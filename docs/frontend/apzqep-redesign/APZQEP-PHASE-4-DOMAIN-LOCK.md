# APZQEP Phase 4 — domain lock

**Status:** LOCKED (Owner accepted reconciliation 2026-08-19)  
**Implementation:** AUTHORISED under [APZQEP-PHASE-4-IMPLEMENTATION-AUTHORITY.md](./APZQEP-PHASE-4-IMPLEMENTATION-AUTHORITY.md)

1. No third execution store. No `qep_execution`.
2. `qep-test-execution` owns Test Case / step execution (Screens 2–4 grain).
3. `qep-execution-workspace` remains Suite/session orchestration.
4. `qep_automation_execution` remains provider records; correlate, do not list as customer Executions.
5. PresentedExecution is a read model / presentation type. `savePresentedExecution` stays non-persistent in postgres.
6. Status and Result are independent. Workspace `completed` is not `not_run`.
7. Execution Plan remains internal. Customer start is Test Plan + strategy.
8. Snapshots are fail-closed at start. Historical definition/scope/strategy must not follow later edits.
9. Retest and Rerun are new Executions with relation metadata. Do not reuse supersede.
10. Defect fix does not mutate historical Failed. Defect close is human-controlled.
11. Phase 1E targets only: `ci_pipeline | managed_runner | remote_host`. Remote Host is configuration only — no SSH/Terminal.
12. No Vault, no Release aggregate, no AI, no `service.yaml` on `@apzhub/qep-test-management`.

## Frozen going forward (Owner 2026-08-20)

These remain locked after Phase 4 acceptance. Later phases must not reopen them.

1. Provider capabilities remain **secondary** to APZQEP product language. Provider runs are not customer Executions.
2. Historical execution truth is **immutable**. Snapshots and historical Failed results do not follow later edits or Defect fixes.
3. **Rerun** and **Retest** remain distinct product concepts even though both create a new Execution. Distinct `relation_kind`. Do not collapse. Do not reuse `supersede`.
