# ADR-0085 — Historical Correction and Supersession

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0085**                                                            |
| Title     | Historical Correction and Supersession                                  |
| Status    | **Accepted** (APZQEP-ARCH-015 Owner Architecture Acceptance 2026-07-28) |
| Date      | 2026-07-28                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-015                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Corrections must not silently rewrite accepted history.

## Decision

Prefer new TestExecution and supersession lineage for re-performance. Silent mutation of accepted/cancelled/superseded content is forbidden. Governed correction, if any, must be explicit, permissioned, and fully audited.

## Consequences

Historical integrity for certification and audit.

## Related

- docs/products/apzqep/test-execution/OES-ARCH-015/COMPLETE.md
- docs/products/apzqep/STANDING-PROGRAMME-RECORD.md
