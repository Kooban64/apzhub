# APZQEP-151 Test Results

Timestamp: 20260802T200407Z  
Raw vitest log is gitignored (`*.log`); summary recorded here.

## Cap unit + APZQEP-151 integration

```text
Test Files  10 passed (10)
Tests       51 passed (51)
```

Files:

- packages/qep-suites/src/suite.test.ts
- packages/qep-execution-plans/src/execution-plan.test.ts
- packages/qep-execution-workspace/src/execution-workspace.test.ts
- packages/qep-defects/src/defect.test.ts
- packages/qep-requirements-traceability/src/requirements-traceability.test.ts
- packages/qep-reporting/src/reporting.test.ts
- testing/apzqep-151/postgres-persistence.integration.test.ts
- testing/apzqep-151/restart-durability.integration.test.ts
- testing/apzqep-151/multi-instance.integration.test.ts
- testing/apzqep-151/provider-selection.test.ts

## Regression

```text
testing/apzqep-150/enterprise-product-chain.test.ts — PASS (1)
```
