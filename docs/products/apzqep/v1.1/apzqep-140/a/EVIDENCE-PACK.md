# APZQEP-140-A — Evidence Pack

## Engineering artefacts

| Artefact             | Location                                                       |
| -------------------- | -------------------------------------------------------------- |
| Package              | `packages/qep-suites/`                                         |
| QKI suite projection | `packages/qep-knowledge-index/src/projection/suite-builder.ts` |
| Module               | `modules/qep-suites/module.yaml`                               |
| API routes           | `apps/web/app/api/v1/qep/suites/**`                            |
| Handlers / schemas   | `apps/web/lib/api/v1/{handlers,schemas}/qep-suites.ts`         |
| Client               | `apps/web/lib/qep/qep-suites-api.ts`                           |
| Workspace UX         | `apps/web/components/qep/qep-suites-views.tsx`                 |
| Runtime              | `apps/web/lib/qep/suite-runtime.ts`                            |

## Tests

```bash
pnpm --filter @apzhub/qep-suites test
pnpm --filter @apzhub/qep-knowledge-index test
```

## Docs

See [README.md](./README.md).
