# APZQEP Phase 3 — domain reconciliation agenda

**Status:** ANALYSIS **COMPLETE** — see [APZQEP-PHASE-3-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-3-DOMAIN-RECONCILIATION-REPORT.md). Implementation **NOT AUTHORISED.**  
**Date:** 2026-08-19  
**Depends on:** Screens 1–4 visual locks

All four Phase 3 visuals are locked. The next authorised step is **domain reconciliation against repository truth**, then one Owner domain lock, then one implementation instruction. Nothing in this file authorises schema, APIs, or UI work.

## Owner-locked distinctions (do not reopen without Owner)

```text
Test Case  = what / how to verify (reusable definition)
Suite      = reusable grouping of Test Cases
Test Plan  = scope + execution strategy
Execution  = a specific run / result
```

```text
Test Case ──► Suite ──► Test Plan ──► Execution ──► Evidence / Defect
                │            │
                └────────────┘  Plan may also include individual Test Cases
```

- **Execution Method / Environment / Target / Tool** belong authoritatively to **Plan execution strategy**.
- A Test Case may express **capability** (manual / automatable) and an **automation mapping** (compatibility), not a mandatory QA / Playwright / Chrome / host assignment.
- The **same Test Case** may execute differently in different Plans.
- Screen 2 Method / Environment / Target = default / capability / latest context, **not** SoR assignment.
- Product IA is **capability** (Browser Automation, SAST, DAST, …). Tool names in visuals are illustrative resolution, not fixed configuration.
- No Release entity. No SSH / Terminal / Source write. No AI. No parallel Test Case / Suite / Plan stores.
- Progress is derived. Historical executions must snapshot scope (Suite membership later adding TC-4 must not rewrite old runs).
- Environment and Execution Target reference **Phase 1E** Application models. Remote Host: `credentialRef` only.
- Manual testing is first-class. Exploratory remains a known gap — do not invent a session entity here.

## Visual authorities

| Screen     | Document                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 1 Library  | [APZQEP-PHASE-3-SCREEN-1-TEST-CASE-LIBRARY.md](./APZQEP-PHASE-3-SCREEN-1-TEST-CASE-LIBRARY.md)   |
| 2 Designer | [APZQEP-PHASE-3-SCREEN-2-TEST-CASE-DESIGNER.md](./APZQEP-PHASE-3-SCREEN-2-TEST-CASE-DESIGNER.md) |
| 3 Suites   | [APZQEP-PHASE-3-SCREEN-3-TEST-SUITES.md](./APZQEP-PHASE-3-SCREEN-3-TEST-SUITES.md)               |
| 4 Plans    | [APZQEP-PHASE-3-SCREEN-4-TEST-PLANS.md](./APZQEP-PHASE-3-SCREEN-4-TEST-PLANS.md)                 |

Phase 0 map: [APZQEP-CAPABILITY-MAP.md](./APZQEP-CAPABILITY-MAP.md).

## Questions that must be answered against the repository

Do not solve by creating parallel stores.

| #   | Question                                               | Starting truth (pointer only)                                                                                                                                                                     |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Specification → product Test Case                      | `@apzhub/qep-test-specifications` (`qep_test_specifications`, operator `TS-…`, opaque `tsp_…`). Product language is **TC-…**.                                                                     |
| 2   | First-class Action / Test Data / Expected Result steps | Specification currently has **no** first-class steps. Extend that SoR or an equivalent **single** aggregate.                                                                                      |
| 3   | Test Case type / lifecycle vocabulary                  | Specification types and statuses exist; visual Draft / In Review / Approved / Deprecated must reconcile, not compete.                                                                             |
| 4   | Suite → Test Case membership                           | `@apzhub/qep-suites` is first-class; **Test Cases are out of scope** today.                                                                                                                       |
| 5   | Suite human key vs Specification `TS-*`                | Visual Suite `TS-001` collides with Specification numbers. Choose a distinct operator scheme.                                                                                                     |
| 6   | Test Plan vs Execution Plan                            | `@apzhub/qep-test-plans` (items pin **specifications**, `testCaseId` rejected in v1) vs `@apzhub/qep-execution-plans` (intent/readiness, **does not execute**). One coherent Plan/strategy model. |
| 7   | Test Case capability vs Plan assignment                | Owner lock: capability/mapping on Case; strategy on Plan. Map to existing automation assets.                                                                                                      |
| 8   | Automation mapping ownership                           | `@apzhub/qep-automation` — reuse; do not duplicate scripts on the Plan.                                                                                                                           |
| 9   | Environment → Phase 1E                                 | Plan strategy references `qep_application` environments. No second catalogue. Existing Execution Plan `EnvironmentReference` is a label/ref — reconcile.                                          |
| 10  | Execution Target → Phase 1E                            | Web / API / Repository / Remote Host as actually modelled. `credentialRef` only.                                                                                                                  |
| 11  | Test Data model                                        | Inspect existing capability before adding. Strategy describes requirement; no secrets on the Plan.                                                                                                |
| 12  | Plan → Suite / Test Case membership                    | Test Plan items today are specification pins. Suites not first-class Plan members.                                                                                                                |
| 13  | Historical execution scope snapshot                    | Existing items already support `specificationVersionPin`. Extend equivalent integrity to Suite membership.                                                                                        |
| 14  | AC → Test Case → Execution / Evidence / Defect         | Phase 2: AC → Specification link table; `TRACE_ENDPOINT_KINDS` has no `acceptance_criterion`. Carry-forward.                                                                                      |
| 15  | Dual execution model                                   | `@apzhub/qep-test-execution` and `@apzhub/qep-execution-workspace`. Do not invent a third store.                                                                                                  |

## Existing Plan lifecycle (do not clone a visual enum)

`qep-test-plans`: `draft | review | approved | ready | in_execution | completed | archived | rejected | cancelled | superseded`

`qep-execution-plans`: `draft | in_review | approved | ready | scheduled | handed_off | cancelled | archived | retired`

Visual Planned / Not Started / In Progress / Completed must **map**, not replace, after Owner domain lock.

## Stop

Domain reconciliation may proceed as **analysis only** when Owner authorises that document. **Do not implement Phase 3.**
