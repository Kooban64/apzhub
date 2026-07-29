# REGRESSION-REPORT — APZQEP-REM-001

## Scope

All previously green Test Execution package tests plus related web handler / Workbench / platform QEP suites exercised after L-02 remediation.

## Results

| Suite                         | Before (1.0.0 baseline)    | After (1.0.1-rc.1)                                 |
| ----------------------------- | -------------------------- | -------------------------------------------------- |
| `@apzhub/qep-test-execution`  | 56+ tests green at release | **77/77 PASS** (includes +21 security/enforcement) |
| Application orchestration     | PASS                       | PASS                                               |
| Domain lifecycle / invariants | PASS                       | PASS                                               |
| Architecture boundaries       | PASS                       | PASS (version marker updated to candidate)         |
| Platform QEP services         | PASS                       | **21/21 PASS**                                     |
| Web handlers                  | PASS                       | **8/8 PASS**                                       |
| Workbench available-actions   | PASS                       | **4/4 PASS**                                       |

## Authorised workflows preserved

Associate evidence with explicit allow / baseline affirmative policy remains operational. Denial paths only engage on missing/indeterminate/failed authorisation.

## Residual risk for regression

Playwright E2E not re-executed in this environment — scheduled for CERT-002.
