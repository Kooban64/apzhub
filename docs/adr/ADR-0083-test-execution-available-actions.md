# ADR-0083 — availableActions Derivation and Transport

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0083**                                                            |
| Title     | availableActions Derivation and Transport                               |
| Status    | **Accepted** (APZQEP-ARCH-015 Owner Architecture Acceptance 2026-07-28) |
| Date      | 2026-07-28                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-015                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Workbench must not invent executable actions.

## Decision

Application computes availableActions from state + permissions + assignment + policy. Workbench renders only those actions. Transport via execution DTO and/or dedicated query. No client lifecycle engine.

## Consequences

Preserves constitutional Workbench purity.

## Related

- docs/products/apzqep/test-execution/OES-ARCH-015/COMPLETE.md
- docs/products/apzqep/STANDING-PROGRAMME-RECORD.md
