# ADR-0077 — Test Execution vs Test Runs Boundary

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0077**                                                            |
| Title     | Test Execution vs Test Runs Boundary                                    |
| Status    | **Accepted** (APZQEP-ARCH-015 Owner Architecture Acceptance 2026-07-28) |
| Date      | 2026-07-28                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-015                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Wave 2 lists both Test Execution and Test Runs; overlap would destroy bounded contexts.

## Decision

**TestExecution** is the atomic performance SoR. **Test Run** is a separate future orchestration capability grouping executions. Test Run is not implemented or aliased inside Test Execution.

## Consequences

Clear Expansion sequencing; prevents dual SoRs.

## Related

- docs/products/apzqep/test-execution/OES-ARCH-015/COMPLETE.md
- docs/products/apzqep/STANDING-PROGRAMME-RECORD.md
