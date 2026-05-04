# Module — Client portal

> Status: Phase 3. Spec stub. Owner: Souhail. Last updated: 2026-05.
> **Not in MVP.** Detailed spec is intentionally minimal until Phase 2 completion. The MVP intake-console workflow must prove out before we invest in customer-facing self-service.

## Purpose

Allow the **subset of digitally-comfortable B2B clients** to:

- Repeat a recent order in two clicks.
- See their order history.
- See and manage the customer-scoped aliases they own.
- (Optional, conditional on Swiver API capability) See client-specific pricing.

## Routes (anticipated, under `[locale]/portal`)

```
/portal                            landing (account summary + "reorder last")
/portal/connexion                  login
/portal/inscription                signup (with admin-approval flow)
/portal/commandes                  order history
/portal/commandes/[id]             order detail
/portal/repeter                    repeat-order builder
/portal/aliases                    customer-scoped alias management
/portal/profil                     contact info
```

## Auth and approval

- Self-serve signup: email + password. Status `pending_approval`.
- Admin approves and links the user to one or more `customer` rows via `user_customer`.
- Roles within a customer org: `owner`, `purchaser`, `viewer`. See [../../02-architecture/auth.md](../../02-architecture/auth.md).
- RLS enforces customer-scoping at the DB layer.

## Submission flow

- Portal submissions create `OrderDraft` with `source = 'portal'`, `status = 'review'`.
- They land in the **same** internal queue as email-sourced orders. No special-case code path.
- Admin review may auto-approve (skip) for trusted customers in Phase 3.5+ — opt-in per customer.

## Out of scope (forever or until reconsidered)

- Online payment.
- Self-service invoice download (Swiver owns invoices).
- Live chat with admin (use WhatsApp).
- File upload of orders (out — they should use the email channel for that).

## Open questions

- Allowing a customer org to have multiple `purchaser` users — invitation flow.
- Whether to send weekly digest emails to customers ("3 of your usual products are running low based on your typical cadence"). Useful but adds CRM-lite scope.
- Whether to expose stock once stock data becomes reliable.

## Related

- [../../01-product/roadmap.md Phase 3](../../01-product/roadmap.md#phase-3--client-portal-610-weeks)
- [../../02-architecture/auth.md](../../02-architecture/auth.md)
- [../../02-architecture/data-model.md](../../02-architecture/data-model.md) — `user`, `user_customer`.
- [../order-intake/](../order-intake/)
