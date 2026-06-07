-- =========================================================
-- INVITATION INDEXES
-- =========================================================

create unique index uq_invitations_pending_scope
on invitations (
  lower(email),
  scope,
  coalesce(
    organization_id,
    '00000000-0000-0000-0000-000000000000'::uuid
  )
)
where status = 'PENDING';

create index idx_invitations_token_hash
on invitations(token_hash);

-- =========================================================
-- EXPLICIT ACTOR AUTHORIZATION
-- Service-role RPCs cannot rely on auth.uid(), so the actor is checked
-- explicitly against the same tenant RBAC data.
-- =========================================================

create or replace function is_platform_admin_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from platform_admins pa
    where pa.user_id = p_user_id
  );
$$;

create or replace function is_root_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from platform_admins pa
    where pa.user_id = p_user_id
      and pa.role = 'ROOT'
  );
$$;

create or replace function has_user_permission(
  p_user_id uuid,
  p_organization_id uuid,
  p_permission_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from organization_members om
    join member_roles mr on mr.member_id = om.id
    join roles r on r.id = mr.role_id
    join role_permissions rp on rp.role_id = r.id
    join permissions p on p.id = rp.permission_id
    join organizations o on o.id = om.organization_id
    where om.user_id = p_user_id
      and om.organization_id = p_organization_id
      and om.status = 'ACTIVE'
      and r.active = true
      and p.key = p_permission_key
      and o.status in ('ACTIVE', 'TRIAL')
      and o.deleted_at is null
  );
$$;

