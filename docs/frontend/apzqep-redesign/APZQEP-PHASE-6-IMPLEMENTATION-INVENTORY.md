# APZQEP Phase 6 — implementation inventory

**Status:** APPROVED — implementation **CLOSED · ACCEPTED**  
**Date:** 2026-08-20  
**Domain lock:** [APZQEP-PHASE-6-DOMAIN-LOCK.md](./APZQEP-PHASE-6-DOMAIN-LOCK.md)  
**Reconciliation:** [APZQEP-PHASE-6-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-6-DOMAIN-RECONCILIATION-REPORT.md)  
**Visuals:** Screens [1](./APZQEP-PHASE-6-SCREEN-1-QUALITY-RISK.md)–[4](./APZQEP-PHASE-6-SCREEN-4-CERTIFICATION-GO-NO-GO.md) LOCKED

This is a finite definition of what “Phase 6 complete” means. It is **not** implementation authority. Do not implement until Owner reviews this list and issues a single implementation authorisation. Do not expand the inventory during coding.

Phase 3–5 SoRs stay untouched except additive relationships. F4 Certification is **extended in place** (`qep_qo_document`). Quality Risk and Quality Gates are **new QEP authorities**. No Release / Release Candidate aggregate.

Approved chain:

```text
Application + Environment + SCM identity
  → Quality Facts → Risks → Gates → Current Readiness Posture
  → Certification → GO / CONDITIONAL_GO / NO_GO / DEFER
```

---

## Done when

All sixteen items below are delivered against the locked visuals and domain lock, with tests and evidence. Out of scope is not “later in the same PR.”

---

## Inventory summary (16)

| ID        | Title                                                  | Screens |
| --------- | ------------------------------------------------------ | ------- |
| **P6-01** | Tenant + application isolation                         | All     |
| **P6-02** | AuthZ family                                           | All     |
| **P6-03** | Durable Quality Risk + JSON ledger migration + history | 1, 2, 4 |
| **P6-04** | Screen 1 — Quality Risk                                | 1       |
| **P6-05** | Quality Gate definition (Blocking / Non-Blocking)      | 3, 2, 4 |
| **P6-06** | Immutable explainable Gate evaluation                  | 3, 2, 4 |
| **P6-07** | Screen 3 — Quality Gates                               | 3       |
| **P6-08** | Current Readiness Posture + live composition           | 2, 4    |
| **P6-09** | Readiness snapshot at Certification                    | 2, 4    |
| **P6-10** | Screen 2 — Release Readiness                           | 2       |
| **P6-11** | Decision context + Environment snapshot                | 2, 3, 4 |
| **P6-12** | Extend F4 Certification decisions + dual authority     | 4       |
| **P6-13** | Certification Exception + failed Blocking Gate rule    | 4, 3    |
| **P6-14** | Certification snapshot + history                       | 4       |
| **P6-15** | Screen 4 — Certification / Go-No-Go                    | 4       |
| **P6-16** | Presentation + focused certification evidence          | All     |

---

## P6-01 — Tenant + application isolation

| Field                                    | Content                                                                                                                                                    |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-01                                                                                                                                                      |
| **TITLE**                                | Tenant + application isolation                                                                                                                             |
| **PURPOSE**                              | Every new/extended Phase 6 record is tenant-safe and `qep_application`-bound. Close today’s Risk ledger and change-only Certification isolation gaps.      |
| **EXISTING AUTHORITY REUSED**            | `qep_application`, Phase 5 RLS/list-reject pattern, session tenant                                                                                         |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Isolation columns/checks on Quality Risk, Gate definition/evaluation, Certification evaluation/exception, Readiness snapshot                               |
| **API/READ MODEL IMPACT**                | All list/get/mutate reject cross-tenant and cross-application ids server-side                                                                              |
| **UI SCREEN(S)**                         | All — Application selector required; no unbound new rows                                                                                                   |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Server-side only. Source independence unchanged                                                                                                            |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | JSON risks without application: migrate only where a safe application mapping exists; otherwise leave unbound rows **out of** the new SoR and do not guess |
| **EVIDENCE REQUIRED FOR PASS**           | Cross-application GET/mutate 404/403. Tenant mismatch 404/403. No new unbound Risk/Gate/Certification rows. Source write still off                         |

