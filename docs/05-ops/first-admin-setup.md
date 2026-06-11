# First admin setup

> Status: Phase 1C. Owner: Souhail. Last updated: 2026-05-15.

This runbook explains how to create the first Prodet admin account without adding open registration.

## Required environment variables

Set these in `.env.local` and the deployment environment:

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXT_PUBLIC_SITE_URL=http://localhost:3004
```

`SUPABASE_SERVICE_ROLE_KEY` is not used by public client code. Keep it server-only.

## Supabase Auth settings

In Supabase Auth:

- enable email login,
- enable magic links,
- disable public signups if the project settings allow it,
- configure the site URL to the production domain,
- add redirect URLs:
  - local standard: `http://localhost:3004/auth/callback`
  - optional local fallback: `http://localhost:3000/auth/callback`
  - optional local fallback: `http://localhost:3001/auth/callback`
  - production: `https://<domain>/auth/callback`

## Create the first admin

1. Create the user in Supabase Auth manually.
2. Copy the Supabase Auth user UUID.
3. Insert a matching `app_user` row in Postgres.

Example SQL:

```sql
insert into app_user (auth_id, email, full_name, role, is_active)
values (
  '<supabase-auth-user-uuid>',
  'souhail@example.com',
  'Souhail',
  'owner',
  true
);
```

If the Auth UUID is not known yet, Prodet may insert the row with `auth_id = null` and the exact email. On first successful magic-link login, the app links the row to the Supabase Auth user UUID.

```sql
insert into app_user (email, full_name, role, is_active)
values ('souhail@example.com', 'Souhail', 'owner', true);
```

Do not insert customer users for Phase 1C.

## Test admin protection

1. Open `/fr/admin/demandes-acces` without a session.
2. Expected: redirect to `/fr/connexion-admin`.
3. Request a magic link with the pre-created admin email.
4. Open the magic link.
5. Expected: redirect back to `/fr/admin/demandes-acces`.
6. Expected page: protected placeholder, no access-request data yet.

## Roles

Admin routes allow:

- `owner`
- `admin`
- `operator`
- `reviewer`

Review mutation actions should be narrower when activated in Phase 1D:

- `owner`
- `admin`
- `operator`

## Rule

No public signup. No automatic account creation. No client portal access until Prodet validates and links the user to the right organization.
