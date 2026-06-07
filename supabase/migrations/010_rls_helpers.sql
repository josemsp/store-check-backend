create or replace function current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid()
$$;

create or replace function is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from platform_admins pa
    where pa.user_id = auth.uid()
  );
$$;

create or replace function is_root()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from platform_admins pa
    where pa.user_id = auth.uid()
      and pa.role = 'ROOT'
  );
$$;

create or replace function is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.status = 'ACTIVE'
  );
$$;

create or replace function get_member_id(target_organization_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select om.id
  from organization_members om
  where om.organization_id = target_organization_id
    and om.user_id = auth.uid()
    and om.status = 'ACTIVE'
  limit 1;
$$;

create or replace function is_org_owner(target_organization_id uuid)
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
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.status = 'ACTIVE'
      and r.name = 'Owner'
      and r.active = true
  );
$$;

create or replace function has_permission(
  target_organization_id uuid,
  permission_key text
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
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.status = 'ACTIVE'
      and r.active = true
      and p.key = permission_key
  );
$$;

create or replace function can_access_location(target_location_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from location_members lm
    join organization_members om on om.id = lm.member_id
    where lm.location_id = target_location_id
      and lm.active = true
      and om.user_id = auth.uid()
      and om.status = 'ACTIVE'
  )
  or exists (
    select 1
    from locations l
    where l.id = target_location_id
      and is_org_owner(l.organization_id)
  );
$$;

create or replace function is_organization_active(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from organizations o
    where o.id = target_organization_id
      and o.status in ('ACTIVE', 'TRIAL')
      and o.deleted_at is null
  );
$$;

create or replace function can_write_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_organization_active(target_organization_id)
    and is_org_member(target_organization_id);
$$;

create or replace function can_invite_to_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_platform_admin()
    or is_org_owner(target_organization_id)
    or has_permission(target_organization_id, 'employee.invite');
$$;

create or replace function can_manage_roles(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_platform_admin()
    or is_org_owner(target_organization_id)
    or has_permission(target_organization_id, 'role.manage');
$$;

create or replace function storage_org_id_from_path(path text)
returns uuid
language sql
stable
as $$
  select split_part(path, '/', 1)::uuid
$$;