---

## P6-02 — AuthZ family

| Field                                    | Content                                                                                                                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-02                                                                                                                                                                                                         |
| **TITLE**                                | AuthZ family                                                                                                                                                                                                  |
| **PURPOSE**                              | Extend existing QEP permission families. Writes must not be granted by read keys.                                                                                                                             |
| **EXISTING AUTHORITY REUSED**            | `qep.risk.read` / `operate`, `qep.release_readiness.read`, `qep.certification.read` / `decide`, `qep.audit.read`                                                                                              |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Gate define/evaluate (or operate) keys; Certification Exception authorise (may be `qep.certification.decide` plus server rule, or one additive key). Exact names at implementation, not a nine-role catalogue |
| **API/READ MODEL IMPACT**                | Fix Risk POST so `qep.risk.read` cannot mutate. Quality Assist / MCP remain forbidden from `qep.certification.decide`                                                                                         |
| **UI SCREEN(S)**                         | All — permission-filtered chrome                                                                                                                                                                              |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Server authoritative. Dual certifier + co-approver retained (P6-12)                                                                                                                                           |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Existing granted `qep.risk.*` / `qep.certification.*` continue to work; no wholesale recatalogue                                                                                                              |
| **EVIDENCE REQUIRED FOR PASS**           | Read-only actor cannot create Risk, define Gate, or record Certification. Decide-without-exception cannot CONDITIONAL_GO over failed Blocking Gate. Assist/MCP still cannot certify                           |

---

## P6-03 — Durable Quality Risk + JSON ledger migration + history

| Field                                    | Content                                                                                                                                                                                                                             |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-03                                                                                                                                                                                                                               |
| **TITLE**                                | Durable Quality Risk SoR                                                                                                                                                                                                            |
| **PURPOSE**                              | Replace the JSON file ledger as Screen 1 SoR. Human-created Risks only. Optional links to quality signals. History of status/level changes.                                                                                         |
| **EXISTING AUTHORITY REUSED**            | Module/route `/workspace/qep/risk`, `qep.risk.*`, Evidence SoR refs, `qep_application`. Status vocabulary `open \| mitigated \| accepted \| waived` as starting point                                                               |
| **NEW/EXTENDED DOMAIN REQUIRED**         | New PostgreSQL Quality Risk aggregate: tenant, application, identity, title, description, stored level/severity, owner, status, optional signal refs, timestamps, actors. **No** auto-create from Defects/Issues/failed tests/Gates |
| **API/READ MODEL IMPACT**                | Retain `/api/v1/qep/risk` as the product API; back it with the new SoR. Trend is **derived** from history, not a stored enum                                                                                                        |
| **UI SCREEN(S)**                         | 1 primary; 2 and 4 consume                                                                                                                                                                                                          |
| **AUTHZ/ISOLATION REQUIREMENTS**         | P6-01 + P6-02. Application-scoped only                                                                                                                                                                                              |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Additive import of `risks.json` where possible. Do not retain JSON as SoR after cutover. Do not import `testing_risk`, `platform_project_risk`, or APZPEN findings                                                                  |
| **EVIDENCE REQUIRED FOR PASS**           | Create Risk is human. Isolation pass. Migrated rows (if any) retain identity/status. History append-only. Failed Execution does not create a Risk                                                                                   |

---

## P6-04 — Screen 1 — Quality Risk

