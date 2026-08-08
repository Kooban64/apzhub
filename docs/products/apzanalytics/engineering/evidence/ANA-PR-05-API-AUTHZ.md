# ANA-PR-05 — API authz sweep

| Field  | Value            |
| ------ | ---------------- |
| ID     | **ANA-PR-05**    |
| Slice  | **APZAN-205**    |
| Status | **Closed**       |
| Date   | 20260808T185500Z |

## Changes

1. `requireAnalyticsPermission` — fail-closed session gate.
2. Analytics + decision-intelligence handlers invoke the gate.
3. Health/readiness require `analytics.admin`.
4. Routes remain on `withPlatformApiAuth` (401 when unauthenticated).

## Tests

- `require-analytics-permission.test.ts`
- `platform-api.analytics.v1.test.ts` — empty permissions → 403
