# Test Results — APZQEP-CERT-050D

| Field       | Value                                                            |
| ----------- | ---------------------------------------------------------------- |
| Result      | **PASS**                                                         |
| Executed at | 2026-07-27T06:24:35Z (Vitest)                                    |
| Typecheck   | **PASS** (`pnpm typecheck` in `@apzhub/qep-test-specifications`) |

## Suite summary

| Suite                           | Location                                           | Tests | Result |
| ------------------------------- | -------------------------------------------------- | ----- | ------ |
| Domain                          | `test-specification.domain.test.ts`                | 45    | PASS   |
| Available actions (application) | `available-actions.test.ts`                        | 5     | PASS   |
| Application service             | `specification-application-service.test.ts`        | 19    | PASS   |
| DTO adapter                     | `specification-dto-adapter.test.ts`                | 2     | PASS   |
| Repository contract (in-memory) | `specification-repository.contract.test.ts`        | 7     | PASS   |
| Postgres repository             | `specification-repository.test.ts`                 | 17    | PASS   |
| Mapper                          | `specification-mapper.test.ts`                     | 3     | PASS   |
| Factories                       | `factories.test.ts`                                | 10    | PASS   |
| Architecture boundaries         | `architecture-boundaries.test.ts`                  | 8     | PASS   |
| Presentation contracts          | `presentation.test.ts`                             | 3     | PASS   |
| Workbench UI (views)            | `qep-test-specification-views.test.tsx`            | 14    | PASS   |
| Workbench availableActions      | `qep-test-specification-available-actions.test.ts` | 6     | PASS   |

**Totals (Test Specifications certification set):** **12 files · 139 tests · 139 PASS · 0 FAIL · 0 SKIP**

## Additional coverage classes

| Class           | Evidence                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Playwright      | `testing/playwright/e2e/apzqep-eng-050c-test-specifications-workbench.spec.ts` — smoke + authenticated mocked journeys + axe + keyboard + dialog focus |
| Accessibility   | [../workbench/ACCESSIBILITY.md](../workbench/ACCESSIBILITY.md) · ECR a11y gates                                                                        |
| Regression      | Domain lifecycle + availableActions matrix incl. ADR-0074 rejected surface                                                                             |
| Static analysis | Package typecheck **PASS**; ESLint package script present                                                                                              |

## Coverage note

Line-coverage percentage tooling was not re-run as a separate CERT-050D campaign. Behavioural coverage across domain / application / infrastructure / Workbench / `availableActions` is comprehensive for the authorised scope. Acceptable under **PRODUCTION_READY_WITH_LIMITATIONS** (same pattern as CERT-040D / TRACE-001 / REQ-001).

## Failures / exclusions

None in the executed certification set. Known limitations are not test failures.
