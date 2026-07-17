# APZIDENTITY-002 Coverage Baseline

Meaningful coverage **≥95%** lines/functions on:

- `packages/platform-services/src/services/identity/**`
- `packages/identity-core/src/service/create-platform-identity-service.ts`

## Measurement

```bash
pnpm exec vitest run --config vitest.config.ts \
  packages/platform-services/src/services/identity \
  packages/identity-core/src/service/create-platform-identity-service.test.ts \
  --coverage \
  --coverage.include='packages/platform-services/src/services/identity/**' \
  --coverage.include='packages/identity-core/src/service/create-platform-identity-service.ts'
```

## Result (2026-07-16)

- Lines: **~99.1%**
- Functions: **~99.3%**
- Branches: **~87.5%** (meaningful branch coverage)

In-memory persistence used for functional coverage. Production path covered via factory construction with explicit `postgresDb` stub.
