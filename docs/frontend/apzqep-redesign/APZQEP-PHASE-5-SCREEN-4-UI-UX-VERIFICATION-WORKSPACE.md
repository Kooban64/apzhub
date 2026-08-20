# APZQEP Phase 5 — Screen 4 visual authority (UI / UX Verification Workspace)

**Record:** APZQEP REDESIGN / PHASE 5 / SCREEN 4 / UI / UX VERIFICATION WORKSPACE / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-20  
**Authority image:** [visuals/phase-5/04-ui-ux-verification-workspace-authority.png](./visuals/phase-5/04-ui-ux-verification-workspace-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for the APZQEP UI / UX Verification Workspace. This is the **live working environment** where a tester performs UI/UX verification — analogous to Phase 4 Screen 2 for manual Test Case execution, not another planning screen.

A prior generated board that behaved like a Plan list/designer is **not** authority. Only this workspace visual is.

Hierarchy:

**UI/UX Verification Plan → UI/UX Verification Workspace → Observation / Evidence / Issue → deliberate Defect promotion**

The workspace must continuously answer: **what am I verifying, in which viewport/device, what have I checked, what did I observe, and what evidence/issues have I captured?**

Phase 5 visual design is **COMPLETE**. Domain reconciliation is **NEXT**. Phase 5 implementation is **NOT AUTHORISED**.

```text
SCREEN 1 — EXPLORATORY SESSIONS:
LOCKED

SCREEN 2 — EXPLORATORY SESSION WORKSPACE:
LOCKED

SCREEN 3 — UI / UX VERIFICATION PLANS:
LOCKED

SCREEN 4 — UI / UX VERIFICATION WORKSPACE:
LOCKED

PHASE 5 VISUAL DESIGN:
COMPLETE

DOMAIN RECONCILIATION:
NEXT

PHASE 5 IMPLEMENTATION:
NOT AUTHORISED
```

Two workflows remain distinct:

- **Exploratory:** Charter → Explore → Observe → Capture → Learn → Evidence / Issue
- **UI/UX Verification:** Plan → Experience Context → Verify Criteria → Observe → Evidence / Issue → Complete

Both converge on existing Evidence and **deliberate** Defect creation. Noticing something is not a failed Test Case.

---

# APZQEP REDESIGN — PHASE 5

# SCREEN 4 — UI / UX VERIFICATION WORKSPACE

# VISUAL AUTHORITY ONLY — NO IMPLEMENTATION

Phase 5 visual status:

SCREEN 1 — EXPLORATORY SESSIONS
LOCKED

SCREEN 2 — EXPLORATORY SESSION WORKSPACE
LOCKED

SCREEN 3 — UI / UX VERIFICATION PLANS
LOCKED

SCREEN 4 — UI / UX VERIFICATION WORKSPACE
LOCKED (this document)

DOMAIN RECONCILIATION
NEXT

PHASE 5 IMPLEMENTATION
NOT AUTHORISED

============================================================

1. VISUAL AUTHORITY
   \============================================================

The supplied Screen 4 visual is the approved design direction for the
UI / UX Verification Workspace.

This is the LIVE VERIFICATION WORKSPACE.

It is NOT:

a Plan list
a Plan designer
a Test Case execution screen
an Exploratory Session
a dashboard

Do not implement yet.

============================================================ 2. PURPOSE
============================================================

This workspace is where a tester performs structured UI / UX verification
against the context defined by the UI / UX Verification Plan.

The operational flow is:

PLAN
→ SELECT EXPERIENCE CONTEXT
→ VERIFY
→ OBSERVE
→ CAPTURE
→ EVIDENCE / ISSUE
→ COMPLETE VERIFICATION

The tester must remain inside one focused workspace while performing
the verification.

============================================================ 3. DESKTOP COMPOSITION
============================================================

Preserve the visual geometry.

HEADER
Verification identity and execution context

LEFT
Plan Context

CENTRE
Live Verification Activity

RIGHT
Session Summary + Quick Capture

BOTTOM
Recent Observations + Active Issues

This is intentionally different from the Phase 4 manual Test Case
execution workspace.

============================================================ 4. HEADER
============================================================

Conceptually show:

UI/UX Verification identity
Plan name
Application
Environment
Verification discipline/type
Target devices
Tester
Status
Elapsed time

Primary active actions:

Pause
Complete

Do not create lifecycle enums from the mock-up.

Domain reconciliation determines persistence.

============================================================ 5. PLAN CONTEXT
============================================================

The tester must always be able to see WHY the verification exists.

Show appropriate Plan context such as:

Mission / Objective
Scope
Verification Disciplines
Target Devices / Viewports
Related Plan

The workspace consumes the Plan.

It does not redefine the Plan.

============================================================ 6. VERIFICATION DISCIPLINES
============================================================

The visual establishes the product concepts:

Functional UX
Responsive
Usability
Accessibility
Visual

These identify WHAT KIND of experience verification is being performed.

Do not create persisted enums solely from this image.

Domain reconciliation must determine their durable representation.

============================================================ 7. TARGET EXPERIENCE CONTEXT
============================================================

Device / viewport context is fundamental.

The tester must know which experience is currently being verified.

Conceptually support:

Desktop
Tablet
Mobile

and later, where authoritative:

viewport dimensions
orientation
browser
operating system
device profile

Do not confuse these with Phase 1E infrastructure execution targets.

A viewport/device is EXPERIENCE CONTEXT.

It is not:

ci_pipeline
managed_runner
remote_host

============================================================ 8. VIEWPORT MATRIX
============================================================

The visual introduces a Viewport Matrix.

Its purpose is to show which planned experience contexts have actually
been verified.

Conceptually:

Desktop Chrome Verified
Desktop Firefox Verified
Tablet In Progress
Mobile Pending

or equivalent real contexts.

This is NOT:

Test Coverage
Requirement Coverage
Quality Score
Pass Rate

It is verification-context progress.

============================================================ 9. LIVE VERIFICATION ACTIVITY
============================================================

The central timeline represents real activity during the verification.

Potential events include:

verification started
viewport activated
criterion reviewed
observation recorded
Evidence captured
Issue created
note added
viewport completed

Do not synthesize events from current state.

If implemented, these must derive from real recorded activity.

============================================================ 10. VERIFICATION CRITERIA
============================================================

Structured UI/UX criteria are required.

Examples may include:

Navigation is understandable
Form feedback is clear
Layout responds correctly
Touch targets remain usable
Keyboard focus is visible
Content remains readable
Errors are understandable

These are EXPERIENCE VERIFICATION CRITERIA.

Do not automatically convert them into ordinary Phase 3 Test Cases.

Domain reconciliation must decide whether:

existing Test Case
new UI/UX criterion
or another existing construct

is authoritative.

============================================================ 11. CRITERION RESULT
============================================================

The eventual workspace must allow a tester to record an honest result
against a criterion.

Do not assume the final vocabulary yet.

Potential concepts may include:

Verified
Issue Found
Not Applicable
Not Verified

This is NOT automatically equivalent to:

Test Execution Passed / Failed / Blocked.

Domain reconciliation determines the correct result model.

============================================================ 12. OBSERVATION
============================================================

Observation remains FIRST-CLASS.

Same rule as Screen 2:

Observation ≠ Defect
Observation ≠ Failure

An Observation records what the tester noticed.

Examples:

alignment feels inconsistent
mobile navigation requires excessive interaction
error message is difficult to understand
focus order feels unexpected
layout changes significantly at a viewport boundary

Observation may later lead to an Issue.

It does not automatically become one.

============================================================ 13. ISSUE
============================================================

Issue remains distinct from Defect.

A UI/UX Issue may represent:

usability concern
accessibility concern
responsive problem
visual discrepancy
functional UX problem

The tester may deliberately:

review
dismiss
link to existing Defect
promote to new Defect

Existing Defect remains authoritative.

No UI/UX Defect store.

============================================================ 14. EVIDENCE
============================================================

Evidence remains the existing APZQEP Evidence SoR.

Quick Capture must eventually allow legitimate supported Evidence such as:

screenshot
screen recording
accessibility output
responsive capture
report
document
other supported evidence

Evidence should retain relevant context such as:

verification
criterion
viewport/device
Observation
Issue

where the existing Evidence model can safely support it.

Do not create another Evidence store.

============================================================ 15. QUICK CAPTURE
============================================================

The visual establishes four high-value actions:

- Observation
- Upload Evidence
- Create Issue
- Add Note

These must remain fast and accessible while verification is underway.

Do not force the tester to leave the workspace for ordinary capture.

============================================================ 16. NOTES
============================================================

Notes are lightweight working information.

Note ≠ Observation
Note ≠ Issue
Note ≠ Defect
Note ≠ Evidence

Classification must be deliberate.

============================================================ 17. SESSION SUMMARY
============================================================

The right-hand summary gives immediate operational context.

Conceptually show real values such as:

Viewports Tested
Observations
Issues
Evidence Items
Progress
Elapsed Time
Areas Covered

Do NOT introduce:

UX Score
UI Score
Accessibility Score
Quality %
Release Readiness

============================================================ 18. PROGRESS
============================================================

Progress must represent something objectively measurable.

The preferred conceptual basis is:

verified planned contexts / total planned contexts

and/or

verified criteria / applicable planned criteria

Domain reconciliation must define this precisely.

Never convert subjective UX judgement into a fabricated percentage.

============================================================ 19. COMPLETE
============================================================

Complete means:

the planned UI/UX verification activity has ended.

It does NOT mean:

UI Passed
UX Passed
Application Passed
Release Ready
all Issues resolved
all Defects closed

Completion and quality outcome remain separate.

============================================================ 20. PAUSE
============================================================

Pause is a visual/product requirement.

Do not manufacture lifecycle semantics yet.

Domain reconciliation must determine:

whether this needs a new verification execution lifecycle
or can safely reuse an existing orchestration mechanism.

============================================================ 21. MOBILE WORKSPACE
============================================================

Mobile is first-class.

Do NOT squeeze the desktop workspace.

The visual establishes focused mobile surfaces such as:

Overview
Activity
Capture
Observations
Evidence
Issues
Summary
Viewport Matrix

Quick Capture must remain immediately accessible.

The tester should realistically be able to perform verification and
capture Evidence from a mobile device.

============================================================ 22. LIGHT / DARK
============================================================

Desktop light and dark:

IDENTICAL GEOMETRY

Mobile light and dark:

IDENTICAL GEOMETRY

Theme changes appearance only.

Preserve established APZQEP visual language.

============================================================ 23. RELATIONSHIP TO EXPLORATORY TESTING
============================================================

UI/UX Verification and Exploratory Sessions may share useful concepts:

Observation
Issue
Evidence
Note
activity

That does NOT mean they are the same domain object.

Exploratory Session:

CHARTER-DRIVEN DISCOVERY

UI/UX Verification:

PLAN-DRIVEN STRUCTURED EXPERIENCE VERIFICATION

Domain reconciliation must determine what can be shared without
collapsing the two product concepts.

============================================================ 24. RELATIONSHIP TO TEST CASE EXECUTION
============================================================

Do not put UI/UX Verification into qep-test-execution merely because
criteria are being verified.

Do not create another Test Case execution engine either.

Domain reconciliation must inspect whether any existing execution
capability can be extended safely.

No architectural decision is authorised from the visual alone.

============================================================ 25. APPLICATION / ENVIRONMENT
============================================================

Reuse:

qep_application

and:

qep_application_environment

No parallel stores.

============================================================ 26. DEFECT
============================================================

Existing Defect SoR remains authoritative.

UI/UX Verification may create/link a Defect only through deliberate
human action.

No automatic Defect generation.

============================================================ 27. SOURCE INDEPENDENCE
============================================================

No change.

UI/UX Verification does not grant:

source.read
source.write

============================================================ 28. NOT AUTHORISED
============================================================

Do not implement:

AI visual inspection
AI usability judgement
AI accessibility judgement
AI issue classification
automatic Defect creation
pixel-diff engine
visual regression engine
BrowserStack
device farm
Figma integration
Playwright screenshot comparison
SSH
Terminal
Source write
Release aggregate
new Evidence store
new Defect store
new Application store
qep_ui_ux_plan
qep_ui_ux_execution
qep_exploratory_session
schemas or migrations
Screen 4 in code

Tool/provider reconciliation comes later.

Do not casually create those tables until domain reconciliation proves
what can safely extend what already exists.

============================================================ 29. SAMPLE DATA
============================================================

All displayed content is illustrative only, including:

UXP-101
Checkout UI/UX Review
tester names
dates
viewport counts
observations
issues
Evidence
progress
durations
activity events

Do not seed it merely to reproduce the visual.

============================================================ 30. DOMAIN QUESTIONS TO CARRY FORWARD
============================================================

Do NOT answer these while recording Screen 4.

Carry them into domain reconciliation:

1. Does Exploratory Session require a new durable aggregate?

2. Can Observation / Issue / Note be shared across Exploratory and
   UI/UX Verification?

3. What existing capability, if any, can represent UI/UX Verification
   Plans without creating a second Test Plan system?

4. What represents a UI/UX verification activity/execution?

5. Are UI/UX Criteria first-class objects or mappings onto existing
   Test Cases / AC?

6. How should viewport/device/browser context be represented?

7. How should verification-context progress be calculated?

8. How does Evidence attach to Observation / Issue / Criterion /
   viewport context?

9. How does Issue deliberately promote/link to existing Defect?

10. What lifecycle is required for Exploratory Session and UI/UX
    Verification?

11. Can activity/history use an existing APZQEP audit/event capability?

12. How do these capabilities remain Application-bound and tenant-safe?

============================================================ 31. RECORD
============================================================

Authority image:

docs/frontend/apzqep-redesign/visuals/phase-5/
04-ui-ux-verification-workspace-authority.png

This specification:

docs/frontend/apzqep-redesign/
APZQEP-PHASE-5-SCREEN-4-UI-UX-VERIFICATION-WORKSPACE.md

Agenda: [APZQEP-PHASE-5-DOMAIN-RECONCILIATION.md](./APZQEP-PHASE-5-DOMAIN-RECONCILIATION.md)

```text
SCREEN 1 — EXPLORATORY SESSIONS:
LOCKED

SCREEN 2 — EXPLORATORY SESSION WORKSPACE:
LOCKED

SCREEN 3 — UI / UX VERIFICATION PLANS:
LOCKED

SCREEN 4 — UI / UX VERIFICATION WORKSPACE:
LOCKED

PHASE 5 VISUAL DESIGN:
COMPLETE

DOMAIN RECONCILIATION:
NEXT

PHASE 5 IMPLEMENTATION:
NOT AUTHORISED
```

STOP.

Do not implement Phase 5.

Next authorised activity is DOMAIN RECONCILIATION against the
existing repository.
