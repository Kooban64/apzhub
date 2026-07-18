# Observability Platform Services Architecture

**Milestone:** APZOBSERVE-002  
**Status:** Complete

## Path

```text
Platform Consumers
        ↓
PlatformServiceGateway.observe.*
        ↓
RequestPipeline
        ↓
Production Authorization
        ↓
Observability Platform Services (thin)
        ↓
Observability Core
        ↓
Observability Persistence
        ↓
PostgreSQL (metadata)
```

## Packages

| Package                       | Version    |
| ----------------------------- | ---------- |
| `@apzhub/observe-contracts`   | **0.2.0**  |
| `@apzhub/observe-core`        | **0.2.0**  |
| `@apzhub/observe-persistence` | **0.1.0**  |
| `@apzhub/platform-services`   | **0.24.0** |

## Ownership

Metadata only: health, readiness, liveness, metrics catalogue, metric sample refs, dashboards registration, log sources, traces catalogue, alerts, diagnostics, maintenance, incidents.

**Not owned:** Grafana dashboards, Prometheus TSDB, Loki storage, OTel exporters, AlertManager, metrics/log/trace collection.

## Enablement

`APZHUB_OBSERVE_ENABLED=true` + `DATABASE_URL` required for production bootstrap. Deny-by-default. No silent in-memory production fallback.
