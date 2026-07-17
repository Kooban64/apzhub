# APZWORKFLOW-005 — Production Readiness

**Date:** 2026-07-15  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Certification:** APZWORKFLOW-005 (Workflow vertical — management plane)

---

## Checklist

| Area | Status |
| ---- | ------ |
| Canonical contracts **0.2.0** · core **0.1.1** · persistence **0.1.1** | ✅ |
| Platform services **0.19.0** · service-contracts **0.16.0** · `gateway.workflow.*` | ✅ |
| RequestPipeline + production authorisation | ✅ |
| HTTP API + OpenAPI Platform Workflow (info **1.2.0**) | ✅ |
| Typed client + mock | ✅ |
| Workbench `/workspace/workflows` + manifests | ✅ |
| Vertical audit `pnpm audit:workflow-vertical` | ✅ 0 violations |
| Prior audits 001–004 | ✅ |
| Engine / n8n / execution / schedules / Event Bus / workers | ❌ Excluded by design |
| Designer / drag-and-drop | ❌ Excluded by design |
| Category/folder ops beyond delivered gateway surface | ⚠️ Limited as shipped |
| Live PostgreSQL in unit CI | ⚠️ Factory + migration + in-memory parity; live DB optional |
| Playwright / Next live webServer | ⚠️ LIMITED (Testing slug conflict — external) |

## Why PRODUCTION_READY_WITH_LIMITATIONS

The management-plane vertical is complete end-to-end, boundary-audited, and OpenAPI-validated. Engine-neutral execution exclusions are intentional product boundaries — the same class of limitation used for Search / Documents / Reporting certifications.

## Why not unqualified PRODUCTION_READY

No execution engine yet (future APZWORKFLOW-006+ n8n adapter track). Live Playwright constrained by unrelated Testing routes. Category/folder mutation surface remains intentionally narrow.

## Frozen architecture

Do not add Workflow execution, n8n, Event Bus, workers, schedules, designer, or new HTTP/UI capabilities without a new approved milestone.

**Recommended next:** **APZWORKFLOW-006 — n8n Reference Adapter Foundation** only.
