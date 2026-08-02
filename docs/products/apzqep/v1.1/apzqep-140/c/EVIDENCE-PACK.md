# Evidence Pack

Artefacts: `packages/qep-execution-workspace/`, `apps/web/app/api/v1/qep/execution-sessions/`, `apps/web/components/qep/qep-execution-workspace-views.tsx`, `modules/qep-execution-workspace/module.yaml`, QKI `execution-builder.ts`, docs under `docs/products/apzqep/v1.1/apzqep-140/c/`.

```bash
pnpm --filter @apzhub/qep-execution-workspace test
pnpm --filter @apzhub/qep-knowledge-index test
pnpm --filter @apzhub/qep-execution-plans test
pnpm --filter @apzhub/qep-suites test
```
