# APZQEP Phase 3 — Domain lock

**Status:** LOCKED  
**Date:** 2026-08-19  
**Authority:** Owner decisions on the accepted Phase 3 domain reconciliation.

This lock is subordinate to the [Constitution](../../000-apzhub-engineering-constitution.md) and foundation documents 001–029. It does not replace certified QEP aggregates.

## Authoritative aggregates (extend, do not replace)

| Product concept         | Authoritative SoR                                               | Notes                                                          |
| ----------------------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| Test Case               | `qep_test_specifications` via `@apzhub/qep-test-specifications` | Operator number remains `TS-*`. No `qep_test_case`. No `TC-*`. |
| Test Suite              | `qep_suite` via `@apzhub/qep-suites`                            | Add `SUITE-*` and Test Case membership.                        |
| Test Plan               | `qep_test_plans` via `@apzhub/qep-test-plans`                   | Additive extension of certified 1.0.                           |
| Execution Plan          | `qep_execution_plan`                                            | Internal orchestration only.                                   |
| Formal execution        | `qep_test_execution`                                            | Sealed step execution.                                         |
| Suite/session execution | `qep_execution_session`                                         | Workspace + operational defects.                               |
| Evidence                | existing Evidence SoR                                           | No second store.                                               |
| Defect                  | existing Defect SoR                                             | Formal TE may relate/raise. No second model.                   |
| Environment             | `qep_application_environment`                                   | Phase 1E.                                                      |
| Infrastructure target   | `qep_application_execution_target`                              | `ci_pipeline` \| `managed_runner` \| `remote_host` only.       |
| AC → Test Case          | `qep_acceptance_criterion_verification`                         | Phase 2 relationship. `asset_kind = test_specification`.       |

## Identity

- Test Case durable number: existing `Specification.number`, conventionally `TS-*`. Historical values are not renumbered.
- Product UX: “Test Case”, “Test Case Library”, “Add Test Case”, “Edit Test Case”.
- Compatibility APIs may retain Specification terminology.
- Suite durable key: application-scoped `SUITE-*`. Never `TS-*`.
- Opaque ids (`tsp_*`, `suite-*`, `tpl_*`) remain internal.

## Definition vs execution

Test Case definition steps store only:

- order
- action
- test-data description/reference
- expected result

They must not store actual result, pass/fail, or evidence. Those belong to Execution.

Preconditions describe what must be true before execution. They are not a workflow engine.

Test data on the case is description/reference only. No raw credentials, passwords, tokens, or private keys. No new secrets store.

A Test Case may expose manual capability, automation mapping availability, and supported verification capability. It does **not** authoritatively assign environment, infrastructure, or runtime target. Those belong to Test Plan Execution Strategy.

## Capability / surface / infrastructure

These dimensions are distinct. Do not collapse them onto Phase 1E target types.

| Dimension                       | Meaning                       | Examples                                                                                          |
| ------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------- |
| Verification capability         | What kind of verification?    | Browser Automation, API Verification, Accessibility, SAST, DAST, Performance, Manual Verification |
| Execution surface / context     | What is being exercised?      | Web, API, Repository, Manual                                                                      |
| Execution infrastructure target | Where/how infrastructure runs | `ci_pipeline`, `managed_runner`, `remote_host`                                                    |
| Environment                     | Which Application environment | Phase 1E `qep_application_environment`                                                            |

Example: `Browser Automation → Web → QA → Managed Runner`.  
Web/API/Repository are **not** infrastructure target types.

Provider/tool implements a capability (Playwright, Semgrep, ZAP are illustrative). Do not hard-code visual providers as platform dependencies.

## Plans and executions

- Test Plan is the customer-facing planning object: objective, scope, included Suites, included individual Test Cases, Execution Strategy, planning context.
- Individual Test Case plan membership uses existing specification item references (`specificationId`). Do not introduce a second `testCaseId` v1 field.
- Suite membership on a plan is a new durable reference table. Definitions are not copied.
- Execution Plan remains behind the scenes. Ordinary navigation exposes Test Plans, not Execution Plans.
- Keep both execution engines. Present one Executions experience. User-facing modes may be Manual / Automated / Suite Session — never package names.
- Historical execution snapshots the Test Case definition and the Suite/Plan scope. Later edits do not rewrite history.
- Plan progress is derived. No user-entered percentages.
- Coverage ≠ Result (Phase 2 rule preserved).

## Binding, isolation, deferred work

- New Test Cases, Suites, and Test Plans bind to `qep_application`. Unresolved historical associations remain Unbound. No guessed project mappings.
- Every new table enforces tenant RLS. Cross-tenant membership is impossible.
- QEP permissions do not imply Source permissions. Do not enable `source.write`.
- Do not create Release. Do not implement SSH runtime, Terminal, RCE, or AI generation.

## Frozen going forward (Owner 2026-08-20)

Test Plan remains the authority for **scripted verification / execution strategy**. It is **not** the UI/UX experience-verification plan. Phase 5 Experience Plan is a separate lightweight aggregate. Do not extend Test Plan into UI/UX planning.
