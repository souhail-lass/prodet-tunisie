# Spike 4 — Inbound email pipeline

- **Status.** Not started.
- **Owner.** Souhail.
- **Time box.** 1–2 days.
- **Blocks.** Slice B inbound-email feature, MVP "single inbox" UX.

## Hypothesis

A Postmark inbound email address (`orders@<domain>`) can reliably forward emails (with attachments) to a Next.js route handler that creates an `OrderDraft` row and stores attachments in Supabase Storage end-to-end in under 60 seconds, with HMAC signature verification.

## Why it matters

- **If yes:** the inbound-email feature ships in MVP. Customers' existing email behavior is captured automatically; the family stops manually copying email content into the console.
- **If partial (only some email formats parse):** ship with documented format limits; rely on paste-fallback for unsupported.
- **If no (vendor problems, DNS friction, signature issues):** ship MVP without inbound email. Console remains paste-and-upload only. Defer inbound to Phase 2.

## Method

1. **DNS pre-check.** Confirm we can manage MX records for the chosen domain ([Q1](../01-product/open-questions.md), [Q20](../01-product/open-questions.md)). If DNS is blocked, spike is paused.
2. **Postmark account.** Sign up free dev plan. Create a server. Create an inbound stream. Get the inbound webhook URL.
3. **DNS records.** Add MX records pointing `orders.<domain>` (subdomain isolation) or `<domain>` to Postmark's MX. SPF/DKIM/DMARC for outbound on the same domain (so DMARC alignment works).
4. **Build a minimal route handler** in a sandbox Next.js project (or in this repo when scaffolded). Endpoint: `/api/inbound/order`.
   - Verify HMAC signature against shared secret.
   - Parse JSON payload (Postmark's inbound webhook format).
   - Extract `From`, `Subject`, `TextBody`, `HtmlBody`, `Attachments[]`.
   - Upload attachments to a temp Supabase Storage bucket (or local dir for the spike).
   - Create a fake `OrderDraft` JSON record (or insert into a temp DB table).
5. **Test with three real email formats.**
   - A plain-text email with order in body.
   - An email with a PDF attachment, minimal body.
   - An email with both body and PDF.
6. **Failure injection.** Send an email > 10MB. Send with a non-PDF attachment (e.g. ZIP, image). Verify graceful handling.

## Dataset

- 3–5 test emails composed by Souhail (no real customer data needed at this stage).

## Gate criteria

| Outcome | Decision |
|---|---|
| All 3 test emails ingested in < 60s, signature verified, attachments stored | Ship inbound in MVP. |
| 2/3 ingested with some friction | Ship with documented limits. |
| Setup blocked by DNS or Postmark issues | Defer to Phase 2. Ship MVP without inbound email. |

## Time box

2 days maximum.

## Result

_To fill in:_

- DNS configuration time:
- Postmark setup notes:
- Test email results:
- Latency observed:
- Failure modes:

## Decision

_To fill in:_

- Inbound email in MVP: yes / no / partial.
- Vendor: Postmark / Mailgun / other.
- Route handler implementation notes:
- Followups:

## References

- [adr/0010-jobs-and-queues.md](../02-architecture/adr/0010-jobs-and-queues.md) — inbound triggers Inngest.
- [02-architecture/system-overview.md inbound flow](../02-architecture/system-overview.md#inbound-email-order)
- [01-product/open-questions.md Q20](../01-product/open-questions.md)
- [03-modules/order-intake/](../03-modules/order-intake/)
