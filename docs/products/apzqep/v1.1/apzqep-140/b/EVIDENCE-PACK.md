# APZQEP-140-B Evidence Pack

## Categories

APZQEP-140-B-ENGINEERING · TEST · SECURITY · UX-ACCESSIBILITY · CERTIFICATION · COMPLETION

## Artefacts

- `packages/qep-execution-plans/`
- `packages/qep-knowledge-index/src/projection/execution-plan-builder.ts`
- `modules/qep-execution-plans/module.yaml`
- `apps/web/app/api/v1/qep/execution-plans/**`
- `apps/web/components/qep/qep-execution-plans-views.tsx`
- Docs under `docs/products/apzqep/v1.1/apzqep-140/b/`
- Cap A retrospective `../a/CAPABILITY-A-RETROSPECTIVE.md`

## Tests

```bash
pnpm --filter @apzhub/qep-execution-plans test
pnpm --filter @apzhub/qep-knowledge-index test
pnpm --filter @apzhub/qep-suites test
```
