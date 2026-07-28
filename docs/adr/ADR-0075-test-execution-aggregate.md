# ADR-0075 — Test Execution Aggregate Root

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0075**                                                            |
| Title     | Test Execution Aggregate Root                                           |
| Status    | **Accepted** (APZQEP-ARCH-015 Owner Architecture Acceptance 2026-07-28) |
| Date      | 2026-07-28                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-015                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Need a single authoritative name for the controlled performance of testing work.

## Decision

Adopt **TestExecution** as the sole aggregate root and ubiquitous term. Do not use run/session/instance as alternate aggregate names in contracts.

## Consequences

Removes naming ambiguity; aligns SoR clarity for ENG Spec.

## Related

- docs/products/apzqep/test-execution/OES-ARCH-015/COMPLETE.md
- docs/products/apzqep/STANDING-PROGRAMME-RECORD.md
