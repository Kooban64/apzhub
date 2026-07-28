# ADR-0081 — Observations vs Defects Boundary

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0081**                                                            |
| Title     | Observations vs Defects Boundary                                        |
| Status    | **Accepted** (APZQEP-ARCH-015 Owner Architecture Acceptance 2026-07-28) |
| Date      | 2026-07-28                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-015                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Failures and notes must be recordable without Defect Management.

## Decision

Record **ExecutionObservation** and failure reasons inside Test Execution. Confirmed defects and defect lifecycle belong to future Defect Management; optional future promotion links only.

## Consequences

Keeps facts now; defects later.

## Related

- docs/products/apzqep/test-execution/OES-ARCH-015/COMPLETE.md
- docs/products/apzqep/STANDING-PROGRAMME-RECORD.md
