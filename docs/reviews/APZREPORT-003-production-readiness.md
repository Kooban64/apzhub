# APZREPORT-003 — Production Readiness

**Milestone:** APZREPORT-003  
**Date:** 2026-07-13  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**

---

## Scope certified

Complete Reporting Platform vertical:

Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authorization → Platform Reporting Services → Reporting Core → Contracts → Output Providers → Canonical Models.

APZ TCMS remains the first production consumer (compatible; no behavioural regressions intended).

## Readiness checklist

| Area                                          | Status            | Notes                                           |
| --------------------------------------------- | ----------------- | ----------------------------------------------- |
| Architecture boundaries                       | Ready             | 0 forbidden-import violations                   |
| Dependency direction                          | Ready             | No reverse deps                                 |
| API + OpenAPI                                 | Ready             | 9 routes; OpenAPI valid                         |
| Typed client + mock                           | Ready             | AbortSignal supported; Query retry at workbench |
| Workbench presentation                        | Ready             | Read-only; a11y structure covered               |
| Gateway + RequestPipeline + `report.*`        | Ready             | Production authz map                            |
| Reporting core + 6 providers                  | Ready             | Frozen from APZREPORT-001                       |
| Contracts / permissions                       | Ready             | `report.*` + legacy aliases                     |
| Security (authn/authz/tenant fields)          | Ready             | See security audit                              |
| Coverage ≥95% lines (scoped)                  | Ready             | ~98.16% lines                                   |
| Live Playwright on app server                 | Limitation        | Spec present; needs `baseURL`                   |
| Platform gateway without Testing ports        | Limitation        | First-consumer composition                      |
| Shared platform metadata SoR                  | Limitation        | Product-scoped persistence today                |
| Binary storage / scheduling / email / AI      | Excluded          | By design                                       |
| Multi-product consumers beyond TCMS           | Limitation        | Documented onboarding only                      |
| Orphan `handleRenderReport` (no public route) | Limitation / debt | Not in OpenAPI                                  |

## Why not unqualified PRODUCTION_READY

1. `gateway.reporting` still requires Testing first-consumer wiring.
2. Metadata persistence is not yet a shared platform SoR.
3. Live Playwright E2E depends on environment `baseURL`.
4. Future product consumers (Projects, Support, Documents, Analytics, Workflow) are documented, not certified in production.

## Why not READY_WITH_LIMITATIONS / NOT_READY

The vertical is fully implemented and audited end-to-end with production authorization, OpenAPI, typed client, workbench, ≥95% coverage, and zero architecture violations — meeting the bar used for prior APZHUB vertical certifications (`PRODUCTION_READY_WITH_LIMITATIONS`).

## Ops re-run recommended before cutover

1. Ensure Testing platform services bundle is enabled wherever `gateway.reporting` is required.
2. Apply TCMS reporting migrations (0035/0036) for metadata RLS.
3. Grant `report.*` permissions to intended roles.
4. Run Playwright with app `baseURL` against mocked or staging APIs.
5. Spot-check TCMS Reports consumer (`listReportPlaceholders` / Open Consumer).

## Next

**APZDOCS-001 — Platform Document Management Foundation** only — owner approval required. Do not start without approval.
