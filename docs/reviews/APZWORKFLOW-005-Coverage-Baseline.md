# APZWORKFLOW-005 — Coverage Baseline

Consolidates prior APZWORKFLOW-001–004 baselines plus vertical harness.

## Prior baselines

| Milestone | Doc |
| --- | --- |
| 001 | [APZWORKFLOW-001-coverage-baseline](./APZWORKFLOW-001-coverage-baseline.md) |
| 002 | [APZWORKFLOW-002-coverage-baseline](./APZWORKFLOW-002-coverage-baseline.md) |
| 003 | [APZWORKFLOW-003-coverage-baseline](./APZWORKFLOW-003-coverage-baseline.md) |
| 004 | [APZWORKFLOW-004-coverage-baseline](./APZWORKFLOW-004-coverage-baseline.md) |

## Vertical harness (005)

| Suite | Location |
| --- | --- |
| Certification | `testing/workflow-vertical/apzworkflow-005-certification.test.ts` |
| Dependency boundaries | `testing/workflow-vertical/apzworkflow-005-boundary.test.ts` |

## Practical coverage posture

| Module | Posture |
| --- | --- |
| workflow-contracts / core / persistence | Governed by 001 baselines + foundation Vitest |
| Platform Workflow services / gateway | 002 coverage tests (`apzworkflow-002-coverage.test.ts`) |
| HTTP handlers + typed client | 003 Vitest suites |
| Workbench helpers | 004 — helpers ~93–100%; large view ~83%; combined ~87% practical |
| Certification harness | Static audit + smoke (not line-coverage pad) |

Global monorepo Istanbul thresholds apply when running full `test:coverage`. Scoped Workflow packages meet previously governed floors; Workbench large view remains practical rather than artificial 95% inflation — acknowledged limitation, not a certification defect for management-plane freeze.