| Field                                    | Content                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-04                                                                                                         |
| **TITLE**                                | Screen 1 — Quality Risk                                                                                       |
| **PURPOSE**                              | Working risk register matching locked visual. Signal ≠ Risk.                                                  |
| **EXISTING AUTHORITY REUSED**            | P6-03 SoR, Application/Environment selectors, Design System                                                   |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Presentation over P6-03 only. Sample QR-* in the visual is **not** seed                                       |
| **API/READ MODEL IMPACT**                | List/filter/summary derived from real Risks. No RAG/quality score                                             |
| **UI SCREEN(S)**                         | 1 — desktop register + first-class mobile (list, filters, detail, summary). Light/dark identical geometry     |
| **AUTHZ/ISOLATION REQUIREMENTS**         | `qep.risk.read` / `operate`. Application required                                                             |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Replace current `QepRiskRouterView` file-ledger UI; do not keep a second Risk page                            |
| **EVIDENCE REQUIRED FOR PASS**           | Playwright desktop + mobile vs visual intent. Create / mitigate / accept / waive recorded. No invented scores |

---

## P6-05 — Quality Gate definition

| Field                                    | Content                                                                                                                                                                                                                      |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-05                                                                                                                                                                                                                        |
| **TITLE**                                | Quality Gate definition (Blocking / Non-Blocking)                                                                                                                                                                            |
| **PURPOSE**                              | Explicit inspectable conditions over existing QEP facts. Definition ≠ Evaluation.                                                                                                                                            |
| **EXISTING AUTHORITY REUSED**            | Defect, Evidence, Test Execution (customer Result, not provider runs), Coverage/AC traces, Quality Risk, Phase 5 Issue, Application, Environment. Closed set of condition kinds — **not** a DSL                              |
| **NEW/EXTENDED DOMAIN REQUIRED**         | New Gate definition aggregate: identity, name, description, scope, type Blocking/Non-Blocking, inspectable condition, version, lifecycle. **Do not** reuse F4 `evidence_ref_present` gates or TCMS `CERTIFICATION_GATE_KEYS` |
| **API/READ MODEL IMPACT**                | New QEP Gate definition APIs (versioned). F4 orchestration gates remain advisory for SCM-change F4 path until a later bridge                                                                                                 |
| **UI SCREEN(S)**                         | 3; consumed by 2 and 4                                                                                                                                                                                                       |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Define permission. Application-scoped. No Force GO fields on the definition                                                                                                                                                  |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Do not seed mock QG-001 rows. Do not create Gate Sets or Templates                                                                                                                                                           |
| **EVIDENCE REQUIRED FOR PASS**           | A Blocking vs Non-Blocking definition is stored and readable. Condition is inspectable (not only a colour). F4 `gate_f4_*` are not listed as Screen 3 Gates                                                                  |

---

## P6-06 — Immutable explainable Gate evaluation

| Field                                    | Content                                                                                                                                                                                                                                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-06                                                                                                                                                                                                                                                                                         |
| **TITLE**                                | Immutable explainable Gate evaluation                                                                                                                                                                                                                                                         |
| **PURPOSE**                              | Apply a definition version to a decision context. Preserve history if the definition later changes.                                                                                                                                                                                           |
| **EXISTING AUTHORITY REUSED**            | P6-05 definitions; P6-11 context; existing fact SoRs (read-only)                                                                                                                                                                                                                              |
| **NEW/EXTENDED DOMAIN REQUIRED**         | New evaluation rows: definition version, context, facts used, observed values, result (`Passed` / `Failed` / `Not Evaluated`), reason, timestamp. **At Risk** is presentation unless a bounded margin condition is on the definition. Evaluations are not mutated when the definition changes |
| **API/READ MODEL IMPACT**                | On-demand + at Certification (P6-12). No scheduled/event platform in Phase 6                                                                                                                                                                                                                  |
| **UI SCREEN(S)**                         | 3, 2, 4                                                                                                                                                                                                                                                                                       |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Evaluate under Gate/Certification permissions. Same tenant/application as context                                                                                                                                                                                                             |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | None from F4 gate result documents — do not rewrite them as Screen 3 evaluations                                                                                                                                                                                                              |
| **EVIDENCE REQUIRED FOR PASS**           | Explainability: condition, context, facts, observed values, why, when, definition version. Changing a definition does not alter a prior evaluation. Failed Blocking Gate visible                                                                                                              |

