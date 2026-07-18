# Platform Metrics Programme Summary (APZMETRICS-001–006)

**Date:** 2026-07-18  
**Status:** Programme **closed/frozen** · **PRODUCTION_READY_WITH_LIMITATIONS**

---

## APZMETRICS-001 — Platform Metrics Foundation

- **Objective:** Establish contracts, core, persistence, migrations
- **Outcome:** `@apzhub/metrics-contracts` / `metrics-core` / `metrics-persistence`; migrations **0056/0057**; `audit:metrics-foundation`
- **Versions:** contracts/core **0.1.0→0.2.0** lineage; persistence **0.1.0**
- **Decisions:** Metadata SoR; no execution engine

## APZMETRICS-002 — Platform Services, Gateway & Authorization

- **Objective:** Wire `gateway.metrics.*`, RequestPipeline, production authz
- **Outcome:** platform-services **0.25.0**; `metricsPlatformOps`; `APZHUB_METRICS_ENABLED`
- **Decisions:** Bundle field `metricsPlatform`; deny-by-default; PostgreSQL required in production

## APZMETRICS-003 — Metrics HTTP API & Production Typed Client

- **Objective:** Expose HTTP + typed client
- **Outcome:** `/api/v1/metrics/*`; OpenAPI **1.9.0**; `apps/web/lib/metrics`; `audit:metrics-http-client`
- **Decisions:** Transport-only; `METRICS_SERVICE_UNAVAILABLE`; no Workbench yet

## APZMETRICS-004 — Metrics Administration Workbench

- **Objective:** Metadata governance UI
- **Outcome:** `/workspace/metrics`; `platform-metrics` order **55**; capability banners; `audit:metrics-workbench`
- **Decisions:** Catch-all shell router; typed-client-only UI

## APZMETRICS-005 — Metrics Vertical Certification

- **Objective:** Certify vertical; no new capabilities
- **Outcome:** `certify:metrics-vertical`; classification **PRODUCTION_READY_WITH_LIMITATIONS**; coverage **97.32%** / **99.04%**
- **Decisions:** LIMITED Playwright accepted as external residual

## APZMETRICS-006 — Wave Certification & Architecture Freeze

- **Objective:** Freeze architecture; publish reference standard; close programme
- **Outcome:** Freeze Notice; Reference Standard; ops/future guides; `audit:metrics-wave`; Knowledge Foundation closed/frozen
- **Decisions:** Docs/governance only; recommend **APZSEARCH-016** next (APZSEARCH-001 already complete)

## Lessons learned

1. Keep Metrics metadata SoR distinct from Observability telemetry metadata
2. Freeze absence of execution/providers as hard architectural boundaries
3. Composite certify/wave audits make programme closeout reproducible
4. Presentation authz must never replace server deny-by-default
