# Test Report — APZ-PROJECTS-NATIVE-001-N03

| Field     | Value                       |
| --------- | --------------------------- |
| Slice     | APZ-PROJECTS-NATIVE-001-N03 |
| Status    | **COMPLETE**                |
| Timestamp | 20260805T072500Z            |

## Coverage

| Area                         | Evidence                                                              |
| ---------------------------- | --------------------------------------------------------------------- |
| Navigation / help / settings | `apps/web/components/projects/projects-navigation.test.ts`            |
| Router help/settings         | `apps/web/components/projects/projects-workspace-router.test.tsx`     |
| Routes                       | `apps/web/lib/projects/routes.test.ts`                                |
| Preferences                  | `apps/web/lib/projects/preferences.test.ts`                           |
| Manifests                    | `packages/platform-runtime/.../projects-manifests.test.ts`            |
| Architecture boundary        | `apps/web/components/projects/projects-architecture-boundary.test.ts` |

## Commands

```bash
pnpm exec vitest run \
  apps/web/components/projects \
  apps/web/lib/projects \
  packages/platform-runtime/src/manifest-engine/projects-manifests.test.ts
```

## Result

```text
Test Files  9 passed (9)
Tests       43 passed (43)
```