---

## P6-07 — Screen 3 — Quality Gates

| Field                                    | Content                                                                                                                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-07                                                                                                                                                                 |
| **TITLE**                                | Screen 3 — Quality Gates                                                                                                                                              |
| **PURPOSE**                              | Operational Gate register matching locked visual.                                                                                                                     |
| **EXISTING AUTHORITY REUSED**            | P6-05 / P6-06, Application/Environment, Design System                                                                                                                 |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Presentation only. Gate Sets / Templates / Archive enums **deferred** — do not invent durable lifecycle from the visual’s Active/Archive tabs beyond what P6-05 needs |
| **API/READ MODEL IMPACT**                | Summary counts derived from real evaluations. Trend derived from evaluation history                                                                                   |
| **UI SCREEN(S)**                         | 3 — desktop + mobile (summary, register, detail, evaluation summary). Light/dark identical geometry. `+ Create Gate` if define permission                             |
| **AUTHZ/ISOLATION REQUIREMENTS**         | P6-02. Application required                                                                                                                                           |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | No seed of illustrative gates                                                                                                                                         |
| **EVIDENCE REQUIRED FOR PASS**           | Playwright desktop + mobile. Detail shows the condition, not only a badge. No gate score                                                                              |

---

## P6-08 — Current Readiness Posture + live composition

| Field                                    | Content                                                                                                                                                                                                                                                                |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-08                                                                                                                                                                                                                                                                  |
| **TITLE**                                | Current Readiness Posture                                                                                                                                                                                                                                              |
| **PURPOSE**                              | Explainable derived briefing. Not a score. Does not write Certification.                                                                                                                                                                                               |
| **EXISTING AUTHORITY REUSED**            | Quality facts from Phases 2–5, P6-03 Risks, P6-06 Gate evaluations, Evidence                                                                                                                                                                                           |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Read model only. Posture vocabulary: Ready / At Risk / Not Ready / Insufficient Data (or equivalent locked labels). Wording is **Current Readiness Posture**, never Recommended Posture. Dimensions are explainable counts/states — Coverage ≠ Result, Status ≠ Result |
| **API/READ MODEL IMPACT**                | Composition API over live facts. **No** percentage overall readiness. **Reject** testing-services `overallReadinessScore` and F4 `score` as product semantics                                                                                                          |
| **UI SCREEN(S)**                         | 2 primary; 4 shows advisory posture                                                                                                                                                                                                                                    |
| **AUTHZ/ISOLATION REQUIREMENTS**         | `qep.release_readiness.read`. Same decision context as P6-11                                                                                                                                                                                                           |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Replace Quality-Flow-checklist-only readiness UI as the customer Screen 2. Do not persist a readiness score table                                                                                                                                                      |
| **EVIDENCE REQUIRED FOR PASS**           | Posture changes when a Blocking Gate fails. No 74% (or any) overall score. Copy never says “Recommended.” High Risk ≠ automatic NO-GO                                                                                                                                  |

---

## P6-09 — Readiness snapshot at Certification

| Field                                    | Content                                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **ID**                                   | P6-09                                                                                                                    |
| **TITLE**                                | Readiness snapshot                                                                                                       |
| **PURPOSE**                              | Freeze the briefing used for a Certification decision. Live state later must not rewrite history.                        |
| **EXISTING AUTHORITY REUSED**            | P6-08 composition; Phase 4 snapshot pattern; F4 `reproduceCertificationEvaluation` pattern                               |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Snapshot payload referenced by the Certification evaluation (extend F4 document), not a second readiness SoR             |
| **API/READ MODEL IMPACT**                | Historical Certification Readiness Snapshot tab shows frozen posture; live context labelled separately if shown          |
| **UI SCREEN(S)**                         | 4 (Readiness Snapshot); 2 remains live                                                                                   |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Same as Certification                                                                                                    |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Existing decided F4 evaluations remain readable; new decisions carry the snapshot                                        |
| **EVIDENCE REQUIRED FOR PASS**           | After a later Defect/Risk closure, an old Certification still shows the original posture/facts. Live Screen 2 may differ |

