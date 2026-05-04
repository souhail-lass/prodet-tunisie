# Module — Order intake console

> Status: Spec stub. Owner: Souhail. Last updated: 2026-05.
> Scope: [../../01-product/mvp-scope.md §Slice B](../../01-product/mvp-scope.md#in-scope--slice-b-internal-order-intake-console).

## Purpose

The internal staff console that compresses the manual email/PDF/phone → Swiver workflow. It is the operational heart of the platform and the make-or-break of Slice B adoption.

> **The success criterion is not "AI is accurate." It is "Mère's Monday morning is faster than last week."**

## Routes (under `[locale]/admin`, auth-required)

```
/admin                             dashboard (today's queue + KPIs)
/admin/queue                       review queue (all order drafts, filtered)
/admin/orders/[id]                 review screen for one order draft
/admin/orders/new                  manual entry (phone order)
/admin/customers                   customer directory
/admin/customers/[id]              customer detail (history, aliases)
/admin/products                    product directory
/admin/products/[id]               product detail (edit translations, visibility, assets)
/admin/aliases                     alias management
/admin/settings                    integration + user settings (owner only)
```

## Inputs (how an `OrderDraft` enters the queue)

1. **Paste text** (from `/admin/orders/new`, "Paste email" tab). Pastes free text → triggers extraction job.
2. **Upload PDF** (`/admin/orders/new`, "Upload PDF" tab). Single file, text-extractable → text extraction → extraction job.
3. **Inbound email** (Postmark webhook, if [Spike 4](../../06-spikes/spike-inbound-email.md) ships). `orders@<domain>` → webhook → `OrderDraft` with `source = 'email'` → extraction job.
4. **Manual entry** (`/admin/orders/new`, "Manual" tab). Typed-in form, no AI in the critical path. Customer picker + product picker + qty.
5. **Public quote form** (from `/devis` on the public site). Already structured → `OrderDraft` with `source = 'web_quote'`, status `review`, no extraction needed.

## Review screen (`/admin/orders/[id]`)

This is **the** screen Mère/Sœur use most. UX priorities, in order:

1. **Speed of correction.** Default-accept; correction is the exception path but must be one keystroke away.
2. **Visibility of confidence.** Per-line color coding (green ≥ 0.92, amber 0.6–0.92, red < 0.6).
3. **Customer context.** Show the customer's recent orders, usual products, and customer-scoped aliases inline.
4. **Original input always visible.** Never hide the raw email/PDF behind a click. Side-by-side or collapsible-but-default-open.

Layout (illustrative, mobile-secondary at MVP):

```
[ left pane ]                    [ right pane ]
Original input                   Extracted lines (table)
  (email body or PDF preview)      [ # | raw | qty | unit | matched product | conf | actions ]
                                   Add line | Approve | Reject

Customer card                    Notes
  - name, contact                  free-text
  - last 3 orders
  - usual products
```

Keyboard shortcuts (suggested):

- `Tab` / `Shift+Tab` — next/previous line.
- `Enter` — accept current line.
- `/` — focus product search for the current line (override the AI's choice).
- `n` — add a new line.
- `Cmd+Enter` — approve the order.
- `r` — reject (prompts for reason).

Confidence handling on `Approve`:

- Lines with confidence < 0.92 require explicit per-line confirmation (cannot bulk-approve a draft that has any).
- Lines with confidence ≥ 0.92 are auto-accepted.

## Push to Swiver (v1)

Manual at MVP:

- Approved order → "Copy to Swiver" view: a stripped-down list of `code`, `qty`, `unit` ready to paste into Swiver's devis form.
- Mère/Sœur copy/paste; manually mark draft as `exported` with the Swiver document reference.

If [Spike 1](../../06-spikes/spike-swiver-api.md) confirms write API:

- "Push to Swiver" button on approved drafts → API call → status updates.

## Alias learning loop

- After approval, every line where the human picked a product different from the AI top-1 (or where the AI returned no match and the human picked one) prompts:

  > "Save 'javel 5L' as an alias for 'JAVEL PRODET BID 5KG'?"
  > [ ] for this customer only
  > [ ] for everyone (default)
  > [Save] [Skip]

- New aliases are `validation_status = confirmed`, `created_by = user`, `validated_by = same user`, `source_order_draft_id = current`.

## Customer directory

- List view with filter by status (active / inactive / prospect), search by name.
- Detail view: contact info, recent order drafts, customer-scoped aliases, customer notes.
- Edit: localized name, email, phone, WhatsApp, sector tag, default locale, notes. Audit-logged.
- Import: button to import latest Swiver CSV (later: scheduled).

## Product directory

- List view with filter by category, family, public-visibility, manufactured-by-Prodet.
- Detail view: edit `name_canonical`, slug, code, conditionnement, unit_of_sale, `is_visible_public`, `is_manufactured_by_prodet`, recommended sectors, translations, assets.
- Saving translations / assets triggers ISR revalidation of the public product detail page.

## Alias management

- List view: search by alias text, filter by scope (global vs customer-scoped), validation_status.
- Bulk actions: confirm proposed aliases, retire stale ones.
- Per-customer view: all aliases for one customer.

## Dashboard

For Père primarily; everyone sees it.

- Today's queue (count by status).
- This week's revenue (sourced from Swiver export, manual at MVP).
- Top 5 customers by recent activity.
- Extraction accuracy trend (Phase 2; placeholder card at MVP).

## Auth and roles

See [../../02-architecture/auth.md](../../02-architecture/auth.md). MVP has one role (`admin`); per-action gating arrives in Phase 2.

## Out of scope (this module, this phase)

- OCR for image-only PDFs.
- Auto-push to Swiver (Phase 4 unless Spike 1 enables it earlier).
- Per-customer pricing.
- Bulk import of historical orders (only current/forward).
- Mobile-optimized review screen (responsive but desktop-first).
- WhatsApp Business API confirmation flow.

## Related

- [../../01-product/mvp-scope.md](../../01-product/mvp-scope.md)
- [../../02-architecture/auth.md](../../02-architecture/auth.md)
- [../../02-architecture/data-model.md](../../02-architecture/data-model.md)
- [../product-matching/](../product-matching/) — invoked from this module.
- [../swiver-integration/](../swiver-integration/) — destination of approved drafts.
- [../../06-spikes/spike-ai-extraction.md](../../06-spikes/spike-ai-extraction.md), [../../06-spikes/spike-product-matching.md](../../06-spikes/spike-product-matching.md), [../../06-spikes/spike-inbound-email.md](../../06-spikes/spike-inbound-email.md)
