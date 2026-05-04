# Prodet Platform

Digital platform for **Prodet Tunisie** — a Tunisian manufacturer and distributor of cleaning, hygiene, and detergent products.

> Current state: **Conception phase.** This repository contains documentation only — no application code yet. Code starts after the PRD is signed off and the first three spikes (Swiver API, AI extraction, product matching) have been run.

## What this is

Prodet Platform is the digital front-layer of the company. It is **not** a brochure website. It is a B2B commercial and operational platform composed of:

1. A multilingual (FR / AR / EN) public B2B website with a manufacturer-grade catalog and a "demander un devis" flow.
2. An internal order intake console that accepts pasted emails / uploaded PDFs / phone-entered orders, runs AI extraction + product matching against the official catalog, and produces validated draft orders.
3. (Phase 3) A client portal for repeat ordering and order history.
4. (Phase 4) Deeper Swiver ERP integration and AI automation.

Swiver remains the ERP / accounting source of truth. Prodet Platform owns acquisition, catalog presentation, order intake, AI assistance, validation, and analytics.

> **AI proposes. Humans approve. Swiver records.**

## Where to start (reading order)

1. [docs/00-overview/vision.md](docs/00-overview/vision.md) — what we are building and why.
2. [docs/00-overview/personas.md](docs/00-overview/personas.md) — who uses it.
3. [docs/01-product/mvp-scope.md](docs/01-product/mvp-scope.md) — what is in / out for MVP.
4. [docs/01-product/roadmap.md](docs/01-product/roadmap.md) — phased delivery plan.
5. [docs/02-architecture/system-overview.md](docs/02-architecture/system-overview.md) — high-level architecture.
6. [docs/06-spikes/](docs/06-spikes/) — the proofs-of-concept that gate development.
7. [AGENTS.md](AGENTS.md) — conventions for AI tools (Claude, Cursor, Codex CLI) working in this repo.

## Status

| Area | Status |
| --- | --- |
| Vision & strategy | Drafted |
| PRD | v0 (pending answers to open questions) |
| Architecture | Drafted at high level (ADRs in progress) |
| Spikes | Briefs written, **not yet executed** |
| Code | Not started |

See [docs/01-product/open-questions.md](docs/01-product/open-questions.md) for the list of decisions blocking PRD v1.

## How to run

There is nothing to run yet. This is intentional. The repository will be initialized as a Next.js application after Phase 0 spikes are completed and the architecture is signed off.

When code arrives, the canonical command set will be:

```bash
pnpm install
pnpm dev          # local dev server
pnpm typecheck
pnpm lint
pnpm test
pnpm db:migrate
```

These scripts will be added in Phase 1 alongside the application bootstrap.

## License

Proprietary — Prodet Tunisie. All rights reserved.
