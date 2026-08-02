# Evidence Pack — APZQEP-140-D

Artefacts:

- `packages/qep-defects/`
- `packages/qep-knowledge-index/src/projection/defect-builder.ts`
- `apps/web/app/api/v1/qep/defects/`
- `apps/web/components/qep/qep-defects-views.tsx`
- `apps/web/lib/qep/defect-runtime.ts`
- `modules/qep-defects/module.yaml`
- Docs under `docs/products/apzqep/v1.1/apzqep-140/d/`
- Product rule: `PRODUCT-RULE-DEFECT-INVESTIGATION.md`

```bash
pnpm --filter @apzhub/qep-defects test
pnpm --filter @apzhub/qep-knowledge-index test
pnpm --filter @apzhub/qep-execution-workspace test
```
