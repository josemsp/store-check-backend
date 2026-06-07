alter table profiles enable row level security;
alter table platform_admins enable row level security;
alter table impersonation_sessions enable row level security;

alter table organizations enable row level security;
alter table organization_settings enable row level security;
alter table subscriptions enable row level security;
alter table organization_members enable row level security;

alter table permissions enable row level security;
alter table roles enable row level security;
alter table role_permissions enable row level security;
alter table member_roles enable row level security;

alter table invitations enable row level security;
alter table invitation_roles enable row level security;
alter table invitation_locations enable row level security;
alter table invitation_platform_roles enable row level security;
alter table new_organization_invitations enable row level security;

alter table locations enable row level security;
alter table location_members enable row level security;

alter table units enable row level security;
alter table product_categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_variant_prices enable row level security;
alter table product_bundles enable row level security;
alter table product_bundle_items enable row level security;

alter table loss_reasons enable row level security;
alter table inventory_lots enable row level security;
alter table inventory_balances enable row level security;
alter table inventory_movements enable row level security;
alter table inventory_counts enable row level security;
alter table inventory_count_items enable row level security;

alter table suppliers enable row level security;
alter table purchases enable row level security;
alter table purchase_items enable row level security;
alter table purchase_attachments enable row level security;

alter table transfers enable row level security;
alter table transfer_items enable row level security;
alter table transfer_receipts enable row level security;
alter table transfer_attachments enable row level security;

alter table transformations enable row level security;
alter table transformation_items enable row level security;
alter table transformation_attachments enable row level security;

alter table cash_sessions enable row level security;
alter table cash_expenses enable row level security;
alter table daily_closures enable row level security;
alter table daily_closure_sales enable row level security;
alter table daily_closure_attachments enable row level security;

alter table notification_types enable row level security;
alter table notification_preferences enable row level security;
alter table notifications enable row level security;
alter table user_push_tokens enable row level security;
alter table audit_logs enable row level security;