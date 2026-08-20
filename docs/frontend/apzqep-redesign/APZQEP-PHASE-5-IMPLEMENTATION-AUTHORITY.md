# APZQEP Phase 5 — Implementation authority

**Status:** AUTHORISED (this implementation)  
**Date:** 2026-08-20  
**Phase 4:** CLOSED · ACCEPTED  
**Phase 6:** domain **ACCEPTED** · inventory **DRAFTED** · implementation **NOT AUTHORISED**

Visual authorities (do not redesign):

| Screen                           | Visual                                                                                                                             | Lock                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1 Exploratory Sessions           | [visuals/phase-5/01-exploratory-sessions-authority.png](./visuals/phase-5/01-exploratory-sessions-authority.png)                   | [SCREEN-1](./APZQEP-PHASE-5-SCREEN-1-EXPLORATORY-SESSIONS.md)          |
| 2 Exploratory Session Workspace  | [visuals/phase-5/02-exploratory-session-workspace-authority.png](./visuals/phase-5/02-exploratory-session-workspace-authority.png) | [SCREEN-2](./APZQEP-PHASE-5-SCREEN-2-EXPLORATORY-SESSION-WORKSPACE.md) |
| 3 UI / UX Verification Plans     | [visuals/phase-5/03-ui-ux-verification-plans-authority.png](./visuals/phase-5/03-ui-ux-verification-plans-authority.png)           | [SCREEN-3](./APZQEP-PHASE-5-SCREEN-3-UI-UX-VERIFICATION-PLANS.md)      |
| 4 UI / UX Verification Workspace | [visuals/phase-5/04-ui-ux-verification-workspace-authority.png](./visuals/phase-5/04-ui-ux-verification-workspace-authority.png)   | [SCREEN-4](./APZQEP-PHASE-5-SCREEN-4-UI-UX-VERIFICATION-WORKSPACE.md)  |

Domain authority: [APZQEP-PHASE-5-DOMAIN-LOCK.md](./APZQEP-PHASE-5-DOMAIN-LOCK.md).  
Reconciliation: [APZQEP-PHASE-5-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-5-DOMAIN-RECONCILIATION-REPORT.md).  
Inventory: [APZQEP-PHASE-5-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-5-IMPLEMENTATION-INVENTORY.md) — **APPROVED WITHOUT CHANGE**.

This phase creates two workflow roots (Exploratory Session, UI/UX Verification Activity), a lightweight Experience Plan, and shared Observation / Issue / Note. It **extends** existing Evidence, Defect, Application, Environment, AuthZ, history, and traceability. It does **not** create `qep_ui_ux_execution`, a second Test Plan, a third execution store, a Viewport Matrix table, extra Evidence/Defect/Application/Environment stores, a generic `quality_session`, TE-observation migration, AI, SSH/Terminal, Source write, Release, or the nine-role catalogue.

## Owner decisions (closed)

1. Experience Plan = NEW lightweight aggregate. Option B (extend Test Plan) rejected.
2. Two distinct workflow roots. Generic `quality_session` rejected.
3. TE observations remain TE-only. Phase 5 Observation is new.
4. Viewport Matrix and progress are derived only.
5. Inventory P5-01 through P5-16 approved without change.

Light and dark use identical geometry. Mobile is a responsive transformation. Counts, progress, and history must be honest.
