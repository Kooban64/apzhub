# SPR-ADOPT-003 — Checklist results

Walked 2026-08-15 on coexistence host. BetterAuth session only. Legacy engines not restarted or reconfigured.

## Cross-cutting

| Item                                           | Result                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `GET /api/health`                              | Pass                                                               |
| Sign-in `dev@apzhub.local` (BetterAuth)        | Pass                                                               |
| Session present; no Authentik login            | Pass                                                               |
| Authentik containers still running (untouched) | Pass (`apz-authentik-server` / worker / redis observed running)    |
| Workspace shells reachable                     | Pass — projects · support · time · analytics · workflow (HTTP 200) |

## Projects ↔ Plane

| Item                                       | Result                                                              |
| ------------------------------------------ | ------------------------------------------------------------------- |
| `GET /api/v1/projects/health`              | Pass — `authN=betterauth`, `authentikUsed=false`, `liveListOk=true` |
| `GET /api/v1/projects` list                | Pass — **18** projects                                              |
| Plane engine login screen for user journey | Pass — none                                                         |

## Support ↔ Zammad

| Item                               | Result                                   |
| ---------------------------------- | ---------------------------------------- |
| `GET /api/v1/support-requests`     | Pass — sample page **5** requests (live) |
| `/workspace/support`               | Pass (HTTP 200)                          |
| Dedicated `/api/v1/support/health` | N/A — route not present (see friction)   |

## Time ↔ Kimai

| Item                          | Result                                                          |
| ----------------------------- | --------------------------------------------------------------- |
| `GET /api/v1/time/health`     | Pass — reachable (`degraded` honesty OK for foundation posture) |
| `GET /api/v1/time/readiness`  | Pass — `ready`                                                  |
| `GET /api/v1/time/customers`  | Pass — **7** customers                                          |
| `GET /api/v1/time/timesheets` | Pass — empty collection OK                                      |

## Analytics ↔ Metabase

| Item                               | Result                                                  |
| ---------------------------------- | ------------------------------------------------------- |
| `GET /api/v1/analytics/health`     | Pass — provider `metabase`, `auth=valid; api=reachable` |
| `GET /api/v1/analytics/dashboards` | Pass — **7** catalogue entries                          |
| `/workspace/analytics`             | Pass                                                    |

## Workflow ↔ n8n

| Item                                     | Result                                                               |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `GET /api/v1/workflows/health`           | Pass — `engineConfigured=true`, `capabilities.n8n=true`, execute off |
| `GET /api/v1/workflow/health`            | Pass — provider `n8n`                                                |
| `GET /api/v1/workflows/engine/health`    | Pass — `healthy`                                                     |
| `GET /api/v1/workflows/engine/workflows` | Pass — empty catalogue OK                                            |
| `/workspace/workflow`                    | Pass                                                                 |

## Verdict

**SPR-ADOPT-003 COMPLETE** — all five wired commercial engines are usable through APZHUB + BetterAuth without Authentik or legacy UI login. Residuals logged; no legacy stack changes.
