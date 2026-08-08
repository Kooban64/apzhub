# SUP-H4 — Security residual

| Field  | Value            |
| ------ | ---------------- |
| ID     | **SUP-H4**       |
| Slice  | **APZSUP-304**   |
| Status | **Closed**       |
| Date   | 20260808T180000Z |

## Evidence

| Control                 | Proof                                                  |
| ----------------------- | ------------------------------------------------------ |
| Session required        | All `/api/v1/support*` use `withPlatformApiAuth`       |
| Handler permission gate | `requireSupportPermission` (SUP-PR-05)                 |
| Empty grants            | 403 `FORBIDDEN` (`platform-api.support.v1.test.ts`)    |
| Cross-tenant            | `MAPPING_NOT_FOUND`                                    |
| Error honesty           | Playwright denied path — no engine brand leak (SUP-H1) |

Complements SUP-PR-05. No Support 2.0 security programme.
