# APZHUB Platform Document Workbench — Developer Guide

**Milestone:** APZDOCS-005

## Entry points

| Concern | Path |
|---------|------|
| View | `apps/web/components/documents/platform-documents-view.tsx` |
| Router | `apps/web/components/documents/documents-workspace-router.tsx` |
| Routes | `apps/web/lib/documents/routes.ts` |
| Client facades | `apps/web/lib/documents/document-api.ts` |
| Manifests | `packages/workbench-framework/manifests/platform-documents*/` |
| Shell mount | `apps/web/components/workbench-page.tsx` → `DocumentsWorkspaceRouter` |

## Rules

1. Call **only** `document-api` / `createHttpDocumentClient()` — never `fetch`, gateway, or document-core.
2. Use React Query for server state — no duplicated caches.
3. Keep components presentation-only.
4. Respect `document.*` permissions via manifests; API enforces authz.

## Tests

```bash
node scripts/apzdocs-005-document-workbench-audit.mjs
pnpm exec vitest run apps/web/lib/documents apps/web/components/documents testing/document-foundation/apzdocs-005-foundation.test.ts
pnpm test:e2e -- apzdocs-005-platform-documents-workbench
```

## Related

- [Workbench Architecture](../architecture/APZHUB-Platform-Document-Workbench.md)
- [Typed Client Guide](./APZHUB-Platform-Document-Typed-Client-Guide.md)
- [HTTP API](../architecture/APZHUB-Platform-Document-HTTP-API.md)
