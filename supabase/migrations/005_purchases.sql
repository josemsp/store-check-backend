create table suppliers (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,

  name text not null,

  contact_name text,
  phone text,
  email text,

  tax_id text,

  notes text,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  unique (organization_id, name)
);

create table purchases (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id),
  supplier_id uuid references suppliers(id),

  status purchase_status not null default 'DRAFT',

  purchase_date date not null default current_date,

  subtotal numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,

  invoice_number text,
  reference text,

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
  updated_at timestamptz not null default now()
);

create table purchase_items (
  id uuid primary key default gen_random_uuid(),

  purchase_id uuid not null references purchases(id) on delete cascade,

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id),

  product_variant_id uuid not null references product_variants(id),

  quantity numeric(14,3) not null check (quantity > 0),

  unit_cost numeric(14,4) not null check (unit_cost >= 0),

  subtotal numeric(14,4)
    generated always as (quantity * unit_cost) stored,

  expires_at date,
  lot_code text,

  notes text,

  created_at timestamptz not null default now()
);

create table purchase_attachments (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  purchase_id uuid not null references purchases(id) on delete cascade,

  type purchase_attachment_type not null default 'OTHER',

  bucket text not null default 'purchase-attachments',
  storage_path text not null,

  file_name text,
  mime_type text,
  file_size bigint,

  uploaded_by uuid references profiles(id),
  impersonated_by uuid references profiles(id),

  created_at timestamptz not null default now()
);

create index idx_suppliers_organization
  on suppliers(organization_id);

create index idx_purchases_organization
  on purchases(organization_id);

create index idx_purchases_location
  on purchases(location_id);

create index idx_purchases_supplier
  on purchases(supplier_id);

create index idx_purchases_status
  on purchases(status);

create index idx_purchases_date
  on purchases(purchase_date);

create index idx_purchase_items_purchase
  on purchase_items(purchase_id);

create index idx_purchase_items_variant
  on purchase_items(product_variant_id);

create index idx_purchase_attachments_purchase
  on purchase_attachments(purchase_id);