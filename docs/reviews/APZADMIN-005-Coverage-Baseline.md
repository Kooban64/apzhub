# APZADMIN-005 — Coverage Baseline

**Date:** 2026-07-16  
**Command:** Vitest with coverage scoped to Administration vertical packages + HTTP handlers + client + Workbench + certification harness

## Consolidated result (APZADMIN-005 measurement)

| Metric             | Value      |
| ------------------ | ---------- |
| Statements / Lines | **99.37%** |
| Functions          | **99.43%** |
| Branches           | **82.75%** |

## Layer notes

| Layer                            | Lines   | Functions | Notes                                            |
| -------------------------------- | ------- | --------- | ------------------------------------------------ |
| Workbench components             | 99.39%  | 95.52%    | Secondary empty/error paths remain               |
| Typed client / facades           | 99.01%  | 100%      | Types-only file reports 0% (no executable stmts) |
| HTTP handlers                    | 99.44%  | 100%      | Via `administration.test.ts` + coverage harness  |
| admin-contracts                  | 100%    | 100%      |                                                  |
| admin-core                       | 100%    | 100%      |                                                  |
| admin-persistence                | 95.83%+ | 100%      | Postgres branch edges partial                    |
| platform-services/administration | 99.83%  | 98.76%    |                                                  |

## Scope / command

```bash
pnpm exec vitest run --coverage \
  packages/admin-contracts \
  packages/admin-core \
  packages/admin-persistence \
  packages/platform-services/src/services/administration \
  apps/web/lib/administration \
  apps/web/lib/api/v1/handlers/administration.test.ts \
  apps/web/lib/api/v1/handlers/administration.coverage.test.ts \
  apps/web/components/administration \
  testing/admin-foundation \
  testing/administration-platform-services \
  testing/administration-http-client \
  testing/administration-workbench \
  testing/administration-vertical \
  --coverage.include='packages/admin-contracts/**' \
  --coverage.include='packages/admin-core/**' \
  --coverage.include='packages/admin-persistence/**' \
  --coverage.include='packages/platform-services/src/services/administration/**' \
  --coverage.include='apps/web/lib/administration/**' \
  --coverage.include='apps/web/lib/api/v1/handlers/administration.ts' \
  --coverage.include='apps/web/components/administration/**'
```

## Target vs actual

Aspirational target ≥95% lines/functions. Achieved **99.37% lines / 99.43% functions**. Branch coverage **82.75%** remains below an absolute 95% bar on Postgres/client edge branches — documented as a limitation alongside intentional product exclusions.
