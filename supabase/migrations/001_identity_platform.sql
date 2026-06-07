create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  email text not null unique,
  name text,
  avatar_url text,
  phone text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table platform_admins (
  user_id uuid primary key references profiles(id) on delete cascade,

  role platform_admin_role not null,

  created_at timestamptz not null default now()
);

create table impersonation_sessions (
  id uuid primary key default gen_random_uuid(),

  admin_user_id uuid not null references profiles(id),
  target_user_id uuid not null references profiles(id),

  reason text not null,

  started_at timestamptz not null default now(),
  ended_at timestamptz,

  active boolean not null default true,

  created_at timestamptz not null default now(),

  constraint impersonation_not_self
    check (admin_user_id <> target_user_id)
);

create index idx_impersonation_admin_user
  on impersonation_sessions(admin_user_id);

create index idx_impersonation_target_user
  on impersonation_sessions(target_user_id);

create index idx_impersonation_active
  on impersonation_sessions(active)
  where active = true;