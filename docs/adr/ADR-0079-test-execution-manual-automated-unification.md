# ADR-0079 — Manual and Automated Execution Unification

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0079**                                                            |
| Title     | Manual and Automated Execution Unification                              |
| Status    | **Accepted** (APZQEP-ARCH-015 Owner Architecture Acceptance 2026-07-28) |
| Date      | 2026-07-28                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-015                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Manual and automated results must share auditability without embedding a runner.

## Decision

Unify under TestExecution with mode (manual|assisted_manual|automated|imported) and agent identity. Automation enters via authorised ingestion/execution paths — no runner engine in this capability.

## Consequences

Single lifecycle and audit model for all performers.

## Related

- docs/products/apzqep/test-execution/OES-ARCH-015/COMPLETE.md
- docs/products/apzqep/STANDING-PROGRAMME-RECORD.md
