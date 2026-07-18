# APZHUB Future Observability Platform Guide

**Status:** Roadmap documentation only (APZOBSERVE-006)  
**Do not implement** without a new approved programme and owner authorisation.

---

## Purpose

Informational roadmap for capabilities **outside** the frozen Observability metadata SoR.

The frozen Platform Observability programme remains the canonical metadata System of Record. Future programmes must not silently expand the frozen path without ADR + owner approval + architecture review.

## Possible future programmes

| Programme               | Intent                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Grafana provider        | Provider adapter for Grafana metadata/connectivity (not Workbench embed by default) |
| Prometheus provider     | Prometheus integration behind explicit provider contracts                           |
| Loki provider           | Log provider adapter                                                                |
| OpenTelemetry provider  | Trace/metrics exporter/provider integration                                         |
| AlertManager provider   | Alert routing provider integration                                                  |
| Metrics collection      | Live metric collection pipelines                                                    |
| Log ingestion           | Live log ingestion pipelines                                                        |
| Trace ingestion         | Live span/trace ingestion pipelines                                                 |
| Live dashboards         | Dashboard rendering / embedding (distinct from definition metadata)                 |
| Telemetry streaming     | WebSocket / SSE live telemetry                                                      |
| Event Bus integration   | Async observability events on platform Event Bus                                    |
| AI-assisted diagnostics | AI analysis over safe diagnostics metadata                                          |

## Distinct recommended next programme

**APZMETRICS-001 — Platform Metrics Foundation** — establishes APZHUB’s canonical metrics domain and metadata model. Builds on the frozen Observability platform while remaining a **distinct capability** focused on metric semantics, definitions, and governance rather than telemetry providers.

Do **not** implement until explicit owner approval.

## Rules for future work

1. Do not modify the frozen Observability architecture without ADR + owner approval + architecture review
2. Do not store provider credentials in `platform_observe_*`
3. Do not implement scrape/ingest/stream/query inside the frozen Workbench/HTTP surface without a new programme
4. Prefer new programmes (e.g. APZMETRICS, provider adapters) over implicitly expanding APZOBSERVE SoR scope
5. Provider SDKs must remain behind Integration/Provider boundaries — never in Workbench or Core

## See also

- [Observability Architecture Freeze Notice](../architecture/APZHUB-Observability-Architecture-Freeze-Notice.md)
- [Observability Reference Standard](../architecture/APZHUB-Observability-Reference-Standard.md)
