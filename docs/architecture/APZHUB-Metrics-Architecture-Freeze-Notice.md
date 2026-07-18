# APZHUB Platform Metrics Architecture Freeze Notice

**Programme:** Platform Metrics System of Record (APZMETRICS)  
**Effective:** 2026-07-18 (APZMETRICS-006)  
**Status:** **FROZEN**

---

## Frozen architecture

```text
Metrics Administration Workbench
→ Metrics Typed Client
→ Metrics HTTP API (/api/v1/metrics/*)
→ PlatformServiceGateway.metrics.*
→ RequestPipeline
→ Production Authorization
→ Platform Metrics Services
→ Metrics Core
→ Metrics Persistence
→ PostgreSQL
```

No alternative execution paths are permitted.

## What is frozen

| Surface           | Freeze scope                                                       |
| ----------------- | ------------------------------------------------------------------ |
| Contracts         | `@apzhub/metrics-contracts` **0.2.0**                              |
| Core              | `@apzhub/metrics-core` **0.2.0**                                   |
| Persistence       | `@apzhub/metrics-persistence` **0.1.0**                            |
| Platform Services | `gateway.metrics.*` wiring in **0.25.0**                           |
| HTTP API          | `/api/v1/metrics/*` · OpenAPI **1.9.0**                            |
| Typed client      | `apps/web/lib/metrics`                                             |
| Workbench         | `/workspace/metrics` + `platform-metrics` manifests (order **55**) |
| Authorization     | `metricsPlatformOps` + `PLATFORM_METRICS_PERMISSIONS`              |
| Schema            | Migrations `0056` / `0057` · `platform_metrics_*`                  |
| Boundary          | Metadata governance only — not calculation/execution/providers     |

## Dependency rules (frozen)

- Workbench → Typed Client only
- Typed Client → HTTP only
- HTTP → Gateway only
- Gateway → Platform Services only
- Platform Services → Core only
- Core → Persistence ports only
- Persistence → PostgreSQL

No reverse dependencies. No layer bypasses.

## Permitted extension points

Documentation and certification evidence updates that do not alter runtime behaviour. Future capabilities require a new milestone after ADR + owner approval (see Future Metrics Platform Guide).

## Intentionally unavailable (frozen absence)

- Metric calculation / collection / scrape / ingest
- Formula execution / KPI execution
- Aggregation / threshold runtime evaluation
- Analytics / reporting / dashboards
- Prometheus / Grafana / OpenTelemetry integrations
- Event Bus / AI-assisted metric governance
- Provider credential management

## Separation (frozen)

| Capability              | Path / ownership                                  |
| ----------------------- | ------------------------------------------------- |
| Platform Metrics        | `/workspace/metrics` — this SoR                   |
| Platform Observability  | `/workspace/observability` — frozen separate SoR  |
| Identity Administration | `/workspace/identity` — frozen separate SoR       |
| Platform Administration | `/workspace/administration` — frozen separate SoR |

## Change control

Any change to the frozen architecture requires:

1. Formal ADR
2. Explicit owner approval
3. Architecture review
4. A new approved milestone (not APZMETRICS-006)

Certification-only documentation updates that do not alter behaviour are permitted under later governance milestones.

## Classification retained

**PRODUCTION_READY_WITH_LIMITATIONS** (APZMETRICS-005 evidence).

## See also

- [Platform Metrics Reference Standard](./APZHUB-Metrics-Reference-Standard.md)
- [APZMETRICS-006 Completion Report](../sprint/APZMETRICS-006-completion-report.md)
