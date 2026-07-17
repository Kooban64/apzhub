# APZHUB Platform Observability Architecture Freeze Notice

**Programme:** Platform Observability System of Record (APZOBSERVE)  
**Effective:** 2026-07-17 (APZOBSERVE-006)  
**Status:** **FROZEN**

---

## Frozen architecture

```text
Observability Administration Workbench
→ Observability Typed Client
→ Observability HTTP API (/api/v1/observe/*)
→ PlatformServiceGateway.observe.*
→ RequestPipeline
→ Production Authorization
→ Observability Platform Services
→ Observability Core
→ Observability Persistence
→ PostgreSQL
```

No alternative execution paths are permitted.

## What is frozen

| Surface | Freeze scope |
| --- | --- |
| Contracts | `@apzhub/observe-contracts` **0.2.0** |
| Core | `@apzhub/observe-core` **0.2.0** |
| Persistence | `@apzhub/observe-persistence` **0.1.0** |
| Platform Services | `gateway.observe.*` wiring in **0.24.0** |
| HTTP API | `/api/v1/observe/*` · OpenAPI **1.8.0** |
| Typed client | `apps/web/lib/observe` |
| Workbench | `/workspace/observability` + `platform-observability` manifests |
| Authorization | `observePlatformOps` + `PLATFORM_OBSERVE_PERMISSIONS` |
| Schema | Migrations `0054` / `0055` · `platform_observe_*` |
| Boundary | Metadata governance only — not live telemetry providers |

## Intentionally unavailable (frozen absence)

- Grafana / Prometheus / Loki / OpenTelemetry / AlertManager integrations
- Live metrics collection, log ingestion, trace ingestion
- Telemetry streaming (WebSockets / SSE)
- PromQL / LogQL execution
- Alert evaluation and notification delivery
- Incident-response execution / automated maintenance suppression
- Event Bus / AI observability features
- Provider credential management

## Separation (frozen)

| Capability | Path / ownership |
| --- | --- |
| Platform Observability | `/workspace/observability` — this SoR |
| Platform Administration | `/workspace/administration` — frozen separate SoR |
| Identity Administration | `/workspace/identity` — frozen separate SoR |
| Platform Operations | `/workspace/operations` — separate product |

## Change control

Any change to the frozen architecture requires:

1. Formal ADR
2. Explicit owner approval
3. Architecture review
4. A new approved milestone (not APZOBSERVE-006)

Certification-only documentation updates that do not alter behaviour are permitted under later governance milestones.

## Classification retained

**PRODUCTION_READY_WITH_LIMITATIONS** (APZOBSERVE-005 evidence).

## See also

- [Platform Observability Reference Standard](./APZHUB-Observability-Reference-Standard.md)
- [APZOBSERVE-006 Completion Report](../sprint/APZOBSERVE-006-completion-report.md)
