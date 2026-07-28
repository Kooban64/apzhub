# ADR-0082 — Review and Finalisation Model

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0082**                                                            |
| Title     | Review and Finalisation Model                                           |
| Status    | **Accepted** (APZQEP-ARCH-015 Owner Architecture Acceptance 2026-07-28) |
| Date      | 2026-07-28                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-015                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Need governed finalisation without forcing every execution through identical review.

## Decision

Support completed → submitted_for_review → accepted|rejected, plus policy fast-path completed → accepted only when exposed via availableActions. Accepted records are immutable except supersession/governed correction.

## Consequences

Balances assurance and operational speed under server authority.

## Related

- docs/products/apzqep/test-execution/OES-ARCH-015/COMPLETE.md
- docs/products/apzqep/STANDING-PROGRAMME-RECORD.md
