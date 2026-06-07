create table locations (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,

  name text not null,
  type location_type not null,

  sales_enabled boolean not null default false,
  purchases_enabled boolean not null default false,
  production_enabled boolean not null default false,

  active boolean not null default true,

  address text,
  phone text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  unique (organization_id, name)
);

create table location_members (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  member_id uuid not null references organization_members(id) on delete cascade,

  active boolean not null default true,

  created_at timestamptz not null default now(),

  unique (location_id, member_id)
);

create table invitation_locations (
  invitation_id uuid not null references invitations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,

  primary key (invitation_id, location_id)
);

create table units (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid references organizations(id) on delete cascade,

  name text not null,
  symbol text not null,

  active boolean not null default true,

  created_at timestamptz not null default now(),

  unique (organization_id, symbol)
);

create table product_categories (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,

  name text not null,
  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (organization_id, name)
);

create table products (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  category_id uuid references product_categories(id),

  name text not null,
  description text,

  product_type product_type not null,

  track_lots boolean not null default true,
  track_expiration boolean not null default true,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  unique (organization_id, name)
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  unit_id uuid references units(id),

  name text not null,
  sku text,
  barcode text,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  unique (product_id, name),
  unique (organization_id, sku)
);

create table product_variant_prices (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  product_variant_id uuid not null references product_variants(id) on delete cascade,

  price numeric(12,2) not null check (price >= 0),

  status price_status not null default 'ACTIVE',

  starts_at timestamptz not null default now(),
  ends_at timestamptz,

  created_at timestamptz not null default now(),

  constraint valid_price_period
    check (ends_at is null or ends_at > starts_at)
);

create table product_bundles (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,

  bundle_variant_id uuid not null references product_variants(id) on delete cascade,

  name text not null,
  description text,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (organization_id, bundle_variant_id)
);

create table product_bundle_items (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  bundle_id uuid not null references product_bundles(id) on delete cascade,

  component_variant_id uuid not null references product_variants(id),

  quantity numeric(14,3) not null check (quantity > 0),

  created_at timestamptz not null default now(),

  unique (bundle_id, component_variant_id)
);

create index idx_locations_organization
  on locations(organization_id);

create index idx_location_members_location
  on location_members(location_id);

create index idx_location_members_member
  on location_members(member_id);

create index idx_products_organization
  on products(organization_id);

create index idx_products_category
  on products(category_id);

create index idx_product_variants_organization
  on product_variants(organization_id);

create index idx_product_variants_product
  on product_variants(product_id);

create index idx_variant_prices_location
  on product_variant_prices(location_id);

create index idx_variant_prices_variant
  on product_variant_prices(product_variant_id);

create index idx_variant_prices_active
  on product_variant_prices(
    organization_id,
    location_id,
    product_variant_id
  )
  where status = 'ACTIVE';

create index idx_product_bundles_org
  on product_bundles(organization_id);

create index idx_product_bundles_variant
  on product_bundles(bundle_variant_id);

create index idx_product_bundle_items_bundle
  on product_bundle_items(bundle_id);

create index idx_product_bundle_items_component
  on product_bundle_items(component_variant_id);