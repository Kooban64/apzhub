# APZNOTIFY-005 — Coverage Baseline

Consolidates prior APZNOTIFY-001–004 baselines plus vertical harness.

## Prior baselines

| Milestone | Doc                                                                     |
| --------- | ----------------------------------------------------------------------- |
| 001       | [APZNOTIFY-001-coverage-baseline](./APZNOTIFY-001-coverage-baseline.md) |
| 002       | [APZNOTIFY-002-coverage-baseline](./APZNOTIFY-002-coverage-baseline.md) |
| 003       | [APZNOTIFY-003-coverage-baseline](./APZNOTIFY-003-coverage-baseline.md) |
| 004       | [APZNOTIFY-004-coverage-baseline](./APZNOTIFY-004-coverage-baseline.md) |

## Consolidated re-measure (005)

Scoped include:

- `packages/notification-*/src/**`
- `packages/platform-services/src/services/notification/**`
- `apps/web/lib/notifications/**`
- `apps/web/components/notifications/**`

| Metric     |   Combined |
| ---------- | ---------: |
| Lines      | **98.42%** |
| Statements | **98.42%** |
| Functions  | **96.95%** |
| Branches   | **83.18%** |

Target ≥95% lines/functions met. Meaningful branch coverage ≥80%.

## Vertical harness

| Suite                 | Location                                                            |
| --------------------- | ------------------------------------------------------------------- |
| Certification         | `testing/notification-vertical/apznotify-005-certification.test.ts` |
| Dependency boundaries | `testing/notification-vertical/apznotify-005-boundary.test.ts`      |
