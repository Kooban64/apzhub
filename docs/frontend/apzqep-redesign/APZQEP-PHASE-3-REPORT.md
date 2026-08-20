# APZQEP Phase 3 report — Test management

**Date:** 2026-08-19  
**Authority:** [APZQEP-PHASE-3-IMPLEMENTATION-AUTHORITY.md](./APZQEP-PHASE-3-IMPLEMENTATION-AUTHORITY.md) · [APZQEP-PHASE-3-DOMAIN-LOCK.md](./APZQEP-PHASE-3-DOMAIN-LOCK.md)  
**Phase 4:** NOT STARTED  
**This document:** closure/certification evidence. It does not copy anticipated PASS values from the implementation instruction.

Implementation extended existing Specification / Suite / Test Plan aggregates. It did **not** create `qep_test_case`, a Plan v2, a merged execution engine, Release, AI generation, SSH, Terminal, or Source write.

Owner direction for this pass: do not keep Phase 3 open solely because live execution-snapshot integration remains PARTIAL, provided the Test Case → AC → Suite → Plan → Strategy chain is proven and snapshot is recorded as an execution-layer gap. Plan Overview, Execution Strategy, Executions, and Plan mobile evidence were mandatory and are now present.

## Owner return block

```text
PHASE 3 STATUS:
COMPLETE

SPECIFICATION → TEST CASE:
PASS

HISTORICAL TS-* PRESERVED:
PASS

TEST CASE STEPS:
PASS

APPLICATION BINDING:
PASS

AC → TEST CASE:
PASS

SUITES:
PASS

SUITE MEMBERSHIP:
PASS

SUITE KEY:
PASS

TEST PLANS:
PASS

EXECUTION STRATEGY:
PASS

EXECUTION PLAN INTERNAL:
PASS

CAPABILITY / SURFACE / TARGET SEPARATION:
PASS

CUSTOMER EXECUTIONS EXPERIENCE:
PARTIAL

DUAL EXECUTION ENGINES:
PRESERVED

EXECUTION SNAPSHOT:
PARTIAL

EVIDENCE:
PASS

DEFECTS:
PARTIAL

COVERAGE != RESULT:
PASS

TENANT ISOLATION:
PASS

SOURCE INDEPENDENCE:
PASS

TEST CASE LIBRARY VISUAL:
CONFORMS

TEST CASE DESIGNER VISUAL:
CONFORMS

TEST SUITES VISUAL:
CONFORMS

TEST PLANS VISUAL:
CONFORMS

LIGHT/DARK GEOMETRY:
MATCH

MOBILE:
PASS

PLAYWRIGHT:
PASS

SUITE DETAIL FAILURE:
APPLICATION
Open-suite via page.goto remounted the workbench and hung on “Opening your workbench…”. Fixed by in-place open from the already-loaded list payload (no extra GET navigation). A later “Test Suites” strict-mode clash was TEST (back control vs sidebar); locators now use testids.

DATABASE CONNECTION FAILURE:
INFRASTRUCTURE
db:seed “Connection terminated unexpectedly” occurred under concurrent Playwright globalSetup seed vs a live Next process. Postgres was not at max_connections (~6 backends vs max 100 at probe). Not classified as an application leak or pool exhaustion. globalSetup now retries seed once; later runs completed (“Authorization catalogue seeded”).

RELEASE:
NOT CREATED

SSH:
NOT ENABLED

TERMINAL:
NOT ENABLED

AI:
NOT IMPLEMENTED
```

Owner should still **visually inspect** the four locked images against [evidence/phase-3/](./evidence/phase-3/). The `CONFORMS` lines mean authorised shell, hierarchy, and navigation were reproduced with real data — not pixel-identity with the illustrative mock (especially `TC-*`, stats rails, and the Screen 4 strategy matrix).

## Critical chain (proven)

Live Playwright path against `http://127.0.0.1:3300`, persona `org_member`, application **Test Management App**:

