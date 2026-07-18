# APZSEARCH-008 — Production Readiness

**Date:** 2026-07-14  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Certification:** APZSEARCH-008

---

## Checklist

| Area                                                        | Status                                        |
| ----------------------------------------------------------- | --------------------------------------------- |
| Canonical Search contracts **0.4.0**                        | ✅                                            |
| Search persistence + management services **0.2.0**          | ✅                                            |
| Search Integration SDK **0.1.0**                            | ✅                                            |
| Meilisearch Reference Adapter **0.1.0**                     | ✅                                            |
| Platform Services management + execution gateway **0.18.0** | ✅                                            |
| RequestPipeline + production `search.*` authorisation       | ✅                                            |
| HTTP API + OpenAPI **Platform Search** (1.1.0)              | ✅                                            |
| Typed client + mock                                         | ✅                                            |
| Product-neutral Search Workbench                            | ✅                                            |
| Architecture / dependency / boundary audits                 | ✅ 0 violations                               |
| Security (authn/authz/tenant isolation/redaction)           | ✅                                            |
| Public index/document HTTP                                  | ❌ Excluded by design (ADR-0064)              |
| Product indexing adapters                                   | ❌ Deferred to APZSEARCH-009                  |
| OCR / AI / semantic / vector / Event Bus / workers          | ❌ Excluded                                   |
| Live Playwright / Next production build                     | ⚠️ LIMITED (external Testing slug conflict)   |
| Live Meilisearch in unit CI                                 | ⚠️ LIMITED (mock REST; ops deploy separately) |

## Why not unqualified PRODUCTION_READY

Public index HTTP is intentionally omitted; product indexers are not shipped; Playwright/live Next `webServer` may be blocked by an unrelated Testing dynamic-route slug conflict; live Meilisearch is not exercised in unit CI.

## Why not LIMITED / NOT_READY

The certified path Workbench → client → HTTP → gateway → pipeline → authz → services → resolver → Meilisearch provider → adapter is complete and gated. Vertical and layered audits pass with zero boundary violations. Suitable for production Search **query + management metadata** workloads with documented exclusions — same class as Documents (**PRODUCTION_READY_WITH_LIMITATIONS**).

## Frozen architecture

No new Search APIs, providers, Workbench features, or domain behaviour may be added without a new approved milestone (**APZSEARCH-009** awaits owner approval).