---

## P6-10 — Screen 2 — Release Readiness

| Field                                    | Content                                                                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-10                                                                                                                                                   |
| **TITLE**                                | Screen 2 — Release Readiness                                                                                                                            |
| **PURPOSE**                              | Decision briefing matching locked visual. Briefing ≠ decision.                                                                                          |
| **EXISTING AUTHORITY REUSED**            | P6-08, P6-11, Design System                                                                                                                             |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Presentation. Selector is Application + Environment + SCM/version identity — **not** a Release object                                                   |
| **API/READ MODEL IMPACT**                | P6-08 composition. Dimensions from real facts with honest gaps (Evidence sufficiency is not a count-as-percentage unless a Gate states the requirement) |
| **UI SCREEN(S)**                         | 2 — desktop + mobile. Light/dark identical geometry                                                                                                     |
| **AUTHZ/ISOLATION REQUIREMENTS**         | `qep.release_readiness.read`. Application required                                                                                                      |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | “Review for Certification” opens Screen 4 with the same context. Does not certify                                                                       |
| **EVIDENCE REQUIRED FOR PASS**           | Playwright desktop + mobile. No overall readiness %. Link through to Gates/Risks/Certification without copying SoRs                                     |

---

## P6-11 — Decision context + Environment snapshot

| Field                                    | Content                                                                                                                                                                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-11                                                                                                                                                                                                                                    |
| **TITLE**                                | Application + Environment + SCM decision context                                                                                                                                                                                         |
| **PURPOSE**                              | Stable identity for Readiness, Gates, and Certification without a Release aggregate.                                                                                                                                                     |
| **EXISTING AUTHORITY REUSED**            | `qep_application`, `qep_application_environment`, `qep_scm_change_event` (sha/tag/PR/ci_run)                                                                                                                                             |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Context record/fields on evaluations, snapshots, and exceptions. Environment **copied/snapshotted** at decision time because the change event does not carry it. “Release Candidate” may appear as **label** of the change identity only |
| **API/READ MODEL IMPACT**                | Certification/Gate/Readiness APIs require the triple. No `qep_release` routes                                                                                                                                                            |
| **UI SCREEN(S)**                         | 2, 3, 4 selectors                                                                                                                                                                                                                        |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Application isolation; SCM change must join to the Application via `qep_application_repository` (or fail closed)                                                                                                                         |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Existing F4 evaluations keyed by `changeEventId` remain valid history. New evaluations add Application + Environment snapshot                                                                                                            |
| **EVIDENCE REQUIRED FOR PASS**           | Cannot certify without Application, Environment, and SCM identity. Env on the snapshot survives env rename. No `qep_release` table created                                                                                               |

---

## P6-12 — Extend F4 Certification decisions + dual authority

| Field                                    | Content                                                                                                                                                                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-12                                                                                                                                                                                                                                                         |
| **TITLE**                                | Extend F4 Certification                                                                                                                                                                                                                                       |
| **PURPOSE**                              | Same SoR (`qep_qo_document` / certification-runtime). Add CONDITIONAL_GO and DEFER. Keep dual certifier + co-approver.                                                                                                                                        |
| **EXISTING AUTHORITY REUSED**            | `certification-runtime.ts`, Approval Engine dual template, `qep.certification.read` / `decide`, human-actor checks                                                                                                                                            |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Outcome union: `GO \| CONDITIONAL_GO \| NO_GO \| DEFER`. Historical `GO` / `NO_GO` remain. DEFER is a recorded postponement, not absence of a decision. Justification required. No automatic outcomes. F4 `score` must not be product Certification semantics |
| **API/READ MODEL IMPACT**                | Extend existing `/api/v1/qep/certification/*`. Handler today rejects anything except GO/NO_GO — extend validation. Preserve `decision_already_recorded`                                                                                                       |
| **UI SCREEN(S)**                         | 4                                                                                                                                                                                                                                                             |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Dual independent actors for terminal GO and CONDITIONAL_GO. Any NO_GO still finalises immediately unless Owner later changes that (not in this inventory). System/QI/automation actors remain rejected                                                        |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Existing decided evaluations unchanged. Do not PATCH old GO → CONDITIONAL_GO                                                                                                                                                                                  |
| **EVIDENCE REQUIRED FOR PASS**           | Record GO / NO_GO / DEFER / CONDITIONAL_GO (latter only with P6-13). Dual GO still requires two authorities. Old GO/NO_GO rows still load. Assist cannot decide                                                                                               |

