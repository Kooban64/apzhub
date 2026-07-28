# Functional Certification Report — APZQEP-CERT-001

## Scope

User workflows, business scenarios, success/failure paths, edge cases, regression behaviour for Test Execution Workbench and Application/Domain lifecycle.

## Workbench surfaces

| Surface  | Route                           | Result |
| -------- | ------------------------------- | ------ |
| Home     | `/workspace/qep/test-execution` | ✅     |
| Explorer | `…/explorer`                    | ✅     |
| Assigned | `…/assigned`                    | ✅     |
| Review   | `…/review`                      | ✅     |
| Create   | `…/new`                         | ✅     |
| Detail   | `…/executions/:id`              | ✅     |
| History  | `…/executions/:id/history`      | ✅     |

Evidence: `packages/qep-test-execution/src/presentation/routes.ts`, `apps/web/components/qep/qep-test-execution-views.tsx`, Playwright ENG-100E.

## Lifecycle / business scenarios

| Scenario                                   | Verification                                    | Result                          |
| ------------------------------------------ | ----------------------------------------------- | ------------------------------- |
| Happy path draft→accepted                  | Domain lifecycle tests                          | ✅ PASS                         |
| Illegal transitions                        | Domain negative tests                           | ✅ PASS                         |
| Concurrency / revision                     | Domain + Application                            | ✅ PASS                         |
| availableActions sole UI authority         | App + contract + UI + Playwright                | ✅ PASS (ADR-0083)              |
| Create / start / block (UI)                | Views + Playwright                              | ✅ PASS                         |
| Review queue / assigned lists              | Application + views                             | ✅ PASS                         |
| Ingestion (API trust boundary)             | Application + Domain tests; no Workbench client | ✅ PASS (API-only by design)    |
| Permission denial UI                       | Views + Playwright forbidden                    | ✅ PASS                         |
| Full UI click-through of every action slug | Not exhaustively Playwright-asserted            | ⚠ Limitation (mechanism proven) |

## Failure paths

| Path                                         | Result |
| -------------------------------------------- | ------ |
| Handler error map 400/403/404/409/503        | ✅     |
| Empty availableActions → no invented buttons | ✅     |
| reasonRequired dialog gating                 | ✅     |

## Regression

| Suite                    | Result                  |
| ------------------------ | ----------------------- |
| Package 56/56            | ✅ Revalidated CERT-001 |
| Workbench+handlers 24/24 | ✅ Revalidated CERT-001 |

## Verdict

**PASS WITH LIMITATIONS** — functional correctness of Domain/Application/Workbench contract is certified; live end-to-end against Postgres and exhaustive UI lifecycle click-through remain residual test-breadth items (see L-04, TD-08).
