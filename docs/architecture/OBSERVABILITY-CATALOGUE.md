# APZHUB Observability Catalogue (Enterprise Architecture)

> **Programme:** APZHUB-ARCHITECTURE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** Document 014 · APZOBSERVE-006 · APZMETRICS-006 · AI-MANIFEST  
> **Date:** 2026-07-19

---

## Purpose

EA inventory of **observability** components — distinguishing **platform SoR (on disk)** from **OSS telemetry engines (absent adapters)**.

---

## Inventory

| Component                      | On disk?                                              | Role                                  | Status                                                           |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| **Observability Platform SoR** | Yes — observe-* packages                              | Metadata governance plane             | **Production** (PRWL) · **Architecture Frozen** (APZOBSERVE-006) |
| **Metrics Platform SoR**       | Yes — metrics-* packages                              | Metadata / lifecycle metrics          | **Production** (PRWL) · **Frozen** (APZMETRICS-006)              |
| **Logging (platform)**         | Structured logs in services                           | Application logging standard          | **Operational** pattern                                          |
| **Metrics (platform)**         | gateway.metrics.*                                     | Metadata plane — not PromQL execution | **Frozen**                                                       |
| **Tracing**                    | Correlation IDs (010/012); OTel planned               | End-to-end correlation                | **Partial** (correlation) / OTel engines **ABSENT**              |
| **Health Monitoring**          | `/api/v1/health` · capability health · adapter health | Hierarchical health                   | **Operational**                                                  |
| **Grafana**                    | **No** adapter package                                | Future observability UI engine        | **Concept / Planned**                                            |
| **Prometheus**                 | **No** adapter package                                | Future metrics engine                 | **Concept / Planned**                                            |
| **Loki**                       | **No** adapter package                                | Future logs engine                    | **Concept / Planned**                                            |
| **Administration Workspace**   | Platform admin surfaces                               | Ops console (permission-gated)        | **Operational** (SoR waves)                                      |

---

## Honesty

Native Observability/Metrics SoRs are **not** Grafana/Prometheus/Loki product integrations. Do not claim engine adapters exist.

---

## Related

- [PLATFORM-CATALOGUE.md](./PLATFORM-CATALOGUE.md)
- [SECURITY-CATALOGUE.md](./SECURITY-CATALOGUE.md)
