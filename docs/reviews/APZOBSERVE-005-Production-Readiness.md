# APZOBSERVE-005 — Production Readiness Classification

**Date:** 2026-07-17  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Certification:** APZOBSERVE-005 (Observability vertical — metadata governance plane)

---

## Checklist

| Area | Status |
| ---- | ------ |
| Contracts **0.2.0** · core **0.2.0** · persistence **0.1.0** | ✅ |
| Platform services **0.24.0** · `gateway.observe.*` | ✅ |
| RequestPipeline + production authorisation (`observePlatformOps`) | ✅ |
| HTTP API + OpenAPI **1.8.0** | ✅ |
| Typed client + Workbench `/workspace/observability` | ✅ |
| Vertical audit `pnpm audit:observe-vertical` | ✅ |
| Composite `pnpm certify:observe-vertical` | ✅ |
| Prior audits 001–004 | ✅ |
| Migrations 0054/0055 · no secret columns | ✅ |
| Certification harness (10 journeys) | ✅ |
| Scoped coverage lines/functions ≥95% | ✅ **98.22%** / **96.97%** (branches **76.52%**) |
| Provider integrations / collection / delivery | ❌ Excluded by design |
| Event Bus / AI | ❌ Excluded by design |
| Live Playwright webServer | ⚠️ LIMITED (Testing slug conflict — external) |

## Why PRODUCTION_READY_WITH_LIMITATIONS

End-to-end metadata governance path is complete, boundary-audited, OpenAPI-validated, journey-certified, and coverage-certified for lines/functions. Provider and delivery exclusions are intentional product boundaries — same class as Administration / Configuration / Notification / Identity certifications.

## Why not unqualified PRODUCTION_READY

No live telemetry providers, no collection/ingest, no alert delivery, Playwright live gate LIMITED by external Testing conflict, optional live PG / branch residuals.

## Why not NOT_PRODUCTION_READY

Zero architecture violations; production authz active; PostgreSQL required in production; controlled 503 when disabled; secret exclusion certified; Workbench and HTTP surfaces complete for the declared scope.

## Recommended next

**APZOBSERVE-006 — Observability Wave Certification & Architecture Freeze** only — do not implement without owner approval.
