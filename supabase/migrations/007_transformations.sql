create table transformations (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,

  location_id uuid not null references locations(id),

  status transformation_status not null default 'DRAFT',

  reference text,
  notes text,

  confirmed_at timestamptz,
  cancelled_at timestamptz,

  created_by uuid references profiles(id),
  confirmed_by uuid references profiles(id),
  cancelled_by uuid references profiles(id),

  impersonated_by uuid references profiles(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table transformation_items (
  id uuid primary key default gen_random_uuid(),

  transformation_id uuid not null references transformations(id) on delete cascade,

  organization_id uuid not null references organizations(id),

  product_variant_id uuid not null references product_variants(id),

  lot_id uuid references inventory_lots(id),

  direction transformation_direction not null,

  quantity numeric(14,3) not null check (quantity > 0),

  unit_cost numeric(14,4) not null default 0,

  notes text,

  created_at timestamptz not null default now()
);

create table transformation_attachments (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id),

  transformation_id uuid not null references transformations(id) on delete cascade,

  bucket text not null default 'transformation-attachments',

  storage_path text not null,

  file_name text,
  mime_type text,
  file_size bigint,

  uploaded_by uuid references profiles(id),

  created_at timestamptz not null default now()
);

create index idx_transformations_org
  on transformations(organization_id);

create index idx_transformations_location
  on transformations(location_id);

create index idx_transformations_status
  on transformations(status);

create index idx_transformation_items_transformation
  on transformation_items(transformation_id);

create index idx_transformation_items_variant
  on transformation_items(product_variant_id);

create index idx_transformation_items_lot
  on transformation_items(lot_id);

create index idx_transformation_attachments_transformation
  on transformation_attachments(transformation_id);