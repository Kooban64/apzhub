# ADR-0086 — AI Assistance Boundary

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0086**                                                            |
| Title     | AI Assistance Boundary                                                  |
| Status    | **Accepted** (APZQEP-ARCH-015 Owner Architecture Acceptance 2026-07-28) |
| Date      | 2026-07-28                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-015                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

AI may assist operators but must not become an ungoverned authority.

## Decision

AI may explain/summarise/suggest only. AI MUST NOT fabricate outcomes, mark pass/fail, bypass evidence, impersonate actors, finalise review, or override Domain state. Human-in-the-loop and provenance required for any applied suggestion. No AI implementation under ARCH-015.

## Consequences

Aligns with constitutional AI governance.

## Related

- docs/products/apzqep/test-execution/OES-ARCH-015/COMPLETE.md
- docs/products/apzqep/STANDING-PROGRAMME-RECORD.md
