# APZ Time — Final Implementation Readiness Assessment

> **Programme:** APZHUB-TIME-READINESS-002  
> **Title:** APZ Time Final Implementation Readiness Assessment  
> **Classification:** DOCUMENTATION ONLY — no production code · no package changes · no architecture changes  
> **Authority:** AI-MANIFEST · Definition Pack · certifications · disk · Operating Model · Reference Implementation · PRODUCTS-003 IR criteria  
> **Prior:** [APZHUB-TIME-READINESS-001](./APZ-TIME-IMPLEMENTATION-READINESS-REASSESSMENT.md) (**ACCEPTED** — remain Planning)  
> **Prerequisite closed:** APZHUB-INTEGRATION-KIMAI-002 **ACCEPTED** — Kimai **0.2.0** **CERTIFIED_DOMAIN**  
> **Date:** 2026-07-19  
> **Related:** [Decision](./APZ-TIME-IMPLEMENTATION-READY-DECISION.md) · [Phase 1 Scope](./APZ-TIME-1.0-PHASE-1-SCOPE.md)

---

## Executive verdict

| Question                                                               | Answer                                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Can APZ Time be promoted from **Planning** → **Implementation Ready**? | **Yes**                                                             |
| Maturity after this programme (documentation)                          | **Implementation Ready**                                            |
| Product implementation authorised by this programme?                   | **No** — IR ≠ Owner Approval of a named Workbench/Release programme |
| Principal READINESS-001 blocker removed?                               | **Yes** — Kimai domain CERTIFIED_DOMAIN (**ACCEPTED**)              |

---

## What changed since TIME-READINESS-001

| Layer                  | READINESS-001                                                 | Repository now                                                                      | Owner status                                 |
| ---------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------- |
| Kimai Integration      | **0.1.0** CERTIFIED_FOUNDATION — domain absent → HTTP **501** | **0.2.0** **CERTIFIED_DOMAIN**                                                      | **ACCEPTED / CLOSED** (KIMAI-002)            |
| Time Platform Services | **0.26.0** / contracts **0.17.0** — limited Kimai domain      | **0.26.1** / **0.17.1** — `domainMode: kimai`                                       | **ACCEPTED / CLOSED** (PLATFORM-TIME-001)    |
| Time HTTP API          | OpenAPI **1.10.0** — Kimai domain → **501**                   | **1.10.0** unchanged routes; production Kimai domain path no longer foundation-only | **ACCEPTED / CLOSED** (TIME-HTTP-001)        |
| Workbench / module UI  | Absent                                                        | Still absent                                                                        | Post-IR programme scope (Projects precedent) |
| Integration SDK        | **1.0.0**                                                     | **1.0.0**                                                                           | Frozen / unchanged                           |

---

## Review summary (repository evidence)

| Artefact                        | Outcome                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Product Definition Pack         | Complete (PRODUCTS-002 **ACCEPTED**)                                                                    |
| Implementation Readiness (pack) | Updated to **Implementation Ready** by this programme                                                   |
| Kimai Integration               | **CERTIFIED_DOMAIN** **0.2.0** — Owner **ACCEPTED**                                                     |
| Time Platform Services          | CERTIFIED_WITH_LIMITATIONS — domain provider wired                                                      |
| Time HTTP API                   | CERTIFIED_WITH_LIMITATIONS — routes consume services → Kimai                                            |
| Engineering Operating Model     | ACTIVE — DoR: pack + architecture + deps + IR mark + Owner Approval of named programme                  |
| Reference Implementation        | Projects IR required domain-capable adapter + service + HTTP; Workbench deferred — **Time now matches** |
| Product Release Roadmap         | Time eligible for IR; Release 1.0 still needs Owner Approval                                            |
| Known Limitations               | Workbench / product cert / approvals / reporting UI remain open (honest)                                |
| Risk Review                     | RR-01/RR-02 domain-501 risk closed by KIMAI-002 Acceptance                                              |

---

## Dimension assessment

