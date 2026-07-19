# Time HTTP API — Compatibility Statement

> **Programme:** APZHUB-TIME-HTTP-001

| Component                            | Version    | Status                                                |
| ------------------------------------ | ---------- | ----------------------------------------------------- |
| Platform OpenAPI                     | **1.10.0** | Unchanged by KIMAI-002                                |
| `@apzhub/platform-service-contracts` | **0.17.1** | Consumed                                              |
| `@apzhub/platform-services`          | **0.26.1** | Consumed (`domainMode: kimai`)                        |
| `@apzhub/integration-kimai`          | **0.2.0**  | Domain CE (KIMAI-002 **ACCEPTED** · CERTIFIED_DOMAIN) |
| `@apzhub/integration-sdk`            | **1.0.0**  | Unchanged                                             |
| Projects HTTP surface                | existing   | Unchanged                                             |

## Compatibility notes

1. Time Entries paths are aliases of Timesheets (same Platform Service).
2. `/time/projects` are **time-domain** projects (`tproj_*`), not APZ Projects (`proj_*`).
3. Production Kimai domain CRUD no longer foundation-only for implemented CE domains (KIMAI-002).
4. Foundation search composes `gateway.time.*.list` — not the Platform Search SoR.
