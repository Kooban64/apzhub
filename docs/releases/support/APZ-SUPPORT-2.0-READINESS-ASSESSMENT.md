# APZ Support 2.0 — Readiness Assessment

> **Programme:** APZ Support Release **2.0** Planning  
> **Classification:** DOCUMENTATION ONLY — no production code · no architecture changes · no implementation  
> **Authority:** AI-MANIFEST · Product Definition Pack · certifications · disk · Operating Model · Reference Implementation  
> **Date:** 2026-07-19  
> **Related:** [Gaps](./APZ-SUPPORT-IMPLEMENTATION-GAPS.md) · [Phase 1 Recommendation](./APZ-SUPPORT-2.0-PHASE-1-RECOMMENDATION.md) · [Risk Review](./APZ-SUPPORT-RISK-REVIEW.md)

---

## Executive verdict

| Question                                                                       | Answer                                                   |
| ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Can APZ Support be promoted from a pre-IR maturity → **Implementation Ready**? | **No — not applicable**                                  |
| Current maturity (repository)                                                  | **Production** (certified with limitations)              |
| Already past Implementation Ready?                                             | **Yes**                                                  |
| Is Release **2.0** an IR gate?                                                 | **No** — Major product release planning after Production |
| Implementation authorised by this planning?                                    | **No**                                                   |

**APZ Support cannot be “promoted to Implementation Ready” because it is already Production.** PRODUCTS-003 and the readiness matrix already classify Support as past IR. Release **2.0** must be planned as a **new Owner-approved Major product release** (SemVer **2.0.0** naming), not as an IR advancement.

---

## Review summary (repository evidence)

| Artefact                    | Outcome                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Product Definition Pack     | Complete — maturity **Production**                                                                            |
| IMPLEMENTATION-READINESS    | **Production**; Operational **PARTIAL**                                                                       |
| ARCHITECTURE / CAPABILITIES | Wave 2 + Support services + HTTP + Workbench + search-support on disk                                         |
| INTEGRATIONS                | `@apzhub/integration-zammad` **0.6.0** CERTIFIED_WITH_LIMITATIONS                                             |
| KNOWN-LIMITATIONS           | No Event Bus publish · no webhook ingress · no binary attachments · no Support notifications/realtime         |
| RELEASE-PLAN                | Engineering baselines OSS-110-12/14; **no commercial SemVer** / `docs/releases/support/` product baseline     |
| Product Release Roadmap     | Support Production; packaging/polish; no Support **2.0.0** baseline filed                                     |
| Reference Implementation    | Support Workbench is the clone pattern for Projects/Time; Support itself already delivered                    |
| Engineering Operating Model | DoR still applies to any **new named programme** (Owner Approval + Sprint Guide) even for Production products |

---

## Technical assessment

| Dimension                    | Status                   | Evidence                                                                                            |
| ---------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------- |
| Zammad integration readiness | **PASS (limited)**       | `@apzhub/integration-zammad` **0.6.0**; Wave 2 CERTIFIED_WITH_LIMITATIONS                           |
| Platform Services            | **PASS**                 | Support Platform Services (OSS-110-10) on disk                                                      |
| Authentication               | **PASS (platform)**      | BetterAuth / `withPlatformApiAuth` on Support HTTP                                                  |
| Authorization / Permissions  | **PASS**                 | Support permission catalogue + module manifests                                                     |
| Provisioning                 | **PASS (platform)**      | Platform provisioning **0.1.0**; Support modules enabled                                            |
| Workbench integration        | **PASS**                 | `apps/web/lib/support` + `components/support` + multiple module manifests                           |
| Search                       | **PASS (limited)**       | `/api/v1/support-search` + `@apzhub/search-support` **0.1.0**                                       |
| Navigation                   | **PASS**                 | Activity Bar / sidebar via Support module manifests                                                 |
| Health                       | **PARTIAL (product UI)** | Adapter/service health exist; **no** dedicated Support Workbench health view (unlike Projects/Time) |
| Diagnostics                  | **PARTIAL (product UI)** | Platform/adapter diagnostics paths exist; **no** dedicated Support Workbench diagnostics view       |
| Audit                        | **PARTIAL**              | Platform pipeline patterns; Support-specific audit product surface thin                             |
| Notification integration     | **FAIL (vertical)**      | Explicit limitation — Support vertical not wired to Attention Engine / notifications                |
| Future analytics             | **PARTIAL**              | Support analytics spine present; Metabase/Analytics product absent (portfolio Concept)              |

---

## Implementation Ready gate (PRODUCTS-003 / DoR)

| Criterion                             | Status for “promote to IR”                              |
| ------------------------------------- | ------------------------------------------------------- |
| Definition Pack complete              | **PASS** (already)                                      |
| Architecture approved                 | **PASS** (Wave 2 closed)                                |
| Dependencies on disk                  | **PASS** (adapter + services + HTTP + Workbench)        |
| Marked Implementation Ready           | **Superseded** — maturity is **Production**             |
| Owner Approval of named 2.0 programme | **FAIL** — planning only; implementation not authorised |

**Conclusion:** IR promotion is the wrong gate. Support is already Production. Gaps below block a **honest Major 2.0** delivery, not IR.

---

## What Release 2.0 means (repository honesty)

| Product      | Current Production baseline                                    | Major line naming                                                                     |
| ------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| APZ Projects | **1.1.0**                                                      | **2.0.0** (Owner Approval)                                                            |
| APZ Time     | **1.0.0** Phase 1                                              | **2.0.0** (Owner Approval)                                                            |
| APZ Support  | Engineering Production (PRWL) — **no SemVer product baseline** | Establishing **2.0.0** requires Owner Approval of a named Major programme + packaging |

Support has **no** `docs/releases/support/` SemVer archive today. A Support **2.0** programme must first establish product release packaging (or explicitly choose a **1.0.0** packaging baseline before a later Major — Owner decision). This assessment does **not** invent a version number as implemented; it plans for Owner-named **Release 2.0**.

---

## STOP

Do not implement APZ Support. Do not create Workbench UI. Do not begin Release 2.0. Await Owner Acceptance of this planning suite.
