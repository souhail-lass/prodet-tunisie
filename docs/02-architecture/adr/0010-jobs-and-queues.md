# ADR 0010 — Inngest for background jobs

- **Status.** Proposed
- **Date.** 2026-05-03
- **Owner.** Souhail
- **Supersedes.** —

## Context

The platform needs background-job execution for:

- Inbound-email processing pipeline (Postmark webhook → store → enqueue extraction → enqueue matching → notify admin).
- Re-embedding when a product's name or description changes.
- Daily Swiver export sync (when API exists).
- Periodic retention/anonymization jobs (Phase 2+).
- Sending transactional emails asynchronously when desired.

Constraints:

- Solo dev. Cannot operate a Redis + worker fleet.
- Vercel serverless: long-running tasks are limited.
- Need observability (job runs, retries, failures).
- Cost-sensitive at MVP.

## Decision

We use **Inngest** as the job orchestrator.

- Functions defined in code (TypeScript) and registered via the Inngest Next.js SDK.
- Triggered by events (`inngest.send({name: 'order/email.received', data: {...}})`) or cron.
- Inngest handles retries, concurrency limits, and step-level checkpointing.
- Free tier (50k events/month) covers MVP comfortably.
- Observability via Inngest dashboard.

## Alternatives considered

- **QStash (Upstash).** HTTP-based queue, very simple. Lacks step-level checkpoints and the rich function model of Inngest. Solid second choice if Inngest proves problematic.
- **Trigger.dev.** Strong contender. Slightly heavier setup. Re-evaluate if a use case demands long-running step orchestration that Inngest cannot easily express.
- **Vercel Cron + Vercel Queues (when GA).** Vercel Queues is appealing (no extra vendor), but maturity and feature parity are not yet there. Re-evaluate at Phase 2.
- **Self-hosted (BullMQ + Redis).** Operational tax disqualifies for solo dev.
- **Postgres-based queue (`pg_cron` + custom polling).** Cheap but everything we'd build is something Inngest already does. Rejected.

## Consequences

- **Positive.**
  - Zero infrastructure to operate.
  - Step-level checkpointing means a partial failure mid-pipeline (e.g. extraction succeeded, matching failed) does not lose work.
  - Built-in retries with exponential backoff.
  - Cron and event-triggered functions in the same model.
- **Negative.**
  - Vendor dependency. Migrating away later requires rewriting function definitions.
  - Job payloads cross the network to Inngest. We avoid PII in payloads by passing IDs and reading from Postgres inside the function.
  - Cost above free tier ($20/month at small commercial tier). Acceptable.
- **Neutral.**
  - Cron schedules live in code (alongside the function definition), not in a separate scheduler config.
  - Local dev uses Inngest's dev server (`inngest dev`).

## Open questions

- Whether to colocate Inngest functions in `src/jobs/*` or with the module they belong to. Default: `src/jobs/<module>/<job>.ts` to surface them.

## References

- [system-overview.md](../system-overview.md)
- [tech-stack.md](../tech-stack.md)
- [Inngest docs](https://www.inngest.com/docs)
