# APZQEP redesign — programme checkpoint after Phase 7

**Date:** 2026-08-20  
**Status:** **OWNER APPROVED** — programme **COMPLETE**  
**Owner decision:** [APZQEP-PROGRAMME-CLOSURE.md](./APZQEP-PROGRAMME-CLOSURE.md)  
**Phase 7:** CLOSED · ACCEPTED — [APZQEP-PHASE-7-ACCEPTANCE.md](./APZQEP-PHASE-7-ACCEPTANCE.md)  
**Phase 8:** **NOT REQUIRED** · NOT STARTED  
**Product state:** OPERATIONAL LEARNING

This checkpoint asked whether another numbered phase was required after the quality chain through AI closed. Owner approved the finding: **Phase 8 is not required.** The redesign programme ends here.

---

## 1. What APZQEP now provides end-to-end after Phases 1–7

APZQEP is a standalone Quality Engineering workbench (and the Quality discipline inside APZHUB) over one Application-scoped chain:

```text
Application
  → Requirements → Stories → Acceptance Criteria
  → Test Cases → Suites → Plans
  → Execution → Evidence / Defects → Retest
  → Exploratory / UI-UX Verification
  → Quality Risk → Quality Gates → Current Readiness Posture
  → Human Certification (GO / CONDITIONAL_GO / NO_GO / DEFER)
  → AI-assisted quality intelligence (proposal only)
```

| Phase           | Product provided                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **1 / 1V / 1E** | Workbench shell, permission-driven Master IA, Overview / My Work, Application registry and selector                           |
| **2**           | Requirements, User Stories, Acceptance Criteria, application binding                                                          |
| **3**           | Test Case library/designer, Suites, Plans                                                                                     |
| **4**           | Executions, manual/automated result, Evidence, Defect, Rerun/Retest                                                           |
| **5**           | Exploratory sessions and UI/UX verification (two workflow roots)                                                              |
| **6**           | Quality Risk SoR, Gate definition/evaluation, derived Current Readiness Posture, dual-authority Certification                 |
| **7**           | AI Quality Companion: permission-safe context, generate/analyse, typed Proposal, type-specific Accept, deterministic analysis |

Operators can define quality intent, design and plan tests, execute and evidence, capture defects and exploratory/experience findings, record risk, evaluate gates, certify a change, and use AI only as a proposal layer above those SoRs. Tenant and Application isolation hold. Source remains independently entitled. `source.read` is exclusive for AI Source context.

---

## 2. Genuine product capability gaps that remain

These are **not** missing links in the quality chain, and they **do not constitute Phase 8**. Owner classified them as bounded product refinement / operational-learning items. They must not introduce new quality SoRs or reopen accepted phases.

| Gap                          | Why it is a product gap, not Phase 7 leftover                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Specified role landings**  | UX authority named distinct landings: Quality Lead Command Centre, Tester My Testing, Developer Quality Feedback, Release Owner Release Decision, Auditor Assurance Review, Viewer Quality Overview. Phase 1 delivered **QEP Master IA composition** only. Role matrix recorded durable role catalogue expansion as later work. Today those users enter the same Master IA, filtered by permission. |
| **QEP Administration depth** | Master IA named People & Access, Teams, Roles, Release Policies. What exists: Settings, Integrations, Audit; Environments under Application Detail. QEP Admin still must not become Org/Platform Admin.                                                                                                                                                                                             |
| **Complete product pass**    | Original sequence item 10: a honesty / visual / permission sweep across the replaced UI, not a new quality SoR.                                                                                                                                                                                                                                                                                     |

Frozen **non-gaps** (do not treat as missing product):

- Release / Release Candidate aggregate — Phase 6 closed without it.
- AI Chat SoR, Finding SoR, embeddings, vector store, MCP product, Source write, SSH, Terminal — Phase 7 frozen non-results.
- AI quality/readiness score — prohibited.
- Nine durable IAM product-role rows — never authorised as a quality SoR; composition over PermissionService remains the rule.

---

## 3. Accepted engineering debt (separate from product scope)

| Debt                                                       | Record                                                                       | Rule                                                                                                        |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Repository-wide `pnpm typecheck` failure                   | [APZQEP-REPOSITORY-TYPECHECK-DEBT.md](./APZQEP-REPOSITORY-TYPECHECK-DEBT.md) | Engineering cleanup. Not an APZQEP phase. Do not reopen Phases 1–7 to absorb it.                            |
| Display UUIDs, shared `+ Create` chrome                    | Phase 5 acceptance                                                           | Presentation/platform chrome. Not quality SoR.                                                              |
| F4 payload may still carry a legacy internal `score` field | Phase 6 acceptance                                                           | Not product semantics.                                                                                      |
| Bounded Evidence body extract for AI                       | Phase 7 report                                                               | Metadata default is certified. Extract is optional and still unauthorised as a follow-on unless Owner asks. |
| QI vendor/score tables                                     | Phase 7 domain lock                                                          | Must not become an AI quality score. Leave as engineering surface.                                          |

---

## 4. Whether a Phase 8 is genuinely required

**No.** Owner confirmed: [APZQEP-PROGRAMME-CLOSURE.md](./APZQEP-PROGRAMME-CLOSURE.md).

The quality engineering product is complete through Certification and governed AI assistance. Another numbered phase is not required merely because the original sequence listed 8 / 9 / 10, and not because MCP, embeddings, or Source write were deferred.

---

## 5. Phase 8 product purpose

**Superseded.** Owner decided Phase 8 is **not required**. Role landings, administration depth, and a complete-product pass remain available only as separately authorised **bounded refinement / operational-learning** work. They are not a numbered redesign phase.

```text
PHASE 1–7                       CLOSED · ACCEPTED · FROZEN
PHASE 8                         NOT REQUIRED · NOT STARTED
APZQEP REDESIGN PROGRAMME       COMPLETE
PRODUCT STATE                   OPERATIONAL LEARNING
```

Owner decision: [APZQEP-PROGRAMME-CLOSURE.md](./APZQEP-PROGRAMME-CLOSURE.md).

**STOP.**
