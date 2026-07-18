# APZHUB Platform Metrics Architecture

**Milestone:** APZMETRICS-001 — Platform Metrics Foundation  
**Status:** Active foundation  
**Date:** 2026-07-17

---

## Purpose

Platform Metrics is the canonical enterprise **System of Record** for metric definitions and governance metadata.

It is **not**:

- a monitoring platform
- Prometheus, Grafana, or OpenTelemetry
- metric collection, ingestion, or evaluation
- KPI / formula execution

Observability, Analytics, Reporting, AI and Workflow **consume** Metrics. Future monitoring providers **implement** Metrics contracts.

## Architecture

```text
Platform Consumers
        ↓
Platform Metrics (SoR — this programme)
        ↓
Metric Core
        ↓
Persistence
        ↓
PostgreSQL
```

Provider implementations remain outside the platform.

## Packages

| Package                       | Version | Ownership                                               |
| ----------------------------- | ------- | ------------------------------------------------------- |
| `@apzhub/metrics-contracts`   | 0.1.0   | Domain models, enums, permissions, service stubs        |
| `@apzhub/metrics-core`        | 0.1.0   | Validation, lifecycle, domain service, repository ports |
| `@apzhub/metrics-persistence` | 0.1.0   | In-memory (tests) + PostgreSQL (production)             |

## Boundaries

- No HTTP / Gateway / Platform Services (deferred to APZMETRICS-002)
- No typed client / Workbench
- No provider SDKs
- No Event Bus / AI
- Contracts must not import core/persistence
- Core must not import persistence
- Production persistence requires explicit PostgreSQL — no silent in-memory fallback

## Persistence

- Tables: `platform_metrics_*`
- Migrations: **0056** (schema), **0057** (RLS)
- Tenant isolation via `tenant_id` + RLS (`app.tenant_id`)

## Permissions (catalogue only)

`metrics.*`, `metrics.read`, `metrics.manage`, `metrics.kpi`, `metrics.definition`, `metrics.metadata`, `metrics.classification`, `metrics.retention`

Authorization wiring is deferred to APZMETRICS-002.

## Related

- [Domain Model](./APZHUB-Metrics-Domain-Model.md)
- [KPI Guide](./APZHUB-Metrics-KPI-Guide.md)
- [Metric Governance Guide](./APZHUB-Metric-Governance-Guide.md)
- [Metric Lifecycle Guide](./APZHUB-Metric-Lifecycle-Guide.md)
- [Validation Guide](./APZHUB-Metrics-Validation-Guide.md)
- [Developer Guide](../developer/APZHUB-Platform-Metrics-Developer-Guide.md)
