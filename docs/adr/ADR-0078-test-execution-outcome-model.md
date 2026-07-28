# ADR-0078 — Test Execution Outcome Model

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0078**                                                            |
| Title     | Test Execution Outcome Model                                            |
| Status    | **Accepted** (APZQEP-ARCH-015 Owner Architecture Acceptance 2026-07-28) |
| Date      | 2026-07-28                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-015                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Need a canonical outcome taxonomy for steps and executions.

## Decision

Adopt step outcomes: passed, failed, blocked, skipped, not_applicable, inconclusive, not_executed, cancelled. Execution-level outcome is Domain-derived then finalised (review or fast-path).

## Consequences

Unambiguous reporting and audit; overrides require audited review.

## Related

- docs/products/apzqep/test-execution/OES-ARCH-015/COMPLETE.md
- docs/products/apzqep/STANDING-PROGRAMME-RECORD.md
