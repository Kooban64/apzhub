# APZQEP Phase 4 report — Executions

**Date:** 2026-08-20  
**Authority:** [APZQEP-PHASE-4-IMPLEMENTATION-AUTHORITY.md](./APZQEP-PHASE-4-IMPLEMENTATION-AUTHORITY.md) · [APZQEP-PHASE-4-DOMAIN-LOCK.md](./APZQEP-PHASE-4-DOMAIN-LOCK.md) · [APZQEP-PHASE-4-CLOSURE.md](./APZQEP-PHASE-4-CLOSURE.md)  
**Phase 5:** NOT STARTED  
**Owner acceptance:** [APZQEP-PHASE-4-ACCEPTANCE.md](./APZQEP-PHASE-4-ACCEPTANCE.md) — **ACCEPTED · CLOSED** (2026-08-20)  
**This document:** closure/certification evidence after the bounded Phase 4 closure pass. Ratings are from live behaviour against `http://127.0.0.1:3300`, not types or empty UI.

Implementation extended the existing Test Execution and Execution Workspace engines through a **PresentedExecution composition**. It did **not** create `qep_execution`, a third execution store, Release, SSH, Terminal, Vault, AI, or `service.yaml` on `@apzhub/qep-test-management`.

Previous PARTIAL findings from 2026-08-19 are preserved in [Closure history](#closure-history-preserved). They are superseded by the last-green focused Playwright run of 2026-08-20. They are not deleted.

---

## Owner return block

```text
PHASE 4 STATUS:
COMPLETE

P4-01 COMPOSITION:
PASS

P4-02 APPLICATION ISOLATION:
PASS

P4-03 PLAN → EXECUTION:
PASS

P4-04 SNAPSHOTS:
PASS

P4-05 MANUAL EXECUTION:
PASS

P4-06 STEP EVIDENCE:
PASS

P4-07 MANUAL DEFECT:
PASS

P4-08 AUTOMATION CORRELATION:
PASS

P4-09 LOGS / ARTIFACTS / EVIDENCE:
PASS WITH HONEST PROVIDER-AVAILABILITY LIMITATION

P4-10 AUTOMATED DEFECT:
PASS

P4-11 EXECUTION RESULT:
PASS

P4-12 RETEST:
PASS

P4-13 RERUN:
PASS

P4-14 HISTORY / LINKED RECORDS:
PASS

P4-15 MOBILE / THEMES:
PASS

P4-16 CERTIFICATION:
PASS

SCREEN 2 SAVE WRITE PATH:
PASS

SCREEN 3 LIVE AUTOMATION:
PASS

RETEST INSTANTIATION:
PASS

PLAYWRIGHT:
PASS

THIRD EXECUTION STORE CREATED:
NO

TWO EXECUTION ENGINES:
PRESERVED

STATUS / RESULT:
SEPARATE

HISTORICAL SNAPSHOT:
PASS

TENANT ISOLATION:
PASS

APPLICATION ISOLATION:
PASS

SOURCE INDEPENDENCE:
PASS

SSH:
NOT ENABLED

TERMINAL:
NOT ENABLED

RELEASE:
NOT CREATED

AI:
NOT IMPLEMENTED
```

Owner should still **visually inspect** [evidence/phase-4/](./evidence/phase-4/) against the four locked authority images. `PASS` means the capability ran against live engines with real data in the last-green focused suite.

---

## Critical chain (proven live — 2026-08-20)

Focused Playwright `testing/playwright/e2e/apzqep-phase-4-executions.spec.ts` against `http://127.0.0.1:3300`, persona `org_member`:

| Step                  | Proof                                                                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan → Execution      | `POST /api/v1/qep/test-plans/:id/start-execution` created a Test Execution; list status **In Progress**, result **Not Run**                                                                                                                                                           |
| Application isolation | Other-application `presented-executions` list did **not** include the execution; cross-application plan member POST rejected                                                                                                                                                          |
| Definition snapshot   | After `PATCH` Test Case steps to “Changed after execution”, Screen 2 / Screen 4 still showed **Open /login**                                                                                                                                                                          |
| Screen 1              | [01](./evidence/phase-4/01-executions-desktop-light.png) [02](./evidence/phase-4/02-executions-desktop-dark.png) — Status and Result as separate columns                                                                                                                              |
| Screen 2 write path   | [03](./evidence/phase-4/03-manual-desktop.png)–[04](./evidence/phase-4/04-manual-active-step.png) — **Save Step Result** and **Save & Next** posted `.../steps/:order/results`; Actual Result persisted after re-select; current step advanced to 2                                   |
| Evidence              | Invalid `evidence://login-form.png` fail-closed; legitimate `apz-evidence:{id}` attached from Screen 2, persisted, resolved after step re-select and on Screen 4                                                                                                                      |
| Manual defect         | Screen 2 Create defect → Defect SoR; Screen 4 Defect tab                                                                                                                                                                                                                              |
| Complete in place     | Complete posted `.../actions/complete`; Result view appeared without full-page remount                                                                                                                                                                                                |
| Screen 4              | [08](./evidence/phase-4/08-result-summary.png) Status **Completed** · Result **Fail** · Environment **QA** · Method **Manual Verification**; [09](./evidence/phase-4/09-result-steps.png) historical steps + persisted actuals                                                        |
| History               | [12](./evidence/phase-4/12-result-history.png) real engine actions only                                                                                                                                                                                                               |
| Linked                | [19](./evidence/phase-4/19-result-linked.png) Test Case, Plan, Execution, Evidence, Defect, Rerun, Retest — no inferred Suite/AC                                                                                                                                                      |
| Rerun                 | `POST .../rerun` new Execution, `relation_kind = rerun`, **18218 ms**                                                                                                                                                                                                                 |
| Retest                | UI **Create retest** after Defect `ready_for_retest`; new TE, `relation_kind = retest`, original remains Failed, Defect not auto-closed, **3292 ms**, classification **NOT_HANG**                                                                                                     |
| Screen 3              | Existing **vitest** `runImmediately` failed report → ingest `mode: imported` → Screen 1 automated row → Screen 3 live detail [15](./evidence/phase-4/15-automated-overview.png)–[18](./evidence/phase-4/18-automated-artifacts.png) [21](./evidence/phase-4/21-automated-defects.png) |

---

## 1. Closure fixes

Bounded to the four authorised screens. No new product capability. No Phase 5.

1. **Screen 2 Save / Save & Next** call the authoritative `qep-test-execution` step-result write path. Labels are **Save Step Result** and **Save & Next**. Persisted Actual Result is re-read from the engine, not a UI-only store. Playwright waits on the real `POST .../steps/:order/results` response.
2. **Evidence capture** accepts a tenant QEP Application when Plane project membership fails (`requireQepProjectOrApplication`). Screen 2 attaches `apz-evidence:{id}`. Invalid `evidence://` remains fail-closed.
3. **Ingest** injects Test Case `resolved` steps in the HTTP handler (production TE has no `resolveSource`), then `bindTestExecutionApplication` + `captureExecutionSnapshots` + `correlateAutomation`. Domain requires `mode === "imported"` for ingest. Provider remains secondary.
4. **Screen 3** resolves execution-time strategy snapshot (Plan, capability, surface, environment, target, provider mapping). Logs/artifacts use reference / fetch-on-demand. Human Create/Link Defect from a failed automated run; ingest does not auto-create Defects.
5. **Investigation linked records** resolve successor Rerun / Retest via `previousExecutionId`. Original Screen 4 Linked tab shows those ids.
6. **Complete** updates the investigation query cache in place (`productResultFromOutcome`) so Screen 4 appears without `page.goto` / reload.
7. **`keepPreviousData`** on the investigation query so invalidate after complete/retest does not unmount ResultDetail.
8. **Client isolation:** Screen 2/3/4 view does not import `@apzhub/qep-test-management` values (that pulled postgres into the browser). Types come from `/domain`; mapping is local.
9. **Retest hang diagnosis:** GET prewarm of `/retest` before the UI POST; hang was first-compile / overall budget, not an application deadlock. Timeout was not raised to hide it.
10. **Playwright harness:** `readJson` (do not consume the body twice); API retries on socket hang; wait for workbench spinner and `qep-application-selector` before Screen 3; list assertion uses `qep-execution-row-${id}` (execution number is displayed, raw id is the row testid).

---

## 2. Root cause of Retest hang

**Classification: TEST HARNESS / HTTP/ROUTE (first compile under `next dev`), not APPLICATION, DATABASE, or TRANSACTION/LOCK.**

Earlier PARTIAL runs reached Defect `ready_for_retest` then hung on the first `POST .../retest`. The handler itself instantiates a new Test Execution the same way as Plan → Execution. The wait boundary was the first compilation / cold route of the mutation under the Playwright webServer, compounded by the overall test budget after rerun + defect lifecycle.

This closure pass:

- Prewarmed `GET .../retest` before the UI action.
- Measured the UI Create Retest POST at **3292 ms**.
- Wrote `classification=NOT_HANG` to [retest-timing.txt](./evidence/phase-4/retest-timing.txt).
- Did **not** increase timeout until it appeared green.

Rerun on the same run was **18218 ms** ([rerun-timing.txt](./evidence/phase-4/rerun-timing.txt)) — slow first-hit compile, still returned OK.

---

## 3. Root cause of Playwright remount flake

**Classification: APPLICATION (client query lifecycle), not INFRASTRUCTURE.**

After Complete, React Query invalidated investigation with no placeholder data. The refetch cleared `investigationQ.data`, unmounted ResultDetail, and Playwright lost `qep-execution-result`. Arbitrary timeout increases would not have fixed that.

Fix:

- `placeholderData: keepPreviousData` on the investigation query.
- Complete writes the updated execution into the query cache in place so the Result view appears from the accepted Workbench in-app navigation, without a full page remount.

Normal user behaviour is preserved: Complete still posts the engine complete action; the shell stays on the same execution.

---

## 4. Automation path used for Screen 3 certification

Existing supported **vitest** provider. No new automation provider.

1. `POST /api/v1/qep/automation/executions` with `providerId: "vitest"`, `runImmediately: true`, and a deterministic failed JSON report (`success: false`, test status `failed`, `failureMessage: "timeout waiting for home"`).
2. `POST /api/v1/qep/executions/ingestions` with `sourceSystemId: "vitest"`, `automationExecutionId`, `isComplete: false`, step outcome `failed`, `create.sourceRefs` to the Test Case and Plan.
3. Handler injects resolved Test Case steps, binds application, freezes strategy snapshot, correlates the provider run.
4. Presented list type **automated**; TE `mode: imported`; Screen 1 Executions → Screen 3 Automated Execution Detail.

Provider remains secondary (`Provider is secondary` on Screen 3). Customer Execution is `qep-test-execution`, not `qep_automation_execution`.

Normalisation proven: provider-native **failed** → ingest step outcome **failed** → Screen 3 Results **Failed**. Overall execution was left **In Progress / Result Not Run** because ingest was incomplete on purpose so Screen 3 remains the live automated surface rather than flipping to Screen 4.

---

## 5. Evidence path used

1. **Fail-closed (required):** Screen 2 Attach with `evidence://login-form.png` → engine **not accessible**. Not stored.
2. **Legitimate SoR:** `POST /api/v1/qep/evidence` with tenant QEP Application as `projectId`, `mediaType: text/plain`, content hash. Capture returned Evidence id `ev-158f3ab1-...`.
3. Screen 2 attached `apz-evidence:ev-158f3ab1-...` via `POST .../evidence-references`.
4. Reload of the same step resolved the URI. Screen 4 Evidence tab shows `apz-evidence:ev-158f3ab1-1828-46db-9b9c-6adbb14b2e8a` on step 2 ([10](./evidence/phase-4/10-result-evidence.png)). History includes `associateEvidence`.

No fake `evidence://` references were seeded to obtain PASS.

---

## 6. Defect path used

**Manual (P4-07, already accepted, recertified):** Screen 2 human Create defect “Login failed in QA” → existing Defect SoR with `testExecutionId` → Screen 4 Defect tab. Lifecycle driven by API: `new` → `triaged` → assign → `in_progress` → `fixed` → `ready_for_retest`. No auto-create.

**Automated (P4-10):** Deterministic **failed** vitest fixture (not a UI result rewrite). Screen 3 Defects tab human Create/Link “Automated login failed” → Defect SoR → relationship persists on Screen 3 ([21](./evidence/phase-4/21-automated-defects.png)). Ingest did not auto-create Defects.

---

## 7. Retest evidence

From genuine failed Execution → linked Defect → `ready_for_retest`:

| Requirement                  | Result                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| New `qep-test-execution`     | PASS — new id, not the original                                                                      |
| `relation_kind = retest`     | PASS                                                                                                 |
| Link prior Execution         | PASS                                                                                                 |
| Link triggering Defect       | PASS                                                                                                 |
| Preserve Application         | PASS                                                                                                 |
| Preserve Test Case scope     | PASS (`specificationId`)                                                                             |
| Resolve strategy/environment | PASS (inherited composition / snapshot)                                                              |
| Original unchanged           | PASS — original outcome remains `failed`                                                             |
| Screen 1                     | PASS — new row `qep-execution-row-${retestId}` visible ([20](./evidence/phase-4/20-retest-list.png)) |
| Screen 4 linked              | PASS — Retest id on original Linked tab ([19](./evidence/phase-4/19-result-linked.png))              |
| Defect not auto-closed       | PASS — remains `ready_for_retest`                                                                    |

Retest Pass (execute the new TE to Passed) was **not** forced. Owner allowed creation + relationship integrity as the closure minimum.

---

## 8. Screenshots

All files in [evidence/phase-4/](./evidence/phase-4/) were captured by the last-green run on 2026-08-20.

| File  | Surface                                                                            |
| ----- | ---------------------------------------------------------------------------------- |
| 01–02 | Executions list desktop light/dark; Status **In Progress**, Result **Not Run**     |
| 03    | Manual workspace desktop — definition snapshot **Open /login**                     |
| 04    | Active step; Save Step Result / Save & Next                                        |
| 05    | Evidence URI field with fail-closed `evidence://` attempt                          |
| 06    | Defect confirm + create                                                            |
| 07    | Manual workspace mobile                                                            |
| 08    | Result summary: Completed / Fail / QA / Manual Verification                        |
| 09    | Result steps: historical **Open /login** + persisted actuals                       |
| 10    | Result evidence: legitimate `apz-evidence:` URI                                    |
| 11    | Result defect tab                                                                  |
| 12    | Result history (authoritative engine actions)                                      |
| 13    | Executions mobile list                                                             |
| 14    | Result mobile                                                                      |
| 15    | Screen 3 overview: Plan, Browser Automation, Web, CI, ci_pipeline, vitest (failed) |
| 16    | Screen 3 results: Provider login assertion — Failed                                |
| 17    | Screen 3 logs: `vitest-report.json` Fetch (reference / on demand)                  |
| 18    | Screen 3 artifacts: `memory://ingest/vitest-summary.json` and `vitest-report.json` |
| 19    | Result linked: Test Case, Plan, Execution, Evidence, Defect, Rerun, Retest         |
| 20    | Screen 1 after Retest: original Completed/Fail plus new In Progress rows           |
| 21    | Screen 3 defects: human-created “Automated login failed · New”                     |

---

## 9. Test commands / results

```text
PLAYWRIGHT_BROWSERS_PATH=/home/ubuntu/.cache/ms-playwright \
  pnpm exec playwright test --config testing/playwright/playwright.config.ts \
  apzqep-phase-4-executions.spec.ts
```

| Suite                                                     | Result                                                                |
| --------------------------------------------------------- | --------------------------------------------------------------------- |
| Focused Playwright `apzqep-phase-4-executions.spec.ts`    | **2 passed (7.4m)** — last-green 2026-08-20                           |
| Test 1 manual write path, evidence, result, rerun, retest | **PASS (3.6m)**                                                       |
| Test 2 automated provider ingest appears on Screen 3      | **PASS (2.1m)**                                                       |
| Phases 1–3 Playwright                                     | **Not recertified this pass** (not required for this bounded closure) |

Commands used for supporting unit work during closure (not the release gate): `project-acl`, Phase 4 view, and `qep-test-management` Vitest — previously **34 passed**. The certification gate is the focused Playwright file above.

---

## 10. Genuine remaining limitations

These do **not** reopen the mandatory gates. They are honest provider/fixture limits.

1. **P4-09 logs:** The vitest deterministic fixture does not expose a live runner log stream. Screen 3 Logs shows fetch-on-demand `vitest-report.json`. Artifacts are `memory://ingest/...` references. APZQEP is not a log store. Logs were not manufactured.
2. **Retest Pass not executed:** Creation, relation integrity, original remains Failed, and Defect not auto-closed are proven. Running the new Retest through to Passed was not part of the focused suite.
3. **Linked records are fixture-complete, not globally complete:** This chain has Test Case, Plan, Execution, Evidence, Defect, Rerun, Retest. No Suite or Acceptance Criterion in this fixture. Empty AC on Screen 4 Summary is honest (`AC: —`).
4. **Screen 3 overall Result stays Not Run** while ingest `isComplete: false`. That keeps Screen 3 as the live automated surface. Step-level Failed is shown on Results. Completing the imported TE would move it to Screen 4 and was not required for this proof.
5. **Provider mapping** on Screen 3 Overview may show `—` when the snapshot has no extra mapping label; Plan / capability / surface / environment / target / vitest correlation were resolved from the historical snapshot, not today’s mutable Plan.
6. **First-hit mutation latency** under `next dev` (rerun ~18s, retest ~3s after GET prewarm) remains a harness/compile characteristic, not a domain lock.
7. **SDK 027 `service.yaml`** is still absent on `@apzhub/qep-test-management`. Owner lock: do not add in Phase 4.
8. **Phases 1–3 Playwright** were not re-run for ceremony.

---

## Migrations / schema (unchanged from accepted composition)

| File                                                                        | Purpose                      |
| --------------------------------------------------------------------------- | ---------------------------- |
| `packages/config/drizzle/0155_apz_qep_phase4_execution_composition.sql`     | Additive composition tables  |
| `packages/config/drizzle/0156_apz_qep_phase4_execution_composition_rls.sql` | Tenant RLS (`app.tenant_id`) |

**Tables added:** `qep_execution_strategy_snapshot`, `qep_test_execution_relation`, `qep_test_execution_automation_link`.

No `qep_execution`. No Release schema. `savePresentedExecution` remains a postgres no-op.

---

## Architecture (preserved)

- Customer Executions = **PresentedExecution** read model over `qep_test_execution` ∪ `qep_execution_session`.
- Provider runs remain `qep_automation_execution`; they are not listed as customer Executions.
- Status is operational. Result is quality. Workspace `completed` is **not** mapped to `not_run`.
- Retest / Rerun create **new** Test Executions with `relation_kind`; `supersede` is not reused.
- AuthZ does not UNION an engine the caller cannot independently read.

---

## History events actually shown

From [12](./evidence/phase-4/12-result-history.png), original manual execution:

- `createExecution`
- `prepareExecution`
- `assignExecutor`
- `startExecution`
- `recordStepResult` (×3 — Save, Save & Next, step 2 Fail)
- `associateEvidence`
- `completeExecution`

Rerun created and Retest created are **linked records**, not synthesized history rows on the original. Defect lifecycle transitions are Defect SoR events, not invented execution history. Missing event names were not fabricated from current state.

---

## Closure history (preserved)

The 2026-08-19 Owner return block was **PARTIAL**. Live-proven then: composition, isolation, Plan → Execution, snapshots, Screen 1/2/4 chrome, API step results, manual defect, Screen 4 result, rerun, fail-closed evidence, mobile/themes.

Not certified then (now closed):

1. Screen 2 Save was not itself the proven write path (API POST was used instead).
2. No durable Evidence SoR attach from Screen 2.
3. Screen 3 had UI/correlation APIs only — no live provider ingest.
4. Retest HTTP hung under the Playwright budget after `ready_for_retest`.
5. Linked tab not screenshot-asserted.
6. Playwright not last-green (result-view remount after complete).

Those gaps were inside the four authorised screens. They are closed by this pass. Do not treat the earlier PARTIAL ratings as current.

---

## PHASE 5

NOT STARTED

Owner-recommended next phase is **Exploratory & Experience Verification**. Visuals 1–4 are **LOCKED**. Implementation is **not authorised**. Next authorised activity is Phase 5 domain reconciliation.

Do not start Phase 5 implementation. Do not create `qep_execution`. Do not enable SSH, Terminal, Release, or AI. Do not invent Exploratory or UI/UX session stores.
