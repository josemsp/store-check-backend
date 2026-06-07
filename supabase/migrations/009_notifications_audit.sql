create table notification_types (
  id uuid primary key default gen_random_uuid(),

  key text not null unique,
  name text not null,
  description text,

  default_enabled boolean not null default true,

  created_at timestamptz not null default now()
);

create table notification_preferences (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  notification_type_id uuid not null references notification_types(id) on delete cascade,

  channel notification_channel not null,
  enabled boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (
    organization_id,
    user_id,
    notification_type_id,
    channel
  )
);

create table notifications (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid references organizations(id) on delete cascade,

  user_id uuid not null references profiles(id) on delete cascade,
  notification_type_id uuid references notification_types(id),

  channel notification_channel not null default 'IN_APP',
  status notification_status not null default 'PENDING',

  title text not null,
  body text,

  data jsonb not null default '{}'::jsonb,

  sent_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,
  failure_reason text,

  created_at timestamptz not null default now()
);

create table user_push_tokens (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references profiles(id) on delete cascade,

  provider text not null default 'firebase',
  token text not null,

  device_name text,
  platform text,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (provider, token)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid references organizations(id) on delete cascade,

  actor_user_id uuid references profiles(id),
  impersonated_by_user_id uuid references profiles(id),

  action audit_action not null,

  entity_type text not null,
  entity_id uuid,

  old_data jsonb,
  new_data jsonb,

  metadata jsonb not null default '{}'::jsonb,

  ip_address inet,
  user_agent text,

  created_at timestamptz not null default now()
);

create index idx_notifications_user
  on notifications(user_id);

create index idx_notifications_org
  on notifications(organization_id);

create index idx_notifications_status
  on notifications(status);

create index idx_user_push_tokens_user
  on user_push_tokens(user_id);

create index idx_audit_logs_org
  on audit_logs(organization_id);

create index idx_audit_logs_actor
  on audit_logs(actor_user_id);

create index idx_audit_logs_entity
  on audit_logs(entity_type, entity_id);

create index idx_audit_logs_created_at
  on audit_logs(created_at);