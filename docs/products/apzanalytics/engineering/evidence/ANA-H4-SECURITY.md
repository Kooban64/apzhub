# ANA-H4 — Security residual

| Field  | Value            |
| ------ | ---------------- |
| ID     | **ANA-H4**       |
| Slice  | **APZAN-304**    |
| Status | **Closed**       |
| Date   | 20260808T191000Z |

| Control          | Proof                                         |
| ---------------- | --------------------------------------------- |
| Session required | `withPlatformApiAuth` on `/api/v1/analytics*` |
| Handler gate     | `requireAnalyticsPermission` (ANA-PR-05)      |
| Empty grants     | 403 FORBIDDEN                                 |
| Error honesty    | Playwright denied path — no engine brand      |

Complements ANA-PR-05.
