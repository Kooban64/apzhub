# APZ Time 1.0.0 — Compatibility Statement

> **Release:** APZ Time **1.0.0** Phase 1  
> **Status:** **ACCEPTED / CLOSED**

| Component                            | Version            | Status                           |
| ------------------------------------ | ------------------ | -------------------------------- |
| `@apzhub/integration-sdk`            | **1.0.0**          | **Unchanged**                    |
| `@apzhub/integration-kimai`          | **0.2.0**          | **Unchanged** (CERTIFIED_DOMAIN) |
| `@apzhub/platform-service-contracts` | **0.17.1**         | **Unchanged**                    |
| `@apzhub/platform-services`          | **0.26.1**         | **Unchanged**                    |
| Time HTTP `/api/v1/time/*`           | OpenAPI **1.10.0** | **Unchanged**                    |
| APZ Projects                         | **1.1.0**          | Unaffected                       |
| Plane integration                    | **0.6.0**          | Unaffected                       |

## Notes

1. Workbench consumes Platform HTTP only — no Module → Connector bypass.
2. Time-domain projects (`tproj_*`) are not APZ Projects (`proj_*`).
3. Tags search remains PARTIAL at Kimai CE variance.
4. In-memory domain mode is non-production only.
