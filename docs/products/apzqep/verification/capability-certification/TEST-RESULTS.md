# Test Results — APZQEP-CERT-040D

| Field | Value |
| ----- | ----- |
| Result | **PASS** |
| Executed at | 2026-07-26T18:09:57Z (Vitest) |
| Typecheck | **PASS** (`pnpm typecheck` in `@apzhub/qep-verification`) |

## Suite summary

| Suite | Location | Tests | Result |
| ----- | -------- | ----- | ------ |
| Domain | `verification.domain.test.ts` | 107 | PASS |
| Available actions (application) | `available-actions.test.ts` | 8 | PASS |
| Application service | `verification-application-service.test.ts` | 9 | PASS |
| Repository contract | `verification-repository.contract.test.ts` | 3 | PASS |
| Architecture boundaries | `architecture-boundaries.test.ts` | 6 | PASS |
| Presentation contracts | `presentation.test.ts` | 3 | PASS |
| Workbench UI | `qep-verification-views.test.tsx` | 10 | PASS |
| Workbench availableActions contract | `qep-verification-available-actions.test.ts` | 5 | PASS |
| Search projection | `search-qep.test.ts` (verification cases included) | 10 file | PASS |

**Totals (Verification certification set):** **9 files · 161 tests · 161 PASS · 0 FAIL · 0 SKIP**

## Additional coverage classes

| Class | Evidence |
| ----- | -------- |
| Playwright smoke | `testing/playwright/e2e/apzqep-eng-040c-verification-workbench.spec.ts` — route reservation (unauthenticated OK) |
| Integration (application + in-memory repo) | application service tests |
| Regression | domain lifecycle matrix + availableActions permission matrix |
| Architecture boundary | no React/Next in package; presentation layer present; domain free of persistence |

## Coverage note

Line-coverage percentage tooling was not re-run as a separate CERT-040D campaign. Behavioural coverage across domain/application/Workbench/`availableActions` is comprehensive for the authorised scope. Acceptable under **PRODUCTION_READY_WITH_LIMITATIONS** (same pattern as TRACE-001 / REQ-001).

## Failures / exclusions

None in the executed certification set. Known product-scope exclusions (Evidence/Coverage/Impact/AI/MCP) are not test failures.
