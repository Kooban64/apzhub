# Test Report — APZ-PROJECTS-NATIVE-001-N02

| Field     | Value                       |
| --------- | --------------------------- |
| Slice     | APZ-PROJECTS-NATIVE-001-N02 |
| Status    | **COMPLETE**                |
| Timestamp | 20260805T071500Z            |

## Coverage

| Area                           | Evidence                                                          |
| ------------------------------ | ----------------------------------------------------------------- |
| Session → Projects permissions | `apps/web/lib/projects/use-projects-permissions.test.tsx`         |
| No `projects.*` UI default     | Router denies create/search/health with empty grants              |
| Route gating                   | `apps/web/components/projects/projects-workspace-router.test.tsx` |

## Commands

```bash
pnpm exec vitest run \
  apps/web/lib/projects/use-projects-permissions.test.tsx \
  apps/web/components/projects/projects-workspace-router.test.tsx
```

## Result

```text
Test Files  2 passed (2)
Tests       6 passed (6)
```
