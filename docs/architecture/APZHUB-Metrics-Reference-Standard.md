# APZHUB Platform Metrics Reference Standard

**Status:** Official APZHUB Platform Metrics Reference Standard  
**Declared:** APZMETRICS-006 (2026-07-18)  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS (metadata governance plane)

---

## Purpose

This document declares the certified Platform Metrics System of Record as the **canonical System of Record for metric definitions and KPI governance metadata** within APZHUB.

Metrics owns metric **metadata and lifecycle governance**. It does **not** own calculation engines, formula/KPI execution, analytics, reporting, dashboards, or telemetry providers.

## Architectural principles

1. Metadata governance first — definitions and recorded metadata, never live calculation
2. Strict layered path — no Workbench → Gateway / Core / Persistence bypass
3. Production Authorization deny-by-default (`metricsPlatformOps`)
4. One System of Record per datum — platform PostgreSQL for metrics metadata only
5. Provider-agnostic contracts — no Prometheus/Grafana/OTel SDK dependencies
6. Formula and KPI entities are metadata — expression/target storage never implies execution
7. Secrets and provider credentials never enter the SoR or Workbench editors

## Package catalogue

| Package                       | Version    | Owns                                             |
| ----------------------------- | ---------- | ------------------------------------------------ |
| `@apzhub/metrics-contracts`   | **0.2.0**  | Domain models, permissions, ports                |
| `@apzhub/metrics-core`        | **0.2.0**  | Validation, lifecycle, business rules            |
| `@apzhub/metrics-persistence` | **0.1.0**  | Repository adapters (memory + PostgreSQL)        |
| `@apzhub/platform-services`   | **0.25.0** | `gateway.metrics.*`, RequestPipeline wrap, authz |

## Dependency rules

- Contracts must not depend on Core, Persistence, or Platform Services
- Core must not depend on Persistence implementations or Platform Services
- Persistence must not depend on Platform Services or HTTP
- HTTP handlers must not import Core or Persistence
- Workbench and typed client must not import Gateway, Platform Services, Core, or Persistence

## Naming conventions

- User-facing: **Metrics**, **KPIs** — never Prometheus/Grafana product names in UI
- Services: Platform Metrics Services (not `PrometheusService`)
- Gateway surface: `gateway.metrics.*` (bundle field `metricsPlatform`)
- Permissions: `metrics.*` catalogue only
- Tables: `platform_metrics_*`

## Service conventions

- Business rules only in Metrics Core / Platform Metrics Services
- Thin Platform Services wrap Core with pipeline, authz, diagnostics readiness
- Production factory requires PostgreSQL — no silent in-memory fallback
- Bootstrap: `APZHUB_METRICS_ENABLED` deny-by-default

## Gateway conventions

- Nested facets for all metadata surfaces + diagnostics
- RequestPipeline on every operation
- Disabled service → not-enabled error (HTTP maps to `METRICS_SERVICE_UNAVAILABLE`)

## HTTP conventions

- Routes under `/api/v1/metrics/*`
- Tag: **Platform Metrics Administration** (OpenAPI **1.9.0**)
- Auth via platform API auth; authz via gateway pipeline
- Standard response envelopes; typed error categories
- No execution/provider/analytics routes

## Typed client conventions

- `apps/web/lib/metrics` only public consumer surface
- `createHttpMetricsClient` · runtime accessor · `createMockMetricsClient` · `metricsQueryKeys`
- Calls `/api/v1/metrics/*` exclusively
- No Gateway / Core / Persistence imports
- No polling / live streaming

## Workbench conventions

- Route `/workspace/metrics` via `platform-metrics` manifests (Activity Bar order **55**)
- Catch-all shell mount (`MetricsWorkspaceRouter`) — no dedicated App Router tree
- Capability limitation banners mandatory
- Presentation permission checks never replace server authz
- Metadata tables/forms only — no calculators or chart engines

## Metadata governance

Owns: metrics, definitions, versions, categories, groups, dimensions, labels, units, formulas, aggregations, thresholds, owners, consumers, retention policies, classifications, dependencies, KPIs, KPI groups, KPI targets, relationships, metadata, diagnostics readiness.

Immutable metric identity, semantic versioning, lifecycle, ownership, dependency and classification metadata are governance concerns — not execution concerns.

## Security model

- No secrets/credentials/API keys/connection strings in SoR
- Safe error envelopes
- Controlled 503 when disabled
- Audit via RequestPipeline
- TLS assumed at edge (platform standard)

## Authorization model (frozen)

`metrics.*` · `metrics.read` · `metrics.manage` · `metrics.kpi` · `metrics.definition` · `metrics.metadata` · `metrics.classification` · `metrics.retention`

Server authorization is authoritative. UI checks are presentation-only.

## Non-ownership (permanent unless ADR)

Metrics does **not** own:

- Formula / KPI / aggregation / threshold execution engines
- Prometheus / Grafana / OpenTelemetry runtime
- Analytics / reporting / dashboards
- Telemetry collection / scrape / ingest
- Event Bus / AI
- Frozen Observability or Identity surfaces

## Change control

Deviations require ADR + explicit owner approval + architecture review + new milestone.

## See also

- [Architecture Freeze Notice](./APZHUB-Metrics-Architecture-Freeze-Notice.md)
- [Certification Guide](../guides/APZHUB-Platform-Metrics-Certification-Guide.md)
- [APZMETRICS-006 Completion Report](../sprint/APZMETRICS-006-completion-report.md)