create or replace function can_invite_user(
  p_user_id uuid,
  p_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_platform_admin_user(p_user_id)
    or exists (
      select 1
      from organization_members om
      join member_roles mr on mr.member_id = om.id
      join roles r on r.id = mr.role_id
      where om.user_id = p_user_id
        and om.organization_id = p_organization_id
        and om.status = 'ACTIVE'
        and r.name = 'Owner'
        and r.active = true
    )
    or has_user_permission(
      p_user_id,
      p_organization_id,
      'employee.invite'
    );
$$;

-- =========================================================
-- ORGANIZATION DEFAULTS
-- =========================================================

create or replace function seed_organization_defaults(p_organization_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_role_id uuid;
  v_manager_role_id uuid;
  v_inventory_role_id uuid;
  v_cashier_role_id uuid;
  v_operator_role_id uuid;
begin
  insert into roles (
    organization_id,
    name,
    description,
    is_system
  )
  values
    (
      p_organization_id,
      'Owner',
      'Organization owner with full tenant access.',
      true
    ),
    (
      p_organization_id,
      'Gerente',
      'Organization manager.',
      true
    ),
    (
      p_organization_id,
      'Inventarios',
      'Inventory and supply operator.',
      true
    ),
    (
      p_organization_id,
      'Cajero',
      'Cash and daily closure operator.',
      true
    ),
    (
      p_organization_id,
      'Operador',
      'Production and operational user.',
      true
    )
  on conflict (organization_id, name) do update
  set active = true,
      is_system = true,
      updated_at = now();

  select id into v_owner_role_id
  from roles
  where organization_id = p_organization_id and name = 'Owner';

  select id into v_manager_role_id
  from roles
  where organization_id = p_organization_id and name = 'Gerente';

  select id into v_inventory_role_id
  from roles
  where organization_id = p_organization_id and name = 'Inventarios';

  select id into v_cashier_role_id
  from roles
  where organization_id = p_organization_id and name = 'Cajero';

  select id into v_operator_role_id
  from roles
  where organization_id = p_organization_id and name = 'Operador';

  insert into role_permissions (role_id, permission_id)
  select v_owner_role_id, p.id
  from permissions p
  on conflict do nothing;

  insert into role_permissions (role_id, permission_id)
  select v_manager_role_id, p.id
  from permissions p
  where p.key not in (
    'role.manage',
    'organization.update',
    'inventory.allow_negative_stock'
  )
  on conflict do nothing;

  insert into role_permissions (role_id, permission_id)
  select v_inventory_role_id, p.id
  from permissions p
  where p.key like 'inventory.%'
     or p.key like 'purchase.%'
     or p.key like 'supplier.%'
     or p.key like 'transfer.%'
     or p.key like 'transformation.%'
     or p.key in ('product.read', 'price.read', 'location.read')
  on conflict do nothing;

  insert into role_permissions (role_id, permission_id)
  select v_cashier_role_id, p.id
  from permissions p
  where p.key like 'cash.%'
     or p.key like 'daily_closure.%'
     or p.key in (
       'product.read',
       'price.read',
       'inventory.read',
       'location.read',
       'notification.read'
     )
  on conflict do nothing;

  insert into role_permissions (role_id, permission_id)
  select v_operator_role_id, p.id
  from permissions p
  where p.key in (
    'product.read',
    'inventory.read',
    'location.read',
    'transformation.read',
    'transformation.create'
  )
  on conflict do nothing;

  insert into units (organization_id, name, symbol)
  values
    (p_organization_id, 'Pieza', 'pz'),
    (p_organization_id, 'Kilogramo', 'kg'),
    (p_organization_id, 'Gramo', 'g'),
    (p_organization_id, 'Litro', 'l'),
    (p_organization_id, 'Mililitro', 'ml'),
    (p_organization_id, 'Caja', 'caja'),
    (p_organization_id, 'Bolsa', 'bolsa'),
    (p_organization_id, 'Paquete', 'paq')
  on conflict (organization_id, symbol) do nothing;

  insert into loss_reasons (organization_id, name)
  values
    (p_organization_id, 'Caducidad'),
    (p_organization_id, 'Producto dañado'),
    (p_organization_id, 'Robo'),
    (p_organization_id, 'Consumo interno'),
    (p_organization_id, 'Error de captura'),
    (p_organization_id, 'Producción'),
    (p_organization_id, 'Otro')
  on conflict (organization_id, name) do nothing;

  return v_owner_role_id;
end;
$$;

-- =========================================================
-- RESPONSE HELPERS
-- =========================================================

create or replace function invitation_summary(p_invitation_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', i.id,
    'email', i.email,
    'type', i.scope,
    'status', i.status,
    'organization_name', coalesce(o.name, noi.organization_name),
    'expires_at', i.expires_at,
    'created_at', i.created_at
  )
  from invitations i
  left join organizations o on o.id = i.organization_id
  left join new_organization_invitations noi
    on noi.invitation_id = i.id
  where i.id = p_invitation_id;
$$;

create or replace function validate_invitation(p_token_hash text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'email', i.email,
    'type', i.scope,
    'organization_name', coalesce(o.name, noi.organization_name),
    'expires_at', i.expires_at
  )
  from invitations i
  left join organizations o on o.id = i.organization_id
  left join new_organization_invitations noi
    on noi.invitation_id = i.id
  where i.token_hash = p_token_hash
    and i.status = 'PENDING'
    and i.expires_at > now();
$$;

-- =========================================================
-- CREATE / CANCEL / RESEND
-- =========================================================

create or replace function create_invitation(
  p_actor_user_id uuid,
  p_email text,
  p_type invitation_scope,
  p_organization_id uuid,
  p_role_ids uuid[],
  p_location_ids uuid[],
  p_platform_role platform_admin_role,
  p_new_organization jsonb,
  p_token_hash text,
  p_expires_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation_id uuid;
  v_email text := lower(trim(p_email));
begin
  if p_expires_at <= now() or p_expires_at > now() + interval '30 days' then
    raise exception 'INVALID_EXPIRATION';
  end if;

  if p_type in ('PLATFORM', 'NEW_ORGANIZATION') then
    if not is_root_user(p_actor_user_id) then
      raise exception 'FORBIDDEN';
    end if;
  elsif p_type = 'ORGANIZATION' then
    if p_organization_id is null
      or not can_invite_user(p_actor_user_id, p_organization_id) then
      raise exception 'FORBIDDEN';
    end if;
    if cardinality(coalesce(p_role_ids, '{}'::uuid[])) = 0 then
      raise exception 'ROLE_REQUIRED';
    end if;
    if exists (
      select 1
      from unnest(p_role_ids) as input_role(role_id)
      where not exists (
        select 1
        from roles r
        where r.id = input_role.role_id
          and r.organization_id = p_organization_id
          and r.active = true
      )
    ) then
      raise exception 'INVALID_ROLE';
    end if;
    if exists (
      select 1
      from unnest(coalesce(p_location_ids, '{}'::uuid[]))
        as input_location(location_id)
      where not exists (
        select 1
        from locations l
        where l.id = input_location.location_id
          and l.organization_id = p_organization_id
          and l.active = true
          and l.deleted_at is null
      )
    ) then
      raise exception 'INVALID_LOCATION';
    end if;
  end if;

  if p_type = 'PLATFORM' and p_platform_role is null then
    raise exception 'PLATFORM_ROLE_REQUIRED';
  end if;

  if p_type = 'NEW_ORGANIZATION'
    and (
      p_new_organization is null
      or nullif(trim(p_new_organization->>'name'), '') is null
      or nullif(trim(p_new_organization->>'slug'), '') is null
    ) then
    raise exception 'ORGANIZATION_DETAILS_REQUIRED';
  end if;

  if p_type = 'NEW_ORGANIZATION' then
    perform pg_advisory_xact_lock(
      hashtext(lower(p_new_organization->>'slug'))
    );

    if exists (
      select 1 from organizations o
      where lower(o.slug) = lower(p_new_organization->>'slug')
        and o.deleted_at is null
    ) or exists (
      select 1
      from new_organization_invitations noi
      join invitations i on i.id = noi.invitation_id
      where lower(noi.organization_slug) =
        lower(p_new_organization->>'slug')
        and i.status = 'PENDING'
    ) then
      raise exception 'ORGANIZATION_SLUG_UNAVAILABLE';
    end if;
  end if;

  if exists (
    select 1
    from invitations i
    where lower(i.email) = v_email
      and i.scope = p_type
      and i.organization_id is not distinct from p_organization_id
      and i.status = 'PENDING'
  ) then
    raise exception 'INVITATION_ALREADY_PENDING';
  end if;

  insert into invitations (
    scope,
    organization_id,
    email,
    token_hash,
    invited_by_user_id,
    expires_at,
    metadata
  )
  values (
    p_type,
    p_organization_id,
    v_email,
    p_token_hash,
    p_actor_user_id,
    p_expires_at,
    jsonb_build_object('last_sent_at', now())
  )
  returning id into v_invitation_id;

  insert into invitation_roles (invitation_id, role_id)
  select distinct v_invitation_id, input_role.role_id
  from unnest(coalesce(p_role_ids, '{}'::uuid[]))
    as input_role(role_id);

  insert into invitation_locations (invitation_id, location_id)
  select distinct v_invitation_id, input_location.location_id
  from unnest(coalesce(p_location_ids, '{}'::uuid[]))
    as input_location(location_id);

  if p_type = 'PLATFORM' then
    insert into invitation_platform_roles (invitation_id, role)
    values (v_invitation_id, p_platform_role);
  end if;

  if p_type = 'NEW_ORGANIZATION' then
    insert into new_organization_invitations (
      invitation_id,
      organization_name,
      organization_slug
    )
    values (
      v_invitation_id,
      trim(p_new_organization->>'name'),
      lower(trim(p_new_organization->>'slug'))
    );
  end if;

  insert into audit_logs (
    organization_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    new_data
  )
  values (
    p_organization_id,
    p_actor_user_id,
    'CREATE',
    'invitation',
    v_invitation_id,
    jsonb_build_object('email', v_email, 'scope', p_type)
  );

  return invitation_summary(v_invitation_id);
end;
$$;

create or replace function cancel_invitation(
  p_actor_user_id uuid,
  p_invitation_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation invitations%rowtype;
begin
  select * into v_invitation
  from invitations
  where id = p_invitation_id
  for update;

  if not found then
    raise exception 'INVITATION_NOT_FOUND';
  end if;
  if v_invitation.scope in ('PLATFORM', 'NEW_ORGANIZATION') then
    if not is_root_user(p_actor_user_id) then
      raise exception 'FORBIDDEN';
    end if;
  elsif not can_invite_user(
    p_actor_user_id,
    v_invitation.organization_id
  ) then
    raise exception 'FORBIDDEN';
  end if;
  if v_invitation.status <> 'PENDING' then
    raise exception 'INVITATION_NOT_PENDING';
  end if;

  update invitations
  set status = 'CANCELLED',
      metadata = metadata || jsonb_build_object('cancelled_at', now()),
      updated_at = now()
  where id = p_invitation_id;

  insert into audit_logs (
    organization_id,
    actor_user_id,
    action,
    entity_type,
    entity_id
  )
  values (
    v_invitation.organization_id,
    p_actor_user_id,
    'CANCEL',
    'invitation',
    p_invitation_id
  );

  return true;
end;
$$;

create or replace function resend_invitation(
  p_actor_user_id uuid,
  p_invitation_id uuid,
  p_token_hash text,
  p_expires_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation invitations%rowtype;
begin
  if p_expires_at <= now() or p_expires_at > now() + interval '30 days' then
    raise exception 'INVALID_EXPIRATION';
  end if;

  select * into v_invitation
  from invitations
  where id = p_invitation_id
  for update;

  if not found then
    raise exception 'INVITATION_NOT_FOUND';
  end if;
  if v_invitation.scope in ('PLATFORM', 'NEW_ORGANIZATION') then
    if not is_root_user(p_actor_user_id) then
      raise exception 'FORBIDDEN';
    end if;
  elsif not can_invite_user(
    p_actor_user_id,
    v_invitation.organization_id
  ) then
    raise exception 'FORBIDDEN';
  end if;
  if v_invitation.status <> 'PENDING' then
    raise exception 'INVITATION_NOT_PENDING';
  end if;

  update invitations
  set token_hash = p_token_hash,
      expires_at = p_expires_at,
      metadata = metadata || jsonb_build_object('last_sent_at', now()),
      updated_at = now()
  where id = p_invitation_id;

  insert into audit_logs (
    organization_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    v_invitation.organization_id,
    p_actor_user_id,
    'UPDATE',
    'invitation',
    p_invitation_id,
    jsonb_build_object('operation', 'resend')
  );

  return invitation_summary(p_invitation_id);
end;
$$;

-- =========================================================
-- ACCEPT
-- =========================================================

create or replace function accept_invitation(
  p_token_hash text,
  p_user_id uuid,
  p_full_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_invitation invitations%rowtype;
  v_auth_email text;
  v_organization_id uuid;
  v_member_id uuid;
  v_owner_role_id uuid;
  v_accepted_at timestamptz := now();
begin
  select * into v_invitation
  from invitations
  where token_hash = p_token_hash
  for update;

  if not found then
    raise exception 'INVITATION_NOT_FOUND';
  end if;
  if v_invitation.status = 'ACCEPTED' then
    raise exception 'INVITATION_ALREADY_ACCEPTED';
  end if;
  if v_invitation.status = 'CANCELLED' then
    raise exception 'INVITATION_CANCELLED';
  end if;
  if v_invitation.status <> 'PENDING'
    or v_invitation.expires_at <= now() then
    raise exception 'INVITATION_EXPIRED';
  end if;

  select email into v_auth_email
  from auth.users
  where id = p_user_id;

  if v_auth_email is null
    or lower(v_auth_email) <> lower(v_invitation.email) then
    raise exception 'INVITATION_EMAIL_MISMATCH';
  end if;

  insert into profiles (id, email, name)
  values (p_user_id, v_auth_email, trim(p_full_name))
  on conflict (id) do update
  set email = excluded.email,
      name = excluded.name,
      updated_at = now();

  if v_invitation.scope = 'PLATFORM' then
    insert into platform_admins (user_id, role)
    select p_user_id, ipr.role
    from invitation_platform_roles ipr
    where ipr.invitation_id = v_invitation.id
    on conflict (user_id) do update
    set role = excluded.role;
  elsif v_invitation.scope = 'NEW_ORGANIZATION' then
    insert into organizations (name, slug, status)
    select organization_name, organization_slug, 'TRIAL'
    from new_organization_invitations
    where invitation_id = v_invitation.id
    returning id into v_organization_id;

    insert into organization_settings (organization_id)
    values (v_organization_id);

    insert into subscriptions (organization_id)
    values (v_organization_id);

    v_owner_role_id := seed_organization_defaults(v_organization_id);

    insert into organization_members (
      organization_id,
      user_id,
      status,
      joined_at
    )
    values (v_organization_id, p_user_id, 'ACTIVE', v_accepted_at)
    returning id into v_member_id;

    insert into member_roles (member_id, role_id)
    values (v_member_id, v_owner_role_id);
  else
    v_organization_id := v_invitation.organization_id;

    insert into organization_members (
      organization_id,
      user_id,
      status,
      joined_at
    )
    values (v_organization_id, p_user_id, 'ACTIVE', v_accepted_at)
    on conflict (organization_id, user_id) do update
    set status = 'ACTIVE',
        joined_at = coalesce(
          organization_members.joined_at,
          excluded.joined_at
        ),
        updated_at = now()
    returning id into v_member_id;

    insert into member_roles (member_id, role_id)
    select v_member_id, ir.role_id
    from invitation_roles ir
    where ir.invitation_id = v_invitation.id
    on conflict do nothing;

    insert into location_members (
      organization_id,
      location_id,
      member_id,
      active
    )
    select
      v_organization_id,
      il.location_id,
      v_member_id,
      true
    from invitation_locations il
    where il.invitation_id = v_invitation.id
    on conflict (location_id, member_id) do update
    set active = true;
  end if;

  update invitations
  set status = 'ACCEPTED',
      accepted_at = v_accepted_at,
      accepted_by_user_id = p_user_id,
      updated_at = v_accepted_at
  where id = v_invitation.id;

  insert into audit_logs (
    organization_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    new_data
  )
  values (
    v_organization_id,
    p_user_id,
    'CONFIRM',
    'invitation',
    v_invitation.id,
    jsonb_build_object('scope', v_invitation.scope)
  );

  insert into domain_events (
    organization_id,
    event_type,
    aggregate_type,
    aggregate_id,
    payload
  )
  values (
    v_organization_id,
    'InvitationAccepted',
    'invitation',
    v_invitation.id,
    jsonb_build_object(
      'userId',
      p_user_id,
      'scope',
      v_invitation.scope
    )
  );

  return jsonb_build_object(
    'user_id', p_user_id,
    'invitation_id', v_invitation.id,
    'organization_id', v_organization_id,
    'type', v_invitation.scope,
    'accepted_at', v_accepted_at
  );
end;
$$;

-- =========================================================
-- ONE-TIME ROOT BOOTSTRAP
-- =========================================================

create or replace function bootstrap_platform_root(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_name text;
begin
  lock table platform_admins in exclusive mode;

  if exists (select 1 from platform_admins) then
    raise exception 'PLATFORM_ROOT_ALREADY_CONFIGURED';
  end if;

  select
    email,
    coalesce(
      raw_user_meta_data->>'full_name',
      split_part(email, '@', 1)
    )
  into v_email, v_name
  from auth.users
  where id = p_user_id;

  if v_email is null then
    raise exception 'AUTH_USER_NOT_FOUND';
  end if;

  insert into profiles (id, email, name)
  values (p_user_id, v_email, v_name)
  on conflict (id) do update
  set email = excluded.email,
      name = excluded.name,
      updated_at = now();

  insert into platform_admins (user_id, role)
  values (p_user_id, 'ROOT');

  insert into audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_user_id,
    'CREATE',
    'platform_admin',
    p_user_id,
    jsonb_build_object('role', 'ROOT', 'bootstrap', true)
  );

  return true;
end;
$$;

-- =========================================================
-- EXECUTION BOUNDARY
-- =========================================================

revoke all on function is_platform_admin_user(uuid) from public;
revoke all on function is_root_user(uuid) from public;
revoke all on function has_user_permission(uuid, uuid, text) from public;
revoke all on function can_invite_user(uuid, uuid) from public;
revoke all on function seed_organization_defaults(uuid) from public;
revoke all on function invitation_summary(uuid) from public;
revoke all on function validate_invitation(text) from public;
revoke all on function create_invitation(
  uuid,
  text,
  invitation_scope,
  uuid,
  uuid[],
  uuid[],
  platform_admin_role,
  jsonb,
  text,
  timestamptz
) from public;
revoke all on function cancel_invitation(uuid, uuid) from public;
revoke all on function resend_invitation(
  uuid,
  uuid,
  text,
  timestamptz
) from public;
revoke all on function accept_invitation(text, uuid, text) from public;
revoke all on function bootstrap_platform_root(uuid) from public;

grant execute on function validate_invitation(text) to service_role;
grant execute on function create_invitation(
  uuid,
  text,
  invitation_scope,
  uuid,
  uuid[],
  uuid[],
  platform_admin_role,
  jsonb,
  text,
  timestamptz
) to service_role;
grant execute on function cancel_invitation(uuid, uuid) to service_role;
grant execute on function resend_invitation(
  uuid,
  uuid,
  text,
  timestamptz
) to service_role;
grant execute on function accept_invitation(text, uuid, text)
  to service_role;
grant execute on function bootstrap_platform_root(uuid) to service_role;
