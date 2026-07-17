# APZADMIN-002 Coverage Baseline

**Date:** 2026-07-16  
**Scope:** Administration platform-services module + admin-core domain service

## Target

Meaningful coverage **≥95%** lines/functions on:

- `packages/platform-services/src/services/administration/**`
- `packages/admin-core/src/service/**`

## Command

```bash
pnpm exec vitest run \
  packages/admin-core/src/service \
  packages/platform-services/src/services/administration \
  testing/administration-platform-services \
  --coverage \
  --coverage.include='packages/platform-services/src/services/administration/**' \
  --coverage.include='packages/admin-core/src/service/**'
```

## Notes

- In-memory persistence used for functional coverage
- Production factory fail-closed paths covered without live Postgres
- Boundary tests assert no HTTP / workbench / Event Bus / runtime admin
- Measured (2026-07-16): **~99.9%** lines, **~99.3%** functions, **~95%** branches on scoped includes