| Dimension                   | Status                              | Evidence                                                                                              |
| --------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Business readiness          | **PASS**                            | Vision / CAPABILITIES pack clear                                                                      |
| Architecture readiness      | **PASS**                            | Pack architecture; Kimai domain path delivered and Owner-accepted; Integration SDK **1.0.0** frozen   |
| Integration readiness       | **PASS**                            | Kimai **0.2.0** CERTIFIED_DOMAIN                                                                      |
| Platform Services readiness | **PASS**                            | Time services **0.26.1** · contracts **0.17.1** · `domainMode: kimai`                                 |
| HTTP readiness              | **PASS**                            | `/api/v1/time/*` OpenAPI **1.10.0** · AuthN/AuthZ pipeline                                            |
| Authentication              | **PASS (platform)**                 | BetterAuth + `withPlatformApiAuth` on Time HTTP                                                       |
| Authorization               | **PASS (platform catalogue)**       | `time.*` permissions in platform-services; product module binding → Phase 1                           |
| Provisioning                | **PARTIAL**                         | Platform provisioning **0.1.0** available; Time product enablement → Phase 1                          |
| Search                      | **PARTIAL**                         | Foundation HTTP `/time/search` composition; Platform Search SoR provider deferred (not IR-blocking)   |
| Navigation                  | **FAIL (product)**                  | No Time module Activity Bar registration — **does not block IR** (Projects: module/Workbench post-IR) |
| Health                      | **PASS**                            | `/time/health` + Kimai ops health                                                                     |
| Diagnostics                 | **PASS**                            | `/time/diagnostics` + service diagnostics                                                             |
| Audit                       | **PARTIAL**                         | Platform pipeline available; product `time.*` events → Phase 1 thin slice                             |
| Testing readiness           | **PARTIAL**                         | Layer tests exist; product Playwright → Production (not IR)                                           |
| Certification readiness     | **PARTIAL**                         | Layer certs present; product cert → after Release programme                                           |
| Operational readiness       | **PARTIAL**                         | Adapter/service/HTTP ops; product ops → with Workbench                                                |
| Workbench prerequisites     | **READY (stack)** / **ABSENT (UI)** | Shell, Design System, Workbench framework available; Time Workbench not built                         |

---

## Implementation Ready gate (Operating Model + PRODUCTS-003)

| Criterion                                                      | Status                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| Definition Pack complete                                       | **PASS**                                                           |
| Architecture Owner-approved for product delivery               | **PASS** — pack ACCEPTED; Kimai domain programme **ACCEPTED**      |
| Dependencies on disk (domain-capable adapter + service + HTTP) | **PASS** — Kimai **0.2.0** + services **0.26.1** + HTTP **1.10.0** |
| Marked Implementation Ready in pack / portfolio / matrix       | **PASS** — this programme                                          |
| Owner Approval of named product implementation programme       | **N/A / FAIL until given** — required before code (DoR)            |
| CURRENT-MILESTONE authorises product implementation            | **FAIL until Owner Approves a named programme**                    |

**Projects IR precedent applied:** Plane **0.6.0** + project-service + HTTP were sufficient for IR; Workbench/module UI were post-IR (APZHUB-PROJECTS-001). Time now has the equivalent stack.

---

## Gap disposition (vs READINESS-001 register)

| ID                                                                   | Disposition                                                                   | Blocks IR?                                     |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| IR-01 Kimai domain CE APIs                                           | **CLOSED** — KIMAI-002 **ACCEPTED**                                           | No                                             |
| IR-02 Kimai path HTTP 501                                            | **CLOSED** — domain provider production path                                  | No                                             |
| IR-03 Module manifest + nav                                          | **Open — Phase 1 / implementation**                                           | **No** (aligned to Projects; reclassified)     |
| IR-04 Product permission / provisioning enablement                   | **Open — Phase 1**                                                            | **No** for IR mark (platform catalogue exists) |
| IR-05 Workbench / typed client / React                               | **Open — Phase 1**                                                            | **No** for IR                                  |
| IR-06 Domain ADR                                                     | **CLOSED by Owner-accepted KIMAI-002** (programme = approved domain approach) | No                                             |
| IR-07 Product Playwright / release cert                              | **Open — Production**                                                         | Soft for IR                                    |
| IR-08–IR-12 Search SoR / reporting UI / approvals / mapping / events | **Deferred**                                                                  | No if Phase 1 scoped thin                      |
| IR-15 In-memory as Production SoR                                    | **Governance hold** — production must use Kimai domain mode                   | Honesty rule                                   |

---

## Remaining non-IR blockers (precise)

These **must** be closed by a future Owner-approved product programme before Production. They **do not** prevent Implementation Ready:

1. Time `module.yaml` + Activity Bar / workspace navigation
2. APZ Time Workbench (typed client + React surfaces)
3. Product permission binding in module manifests
4. Product Playwright certification
5. Optional later: Platform Search SoR provider, reporting UI, approvals, analytics

---

## Conclusion

APZ Time **satisfies** the repository definition of **Implementation Ready**.

Promote maturity **Planning → Implementation Ready**. Do **not** begin Workbench or Release 1.0 until Owner Approval of a **named** product programme.

See [APZ-TIME-IMPLEMENTATION-READY-DECISION.md](./APZ-TIME-IMPLEMENTATION-READY-DECISION.md) · [APZ-TIME-1.0-PHASE-1-SCOPE.md](./APZ-TIME-1.0-PHASE-1-SCOPE.md).
