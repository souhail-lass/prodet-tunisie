# ADR 0011 - Client portal access and request model

- **Status.** Proposed
- **Date.** 2026-05-15
- **Owner.** Souhail
- **Supersedes.** -

## Context

Phase 3 introduces a client portal for validated B2B customers. The portal must make reorder and quote-request workflows faster for hotels, restaurants, companies, cleaning companies, revendeurs, and institutions.

The portal touches several load-bearing decisions:

- public quote requests vs authenticated portal requests,
- customer account creation and validation,
- row-level security for customer-scoped data,
- `order_draft` as the unified internal queue entity,
- notification behavior,
- future Swiver integration.

Hard constraints:

- no public prices,
- no public stock,
- no checkout or payment,
- no open uncontrolled registration,
- no autonomous official Swiver document creation,
- AI proposes, humans approve, Swiver records.

## Decision

We implement the client portal as a restricted, validated-access workspace inside the same Next.js application.

Access:

- Existing clients enter by Prodet-issued invitation, magic link, password flow, or one-time access code.
- New professional buyers submit `Devenir client Prodet`; Prodet validates before creating or inviting the account.
- No portal account can see customer data until linked to a validated `customer` via `user_customer`.

Requests:

- Authenticated portal submissions reuse `order_draft` with `source = 'portal'`.
- Portal request lines reuse `order_line`.
- Portal submissions create a stable submitted snapshot for copy/export.
- Portal submissions notify Prodet and appear in the internal review queue.
- Prodet reviews and approves before any Swiver export/push.

Public quotes:

- Public visitors can still request a quote without an account.
- Public quote requests remain separate from portal requests. They are email-first to `prodet.tunisie@gmail.com` and may also create `order_draft.source = 'web_quote'` when the quote bridge is active.

Swiver:

- Portal requests may store Swiver customer/product IDs when known.
- Swiver remains the source of truth for official commercial documents.
- No automatic official Swiver document is created without human review unless a later ADR explicitly changes this.

## Alternatives Considered

### Open self-registration with pending approval

Rejected. It creates confusing account states and increases the chance that an unvalidated buyer expects portal capabilities. Prodet needs request-access first, then invite.

### E-commerce-style account portal

Rejected. Checkout, payment, stock, and public prices contradict Prodet's B2B commercial model and non-goals.

### Separate portal application

Rejected. The platform already decided on one Next.js app for public site, admin, and portal. A separate app would duplicate auth, i18n, design system, and data access.

### Portal requests stored in a separate order table

Rejected for MVP. `order_draft` is the unified queue entity. A second request/order table would force duplicate review and Swiver export logic.

### Automatic Swiver push for portal requests

Rejected through Phase 3. Even authenticated clients can submit wrong quantities or products. Prodet must review before official Swiver records are created.

## Consequences

### Positive

- Portal, public quote, email, PDF, and phone requests converge on the same internal review queue.
- Customer data can be protected through `user_customer` and RLS.
- Portal requests can be useful before Swiver API integration exists.
- The model supports habit-forming reorder UX without becoming checkout.
- Copy/export can serve client ERP needs without exposing prices or stock.

### Negative

- Prodet must configure pilot clients, usual products, and invitations manually at first.
- Clients cannot instantly self-serve access.
- Portal request history is initially portal-only unless Swiver history import becomes reliable.
- Some clients may still prefer email if usual products are not configured well.

### Neutral

- Public quote requests and portal requests intentionally have different trust levels.
- Spending stats remain deferred because pricing data is not approved for client display.
- Saved templates can be added after usual products and reorder-last flows prove useful.

## Open Questions

- Which clients are the Phase 3 pilot group?
- Who approves access requests operationally?
- Should client organization admins exist in MVP or later?
- What copy/export format do clients need for their own ERP?
- Can Swiver expose customer-specific history and delivery sites reliably?
- Should client-specific spending ever be visible?

## References

- [../auth.md](../auth.md)
- [../data-model.md](../data-model.md)
- [0002-nextjs-app-router.md](0002-nextjs-app-router.md)
- [0003-postgres-supabase.md](0003-postgres-supabase.md)
- [0009-swiver-integration-strategy.md](0009-swiver-integration-strategy.md)
- [../../03-modules/client-portal.md](../../03-modules/client-portal.md)
- [../../03-modules/client-portal-flows.md](../../03-modules/client-portal-flows.md)
- [../../03-modules/client-portal-data-model.md](../../03-modules/client-portal-data-model.md)
- [../../design/client-portal-ux.md](../../design/client-portal-ux.md)

