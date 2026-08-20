# APZQEP Phase 4 — Implementation authority

**Status:** DELIVERED · Owner **ACCEPTED · CLOSED** (2026-08-20)  
**Date:** 2026-08-19  
**Phase 3:** CLOSED · ACCEPTED  
**Phase 5 implementation:** NOT AUTHORISED (domain lock recorded; inventory awaiting Owner authorisation)

Visual authorities (do not redesign):

| Screen                                          | Visual                                                                                                                                                 | Lock                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 1 Executions / Runs                             | [visuals/phase-4/01-executions-runs-authority.png](./visuals/phase-4/01-executions-runs-authority.png)                                                 | [SCREEN-1](./APZQEP-PHASE-4-SCREEN-1-EXECUTIONS-RUNS.md)            |
| 2 Manual Test Execution Workspace               | [visuals/phase-4/02-manual-test-execution-workspace-authority.png](./visuals/phase-4/02-manual-test-execution-workspace-authority.png)                 | [SCREEN-2](./APZQEP-PHASE-4-SCREEN-2-MANUAL-EXECUTION.md)           |
| 3 Automated Execution Detail                    | [visuals/phase-4/03-automated-execution-detail-authority.png](./visuals/phase-4/03-automated-execution-detail-authority.png)                           | [SCREEN-3](./APZQEP-PHASE-4-SCREEN-3-AUTOMATED-EXECUTION-DETAIL.md) |
| 4 Execution Result / Evidence / Defect / Retest | [visuals/phase-4/04-execution-result-evidence-defect-retest-authority.png](./visuals/phase-4/04-execution-result-evidence-defect-retest-authority.png) | [SCREEN-4](./APZQEP-PHASE-4-SCREEN-4-EXECUTION-RESULT-RETEST.md)    |

Domain authority: [APZQEP-PHASE-4-DOMAIN-LOCK.md](./APZQEP-PHASE-4-DOMAIN-LOCK.md).  
Reconciliation: [APZQEP-PHASE-4-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-4-DOMAIN-RECONCILIATION-REPORT.md).

This phase **extends and composes** existing execution engines. It does **not** create `qep_execution`, Release, SSH/Terminal, Source write, AI, or a Retest SoR.

## Architecture lock

- Test Case / step execution: `@apzhub/qep-test-execution`
- Suite / session orchestration: `@apzhub/qep-execution-workspace`
- Provider runs: `qep_automation_execution` (not customer Executions)
- Customer Executions: **PresentedExecution composition / read model** (not a table)

## Inventory (finite)

P4-01 … P4-16 as authorised by the Owner implementation instruction. Do not expand.
