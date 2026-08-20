# APZQEP Phase 5 — implementation inventory

**Status:** APPROVED WITHOUT CHANGE — implementation **AUTHORISED** under [APZQEP-PHASE-5-IMPLEMENTATION-AUTHORITY.md](./APZQEP-PHASE-5-IMPLEMENTATION-AUTHORITY.md)  
**Date:** 2026-08-20  
**Domain lock:** [APZQEP-PHASE-5-DOMAIN-LOCK.md](./APZQEP-PHASE-5-DOMAIN-LOCK.md)  
**Visuals:** Screens 1–4 LOCKED

This is a finite definition of what “Phase 5 complete” means. It is **not** implementation authority. Do not implement until Owner reviews this list and issues a single implementation authorisation. Do not expand the inventory during coding.

Phase 3 Test Plan / Test Case / Suite stay untouched as planning/scripted-verification authorities. Phase 4 execution engines stay untouched. Option B (extend Test Plan) remains rejected.

---

## Done when

All sixteen items below are delivered against the locked visuals and domain lock, with tests and evidence. Out of scope is not “later in the same PR.”

---

## Inventory (16)

| ID        | Item                                            | Screens | Bounded meaning of done                                                                                                                                                                                                                                                    |
| --------- | ----------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P5-01** | Application + tenant isolation                  | All     | Every new Phase 5 root and capture record is `qep_application`-bound and tenant RLS-safe. Cross-application list/mutate rejected server-side. No unbound new rows. Source independence unchanged.                                                                          |
| **P5-02** | AuthZ family                                    | All     | Extend existing QEP permission families for view/manage/perform Exploratory and Experience Plan/Activity. Server-side authoritative. No nine-role catalogue.                                                                                                               |
| **P5-03** | Shared Observation                              | 2, 4    | New Phase 5 Observation SoR. Attachable to Exploratory Session and UI/UX Verification Activity. Does not imply failure/Defect/Issue/TE result. TE and QI “observation” untouched; no migration.                                                                            |
| **P5-04** | Shared Issue                                    | 2, 4    | New Issue SoR, distinct from Defect. Elevate from Observation/concern. Dismiss / resolve / link existing Defect / human-controlled promote to Defect. No auto-create Defect. One Issue model for both workflows.                                                           |
| **P5-05** | Shared Note                                     | 2, 4    | Lightweight notes on either workflow root. Distinct from Observation, Issue, Evidence, Defect. No extra Note workflow engine.                                                                                                                                              |
| **P5-06** | Evidence relationship extension                 | 2, 4    | Existing Evidence SoR only. Associate to Session, Observation, Issue, Verification Activity, Criterion, Experience Context where meaningful. Fail-closed invalid refs. No second Evidence store.                                                                           |
| **P5-07** | Defect relationship extension                   | 2, 4    | Existing Defect SoR only. Deliberate create/link from Issue with safe context transfer (Application, Environment snapshot, Issue/Observation, criterion/viewport where present, Evidence).                                                                                 |
| **P5-08** | Exploratory Session + Charter                   | 1, 2    | New Session aggregate: Application, Environment, tester, lifecycle, timing, charter (mission/objective/scope), Areas to Explore as prompts. No independent Charter aggregate unless technically unavoidable. No Test Cases/steps/pass-fail.                                |
| **P5-09** | Screen 1 — Exploratory Sessions                 | 1       | List/filter/summary matching visual authority. Operational counts only (derived). Desktop table + genuine mobile cards. `+ New Session`. Sample EXS-* not seeded as product data.                                                                                          |
| **P5-10** | Screen 2 — Exploratory Session Workspace        | 2       | Live workspace: charter / activity / summary + capture. Pause/Complete. Real activity timeline. Quick capture Observation / Evidence / Issue / Note. Derived exploratory progress from areas. Mobile Overview/Activity/Capture/Summary.                                    |
| **P5-11** | Experience Plan + contexts + criteria           | 3, 4    | New lightweight Experience Plan: disciplines, Experience Contexts, Criteria, owner/lifecycle. Not Test Plan, not Execution Plan, not Test Case container. No Suite membership, Execution Strategy, or runner config.                                                       |
| **P5-12** | Screen 3 — UI / UX Verification Plans           | 3       | Plan list/filters/summary matching visual. Plan ≠ live activity. Desktop + mobile. Annotation residual “Exploratory Sessions” on the board is ignored.                                                                                                                     |
| **P5-13** | UI/UX Verification Activity + criterion results | 4       | New activity aggregate consuming an Experience Plan. Current experience context, criterion results (not TE Passed/Failed/Blocked/Not Run), pause/complete. Not `qep-test-execution`, workspace, or `qep-verification`.                                                     |
| **P5-14** | Screen 4 — Verification Workspace               | 4       | Live workspace matching visual: plan context / activity / summary+capture / recent observations+issues. Viewport Matrix **derived**. Progress **derived**. Quick capture. Mobile first-class. Light/dark identical geometry.                                               |
| **P5-15** | History + optional traceability                 | 2, 4    | Real recorded events only (start, pause, capture, complete, …). Extend existing history/audit patterns; no synthetic history; no second generic history engine. Optional traces to Requirement/Story/AC/Test Case/Suite/Test Plan/Evidence/Defect — never required origin. |
| **P5-16** | Focused certification                           | All     | Finite tests proving: two workflow roots; shared capture; Isolation; Evidence/Defect extension; derived matrix/progress; TE observations unchanged; Source independence. Focused Playwright for Screens 1–4. No unrelated legacy suites for ceremony.                      |

---

## Explicitly out of inventory

- `qep_ui_ux_execution`
- Generic `quality_session` discriminator
- Second Test Plan system / Option B
- Third execution store / `qep_execution`
- Viewport Matrix table
- New Evidence, Defect, Application, or Environment stores
- Migration of TE/QI observations
- UX / accessibility / quality scores
- AI, pixel-diff, BrowserStack, device farm, Figma, Playwright visual comparison
- SSH, Terminal, Source write, Release
- Nine-role catalogue
- Phase 6

---

## Authorisation gate

```text
IMPLEMENTATION INVENTORY:
APPROVED WITHOUT CHANGE

PHASE 5 IMPLEMENTATION:
AUTHORISED
```
