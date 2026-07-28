# Canonical Analytics HTTP API

> **Programme:** APZHUB-PLATFORM-ANALYTICS-005 — **ACCEPTED / CLOSED**  
> **Surface:** `/api/v1/analytics/*`  
> **OpenAPI:** [APZHUB-Platform-OpenAPI-v1.yaml](../../specs/APZHUB-Platform-OpenAPI-v1.yaml) **1.11.0**

## Documents

| Document                | Path                                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP API Certification  | [HTTP-API-CERTIFICATION.md](./HTTP-API-CERTIFICATION.md)                                                                                                                                             |
| Compatibility Statement | [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md)                                                                                                                                           |
| Quality Evidence        | [QUALITY-EVIDENCE.md](./QUALITY-EVIDENCE.md)                                                                                                                                                         |
| Known Limitations       | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)                                                                                                                                                       |
| Release Notes           | [RELEASE-NOTES.md](./RELEASE-NOTES.md)                                                                                                                                                               |
| Completion Report       | [../../sprint/APZHUB-PLATFORM-ANALYTICS-005-completion-report.md](../../sprint/APZHUB-PLATFORM-ANALYTICS-005-completion-report.md)                                                                   |
| Acceptance Report       | [../../foundation/completion-reports/APZHUB-PLATFORM-ANALYTICS-005-programme-acceptance-report.md](../../foundation/completion-reports/APZHUB-PLATFORM-ANALYTICS-005-programme-acceptance-report.md) |

## Architecture

```
Client → /api/v1/analytics/* → withPlatformApiAuth → gateway.analytics.*
  → Analytics Platform Services → Metabase Integration (ops) / in-memory registry
```

No direct Metabase access from HTTP handlers.

## Endpoints

| Method | Path                                         | Permission                         |
| ------ | -------------------------------------------- | ---------------------------------- |
| GET    | `/api/v1/analytics/health`                   | `analytics.dashboard.view`         |
| GET    | `/api/v1/analytics/readiness`                | `analytics.dashboard.view`         |
| GET    | `/api/v1/analytics/capabilities`             | `analytics.dashboard.view`         |
| GET    | `/api/v1/analytics/dashboards`               | `analytics.dashboard.view`         |
| GET    | `/api/v1/analytics/dashboards/{dashboardId}` | `analytics.dashboard.view`         |
| GET    | `/api/v1/analytics/categories`               | `analytics.dashboard.view`         |
| GET    | `/api/v1/analytics/datasets`                 | `analytics.dataset.view`           |
| GET    | `/api/v1/analytics/reports`                  | `analytics.report.run`             |
| GET    | `/api/v1/analytics/saved`                    | `analytics.saved.manage`           |
| POST   | `/api/v1/analytics/saved`                    | `analytics.saved.manage`           |
| PATCH  | `/api/v1/analytics/saved/{savedId}`          | `analytics.saved.manage`           |
| DELETE | `/api/v1/analytics/saved/{savedId}`          | `analytics.saved.manage` (archive) |

## Enablement

- `APZHUB_ANALYTICS_ENABLED=true`
- Production: `METABASE_INTEGRATION_ENABLED=true` (+ Metabase env)
- Non-production optional: `APZHUB_ANALYTICS_DOMAIN_MODE=in_memory`

## Explicit non-deliverables

Workbench Analytics Module · APZ Analytics product · embed token product UI · Postgres registry SoR
