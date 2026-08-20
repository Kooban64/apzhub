# APZQEP Phase 4 — visual sequence

**Status:** Screens 1–4 **LOCKED**. Visual design **COMPLETE**. Domain reconciliation **ACCEPTED**. Implementation **CLOSED · ACCEPTED**.  
**Date:** 2026-08-20  
**Phase 5:** NOT STARTED

Phase 3 is **CLOSED and ACCEPTED**. Phase 4 is **CLOSED and ACCEPTED** — [APZQEP-PHASE-4-ACCEPTANCE.md](./APZQEP-PHASE-4-ACCEPTANCE.md).

```text
SCREEN 1 — Executions / Runs                    LOCKED
SCREEN 2 — Manual Test Execution Workspace      LOCKED
SCREEN 3 — Automated Execution Detail           LOCKED
SCREEN 4 — Execution Result / Evidence / Defect / Retest  LOCKED

PHASE 4 VISUAL DESIGN                           COMPLETE
DOMAIN RECONCILIATION                           ACCEPTED
PHASE 4 IMPLEMENTATION                          CLOSED · ACCEPTED
PHASE 5                                         NOT STARTED
```

Report: [APZQEP-PHASE-4-REPORT.md](./APZQEP-PHASE-4-REPORT.md)

Chain: Executions → Manual Workspace / Automated Detail → Executed Result → Evidence → Defect → Retest. Two execution engines remain separate internally. Customer Executions are a **composition read model**, not a third store. Retest and Rerun are distinct product concepts; both create **new** executions. Historical failure is not mutated when a Defect is fixed.

Screen 1: [APZQEP-PHASE-4-SCREEN-1-EXECUTIONS-RUNS.md](./APZQEP-PHASE-4-SCREEN-1-EXECUTIONS-RUNS.md)  
Screen 2: [APZQEP-PHASE-4-SCREEN-2-MANUAL-EXECUTION.md](./APZQEP-PHASE-4-SCREEN-2-MANUAL-EXECUTION.md)  
Screen 3: [APZQEP-PHASE-4-SCREEN-3-AUTOMATED-EXECUTION-DETAIL.md](./APZQEP-PHASE-4-SCREEN-3-AUTOMATED-EXECUTION-DETAIL.md)  
Screen 4: [APZQEP-PHASE-4-SCREEN-4-EXECUTION-RESULT-RETEST.md](./APZQEP-PHASE-4-SCREEN-4-EXECUTION-RESULT-RETEST.md)

Do not start Phase 5 implementation. Phase 5 visual design is **COMPLETE**. Domain reconciliation is **COMPLETE** — Owner review. Do not merge execution engines. Do not create `qep_execution`. Do not create Release, SSH, Terminal, Source write, or AI.
