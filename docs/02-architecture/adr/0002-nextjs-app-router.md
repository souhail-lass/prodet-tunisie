# ADR 0002 — Use Next.js App Router as the single application framework

- **Status.** Proposed
- **Date.** 2026-05-03
- **Owner.** Souhail
- **Supersedes.** —

## Context

We need a framework that can host:

- A public B2B website with SEO-critical SSR/ISR pages.
- An admin console with auth-gated dynamic UI.
- A future client portal (Phase 3).
- Server-side mutations, route handlers for webhooks, and background-job triggers.

Constraints:

- Solo developer with AI assistance — must minimize moving parts.
- Three locales with RTL.
- Deployable on a managed platform (no Kubernetes).

Three plausible families:

1. **Next.js App Router** with React server components, server actions.
2. **Remix** with loaders/actions.
3. **Two separate apps** — e.g. Astro for the public site, an SPA for admin.

## Decision

We use **Next.js 15 App Router** as the single application framework. The public site, admin console, and future portal live as route groups inside one project, deployed to Vercel.

## Alternatives considered

- **Remix.** Excellent framework, but tighter Vercel integration and richer ecosystem (server components, server actions, ISR) make Next.js a better fit for our deployment target. Remix is the second choice if Next.js becomes problematic.
- **Astro for public + Next/SPA for admin.** Two apps means two deploys, two design systems, two i18n configs, and two deployments. Optimizes the public site by 10–20% (smaller bundle) at the cost of doubling the maintenance surface for a one-person team. Rejected.
- **SvelteKit.** Strong technical contender. Rejected because Souhail's TypeScript+React fluency is higher and AI tooling (Cursor, Claude) is much better at React than at Svelte today. Velocity wins.
- **A pure SPA + headless backend.** Rejected — terrible for SEO on the public site.

## Consequences

- **Positive.**
  - One codebase, one deploy, one design system, one i18n config.
  - Server components and server actions simplify data fetching and mutations.
  - First-class Vercel deployment, ISR, image optimization, edge functions if needed.
  - Excellent AI-tooling ergonomics.
- **Negative.**
  - App Router still maturing; some edge cases (caching, dynamic routing with `[locale]`) require careful handling.
  - Coupling to Vercel for some optimizations (ISR, image opt). Mitigated by Cloudflare in front.
  - One large app — module boundaries enforced by convention, not by package separation. We accept this for solo-dev velocity.
- **Neutral.**
  - We do not use a separate API layer (no tRPC, no GraphQL). Server actions cover MVP. Re-evaluate if the portal demands richer client-side data fetching.

## Open questions

- Whether to extract shared types into a `packages/shared` workspace later. Default: no, until pain emerges.

## References

- [system-overview.md](../system-overview.md)
- [tech-stack.md](../tech-stack.md)
- [Next.js App Router docs](https://nextjs.org/docs/app)
