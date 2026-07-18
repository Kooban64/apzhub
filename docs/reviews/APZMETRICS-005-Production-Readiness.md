# APZMETRICS-005 — Production Readiness Classification

**Date:** 2026-07-18  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Certification:** APZMETRICS-005 (Metrics vertical — metadata governance plane)

---

## Checklist

| Area                                                              | Status                                        |
| ----------------------------------------------------------------- | --------------------------------------------- |
| Contracts **0.2.0** · core **0.2.0** · persistence **0.1.0**      | ✅                                            |
| Platform services **0.25.0** · `gateway.metrics.*`                | ✅                                            |
| RequestPipeline + production authorisation (`metricsPlatformOps`) | ✅                                            |
| HTTP API + OpenAPI **1.9.0**                                      | ✅                                            |
| Typed client + Workbench `/workspace/metrics`                     | ✅                                            |
| Vertical audit `pnpm audit:metrics-vertical`                      | ✅                                            |
| Composite `pnpm certify:metrics-vertical`                         | ✅                                            |
| Prior audits 001–004                                              | ✅                                            |
| Migrations 0056/0057 · no secret columns                          | ✅                                            |
| Certification harness (10 journeys)                               | ✅                                            |
| Scoped coverage lines/functions ≥95%                              | ✅ **97.32%** / **99.04%** (branches **73%**) |
| Formula/KPI execution / providers / analytics                     | ❌ Excluded by design                         |
| Event Bus / AI                                                    | ❌ Excluded by design                         |
| Live Playwright webServer                                         | ⚠️ LIMITED (Testing slug conflict — external) |

## Why PRODUCTION_READY_WITH_LIMITATIONS

End-to-end metadata governance path is complete, boundary-audited, OpenAPI-validated, journey-certified, and coverage-certified for lines/functions. Execution and provider exclusions are intentional product boundaries — same class as Observability / Identity certifications.

## Why not unqualified PRODUCTION_READY

No formula/KPI execution, no provider integrations, Playwright live gate LIMITED by external Testing conflict, optional live PG / branch residuals.

## Why not DEVELOPMENT / NOT_PRODUCTION_READY

Zero architecture violations; production authz active; PostgreSQL required in production; controlled 503 when disabled; secret exclusion certified; Workbench and HTTP surfaces complete for the declared scope.

## Recommended next

**APZMETRICS-006 — Metrics Wave Certification & Architecture Freeze** only — do not implement without owner approval.