---

## P6-13 — Certification Exception + failed Blocking Gate rule

| Field                                    | Content                                                                                                                                                                                                                                                   |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-13                                                                                                                                                                                                                                                     |
| **TITLE**                                | Bounded Certification Exception                                                                                                                                                                                                                           |
| **PURPOSE**                              | Single exception concept. Failed Blocking Gate never yields ordinary GO.                                                                                                                                                                                  |
| **EXISTING AUTHORITY REUSED**            | Quality Risk `accepted` / `waived` remain **Risk** acceptance (not Gate override). Approval identities from P6-12                                                                                                                                         |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Bounded Certification Exception: reason, authoriser, affected Gate, decision context, conditions, effective period/expiry, immutable history, link to Certification. **One** concept — not Exception + Waiver + Override + Risk Acceptance as four stores |
| **API/READ MODEL IMPACT**                | Exception APIs under Certification. Record-decision rejects: GO if any failed Blocking Gate; CONDITIONAL_GO without a valid authorised exception covering each failed Blocking Gate; CONDITIONAL_GO/GO if Blocking failed and no exception                |
| **UI SCREEN(S)**                         | 4 (Exceptions / Waivers tab = this object). No Ignore Gate / Force GO actions                                                                                                                                                                             |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Authorise exception is permission-gated and audited. Same tenant/application/context                                                                                                                                                                      |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Do not migrate Risk `waiverNote` into Certification Exceptions automatically                                                                                                                                                                              |
| **EVIDENCE REQUIRED FOR PASS**           | Failed Blocking Gate + no exception → cannot GO or CONDITIONAL_GO. Valid exception → CONDITIONAL_GO only, never GO. Exception fields persist and appear on reproduce/history                                                                              |

---

## P6-14 — Certification snapshot + history

| Field                                    | Content                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-14                                                                                                                                                                                                                                                                                                                     |
| **TITLE**                                | Certification snapshot and history                                                                                                                                                                                                                                                                                        |
| **PURPOSE**                              | Historical truth. No silent rewrite of GO → NO_GO.                                                                                                                                                                                                                                                                        |
| **EXISTING AUTHORITY REUSED**            | `reproduceCertificationEvaluation`, Phase 4 snapshot pattern, append-only history pattern (prefer tenant-scoped subject history over unscoped `qep-audit` JSON as SoR)                                                                                                                                                    |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Freeze at decision: context, Current Readiness Posture, Gate evaluations, Risk ids+observed status/level, Evidence refs, Issue ids if considered, exceptions, decision, justification, certifier, co-approver, timestamp. New decision / supersede / re-certification = **new** evaluation, not in-place PATCH of outcome |
| **API/READ MODEL IMPACT**                | Extend reproduce + history list. Recent Decisions are real records                                                                                                                                                                                                                                                        |
| **UI SCREEN(S)**                         | 4 History / Recent Decisions / Summary                                                                                                                                                                                                                                                                                    |
| **AUTHZ/ISOLATION REQUIREMENTS**         | `qep.certification.read` for history; decide for new records                                                                                                                                                                                                                                                              |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Pre-Phase-6 F4 evaluations remain reproduce-able                                                                                                                                                                                                                                                                          |
| **EVIDENCE REQUIRED FOR PASS**           | Reproduce after fact changes still shows original snapshot. Second decision is a new evaluation. No synthetic history from current readiness                                                                                                                                                                              |

