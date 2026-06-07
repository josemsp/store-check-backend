create table transfers (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,

  origin_location_id uuid not null references locations(id),
  destination_location_id uuid not null references locations(id),

  status transfer_status not null default 'DRAFT',

  reference text,
  notes text,

  sent_at timestamptz,
  received_at timestamptz,

  cancelled_at timestamptz,
  voided_at timestamptz,

  created_by uuid references profiles(id),
  sent_by uuid references profiles(id),
  received_by uuid references profiles(id),

  cancelled_by uuid references profiles(id),
  voided_by uuid references profiles(id),

  impersonated_by uuid references profiles(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint transfer_locations_different
    check (origin_location_id <> destination_location_id)
);

create table transfer_items (
  id uuid primary key default gen_random_uuid(),

  transfer_id uuid not null references transfers(id) on delete cascade,

  organization_id uuid not null references organizations(id),

  product_variant_id uuid not null references product_variants(id),
  lot_id uuid references inventory_lots(id),

  quantity_sent numeric(14,3) not null check (quantity_sent > 0),

  unit_cost numeric(14,4) not null default 0,

  notes text,

  created_at timestamptz not null default now(),

  unique (
    transfer_id,
    product_variant_id,
    lot_id
  )
);

create table transfer_receipts (
  id uuid primary key default gen_random_uuid(),

  transfer_item_id uuid not null references transfer_items(id) on delete cascade,

  organization_id uuid not null references organizations(id),

  quantity_received numeric(14,3) not null,

  difference_quantity numeric(14,3) not null default 0,

  difference_reason text,

  received_by uuid references profiles(id),
  impersonated_by uuid references profiles(id),

  received_at timestamptz not null default now(),

  unique (transfer_item_id)
);

create table transfer_attachments (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,

  transfer_id uuid not null references transfers(id) on delete cascade,

  type transfer_attachment_type not null default 'OTHER',

  bucket text not null default 'transfer-attachments',
  storage_path text not null,

  file_name text,
  mime_type text,
  file_size bigint,

  uploaded_by uuid references profiles(id),
  impersonated_by uuid references profiles(id),

  created_at timestamptz not null default now()
);

create index idx_transfers_organization
  on transfers(organization_id);

create index idx_transfers_origin
  on transfers(origin_location_id);

create index idx_transfers_destination
  on transfers(destination_location_id);

create index idx_transfers_status
  on transfers(status);

create index idx_transfer_items_transfer
  on transfer_items(transfer_id);

create index idx_transfer_items_variant
  on transfer_items(product_variant_id);

create index idx_transfer_receipts_item
  on transfer_receipts(transfer_item_id);

create index idx_transfer_attachments_transfer
  on transfer_attachments(transfer_id);