# APZHUB Supported Services

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20

---

## Support tiers for shared services

| Tier                           | Meaning                                   | Examples                                                                       |
| ------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------ |
| **Tier A — Critical**          | Production identity/path; P1 if down      | Identity, Gateway, AuthZ, Platform PostgreSQL, Redis (session)                 |
| **Tier B — Core product path** | Blocks a commercial product               | Project/Time/Support/Documents/TCMS/Analytics/Workflow/Law services + adapters |
| **Tier C — Enhancement**       | Degraded UX acceptable short-term         | Automation journal, ENF Attention toasts, Activity stream                      |
| **Tier D — Metadata / frozen** | Operate within freeze; no delivery claims | APZNOTIFY delivery, Observe/Metrics live providers, Workflow execute           |

## Supported shared services matrix

| Service                         | Tier | Supported      | Notes                                            |
| ------------------------------- | ---- | -------------- | ------------------------------------------------ |
| Identity / BetterAuth           | A    | Yes            | SSO silent handoff; no engine login screens      |
| AuthZ / PermissionService       | A    | Yes            | Law path hardened in 1.1                         |
| API Gateway                     | A    | Yes            | One client API                                   |
| Platform PostgreSQL             | A    | Yes            | Platform metadata SoR only                       |
| Redis                           | A    | Yes            | Sessions/cache — not notify delivery             |
| Search                          | B    | Yes            | Publication freeze — additive adapters only      |
| Event Bus / Outbox              | B    | Yes            | MVP; Support publish live                        |
| ENF Attention                   | C    | Yes            | In-app; not email/SMS/push                       |
| Automation Foundation           | C    | Yes            | In-memory journal MVP; workflow.trigger deferred |
| Workflow execute                | D    | **No** (gated) | Metadata/read paths supported                    |
| Notification delivery providers | D    | **No**         | Frozen                                           |
| Email SoR                       | D    | **No**         | STOP                                             |
| FIN-001 Financial Engine        | D    | **No**         | STOP                                             |

## Unsupported claims

Do not offer operational SLAs for: n8n execute, SMTP delivery, Support webhook ingress, binary DMS unlock, or uncertified AI features.
