# APZQEP Phase 5 — Owner acceptance

**Date:** 2026-08-20  
**Status:** **ACCEPTED · CLOSED**  
**Authority:** Owner gate on [APZQEP-PHASE-5-REPORT.md](./APZQEP-PHASE-5-REPORT.md)

Phase 5 Exploratory & Experience Verification is accepted. The later green Playwright certification supersedes the earlier mobile failure. The mobile fix did not weaken the test (Application selection remains required; the selector is not required to be _visible_ on 390px).

The three leftovers recorded in the report are **not Phase 5 blockers**:

1. Tester/owner UUID display is presentation debt.
2. Header `+ Create` is shared platform chrome.
3. Source appearing for a persona that independently has `source.read` is correct behaviour.

```text
# OWNER ACCEPTANCE — APZQEP REDESIGN PHASE 5

PHASE 5                         ACCEPTED
EXPLORATORY SESSIONS            CLOSED
EXPLORATORY SESSION WORKSPACE   CLOSED
UI / UX VERIFICATION PLANS      CLOSED
UI / UX VERIFICATION WORKSPACE  CLOSED

TWO WORKFLOW ROOTS              PRESERVED
EXPERIENCE PLAN                 LIGHTWEIGHT · NOT TEST PLAN
EVIDENCE SOR                    PRESERVED
DEFECT SOR                      PRESERVED
SECOND TEST PLAN CREATED        NO
THIRD EXECUTION STORE CREATED   NO
QEP_UI_UX_EXECUTION             NO
VIEWPORT MATRIX                 DERIVED
PROGRESS                        DERIVED

APPLICATION ISOLATION           PASS
TENANT ISOLATION                PASS
SOURCE INDEPENDENCE             PASS
PLAYWRIGHT                      PASS

UUID DISPLAY                    NOT A PHASE 5 BLOCKER
PLATFORM + CREATE               NOT A PHASE 5 BLOCKER
SOURCE LEAF IF source.read      CORRECT BEHAVIOUR

PHASE 5 STATUS                  CLOSED

PHASE 6                         VISUAL DESIGN COMPLETE · SCREENS 1–4 LOCKED
```

## Frozen going forward

These rules remain frozen after Phase 5. Do not reopen them in later phases.

1. **Exploratory Session ≠ UI/UX Verification Activity.** Two workflow roots. No generic `quality_session` discriminator.
2. **Experience Plan is a lightweight aggregate**, not a second Test Plan. Option B (extend Test Plan) remains rejected.
3. **Observation / Issue / Note are shared capture**, not Defects. Issue → Defect is human-controlled. TE observations stay TE-only.
4. **Viewport Matrix and progress are derived.** No Viewport Matrix table. No `qep_ui_ux_execution`. No third execution store.
5. **Evidence SoR and Defect SoR are preserved.** Phase 5 extended relationships only.

Also preserved: Application + tenant isolation; no nine-role catalogue; no TE-observation migration; device class is `desktop | tablet | mobile`.

## Accepted limitations (not Phase 5 debt to reopen)

- Display names for tester/owner may show a UUID.
- Workbench `+ Create` is platform chrome.
- Source nav is independently entitled.

## Next — Phase 6 domain reconciliation complete; stop for Owner review

Do **not** implement Phase 6. Do **not** create a Release aggregate. All four Phase 6 screens are locked. Next is **domain reconciliation**. Release/candidate context remains a **domain-reconciliation question**.

Owner-recommended next phase:

**Phase 6 — Quality Risk + Release Readiness / Gates / Certification**

Visuals first, in this order — [APZQEP-PHASE-6-SEQUENCE.md](./APZQEP-PHASE-6-SEQUENCE.md):

| Screen                     | Intent                                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1 Quality Risk             | Application-level risk register / quality risks, linked to actual quality signals                          |
| 2 Release Readiness        | Evidence-based readiness workspace: requirements, tests, executions, defects, evidence, unresolved risks   |
| 3 Quality Gates            | Explicit, inspectable conditions that determine whether a candidate satisfies defined quality requirements |
| 4 Certification / Go-No-Go | Final human decision workspace: evidence, gate results, exceptions/waivers, immutable decision history     |

```text
PHASE 6                         VISUAL DESIGN COMPLETE
SCREEN 1 — Quality Risk         LOCKED
SCREEN 2 — Release Readiness    LOCKED
SCREEN 3 — Quality Gates        LOCKED
SCREEN 4 — Certification / Go-No-Go LOCKED
DOMAIN RECONCILIATION           ACCEPTED
IMPLEMENTATION INVENTORY        DRAFTED FOR OWNER REVIEW
IMPLEMENTATION                  NOT AUTHORISED
RELEASE AGGREGATE               NOT REQUIRED
READINESS SCORE                 REJECTED
PHASE 7                         NOT STARTED
```
