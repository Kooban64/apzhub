# Test Report — APZ-SUPPORT-NATIVE-001-N02

| Field     | Value                      |
| --------- | -------------------------- |
| Slice     | APZ-SUPPORT-NATIVE-001-N02 |
| Status    | **COMPLETE**               |
| Timestamp | 20260805T043000Z           |

## Coverage

| Area                          | Evidence                                                        |
| ----------------------------- | --------------------------------------------------------------- |
| Session → Support permissions | `apps/web/lib/support/use-support-permissions.test.tsx`         |
| No `support.*` UI default     | Router denies create/users/search/analytics with empty grants   |
| Route gating                  | `apps/web/components/support/support-workspace-router.test.tsx` |
| Detail soft-open removed      | `permissions === undefined` bypass deleted from detail view     |

## Commands

```bash
pnpm exec vitest run \
  apps/web/lib/support/use-support-permissions.test.tsx \
  apps/web/components/support/support-workspace-router.test.tsx \
  apps/web/components/support/support-request-detail-view.test.tsx
```
