# APZHUB Future Metrics Platform Guide

**Status:** Roadmap only — **not authorised for implementation**  
**Date:** 2026-07-18  
**Context:** Published at APZMETRICS-006 wave freeze

---

## Purpose

Document potential future evolution of Platform Metrics **without** implementing any of it. The certified metadata governance plane remains frozen.

## Current frozen baseline

Workbench → Typed Client → HTTP → `gateway.metrics.*` → RequestPipeline → Production Authorization → Platform Metrics Services → Core → Persistence → PostgreSQL.

Classification: **PRODUCTION_READY_WITH_LIMITATIONS**.

## Potential future phases (docs only)

| Theme                    | Examples                                                      | Notes                                 |
| ------------------------ | ------------------------------------------------------------- | ------------------------------------- |
| Provider integrations    | Prometheus adapters, Grafana adapters, OpenTelemetry adapters | Separate milestones; Integration SDK  |
| Execution engines        | Formula execution, enterprise KPI execution                   | Must not bypass Platform Services     |
| Aggregation / thresholds | Runtime evaluation engines                                    | Distinct from metadata SoR            |
| Analytics / reporting    | Analytics integration, reporting integration                  | Coordinate with Reporting SoR         |
| Dashboards               | Metric dashboards                                             | Not part of frozen Workbench          |
| Event-driven metrics     | Event Bus consumers/producers                                 | Requires Platform Event Bus programme |
| AI-assisted governance   | AI suggestions for definitions/ownership                      | Requires AI Assist programme          |

## Explicit non-goals of APZMETRICS-006

This guide does **not** authorise runtime work. No HTTP, OpenAPI, Gateway, Services, Core, Persistence, or Workbench changes are implied.

## Recommended next programme (owner-gated)

**APZSEARCH-016 — Product Indexing Orchestration Framework** — builds on frozen Search Platform (001–008) and certified publication ecosystem (009–015). Do **not** re-implement APZSEARCH-001. Do **not** implement until explicit owner approval.

## Change control

Any Metrics evolution requires ADR + owner approval + architecture review + new milestone after the freeze.
