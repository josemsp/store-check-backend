-- =========================================================
-- 016_final_hardening.sql
-- Correcciones finales antes del backend
-- =========================================================

-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Aplicar manualmente a tablas con updated_at.
-- Ejemplo:
-- create trigger trg_products_updated_at
-- before update on products
-- for each row execute function set_updated_at();

-- =========================================================
-- PRODUCT VARIANT SKU UNIQUE FIX
-- =========================================================

-- Si en la migración inicial creaste:
-- unique (organization_id, sku)
-- elimínalo y usa este índice parcial.

alter table product_variants
drop constraint if exists product_variants_organization_id_sku_key;

create unique index if not exists uq_product_variants_org_sku
on product_variants(organization_id, sku)
where sku is not null and sku <> '';

-- =========================================================
-- INVENTORY BALANCES UNIQUE FIX
-- =========================================================

alter table inventory_balances
drop constraint if exists
  inventory_balances_organization_id_location_id_product_variant_id_lot_id_key;

create unique index if not exists uq_inventory_balances_with_lot
on inventory_balances(
  organization_id,
  location_id,
  product_variant_id,
  lot_id
)
where lot_id is not null;

create unique index if not exists uq_inventory_balances_without_lot
on inventory_balances(
  organization_id,
  location_id,
  product_variant_id
)
where lot_id is null;

-- =========================================================
-- TRANSFER ITEMS UNIQUE FIX
-- =========================================================

alter table transfer_items
drop constraint if exists
  transfer_items_transfer_id_product_variant_id_lot_id_key;

create unique index if not exists uq_transfer_items_with_lot
on transfer_items(
  transfer_id,
  product_variant_id,
  lot_id
)
where lot_id is not null;

create unique index if not exists uq_transfer_items_without_lot
on transfer_items(
  transfer_id,
  product_variant_id
)
where lot_id is null;

-- =========================================================
-- INVENTORY COUNT ITEMS UNIQUE FIX
-- =========================================================

alter table inventory_count_items
drop constraint if exists
  inventory_count_items_inventory_count_id_product_variant_id_lot_id_key;

create unique index if not exists uq_inventory_count_items_with_lot
on inventory_count_items(
  inventory_count_id,
  product_variant_id,
  lot_id
)
where lot_id is not null;

create unique index if not exists uq_inventory_count_items_without_lot
on inventory_count_items(
  inventory_count_id,
  product_variant_id
)
where lot_id is null;

-- =========================================================
-- INVENTORY MOVEMENT SIGN CHECK
-- =========================================================

alter table inventory_movements
add constraint inventory_movement_sign_check
check (
  (
    movement_type in (
      'PURCHASE_IN',
      'TRANSFER_IN',
      'ADJUSTMENT_IN',
      'TRANSFORMATION_IN',
      'COUNT_ADJUSTMENT_IN'
    )
    and quantity > 0
  )
  or
  (
    movement_type in (
      'TRANSFER_OUT',
      'SALE_OUT',
      'LOSS_OUT',
      'ADJUSTMENT_OUT',
      'TRANSFORMATION_OUT',
      'COUNT_ADJUSTMENT_OUT'
    )
    and quantity < 0
  )
);

-- =========================================================
-- CASH DIFFERENCE FIX
-- =========================================================

-- Recomendación:
-- En la definición final de cash_sessions, usar:
--
-- difference_amount numeric(14,2)
--   generated always as (
--     case
--       when actual_closing_amount is null then null
--       else actual_closing_amount - expected_closing_amount
--     end
--   ) stored
--
-- Si ya existe la columna anterior, recrearla:

alter table cash_sessions
drop column if exists difference_amount;

alter table cash_sessions
add column difference_amount numeric(14,2)
generated always as (
  case
    when actual_closing_amount is null then null
    else actual_closing_amount - expected_closing_amount
  end
) stored;

-- =========================================================
-- INVENTORY THRESHOLDS
-- Para alertas de stock bajo
-- =========================================================

create table inventory_thresholds (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  product_variant_id uuid not null references product_variants(id),

  min_quantity numeric(14,3) not null default 0,
  max_quantity numeric(14,3),

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (organization_id, location_id, product_variant_id)
);

create index idx_inventory_thresholds_org
  on inventory_thresholds(organization_id);

create index idx_inventory_thresholds_location
  on inventory_thresholds(location_id);

create index idx_inventory_thresholds_variant
  on inventory_thresholds(product_variant_id);

-- =========================================================
-- DOMAIN EVENTS
-- Para notificaciones, jobs y procesos async
-- =========================================================

create table domain_events (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid references organizations(id) on delete cascade,

  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,

  payload jsonb not null default '{}'::jsonb,

  processed_at timestamptz,
  failed_at timestamptz,
  failure_reason text,

  created_at timestamptz not null default now()
);

create index idx_domain_events_org
  on domain_events(organization_id);

create index idx_domain_events_type
  on domain_events(event_type);

create index idx_domain_events_unprocessed
  on domain_events(created_at)
  where processed_at is null and failed_at is null;

-- =========================================================
-- RLS FOR NEW TABLES
-- =========================================================

alter table inventory_thresholds enable row level security;
alter table domain_events enable row level security;

create policy "inventory_thresholds_select"
on inventory_thresholds
for select
using (
  is_platform_admin()
  or (
    is_org_member(organization_id)
    and can_access_location(location_id)
    and has_permission(organization_id, 'inventory.read')
  )
);

create policy "inventory_thresholds_manage"
on inventory_thresholds
for all
using (
  can_write_organization(organization_id)
  and can_access_location(location_id)
  and has_permission(organization_id, 'inventory.adjust')
)
with check (
  can_write_organization(organization_id)
  and can_access_location(location_id)
  and has_permission(organization_id, 'inventory.adjust')
);

create policy "domain_events_select_platform_or_owner"
on domain_events
for select
using (
  is_platform_admin()
  or (
    organization_id is not null
    and is_org_owner(organization_id)
  )
);

-- domain_events se insertan desde backend/service role.

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'organizations',
    'organization_settings',
    'subscriptions',
    'organization_members',
    'roles',
    'invitations',
    'locations',
    'product_categories',
    'products',
    'product_variants',
    'product_bundles',
    'loss_reasons',
    'inventory_counts',
    'suppliers',
    'purchases',
    'transfers',
    'transformations',
    'cash_sessions',
    'daily_closures',
    'notification_preferences',
    'user_push_tokens',
    'inventory_thresholds'
  ]
  loop
    execute format(
      'create trigger %I before update on %I
       for each row execute function set_updated_at()',
      'trg_' || table_name || '_updated_at',
      table_name
    );
  end loop;
end;
$$;
