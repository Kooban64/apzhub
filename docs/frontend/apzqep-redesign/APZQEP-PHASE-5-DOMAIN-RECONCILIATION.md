# APZQEP Phase 5 — domain reconciliation agenda

**Status:** ACCEPTED — see [APZQEP-PHASE-5-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-5-DOMAIN-RECONCILIATION-REPORT.md) · lock [APZQEP-PHASE-5-DOMAIN-LOCK.md](./APZQEP-PHASE-5-DOMAIN-LOCK.md)  
**Date:** 2026-08-20  
**Visual design:** COMPLETE (Screens 1–4 LOCKED)  
**Implementation:** NOT AUTHORISED

Phase 4 is CLOSED and ACCEPTED. Phase 5 visual design is COMPLETE. Do not implement from this file. Do not create `qep_ui_ux_plan`, `qep_ui_ux_execution`, `qep_exploratory_session`, or any other new store until the reconciliation report proves what can safely extend what already exists.

## Product distinctions (locked)

| Concept              | Flow                                                                                | Not                                                                   |
| -------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Test Case            | predefined steps → expected → actual → result                                       | Exploratory Session, UI/UX Verification                               |
| Exploratory Session  | Charter → Explore → Observe → Capture → Learn → Evidence / Issue                    | Test Case execution, UI/UX Plan                                       |
| UI / UX Verification | Plan → Experience Context → Verify Criteria → Observe → Evidence / Issue → Complete | Exploratory Session, ordinary Test Plan clone, Phase 4 step execution |

Observation ≠ Defect ≠ Failure. Issue ≠ Defect. Note ≠ Observation. Plan ≠ execution. Complete ≠ quality passed. Viewport/device = experience context, not `ci_pipeline` / `managed_runner` / `remote_host`.

Reuse: `qep_application`, `qep_application_environment`, existing Evidence SoR, existing Defect SoR. Source independence unchanged.

## Questions (do not invent answers from visuals)

1. Does Exploratory Session require a new durable aggregate?
2. Can Observation / Issue / Note be shared across Exploratory and UI/UX Verification?
3. What existing capability, if any, can represent UI/UX Verification Plans without creating a second Test Plan system?
4. What represents a UI/UX verification activity/execution?
5. Are UI/UX Criteria first-class objects or mappings onto existing Test Cases / AC?
6. How should viewport/device/browser context be represented?
7. How should verification-context progress be calculated?
8. How does Evidence attach to Observation / Issue / Criterion / viewport context?
9. How does Issue deliberately promote/link to existing Defect?
10. What lifecycle is required for Exploratory Session and UI/UX Verification?
11. Can activity/history use an existing APZQEP audit/event capability?
12. How do these capabilities remain Application-bound and tenant-safe?

## Visual authorities

- Screen 1: [APZQEP-PHASE-5-SCREEN-1-EXPLORATORY-SESSIONS.md](./APZQEP-PHASE-5-SCREEN-1-EXPLORATORY-SESSIONS.md)
- Screen 2: [APZQEP-PHASE-5-SCREEN-2-EXPLORATORY-SESSION-WORKSPACE.md](./APZQEP-PHASE-5-SCREEN-2-EXPLORATORY-SESSION-WORKSPACE.md)
- Screen 3: [APZQEP-PHASE-5-SCREEN-3-UI-UX-VERIFICATION-PLANS.md](./APZQEP-PHASE-5-SCREEN-3-UI-UX-VERIFICATION-PLANS.md)
- Screen 4: [APZQEP-PHASE-5-SCREEN-4-UI-UX-VERIFICATION-WORKSPACE.md](./APZQEP-PHASE-5-SCREEN-4-UI-UX-VERIFICATION-WORKSPACE.md)

Report: [APZQEP-PHASE-5-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-5-DOMAIN-RECONCILIATION-REPORT.md) — **ACCEPTED**.  
Lock: [APZQEP-PHASE-5-DOMAIN-LOCK.md](./APZQEP-PHASE-5-DOMAIN-LOCK.md).  
Inventory: [APZQEP-PHASE-5-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-5-IMPLEMENTATION-INVENTORY.md) — **DRAFTED FOR OWNER REVIEW**. Implementation is **not authorised**.
