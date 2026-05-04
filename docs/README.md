# Prodet Platform — Documentation

This is the source of truth for the Prodet Platform during conception and beyond. Every architectural choice, product decision, spike, and open question lives here.

## Map

```
docs/
  00-overview/    What and why
  01-product/     PRD, MVP scope, roadmap, backlog, open questions
  02-architecture/ System design, data model, ADRs
  03-modules/     Per-module specs (public site, intake, matching, swiver, portal)
  04-design/      Brand, design tokens, components, content rules
  05-ops/         CI/CD, deployment, observability, runbooks
  06-spikes/      Pre-build proofs of concept (gating)
  07-research/    Competitor analysis, keyword research, catalog audit
  08-tickets/     Ticket templates and milestone breakdowns
```

## Reading order for a new contributor

1. [00-overview/vision.md](00-overview/vision.md)
2. [00-overview/personas.md](00-overview/personas.md)
3. [00-overview/sectors.md](00-overview/sectors.md)
4. [01-product/mvp-scope.md](01-product/mvp-scope.md)
5. [01-product/non-goals.md](01-product/non-goals.md)
6. [01-product/roadmap.md](01-product/roadmap.md)
7. [02-architecture/system-overview.md](02-architecture/system-overview.md)
8. [02-architecture/data-model.md](02-architecture/data-model.md)
9. [02-architecture/adr/](02-architecture/adr/)
10. [06-spikes/](06-spikes/)
11. [07-research/competitors.md](07-research/competitors.md)

## Conventions

- Markdown only. Mermaid for diagrams.
- ADRs follow [02-architecture/adr/0001-record-format.md](02-architecture/adr/0001-record-format.md).
- Spike briefs follow the structure shown in any of the existing files under `06-spikes/`.
- French and Arabic terms (e.g. *devis*, *bon de livraison*, *fiche technique*) are written as plain text — they are domain vocabulary, not foreign words.
