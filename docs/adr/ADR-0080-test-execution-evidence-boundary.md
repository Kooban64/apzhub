# ADR-0080 — Evidence Ownership Boundary

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0080**                                                            |
| Title     | Evidence Ownership Boundary                                             |
| Status    | **Accepted** (APZQEP-ARCH-015 Owner Architecture Acceptance 2026-07-28) |
| Date      | 2026-07-28                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-015                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Executions need evidence association without absorbing Evidence Management.

## Decision

Test Execution owns **EvidenceReference** (pointer + integrity metadata) only. Blob storage, retention SoR, and evidence lifecycle belong to future Evidence Management.

## Consequences

Prevents premature SoR expansion.

## Related

- docs/products/apzqep/test-execution/OES-ARCH-015/COMPLETE.md
- docs/products/apzqep/STANDING-PROGRAMME-RECORD.md
