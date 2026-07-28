# Configuration Checklist — Test Execution 1.0.0-rc.1

| #   | Item                                                 | Required                          | Notes                                                   |
| --- | ---------------------------------------------------- | --------------------------------- | ------------------------------------------------------- |
| 1   | PostgreSQL reachable                                 | ✅                                | Platform DB                                             |
| 2   | Migrations 0087 + 0088 applied                       | ✅                                | Journal entries present                                 |
| 3   | RLS session `app.tenant_id` set per platform pattern | ✅                                | Required for table access                               |
| 4   | `APZHUB_QEP_ENABLED`                                 | ✅                                | Must not be `false`/`0`/`off` for this capability       |
| 5   | Better Auth / session cookies                        | ✅                                | Platform                                                |
| 6   | Redis (platform session/cache as configured)         | ✅                                | Platform                                                |
| 7   | No production secrets in repo                        | ✅                                | Verified for capability paths                           |
| 8   | Module registered (`modules/qep-test-execution`)     | ✅                                | Nav + permissions                                       |
| 9   | Permission assignments for operator roles            | ✅                                | Least privilege; tighten evidence-related grants (L-02) |
| 10  | Outbox consumers                                     | ❌ Not required                   | Must not be assumed (L-03)                              |
| 11  | Evidence accessibility hook                          | ❌ Not wired                      | Track before unrestricted GA (L-02)                     |
| 12  | OpenAPI publish                                      | ❌ Not required for controlled RC | L-01                                                    |

## Feature flags

No dedicated Test Execution feature flag. Capability follows shared QEP enable gate + RBAC.
