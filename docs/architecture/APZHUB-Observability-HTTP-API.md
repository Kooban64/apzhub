# APZHUB Observability HTTP API

**Milestone:** APZOBSERVE-003  
**Status:** Complete  
**Base path:** `/api/v1/observe`

## Purpose

Expose the Platform Observability **metadata management plane** through a versioned HTTP API, OpenAPI 3.1 documentation, and a production typed client. All business rules remain in Observability Core, Platform Services, and Persistence — the HTTP layer is presentation only.

## Execution path (mandatory)

```text
Future Observability Workbench
  → apps/web/lib/observe (typed client)
  → /api/v1/observe/*
  → PlatformServiceGateway.observe.*
  → RequestPipeline
  → Production Authorization
  → thin Observability Platform Services
  → Observability Core
  → Observability Persistence
  → PostgreSQL
```

**Prohibited:** HTTP → Core/Persistence; typed client → gateway/platform-services/core/persistence.

## Metadata plane only

| Capability | Available |
| --- | --- |
| Health / readiness / liveness metadata CRUD | Yes |
| Service / component status metadata | Yes |
| Metric definitions & sample metadata | Yes |
| Alert definitions & state metadata | Yes |
| Dashboard / log / trace metadata | Yes |
| Incident references & maintenance windows | Yes |
| Diagnostics metadata (platform readiness, persistence, completeness) | Yes |
| Grafana / Prometheus / Loki / OTel / AlertManager execution | **No** |
| Metrics collection / log ingest / trace ingest | **No** |
| Provider credentials / secrets / API keys | **No** |
| Observability Workbench | **No** (APZOBSERVE-004) |

## Bootstrap

Controlled by `APZHUB_OBSERVE_ENABLED`. When disabled, routes return `503 OBSERVE_SERVICE_UNAVAILABLE`.

## Response envelopes

Standard API v1: `{ data, meta }` for resources; `{ data, page, meta }` for collections; `{ error, meta }` for errors.

## Typed client

`apps/web/lib/observe` — `createHttpObserveClient()`, mock client, `observeQueryKeys`, module accessor (`getObserveClient` / `setObserveClient`).

## OpenAPI

Platform spec `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` **v1.8.0** — tag **Platform Observability Administration**.

## Audit

`pnpm audit:observe-http-client` — zero violations required.

## Next milestone

**APZOBSERVE-004 — Observability Administration Workbench** (not started; consumes typed client only).

## See also

- [Route Catalogue](../guides/APZHUB-Observability-HTTP-Route-Catalogue.md)
- [Typed Client Guide](../guides/APZHUB-Observability-Typed-Client-Guide.md)
- [Security Guide](../guides/APZHUB-Observability-HTTP-Security-Guide.md)
- [Consumer Guide](../guides/APZHUB-Observability-HTTP-Consumer-Guide.md)
- [APZOBSERVE-003 Completion Report](../sprint/APZOBSERVE-003-completion-report.md)
