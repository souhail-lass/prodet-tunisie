# ADR 0001 — Record format for ADRs

- **Status.** Accepted
- **Date.** 2026-05-03
- **Owner.** Souhail
- **Supersedes.** —

## Context

We need a consistent format for Architecture Decision Records so that future contributors (including AI agents) can locate, understand, and update them without re-deriving the structure each time.

The popular formats — Michael Nygard's original ADR template, the MADR template, the C4 model's ADR — all serve this purpose. We adopt a lightweight Nygard-flavored variant tailored to the size of this project.

## Decision

Each ADR is a markdown file under `docs/02-architecture/adr/` named `NNNN-short-title-in-kebab.md`.

The required sections are, in order:

1. **Title line.** `# ADR NNNN — Title`.
2. **Header block.** Status, date, owner, supersedes/superseded-by.
3. **Context.** What is the problem? What forces are at play? Constraints, prior decisions, related ADRs.
4. **Decision.** What we are doing, in declarative present tense ("We use X.").
5. **Alternatives considered.** Each alternative with a one-line rejection reason.
6. **Consequences.** Both positive and negative. What becomes easier; what becomes harder.
7. **Open questions.** Anything still in flux. (Optional.)
8. **References.** Links to spikes, external docs, related ADRs.

Statuses: `Proposed`, `Accepted`, `Rejected`, `Superseded by NNNN`, `Deprecated`.

Numbering is monotonic and global. We do not renumber.

## Alternatives considered

- **MADR template.** More structured but heavier. Rejected for ergonomics at our project size.
- **Free-form prose.** Rejected — defeats the point of a record.
- **Issue-tracker tickets.** Rejected — not version-controlled with the code.

## Consequences

- **Positive.** Predictable structure. Easy to scan. AI agents can be told to follow this template.
- **Negative.** New contributors must read this file once before authoring an ADR.
- **Neutral.** No tooling to enforce the structure today; CI may add a markdown lint rule later.

## References

- Michael Nygard, "Documenting Architecture Decisions" (2011).
- [adr/README.md](README.md) — index of all ADRs.
