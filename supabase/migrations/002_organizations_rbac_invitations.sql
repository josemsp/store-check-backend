create table organizations (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text not null unique,

  status organization_status not null default 'TRIAL',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table organization_settings (
  organization_id uuid primary key references organizations(id) on delete cascade,

  timezone text not null default 'America/Mexico_City',
  currency text not null default 'MXN',

  low_stock_enabled boolean not null default true,
  expiration_alert_days int not null default 3,

  settings jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,

  plan subscription_plan not null default 'FREE',
  status subscription_status not null default 'TRIALING',

  starts_at timestamptz not null default now(),
  ends_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,

  status member_status not null default 'ACTIVE',

  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (organization_id, user_id)
);

create table permissions (
  id uuid primary key default gen_random_uuid(),

  key text not null unique,
  description text,

  created_at timestamptz not null default now()
);

create table roles (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid references organizations(id) on delete cascade,

  name text not null,
  description text,

  is_system boolean not null default false,
  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (organization_id, name)
);

create table role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,

  created_at timestamptz not null default now(),

  primary key (role_id, permission_id)
);

create table member_roles (
  member_id uuid not null references organization_members(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,

  created_at timestamptz not null default now(),

  primary key (member_id, role_id)
);

create table invitations (
  id uuid primary key default gen_random_uuid(),

  scope invitation_scope not null,

  organization_id uuid references organizations(id) on delete cascade,

  email text not null,

  token_hash text not null unique,

  invited_by_user_id uuid not null references profiles(id),

  status invitation_status not null default 'PENDING',

  expires_at timestamptz not null,

  accepted_at timestamptz,
  accepted_by_user_id uuid references profiles(id),

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint valid_invitation_scope check (
    (scope = 'PLATFORM' and organization_id is null)
    or
    (scope = 'NEW_ORGANIZATION' and organization_id is null)
    or
    (scope = 'ORGANIZATION' and organization_id is not null)
  )
);

create table invitation_roles (
  invitation_id uuid not null references invitations(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,

  primary key (invitation_id, role_id)
);

create table invitation_platform_roles (
  invitation_id uuid primary key references invitations(id) on delete cascade,
  role platform_admin_role not null
);

create table new_organization_invitations (
  invitation_id uuid primary key references invitations(id) on delete cascade,

  organization_name text not null,
  organization_slug text not null,

  owner_role_name text not null default 'Owner'
);

create index idx_subscriptions_organization
  on subscriptions(organization_id);

create index idx_org_members_org
  on organization_members(organization_id);

create index idx_org_members_user
  on organization_members(user_id);

create index idx_invitations_email
  on invitations(email);

create index idx_invitations_status
  on invitations(status);

create index idx_invitations_org
  on invitations(organization_id);