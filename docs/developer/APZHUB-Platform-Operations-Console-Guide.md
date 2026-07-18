# APZHUB Platform Operations Console — Developer Guide

> **Audience:** Platform engineers  
> **Milestone:** M8-03

---

## Access

1. Sign in to `apps/web`
2. Open **Platform Operations** on the Activity Bar
3. Navigate via sidebar sections

Base route: `/workspace/administration`

---

## Adding a new operations section

1. **Manifest** — create `packages/workbench-framework/manifests/platform-operations-<section>/module.yaml` with sidebar navigation under `platform-administration`.
2. **Route** — add section to `PLATFORM_OPERATIONS_SECTIONS` in `apps/web/lib/platform-operations/routes.ts`.
3. **Component** — add section component in `apps/web/components/platform-operations/operations-workspace-router.tsx`.
4. **API** (if needed) — add read-only route under `apps/web/app/api/platform/v1/`.

Do not call `@apzhub/platform-identity` or `@apzhub/platform-authorization` directly from UI — use platform APIs.

---

## Key files

| File                                                                      | Purpose                     |
| ------------------------------------------------------------------------- | --------------------------- |
| `apps/web/components/workbench-page.tsx`                                  | Routes operations workspace |
| `apps/web/components/platform-operations/operations-workspace-router.tsx` | Section pages               |
| `apps/web/lib/platform-operations/routes.ts`                              | Route resolution            |
| `apps/web/lib/platform-operations/ops-api.ts`                             | Client fetch helpers        |

---

## Testing

```bash
pnpm vitest run apps/web/lib/platform-operations/routes.test.ts
```

---

## Constraints

- Presentation only in Workbench components
- Reuse existing diagnostics — no duplicate health logic
- No Law Platform business screens in operations workspace