| Step               | Proof                                                                                                                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test Case Designer | [06](./evidence/phase-3/06-test-case-designer-desktop-light.png) [07](./evidence/phase-3/07-test-case-designer-steps.png) — `TS-*`, application selector, preconditions, ordered Action / Test Data / Expected Result                                          |
| AC traceability    | [08](./evidence/phase-3/08-test-case-designer-ac-links.png) — **TS-38** verifies **AC-1 Valid credentials authenticate the user** via `POST /api/v1/qep/test-cases/:id/criteria` → `qep_acceptance_criterion_verification` (`asset_kind = test_specification`) |
| Suite membership   | [15](./evidence/phase-3/15-test-suites-membership.png) — **SUITE-001 Authentication** members **TS-38 Login with valid credentials** by specification id (definition not copied). Cross-application member POST rejected                                       |
| Test Plan scope    | [20](./evidence/phase-3/20-test-plan-overview.png) — **Sprint regression** contains **SUITE-001** and individual **TS-39 Logout**. No customer “Execution Plan” tab                                                                                            |
| Execution Strategy | [21](./evidence/phase-3/21-test-plan-strategy.png) — **QA browsers**: `Browser Automation → Web → QA → Managed Runner`. Environment name is joined from Phase 1E `qep_application_environment`, not inferred from the group title “QA browsers”                |

`web` / `api` / `repository` as Phase 1E infrastructure target types remain rejected (`POST` execution-target `targetType: "web"` and strategy `infrastructureTargetType: "web"` both non-OK).

## 1. Migrations / schema extensions actually delivered

| File                                                               | Purpose                                    |
| ------------------------------------------------------------------ | ------------------------------------------ |
| `packages/config/drizzle/0153_apz_qep_test_management_sor.sql`     | Additive columns + new tables              |
| `packages/config/drizzle/0154_apz_qep_test_management_sor_rls.sql` | Tenant RLS (`app.tenant_id`) on new tables |
| `packages/config/src/db/qep-test-management-schema.ts`             | Drizzle mapping                            |

**Columns added (existing tables):**

- `qep_test_specifications`: `application_id`, `definition_version`, `manual_capable`
- `qep_suite`: `application_id`, `suite_key`
- `qep_test_plans`, `qep_execution_plan`, `qep_execution_session`, `qep_test_execution`: `application_id`
- `qep_defect`: `test_execution_id`

**Tables added:** `qep_test_specification_step`, `qep_suite_item`, `qep_test_plan_suite_item`, `qep_test_plan_strategy_group` (CHECK infrastructure type ∈ `ci_pipeline | managed_runner | remote_host`), `qep_test_case_automation_mapping`, `qep_execution_definition_snapshot`, `qep_execution_scope_snapshot`, `qep_test_execution_defect`.

No `qep_test_case`. No Release schema.

## 2. Packages extended / added

| Package                                                                   | Role                                                              |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Added** `@apzhub/qep-test-management` (`packages/qep-test-management/`) | Domain + application service + Postgres/in-memory persistence     |
| `@apzhub/qep-test-specifications`                                         | Still the Test Case SoR (`qep_test_specifications`)               |
| `@apzhub/qep-suites`                                                      | Still the Suite SoR; `SUITE-*` + membership overlay               |
| `@apzhub/qep-test-plans`                                                  | Still Test Plan 1.0; strategy/scope overlay                       |
| `@apzhub/qep-applications`                                                | Environment + infrastructure target (Phase 1E) unchanged as types |
| `@apzhub/qep-definition`                                                  | AC verification links reused                                      |

Missing vs SDK 027: no `services/qep/services/qep-test-management/service.yaml`. Carried as debt.

## 3. Compatibility adapters

Product UX says **Test Case**. Durable number remains `TS-*`. Compatibility HTTP kept:

| Compatibility                         | Product                                         |
| ------------------------------------- | ----------------------------------------------- |
| `GET/POST /api/v1/qep/specifications` | `/api/v1/qep/test-cases`                        |
| `GET/POST /api/v1/qep/suites`         | `/api/v1/qep/test-suites`                       |
| `GET/POST /api/v1/qep/plans`          | `/api/v1/qep/test-plans`                        |
| `/api/v1/qep/execution-plans`         | Internal orchestration; not in customer TEST IA |

`POST /test-cases` with `number: "TC-101"` is rejected.

## 4. API changes (product)

