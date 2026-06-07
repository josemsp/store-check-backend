create table cash_sessions (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id),

  status cash_session_status not null default 'OPEN',

  opened_at timestamptz not null default now(),
  closed_at timestamptz,

  opening_amount numeric(14,2) not null default 0,

  expected_closing_amount numeric(14,2) not null default 0,
  actual_closing_amount numeric(14,2),

  difference_amount numeric(14,2)
    generated always as (
      coalesce(actual_closing_amount, 0) - expected_closing_amount
    ) stored,

  notes text,

  opened_by uuid references profiles(id),
  closed_by uuid references profiles(id),
  impersonated_by uuid references profiles(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index uq_one_open_cash_session_per_location
  on cash_sessions(location_id)
  where status = 'OPEN';

create table cash_expenses (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id),
  cash_session_id uuid not null references cash_sessions(id) on delete cascade,

  type cash_expense_type not null default 'OTHER',

  concept text not null,
  amount numeric(14,2) not null check (amount > 0),

  notes text,

  created_by uuid references profiles(id),
  impersonated_by uuid references profiles(id),

  created_at timestamptz not null default now()
);

create table daily_closures (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id),
  cash_session_id uuid references cash_sessions(id),

  closure_date date not null,

  status daily_closure_status not null default 'DRAFT',

  gross_sales_amount numeric(14,2) not null default 0,
  expenses_amount numeric(14,2) not null default 0,

  net_sales_amount numeric(14,2)
    generated always as (gross_sales_amount - expenses_amount) stored,

  total_cost_amount numeric(14,4) not null default 0,

  gross_profit_amount numeric(14,4)
    generated always as (gross_sales_amount - total_cost_amount) stored,

  notes text,

  confirmed_at timestamptz,
  cancelled_at timestamptz,
  voided_at timestamptz,

  created_by uuid references profiles(id),
  confirmed_by uuid references profiles(id),
  cancelled_by uuid references profiles(id),
  voided_by uuid references profiles(id),
  impersonated_by uuid references profiles(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (organization_id, location_id, closure_date)
);

create table daily_closure_sales (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id),
  daily_closure_id uuid not null references daily_closures(id) on delete cascade,

  product_variant_id uuid not null references product_variants(id),

  quantity numeric(14,3) not null check (quantity > 0),

  unit_price numeric(14,2) not null default 0,
  total_amount numeric(14,2)
    generated always as (quantity * unit_price) stored,

  unit_cost numeric(14,4) not null default 0,
  total_cost numeric(14,4)
    generated always as (quantity * unit_cost) stored,

  notes text,

  created_at timestamptz not null default now(),

  unique (daily_closure_id, product_variant_id)
);

create table daily_closure_attachments (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  daily_closure_id uuid not null references daily_closures(id) on delete cascade,

  type daily_closure_attachment_type not null default 'OTHER',

  bucket text not null default 'daily-closure-attachments',
  storage_path text not null,

  file_name text,
  mime_type text,
  file_size bigint,

  ai_processed boolean not null default false,
  ai_extracted_data jsonb,

  uploaded_by uuid references profiles(id),
  impersonated_by uuid references profiles(id),

  created_at timestamptz not null default now()
);

create index idx_cash_sessions_org
  on cash_sessions(organization_id);

create index idx_cash_sessions_location
  on cash_sessions(location_id);

create index idx_cash_expenses_session
  on cash_expenses(cash_session_id);

create index idx_daily_closures_org
  on daily_closures(organization_id);

create index idx_daily_closures_location
  on daily_closures(location_id);

create index idx_daily_closures_date
  on daily_closures(closure_date);

create index idx_daily_closure_sales_closure
  on daily_closure_sales(daily_closure_id);

create index idx_daily_closure_sales_variant
  on daily_closure_sales(product_variant_id);

create index idx_daily_closure_attachments_closure
  on daily_closure_attachments(daily_closure_id);