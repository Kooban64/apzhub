# APZOBSERVE Programme Summary

**Programme:** Platform Observability System of Record  
**Status:** **CLOSED / FROZEN** (APZOBSERVE-006)  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Date:** 2026-07-17

---

## What was delivered

| Milestone | Deliverable |
| --- | --- |
| APZOBSERVE-001 | Foundation — contracts/core/persistence; migrations 0054/0055 |
| APZOBSERVE-002 | Platform Services — `gateway.observe.*`; RequestPipeline; production Authz |
| APZOBSERVE-003 | HTTP `/api/v1/observe/*` + OpenAPI **1.8.0** + typed client |
| APZOBSERVE-004 | Administration Workbench `/workspace/observability` |
| APZOBSERVE-005 | Vertical certification — **PRODUCTION_READY_WITH_LIMITATIONS** |
| APZOBSERVE-006 | Wave certification + architecture freeze + Reference Standard |

## What Observability is

A metadata-governance platform for health, metrics definitions/samples, alerts metadata, logs/traces metadata, dashboards definitions, incidents references, maintenance windows, and diagnostics readiness metadata.

## What Observability is not

A Grafana/Prometheus/Loki/OTel/AlertManager product. Not a live telemetry collector, query engine, alert delivery system, or incident-response engine.

## Frozen architecture

```text
Workbench → Typed Client → /api/v1/observe/* → gateway.observe.*
→ RequestPipeline → Production Authorization
→ Platform Services → Core → Persistence → PostgreSQL
```

## Package versions (frozen)

| Package | Version |
| --- | --- |
| `@apzhub/observe-contracts` | 0.2.0 |
| `@apzhub/observe-core` | 0.2.0 |
| `@apzhub/observe-persistence` | 0.1.0 |
| `@apzhub/platform-services` (observe wiring) | 0.24.0 |
| Platform OpenAPI | 1.8.0 |

## Recommended next (outside Observability programme)

**APZMETRICS-001 — Platform Metrics Foundation** — distinct metrics domain programme. Do not implement without owner approval.

## See also

- [Wave Closeout Report](./APZOBSERVE-006-wave-closeout-report.md)
- [Completion Report](./APZOBSERVE-006-completion-report.md)
- [Reference Standard](../architecture/APZHUB-Observability-Reference-Standard.md)