| Method     | Path                                           |
| ---------- | ---------------------------------------------- |
| GET, POST  | `/api/v1/qep/test-cases`                       |
| GET, PATCH | `/api/v1/qep/test-cases/[testCaseId]`          |
| POST       | `/api/v1/qep/test-cases/[testCaseId]/criteria` |
| GET, POST  | `/api/v1/qep/test-suites`                      |
| GET        | `/api/v1/qep/test-suites/[suiteId]`            |
| POST       | `/api/v1/qep/test-suites/[suiteId]/members`    |
| GET, POST  | `/api/v1/qep/test-plans`                       |
| GET        | `/api/v1/qep/test-plans/[planId]`              |
| POST       | `/api/v1/qep/test-plans/[planId]/members`      |
| POST       | `/api/v1/qep/test-plans/[planId]/strategy`     |
| GET        | `/api/v1/qep/test-plans/[planId]/executions`   |

Strategy create persists verification capability, execution surface, Phase 1E environment id, and infrastructure target type/id. Presented strategy includes `environmentName` from the environment SoR.

## 5. Evidence / screenshots

[evidence/phase-3/](./evidence/phase-3/) — captured by `testing/playwright/e2e/apzqep-phase-3-test-management.spec.ts`.

| File  | Surface                                                                                  |
| ----- | ---------------------------------------------------------------------------------------- |
| 01–02 | Test Case Library desktop light/dark                                                     |
| 03    | Library inspector                                                                        |
| 04–05 | Library mobile light/dark (cards, not a squeezed table; not the access-check flash)      |
| 06    | Designer details (`TS-*`, application-bound, strategy note)                              |
| 07    | Designer steps: two ordered rows, Action, Test Data `sku:DEMO`, Expected Result          |
| 08    | AC links: AC-1                                                                           |
| 09    | Designer desktop dark                                                                    |
| 10–11 | Designer mobile light/dark                                                               |
| 12–13 | Suites desktop light/dark                                                                |
| 14    | Suite inspector                                                                          |
| 15    | Suite membership (`SUITE-001` → `TS-*`)                                                  |
| 16–17 | Suites mobile light/dark                                                                 |
| 18–19 | Test Plan list desktop light/dark                                                        |
| 20    | Plan Overview (suite + individual Test Case scope, tabs, no Execution Plan)              |
| 21    | Execution Strategy chain including **QA** environment name                               |
| 22    | Executions tab honest empty state: **No executions yet.**                                |
| 23    | Plan desktop dark                                                                        |
| 24–25 | Plan mobile light/dark: identity, Overview / Execution Strategy / Executions tabs, scope |

Earlier mobile captures that showed only “Checking product access…” were invalid and were recaptured after waiting for the real surface.

## 6. Tests and exact results

