# APZ Law Platform — Integrations (Release 1.0 Planning)

> **Programme:** APZ-LAW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Authority:** Definition Pack INTEGRATIONS · INTEGRATION-PRODUCT-CAPABILITY-INVENTORY · disk

---

## Core SoR

| Provider                                     | Role                          | Status                                            |
| -------------------------------------------- | ----------------------------- | ------------------------------------------------- |
| Native Law persistence (platform PostgreSQL) | System of Record for core Law | **On disk** · LAW-001…015                         |
| Plane / Zammad                               | Core Law SoR                  | **Not used** for core Law                         |
| External court / DMS / accounting            | Future integrations           | **Out of Release 1.0** unless separately approved |

---

## Cross-product integrations (assessment)

| Product / capability | Release 1.0 expectation                                                                                                             | Evidence / notes                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Identity**         | **Required** — BetterAuth + PermissionService; legal permission keys                                                                | OBS-LAW-01 closed (APZHUB-1.1-001)                            |
| **Workflow**         | **Partial** — in-app matter/document/task/invoice/trust lifecycles packageable; **APZ Workflow** (n8n) product **optional / later** | No Law→n8n bypass                                             |
| **Documents**        | **Present in-Law** — Law Documents native; **APZ Documents** product cross-link **optional / later**                                | Do not invent shared binary DMS dependency                    |
| **Analytics**        | **Partial** — Law reports/dashboard; **APZ Analytics** (Metabase) **optional / later**                                              | No Metabase branding in Law UI                                |
| **Search**           | **Present** — legal search / Knowledge Discovery patterns in law-platform                                                           | No standalone Law search engine product                       |
| **Notifications**    | **Ready** — Platform ENF + durable session stores (OBS-LAW-02 closed — APZHUB-1.1-002)                                              | No Law-owned notify subsystem                                 |
| **Projects**         | **Optional / later** — matter↔project adjacency may exist as future programme                                                       | Plane-backed Projects not Law SoR                             |
| **Calendar**         | **Present** — in-app Law calendar (components + OpenAPI)                                                                            | Package existing; not a separate Calendar product requirement |
| **Email**            | **Absent / later** — no first-class Law Email product SoR evidenced                                                                 | Do not invent email inbox product for 1.0                     |

---

## Integration rules

1. Modules/UI never import adapter clients for OSS engines as Law SoR.
2. Request path: Client → Gateway → Auth → Authz → Platform Service → (Connector only when OSS-backed).
3. Integration SDK **1.0.0** Architecture Frozen for any future connectors.
4. Engine brands never appear as primary UX.
5. Events publish via platform patterns; Notification Framework delivers.
6. Cross-product automation only through Platform Services / approved Workflow product paths.

---

## Status

Documented against disk. This programme does **not** create integrations, contracts, adapters, or APIs.
