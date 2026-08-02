# Evidence Pack — APZQEP-140-E

Artefacts:

- `packages/qep-requirements-traceability/`
- `packages/qep-knowledge-index/src/projection/requirement-builder.ts`
- `apps/web/app/api/v1/qep/enterprise-requirements/`
- `apps/web/components/qep/qep-enterprise-requirements-views.tsx`
- `apps/web/lib/qep/enterprise-requirements-runtime.ts`
- `modules/qep-enterprise-requirements/module.yaml`
- Docs under `docs/products/apzqep/v1.1/apzqep-140/e/`
- Product rule: `PRODUCT-RULE-TRACEABILITY-DERIVED.md`

```bash
pnpm --filter @apzhub/qep-requirements-traceability test
pnpm --filter @apzhub/qep-knowledge-index test
pnpm --filter @apzhub/qep-defects test
```
