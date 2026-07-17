# APZWORKFLOW-003 Coverage Baseline

Scoped modules:

- `apps/web/lib/api/v1/handlers/workflows.ts` — **~98%** lines, **100%** functions
- `apps/web/lib/workflows/{workflow-client,workflow-api,mock,errors,routes}.ts` — **~96%** lines combined, **100%** functions

Overall scoped statement/line coverage: **~97%** (branches lower on mock/client mapping).

Forbidden route absence covered in handler tests and `pnpm audit:workflow-http-client`.

```bash
pnpm exec vitest run \
  apps/web/lib/api/v1/handlers/workflows.test.ts \
  apps/web/lib/workflows \
  --coverage
```