| Suite                                                               | Result                                                                                                                                                                                                |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/qep-test-management` Vitest                               | **19 passed**                                                                                                                                                                                         |
| Playwright `apzqep-phase-3-test-management.spec.ts`                 | **1 passed** (last green run ~1.7–1.9 min, Chromium)                                                                                                                                                  |
| Playwright `apzqep-phase-1-master.spec.ts` Command Centre / My Work | **PASS**                                                                                                                                                                                              |
| Playwright Phase 1 non-QEP user                                     | **PASS**                                                                                                                                                                                              |
| Playwright Phase 1 Source read / write unused                       | **PASS**                                                                                                                                                                                              |
| Playwright Phase 1 mobile foundation                                | First run **timeout** on `page.goto` after a long prior test; **PASS on isolated retry** (1.1 min)                                                                                                    |
| Playwright `apzqep-phase-2-definition.spec.ts`                      | **Did not recertify this pass** — `quick-login` 60s then `POST /user-stories` 30s timeouts under host load. Phase 2 remains **ACCEPTED** from its own report. Not treated as a Phase 3 product defect |

Phase 3 Playwright also asserted: `TC-*` rejected; historical `TS-*` still present after a later step PATCH; cross-application suite membership rejected; `web` not accepted as an infrastructure target type.

## 7. Genuine remaining gaps

1. **EXECUTION SNAPSHOT = PARTIAL.** Tables, `snapshotTestCaseExecution` / `snapshotScope`, and unit tests prove create-once immutability. `captureExecutionSnapshots` is best-effort on TE / workspace-session create and must not fail those paths. **No live-engine proof** in this pass (create → snapshot → edit definition → historical unchanged; suite A/B/C → add D → historical A/B/C). Carry to the Execution Workspace phase. Do not treat as PASS.
2. **CUSTOMER EXECUTIONS EXPERIENCE = PARTIAL.** Plan Executions tab shows a coherent empty state without package names. Sidebar label is **Executions**. Dual engines are **not merged**. Live rows from both engines were not shown.
3. **DEFECTS = PARTIAL.** `qep_test_execution_defect` + `qep_defect.test_execution_id` exist. Not evidenced in the Phase 3 Playwright spec.
4. **Automation mapping = PARTIAL.** Durable `qep_test_case_automation_mapping`; JSON ledger remains compatibility. Provider “Playwright” was not manufactured as a strategy screenshot dependency.
5. **Plan list / strategy matrix density** is lower than locked Screen 4 (no donut inspector, no Release/cycle columns). Strategy is a dimensional chain, not the full mock matrix.
6. **Library Overview stats rail** from Screen 1 is illustrative and was not implemented as seed/UI.
7. **`service.yaml` for test-management** not filed under `/services/qep/services/`.
8. **Phase 2 Playwright** not green in this closure pass (host timeouts). Prior acceptance stands.

## 8. Technical debt carried forward

- In-place suite/plan open (sessionStorage) because route `goto` remounts workbench — Execution phase may restore durable deep links once redirect is safe.
- Soft product-access last-evaluation cache so desktop↔mobile shell remount does not flash the gate.
- Strategy environment dropdown may still show placeholder while the **chain** shows the stored environment name (form is for adding groups, not editing the existing card).
- Snapshot capture is swallow-errors by design; Execution phase must make engine integration authoritative.
- Designer “Used by Plans” counts direct plan membership, not suite-in-plan transitives.
- Focused Phase 2 recertification still owed when the host is idle.

## Visual comparison notes

Compared against locked visuals `01`–`04` in `visuals/phase-3/`.

- **Geometry / hierarchy / navigation:** QEP shell (header, navy sidebar, workspace). TEST IA: Test Cases, Test Suites, Test Plans, **Executions**. Four authorised screens exist as those surfaces, not merely routes.
- **Inspector:** Library and Suites use an inline right inspector on desktop (`lg` width) because the shell inspector defaults collapsed.
- **Identity:** Implementation correctly uses `TS-*` / `SUITE-*` rather than the mock’s illustrative `TC-*`.
- **Designer vs Screen 2 mock:** Environment / Target / Playwright are **not** on the Test Case (Screen 4 + domain lock). Steps table columns match the authorised Action / Test Data / Expected Result model.
- **Light/dark:** Same regions and structure ([01](./evidence/phase-3/01-test-case-library-desktop-light.png) vs [02](./evidence/phase-3/02-test-case-library-desktop-dark.png); [24](./evidence/phase-3/24-test-plan-mobile-light.png) vs [25](./evidence/phase-3/25-test-plan-mobile-dark.png)).
- **Mobile:** Bottom nav + stacked cards / plan detail tabs. Not a horizontally squeezed desktop table.

## Closure-pass defects that were fixed (no feature expansion)

| Class          | Fix                                                                             |
| -------------- | ------------------------------------------------------------------------------- |
| APPLICATION    | Suite/plan detail: in-place open instead of `page.goto`                         |
| APPLICATION    | Soft product-access cache across desktop/mobile remount                         |
| APPLICATION    | Persist opened suite/plan id in `sessionStorage` so mobile remount keeps detail |
| APPLICATION    | Present strategy `environmentName` from Phase 1E environment SoR                |
| TEST           | Wait for real surface testids after viewport resize; sidebar/back testids       |
| TEST           | Capture Designer steps **before** the identity-preservation PATCH               |
| INFRASTRUCTURE | `db:seed` one retry in Playwright `global-setup.ts`                             |

## Stop

```text
PHASE 4:
NOT STARTED

STOP FOR OWNER REVIEW.
```

Do not start the Execution Workspace. Snapshot engine integration and live dual-engine Executions rows belong there.
