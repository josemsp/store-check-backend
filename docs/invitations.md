# Invitations

Invitations are the only registration path. Public sign-up must remain disabled
in the product UI.

## HTTP contract

```text
GET  /api/v1/invitations/validate?token=...
POST /api/v1/invitations/accept
POST /api/v1/invitations
POST /api/v1/invitations/{id}/cancel
POST /api/v1/invitations/{id}/resend
```

The OpenAPI contract at `/openapi.json` is the source used by Orval.

`POST /accept` supports two paths:

- New user: send `token`, `password` and `fullName`.
- Existing user: send `token` and the current Supabase Bearer token. The user
  can then join an additional organization without creating another account.

## Security model

- Only a SHA-256 token hash is persisted.
- Validation has no side effects.
- Platform and new-organization invitations require ROOT.
- Organization invitations require `employee.invite` or a platform admin.
- Role and location IDs are checked against the invitation organization.
- Acceptance is serialized with `FOR UPDATE` and runs in one database
  transaction.
- If database acceptance fails after creating the Supabase Auth user, the
  backend deletes that Auth user.
- Invitation tables have RLS enabled and no direct client policies.

## Environment

```text
FRONTEND_URL=https://app.example.com
RESEND_API_KEY=re_...
EMAIL_FROM=Store Check <invitations@example.com>
```

The acceptance page is expected at `/invitations/accept` in the frontend.

## Initial ROOT

Create the first user in Supabase Auth, then execute this once with the service
role or from the Supabase SQL editor:

```sql
select public.bootstrap_platform_root(
  'AUTH_USER_UUID'::uuid
);
```

The function refuses to run after any platform administrator exists.

## Local database

With Docker Desktop running:

```bash
pnpm db:start
pnpm db:reset
pnpm db:lint
```
