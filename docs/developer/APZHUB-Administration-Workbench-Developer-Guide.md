# Administration Workbench Developer Guide

**Milestone:** APZADMIN-004

## Layout

| Path | Role |
| --- | --- |
| `apps/web/lib/administration/routes.ts` | Workspace + HTTP helpers |
| `apps/web/lib/administration/administration-api.ts` | Typed-client facades |
| `apps/web/components/administration/administration-workspace-router.tsx` | Path → section |
| `apps/web/components/administration/platform-administration-view.tsx` | Section UI |
| `packages/workbench-framework/manifests/platform-admin*/` | Activity Bar + Sidebar |

## Consumption rule

```ts
import { listModules } from "@/lib/administration/administration-api";
```

Do **not** import `@apzhub/platform-services`, `@apzhub/admin-core`, `@apzhub/admin-persistence`, or call `fetch` in UI.

## Audit

```bash
pnpm audit:administration-workbench
```

## Tests

```bash
pnpm exec vitest run apps/web/components/administration apps/web/lib/administration testing/administration-workbench
```

## Shell wiring

`workbench-page.tsx`: ops (`/workspace/operations`) first, then other products, Configuration, then Administration (`isAdministrationRoute` → `AdministrationWorkspaceRouter`).

## Stop

Do not start **APZADMIN-005** without owner approval.
