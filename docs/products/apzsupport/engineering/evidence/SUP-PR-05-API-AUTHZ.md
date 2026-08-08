# SUP-PR-05 — API authz sweep

| Field  | Value            |
| ------ | ---------------- |
| ID     | **SUP-PR-05**    |
| Slice  | **APZSUP-205**   |
| Status | **Closed**       |
| Date   | 20260808T174000Z |

## Changes

1. `requireSupportPermission` — fail-closed session gate for Support permissions.
2. All Support HTTP handlers invoke the gate with catalogue permissions.
3. All `/api/v1/support*` routes use `withPlatformApiAuth` (session required → 401 when unauthenticated).
4. Gateway / service-layer authz remains authoritative for deeper checks (`PERMISSION_DENIED`).

## Tests

- `apps/web/lib/api/v1/handlers/require-support-permission.test.ts`
- `platform-api.support.v1.test.ts` — empty permissions → 403; routes use `withPlatformApiAuth`
