# APZHUB Platform Search — Persistence Developer Guide (addendum)

See primary guide: continue to use factories from `@apzhub/search-persistence` and gateway composition from `@apzhub/platform-services` (APZSEARCH-003).

Audit:

```bash
pnpm audit:search-platform-services
pnpm --filter @apzhub/platform-services exec true
pnpm exec vitest run --config vitest.config.ts packages/platform-services/src/services/search
```
