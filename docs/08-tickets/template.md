# Ticket template

Use this template when filing a ticket (in this repo, GitHub issues, or a project tool TBD). Keep it short — < 200 words is ideal. The point is to be specific, not exhaustive.

---

## Title

`<verb> <object>`. E.g. "Add WhatsApp deep link to product detail page". Not "WhatsApp stuff".

## Context (1–2 sentences)

Why does this exist? What is the user-visible or operational outcome?

## Acceptance criteria

Checklist of testable conditions. Each must be objectively verifiable.

- [ ] …
- [ ] …
- [ ] …

## Out of scope

Explicit list of what this ticket does NOT do. Prevents scope creep.

## Implementation notes (optional)

- Files likely affected: `…`
- Existing components to reuse: `…`
- Migrations needed: yes/no
- ADR / module spec to align with: `…`

## Risk and rollback

What can go wrong? How do we roll back?

## Related

- Module: `[…](…)`
- ADR: `[…](…)`
- Open question: `[…](…)`
- Spike: `[…](…)`

## Definition of done

- [ ] Code merged and deployed to staging.
- [ ] Acceptance criteria validated on staging.
- [ ] Tests added (unit / E2E as appropriate).
- [ ] Documentation updated if user-visible behavior or invariants changed.
- [ ] Audit-log event emitted if a state change.
- [ ] Owner notified.
