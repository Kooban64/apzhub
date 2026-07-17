# APZOBSERVE-001 Quality Evidence

| Gate | Evidence | Result |
| --- | --- | --- |
| Architecture / dependency / boundary audit | `pnpm audit:observe-foundation` | PASS |
| Foundation harness | `testing/observe-foundation/apzobserve-001-foundation.test.ts` | PASS |
| Domain harness | `testing/observe-foundation/apzobserve-001-domain.test.ts` | PASS |
| Typecheck | `pnpm --filter @apzhub/observe-{contracts,core,persistence} typecheck` | PASS |
| Lint | `pnpm --filter @apzhub/observe-{contracts,core,persistence} lint` | PASS |
| Vitest (observe packages + harness) | 22 tests | PASS |
| Coverage (scoped) | [coverage baseline](./APZOBSERVE-001-coverage-baseline.md) | PASS (≥95% lines/functions) |

## Versions

| Package | Version |
| --- | --- |
| `@apzhub/observe-contracts` | 0.1.0 |
| `@apzhub/observe-core` | 0.1.0 |
| `@apzhub/observe-persistence` | 0.1.0 |

## Migrations

- `0054_apz_platform_observe.sql`
- `0055_apz_platform_observe_rls.sql`