---

## P6-15 — Screen 4 — Certification / Go-No-Go

| Field                                    | Content                                                                                                                                                                                                                           |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-15                                                                                                                                                                                                                             |
| **TITLE**                                | Screen 4 — Certification / Go-No-Go                                                                                                                                                                                               |
| **PURPOSE**                              | Controlled human decision surface matching locked visual. Not a prettier readiness dashboard.                                                                                                                                     |
| **EXISTING AUTHORITY REUSED**            | P6-08–P6-14, Evidence SoR, Risk SoR, Gate evaluations, IAM identities (human-readable, not UUID-first)                                                                                                                            |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Presentation. Supporting-rationale checkboxes in the visual are **not** durable enums unless later justified — justification text is required                                                                                     |
| **API/READ MODEL IMPACT**                | Decision recording through extended F4 APIs only                                                                                                                                                                                  |
| **UI SCREEN(S)**                         | 4 — desktop Decision/Summary/snapshot/Gates/Risks/Evidence/Exceptions/Notes/History. Mobile first-class; recording on mobile must not bypass controls. Light/dark identical geometry. Current Readiness Posture (not Recommended) |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Dual authority UX. Notes: reuse existing note/activity if present; do not create a generic note engine                                                                                                                            |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | `/workspace/qep/certification` and `/rc` remain the same product surface                                                                                                                                                          |
| **EVIDENCE REQUIRED FOR PASS**           | Playwright desktop + mobile. Cannot record GO over failed Blocking Gate. CONDITIONAL_GO requires exception. Justification required. Posture advisory only                                                                         |

---

## P6-16 — Presentation + focused certification evidence

| Field                                    | Content                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P6-16                                                                                                                                                                                                                                                                                                                           |
| **TITLE**                                | Light/dark, mobile, focused evidence                                                                                                                                                                                                                                                                                            |
| **PURPOSE**                              | Same domain, same APIs, responsive composition. Prove the chain end-to-end.                                                                                                                                                                                                                                                     |
| **EXISTING AUTHORITY REUSED**            | APZQEP Design System, Phase 5 Playwright harness patterns                                                                                                                                                                                                                                                                       |
| **NEW/EXTENDED DOMAIN REQUIRED**         | None                                                                                                                                                                                                                                                                                                                            |
| **API/READ MODEL IMPACT**                | None beyond P6-01–P6-15                                                                                                                                                                                                                                                                                                         |
| **UI SCREEN(S)**                         | All four — desktop light/dark identical geometry; mobile light/dark identical geometry                                                                                                                                                                                                                                          |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Covered by P6-01/P6-02                                                                                                                                                                                                                                                                                                          |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Focused tests only; no unrelated legacy suite ceremony                                                                                                                                                                                                                                                                          |
| **EVIDENCE REQUIRED FOR PASS**           | Finite Playwright + API tests proving: isolation; Risk human-create; Gate explainability; posture not a score; F4 extension; CONDITIONAL_GO-only override; dual authority; snapshot immutability; Source independence. Screenshots for Screens 1–4 desktop+mobile light (and dark where required by existing evidence practice) |

---

## Explicitly out of inventory

- `qep_release` / `qep_release_candidate`
- Gate Sets / Gate Templates
- Generic rule engine / generic workflow engine
- Quality score / readiness score / Gate weighting / F4 `score` as product
- New Evidence, Defect, Application, or Environment stores
- Parallel Certification store / TCMS `certification_record` / `testing_release*`
- Automatic GO / CONDITIONAL_GO / NO_GO / DEFER
- AI Certification / AI recommendation
- Ordinary GO over a failed Blocking Gate
- Portfolio/cross-application Risk
- Nine-role catalogue
- SSH, Terminal, Source write
- Phase 7

---

## Authorisation gate

```text
IMPLEMENTATION INVENTORY:
DRAFTED FOR OWNER REVIEW

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED

PHASE 7:
NOT STARTED
```

Do not implement until Owner issues a single implementation authorisation against this list.
