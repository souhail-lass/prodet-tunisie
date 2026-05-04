# Observability — placeholder

> Status: Plan. Owner: Souhail.

## Stack

| Concern | Tool | Notes |
|---|---|---|
| App errors | Sentry | Frontend + serverless. EU region. PII scrubbing on. |
| Logs | Logtail (or Vercel Logs at MVP) | Structured JSON; per-request correlation ID. |
| Uptime | Better Stack monitor (or self-hosted heartbeat) | One per public surface. |
| Web analytics | Plausible | No cookies; EU-hosted. |
| Custom business events | Postgres `audit_log` | All approvals, alias creations, exports. |
| Job runs | Inngest dashboard | Built-in. |
| Synthetic checks | Playwright via GitHub Actions cron | Phase 2. |

## What to alert on

- **App error rate.** Spike above baseline → Sentry alert to Souhail.
- **Job failure.** Inngest function failure (after retries) → email/Slack/WhatsApp (vendor TBD).
- **Inbound email parse failures** > N per hour → alert (Phase 2).
- **Push-to-Swiver failures** (Phase 4) → alert immediately.
- **Quote-form submission spikes** (could be spam) → alert.
- **Auth failures (lockouts)** > threshold → alert.

## What to dashboard

For Père (read-only, glanceable):

- Today's `OrderDraft` count by status.
- This week's revenue (Swiver export).
- Top 5 customers by recent activity.
- Extraction accuracy 30-day trend (Phase 2).
- Match override rate 30-day trend (Phase 2).

For Souhail:

- Sentry issue list.
- Inngest job dashboard.
- Vercel deployment status.
- Latency p95 on `/api/extract` and `/api/match`.

## Related

- [../02-architecture/security-rgpd.md](../02-architecture/security-rgpd.md) — PII scrubbing in Sentry.
- [incident-response.md](incident-response.md)
- [runbooks/](runbooks/)
