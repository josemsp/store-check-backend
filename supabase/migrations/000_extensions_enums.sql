create extension if not exists "pgcrypto";

create type platform_admin_role as enum (
  'ROOT',
  'SUPER_ADMIN',
  'SUPPORT'
);

create type organization_status as enum (
  'ACTIVE',
  'SUSPENDED',
  'TRIAL',
  'CANCELLED'
);

create type subscription_plan as enum (
  'FREE',
  'BASIC',
  'PRO',
  'ENTERPRISE'
);

create type subscription_status as enum (
  'ACTIVE',
  'PAST_DUE',
  'CANCELLED',
  'TRIALING'
);

create type member_status as enum (
  'ACTIVE',
  'INVITED',
  'SUSPENDED',
  'REMOVED'
);

create type invitation_scope as enum (
  'PLATFORM',
  'ORGANIZATION',
  'NEW_ORGANIZATION'
);

create type invitation_status as enum (
  'PENDING',
  'ACCEPTED',
  'EXPIRED',
  'CANCELLED'
);

create type location_type as enum (
  'WAREHOUSE',
  'BRANCH',
  'PRODUCTION'
);

create type product_type as enum (
  'RAW_MATERIAL',
  'FINISHED_PRODUCT',
  'SUPPLY',
  'BUNDLE'
);

create type price_status as enum (
  'ACTIVE',
  'INACTIVE'
);

create type inventory_movement_type as enum (
  'PURCHASE_IN',
  'TRANSFER_OUT',
  'TRANSFER_IN',
  'SALE_OUT',
  'LOSS_OUT',
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT',
  'TRANSFORMATION_IN',
  'TRANSFORMATION_OUT',
  'COUNT_ADJUSTMENT_IN',
  'COUNT_ADJUSTMENT_OUT'
);

create type inventory_count_status as enum (
  'DRAFT',
  'CONFIRMED',
  'CANCELLED'
);

create type purchase_status as enum (
  'DRAFT',
  'CONFIRMED',
  'CANCELLED',
  'VOIDED'
);

create type purchase_attachment_type as enum (
  'TICKET_PHOTO',
  'INVOICE',
  'RECEIPT',
  'OTHER'
);

create type transfer_status as enum (
  'DRAFT',
  'SENT',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'RECEIVED_WITH_DIFFERENCE',
  'CANCELLED',
  'VOIDED'
);

create type transfer_attachment_type as enum (
  'DEPARTURE_PHOTO',
  'RECEPTION_PHOTO',
  'EVIDENCE',
  'OTHER'
);

create type transformation_status as enum (
  'DRAFT',
  'CONFIRMED',
  'CANCELLED'
);

create type transformation_direction as enum (
  'INPUT',
  'OUTPUT'
);

create type cash_session_status as enum (
  'OPEN',
  'CLOSED',
  'CANCELLED'
);

create type cash_expense_type as enum (
  'SUPPLIES',
  'SERVICE',
  'TRANSPORT',
  'PAYROLL',
  'OTHER'
);

create type daily_closure_status as enum (
  'DRAFT',
  'CONFIRMED',
  'CANCELLED',
  'VOIDED'
);

create type daily_closure_attachment_type as enum (
  'SALES_NOTEBOOK_PHOTO',
  'CASH_PHOTO',
  'EXPENSE_RECEIPT',
  'AI_SOURCE_IMAGE',
  'OTHER'
);

create type notification_channel as enum (
  'IN_APP',
  'PUSH',
  'WHATSAPP'
);

create type notification_status as enum (
  'PENDING',
  'SENT',
  'READ',
  'FAILED'
);

create type audit_action as enum (
  'CREATE',
  'UPDATE',
  'DELETE',
  'CANCEL',
  'VOID',
  'CONFIRM',
  'SEND',
  'RECEIVE',
  'LOGIN',
  'IMPERSONATE_START',
  'IMPERSONATE_END'
);