# APZHUB Platform Observability Reference Standard

**Status:** Official APZHUB Platform Observability Reference Standard  
**Declared:** APZOBSERVE-006 (2026-07-17)  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS (metadata governance plane)

---

## Purpose

This document declares the certified Platform Observability System of Record as the **canonical System of Record for observability metadata** within APZHUB.

Observability owns observability **metadata and lifecycle governance**. It does **not** own live telemetry providers, collection/ingestion pipelines, alert delivery, or incident-response execution.

## Architectural principles

1. Metadata governance first — definitions and recorded metadata, not live provider UIs
2. Strict layered path — no Workbench → Gateway / Core / Persistence bypass
3. Production Authorization deny-by-default (`observePlatformOps`)
4. One System of Record per datum — platform PostgreSQL for observability metadata only
5. Provider-agnostic contracts — `providerKind` is metadata, never an SDK dependency
6. Unknown status is never implied healthy
7. Secrets and provider credentials never enter the SoR or Workbench editors

## Package ownership

| Package | Version | Owns |
| --- | --- | --- |
| `@apzhub/observe-contracts` | **0.2.0** | Domain models, permissions, ports |
| `@apzhub/observe-core` | **0.2.0** | Validation, lifecycle, business rules |
| `@apzhub/observe-persistence` | **0.1.0** | Repository adapters (memory + PostgreSQL) |
| `@apzhub/platform-services` | **0.24.0** | `gateway.observe.*`, RequestPipeline wrap, authz |

## Dependency boundaries

- Contracts must not depend on Core, Persistence, or Platform Services
- Core must not depend on Persistence implementations or Platform Services
- Persistence must not depend on Platform Services or HTTP
- HTTP handlers must not import Core or Persistence
- Workbench and typed client must not import Gateway, Platform Services, Core, or Persistence

## Metadata ownership (canonical)

Observability owns metadata for:

- Health checks, readiness checks, liveness checks
- Service health, service status, component status
- Metric definitions and metric samples (stored metadata)
- Alert definitions and alert states (recorded metadata)
- Dashboard definitions (metadata only)
- Log sources, trace definitions, trace spans (metadata only)
- Incident references (external ownership retained)
- Maintenance windows
- Health summaries (stored/canonical results)
- Platform diagnostics metadata
- General observability registration/classification metadata

## Non-ownership (permanent unless ADR)

Observability does **not** own:

- Grafana / Prometheus / Loki / OpenTelemetry / AlertManager runtime
- Live scrape, ingest, stream, or query engines
- PromQL / LogQL evaluation
- Alert notification delivery
- Incident response workflows
- Provider secrets / API keys / connection strings
- Platform Operations console ownership
- Frozen Administration or Identity surfaces

## Layer responsibilities

| Layer | Responsibility |
| --- | --- |
| Workbench | Presentation over typed client; capability banners; permission-aware UI |
| Typed client | Calls `/api/v1/observe/*` only; query keys; error mapping |
| HTTP | Thin handlers → `gateway.observe.*`; controlled `OBSERVE_SERVICE_UNAVAILABLE` |
| Gateway | Nested `observe.*` facet surface |
| RequestPipeline | Auth → Authz → validation → execution |
| Authorization | `PLATFORM_OBSERVE_PERMISSIONS` / `observePlatformOps` |
| Platform Services | Orchestration, authz wrap, diagnostics readiness |
| Core | Business rules, validation, lifecycle |
| Persistence | Repository ports; PostgreSQL SoR; RLS |
| PostgreSQL | `platform_observe_*` tables (migrations 0054/0055) |

## Authorization model (frozen)

`observe.*` · `observe.read` · `observe.manage` · `observe.health` · `observe.metrics` · `observe.logs` · `observe.traces` · `observe.alerts` · `observe.diagnostics`

Server authorization is authoritative. UI checks are presentation-only.

## Diagnostics model

Diagnostics expose safe readiness/registration/persistence metadata. Provider execution is always unavailable in this programme. No provider probes. No secrets in diagnostics payloads.

## Status and severity model

- Canonical health/status vocabulary only (including **unknown**)
- Canonical alert severities (`info` / `warning` / `critical`)
- Missing data → unknown (never healthy by implication)
- Workbench indicators are not colour-only

## Tenant and organisation isolation

- Tenant scoping enforced in persistence (assert + filter) and RLS (0055)
- Organisation context carried on `ServiceRequestContext`
- Cross-tenant reads/mutations denied

## Provider abstraction

- `providerKind` is metadata enumeration only
- Future providers require explicit provider contracts, approved milestones, and ADR
- Provider SDKs must not enter the frozen Core/HTTP/Workbench path without ADR

## Certified lifecycle (mandatory)

```text
Foundation
→ Platform Services (Gateway + RequestPipeline + Authorization)
→ HTTP API + OpenAPI + Production Typed Client
→ Workbench (manifest-driven)
→ Vertical Certification
→ Wave Certification & Architecture Freeze
```

## Certified architecture shape

```text
Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authz
→ Platform Services → Domain Core → Persistence → PostgreSQL
```

## Deviations

Any deviation from this Reference Standard requires an approved ADR, owner authorisation, and architecture review.

## See also

- [Architecture Freeze Notice](./APZHUB-Observability-Architecture-Freeze-Notice.md)
- [Future Observability Platform Guide](../developer/APZHUB-Future-Observability-Platform-Guide.md)
- [Observability Operational Readiness Guide](../guides/APZHUB-Observability-Operational-Readiness-Guide.md)
