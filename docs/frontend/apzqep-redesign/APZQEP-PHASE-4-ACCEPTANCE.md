# APZQEP Phase 4 — Owner acceptance

**Date:** 2026-08-20  
**Status:** **ACCEPTED · CLOSED**  
**Authority:** Owner gate on [APZQEP-PHASE-4-REPORT.md](./APZQEP-PHASE-4-REPORT.md)

Phase 4 Executions is accepted. Remaining limitations are legitimate provider/fixture limits, not unfinished Phase 4 product capability.

The certified chain is real:

**Plan → Execution → manual/automated result → immutable snapshot → Evidence → Defect → Rerun/Retest**

The original failed Execution is preserved. Retest creates a **new** Execution. No third execution store was introduced.

```text
# OWNER ACCEPTANCE — APZQEP REDESIGN PHASE 4

PHASE 4                         ACCEPTED
EXECUTIONS                      CLOSED
MANUAL EXECUTION                CLOSED
AUTOMATED EXECUTION             CLOSED
EXECUTION RESULT                CLOSED
EVIDENCE INTEGRATION            CLOSED
DEFECT INTEGRATION              CLOSED
RERUN                           CLOSED
RETEST                          CLOSED
SNAPSHOT INTEGRITY              CLOSED
APPLICATION ISOLATION           PASS
TENANT ISOLATION                PASS
SOURCE INDEPENDENCE             PASS

TWO EXECUTION ENGINES           PRESERVED
THIRD EXECUTION STORE           NO

PROVIDER LOG AVAILABILITY       PROVIDER-DEPENDENT
RETEST-TO-PASS FIXTURE          NOT REQUIRED FOR PHASE 4 CLOSURE
INCOMPLETE INGEST RESULT        HONESTLY PRESENTED

PHASE 4 STATUS                  CLOSED

PHASE 5                         NOT STARTED
```

## Frozen going forward

These three rules remain frozen after Phase 4. Do not reopen them in later phases.

1. **Provider capabilities remain secondary** to APZQEP product language. Provider runs are not customer Executions. Customer copy stays Plan, Execution, Result, Evidence, Defect — not engine/provider nouns.
2. **Historical execution truth is immutable.** Snapshots taken at start do not follow later Plan / Test Case / strategy edits. A Defect fix does not mutate a historical Failed result.
3. **Rerun and Retest remain distinct** even though both create a new Execution. Distinct `relation_kind`. Do not collapse them. Do not reuse `supersede`.

Also preserved from the Phase 4 domain lock: two execution engines; no `qep_execution`; Status ≠ Result; `savePresentedExecution` remains a postgres no-op.

## Accepted limitations (not Phase 4 debt)

- Provider log/artifact availability is provider-dependent. APZQEP is not a log store.
- Executing a Retest through to Passed was not required for Phase 4 closure.
- Incomplete ingest may honestly present overall Result as Not Run while step-level Failed is shown on Screen 3.

## Next — Phase 5 recommended, not started

Do **not** jump into generic test-management screens or Engineering (Builds & CI / Source). Do **not** contaminate the scripted Test Case / Execution model now closed.

Owner-recommended next phase:

**Phase 5 — Exploratory & Experience Verification**

Visuals first, in this order:

| Screen                          | Intent                                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1 Exploratory Sessions          | Charter, scope, tester, environment, duration, notes, observations, Evidence, defects                                |
| 2 Exploratory Session Workspace | Live session timer/context, charter, observations, Evidence capture, issue/defect creation, areas covered            |
| 3 UI/UX Verification Plan       | Viewports/devices, usability, accessibility, responsive behaviours, visual checks, expected design/reference context |
| 4 UI/UX Verification Workspace  | Device/viewport context, criteria/checklist, observed behaviour, screenshots/evidence, pass/fail/issue               |

Exploratory and UI/UX Verification are genuinely different from scripted Test Cases. They close Phase 0 capability-map gaps **C** (no fake session entity in Phase 4; spec-type enums are not a verification product).

```text
PHASE 5                         VISUAL COMPLETE · DOMAIN RECONCILIATION COMPLETE
PHASE 5 IMPLEMENTATION          NOT AUTHORISED
NEXT OWNER ACTION               REVIEW RECONCILIATION MATRIX / DOMAIN LOCK
```

**Do not implement Phase 5.** Do not start Phase 6. See [APZQEP-PHASE-5-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-5-DOMAIN-RECONCILIATION-REPORT.md).

Engineering (Builds & CI, Source) remains deferred. It is not Phase 5 under this Owner gate.
