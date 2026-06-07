create table loss_reasons (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,

  name text not null,
  description text,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (organization_id, name)
);

create table inventory_lots (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  product_variant_id uuid not null references product_variants(id),

  lot_code text not null,

  expires_at date,

  source_type text,
  source_id uuid,

  created_at timestamptz not null default now(),

  unique (organization_id, product_variant_id, lot_code)
);

create table inventory_balances (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  product_variant_id uuid not null references product_variants(id),
  lot_id uuid references inventory_lots(id),

  quantity numeric(14,3) not null default 0,
  average_unit_cost numeric(14,4) not null default 0,

  updated_at timestamptz not null default now(),

  constraint inventory_balance_non_negative
    check (quantity >= 0),

  unique (organization_id, location_id, product_variant_id, lot_id)
);

create table inventory_movements (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id),
  product_variant_id uuid not null references product_variants(id),
  lot_id uuid references inventory_lots(id),

  movement_type inventory_movement_type not null,

  quantity numeric(14,3) not null,
  unit_cost numeric(14,4) not null default 0,
  total_cost numeric(14,4) generated always as (quantity * unit_cost) stored,

  reason text,
  loss_reason_id uuid references loss_reasons(id),

  source_type text not null,
  source_id uuid not null,

  created_by uuid references profiles(id),
  impersonated_by uuid references profiles(id),

  created_at timestamptz not null default now(),

  constraint inventory_movement_quantity_not_zero
    check (quantity <> 0)
);

create table inventory_counts (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id),

  status inventory_count_status not null default 'DRAFT',

  counted_at timestamptz,
  confirmed_at timestamptz,

  created_by uuid references profiles(id),
  confirmed_by uuid references profiles(id),
  impersonated_by uuid references profiles(id),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table inventory_count_items (
  id uuid primary key default gen_random_uuid(),

  inventory_count_id uuid not null references inventory_counts(id) on delete cascade,

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id),
  product_variant_id uuid not null references product_variants(id),
  lot_id uuid references inventory_lots(id),

  expected_quantity numeric(14,3) not null default 0,
  counted_quantity numeric(14,3) not null default 0,

  difference_quantity numeric(14,3)
    generated always as (counted_quantity - expected_quantity) stored,

  loss_reason_id uuid references loss_reasons(id),

  notes text,

  created_at timestamptz not null default now(),

  unique (inventory_count_id, product_variant_id, lot_id)
);

create index idx_loss_reasons_organization
  on loss_reasons(organization_id);

create index idx_inventory_lots_org
  on inventory_lots(organization_id);

create index idx_inventory_lots_variant
  on inventory_lots(product_variant_id);

create index idx_inventory_lots_expiration
  on inventory_lots(expires_at)
  where expires_at is not null;

create index idx_inventory_balances_location
  on inventory_balances(location_id);

create index idx_inventory_balances_variant
  on inventory_balances(product_variant_id);

create index idx_inventory_balances_lot
  on inventory_balances(lot_id);

create index idx_inventory_balances_lookup
  on inventory_balances(
    organization_id,
    location_id,
    product_variant_id,
    lot_id
  );

create index idx_inventory_movements_org
  on inventory_movements(organization_id);

create index idx_inventory_movements_location
  on inventory_movements(location_id);

create index idx_inventory_movements_variant
  on inventory_movements(product_variant_id);

create index idx_inventory_movements_lot
  on inventory_movements(lot_id);

create index idx_inventory_movements_source
  on inventory_movements(source_type, source_id);

create index idx_inventory_movements_created_at
  on inventory_movements(created_at);

create index idx_inventory_counts_org
  on inventory_counts(organization_id);

create index idx_inventory_counts_location
  on inventory_counts(location_id);

create index idx_inventory_counts_status
  on inventory_counts(status);

create index idx_inventory_count_items_count
  on inventory_count_items(inventory_count_id);

create index idx_inventory_count_items_variant
  on inventory_count_items(product_variant_id);

create index idx_inventory_count_items_lot
  on inventory_count_items(lot_id);