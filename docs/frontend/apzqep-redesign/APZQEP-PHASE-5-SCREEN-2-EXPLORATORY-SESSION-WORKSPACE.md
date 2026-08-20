# APZQEP Phase 5 — Screen 2 visual authority (Exploratory Session Workspace)

**Record:** APZQEP REDESIGN / PHASE 5 / SCREEN 2 / EXPLORATORY SESSION WORKSPACE / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-20  
**Authority image:** [visuals/phase-5/02-exploratory-session-workspace-authority.png](./visuals/phase-5/02-exploratory-session-workspace-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for the APZQEP Exploratory Session Workspace. It is the working surface used while a tester is actively performing an Exploratory Session. Screen 3 is locked separately. Do not design Screen 4 from this screen.

Phase 4 is **CLOSED and ACCEPTED**. Phase 5 Screens 1 and 3 are **LOCKED**. Domain reconciliation is **NOT STARTED**. Phase 5 implementation is **NOT AUTHORISED**.

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

**Test Case ≠ Exploratory Session.** Observation is a first-class product concept: something can be worth recording without prematurely declaring it a Defect. Do not force this workspace into `qep-test-execution` or `qep-execution-workspace`.

---

# APZQEP REDESIGN — PHASE 5

# SCREEN 2 — EXPLORATORY SESSION WORKSPACE

# VISUAL AUTHORITY ONLY — NO IMPLEMENTATION

Phase 4 is CLOSED and ACCEPTED.

Phase 5 Screen 1 — Exploratory Sessions is LOCKED.

The attached image is now the VISUAL AUTHORITY for:

SCREEN 2 — EXPLORATORY SESSION WORKSPACE

Do NOT implement.
Do NOT create schemas or migrations.
Do NOT manufacture an Exploratory Session backend.

============================================================
PHASE 5 VISUAL SET
============================================================

SCREEN 1 — Exploratory Sessions
LOCKED

SCREEN 2 — Exploratory Session Workspace
LOCKED (this document)

SCREEN 3 — UI / UX Verification Plans
LOCKED

SCREEN 4 — UI / UX Verification Workspace
LOCKED

DOMAIN RECONCILIATION
NEXT

PHASE 5 IMPLEMENTATION
NOT AUTHORISED

============================================================

1. PURPOSE
   \============================================================

This is the working surface used while a tester is actively performing
an Exploratory Session.

It is NOT a Test Case execution screen.

Test Case execution follows:

predefined steps
→ expected result
→ actual result
→ execution result

Exploratory execution follows:

Charter
→ Explore
→ Observe
→ Capture
→ Learn
→ Evidence / Issue where appropriate

Do not force exploratory work into the Phase 3/4 Test Case model.

============================================================ 2. CORE WORKSPACE
============================================================

Match the attached visual authority.

Desktop composition:

LEFT
Session Charter / Context

CENTRE
Live Activity

RIGHT
Session Summary / Progress

The user should be able to understand simultaneously:

WHY am I exploring?
WHAT have I done?
WHAT have I discovered?
WHAT evidence/issues exist?
HOW FAR through the intended exploration am I?

============================================================ 3. SESSION HEADER
============================================================

Conceptually show:

Session identity
Session name
Status
Tester
Application
Environment
Started
Elapsed duration

Primary active-session actions:

Pause
Complete

Do not create lifecycle enums from the visual.

Domain reconciliation will determine the durable lifecycle.

============================================================ 4. CHARTER
============================================================

The Charter defines the exploratory mission.

Conceptually support:

Mission / Objective
Scope
Areas to Explore
Session Notes

Example:

Explore checkout behaviour to identify usability issues,
validation problems, unexpected behaviour and defects.

The Charter is NOT:

Requirement
User Story
Acceptance Criterion
Test Case
Test Plan

It is the bounded purpose of an Exploratory Session.

============================================================ 5. AREAS TO EXPLORE
============================================================

Allow the Charter to identify intended areas/topics such as:

Cart behaviour
Address validation
Payment methods
Error handling
Order confirmation

These are exploration prompts.

They are NOT Test Case steps.

They do not carry predefined Pass/Fail expectations merely because they
appear in a list.

============================================================ 6. LIVE ACTIVITY
============================================================

The centre workspace represents chronological activity during the
session.

Examples may include:

Session started
Navigated to area
Action performed
Observation captured
Evidence attached
Issue created
Note recorded

Do not infer these events from current state.

If implemented later, activity must come from real session events.

============================================================ 7. OBSERVATION
============================================================

Observation is a first-class product concept for exploratory testing.

An Observation records something the tester noticed.

It does NOT automatically mean:

Defect
Failure
Test Case result

Examples:

unexpected behaviour
usability concern
interesting system behaviour
potential risk
inconsistency
question requiring investigation

Domain reconciliation must determine whether an existing capability can
represent this safely or whether an additive exploratory object is
required.

============================================================ 8. ISSUE
============================================================

Issue means a discovered concern requiring stronger attention.

Do NOT assume:

Issue = Defect.

An Issue may later be:

reviewed
dismissed
linked to an existing Defect
promoted into a new Defect

Existing APZQEP Defect remains the Defect SoR.

No second Defect store.

============================================================ 9. EVIDENCE
============================================================

Exploratory testing must use the existing Evidence SoR.

Conceptually allow:

Upload Evidence
Attach Evidence

Examples may include:

screenshot
video
trace
report
document
other supported Evidence

Preserve existing:

provenance
integrity
tenant isolation
access controls

Do not create an Exploratory Evidence table.

============================================================ 10. NOTES
============================================================

Notes are lightweight tester working notes.

They are not automatically:

Observations
Issues
Defects
Evidence

The tester must deliberately classify/promote information when
appropriate.

============================================================ 11. QUICK CAPTURE
============================================================

The visual establishes a fast Capture interaction.

Conceptually:

- Observation
- Upload Evidence
- Create Issue
- Add Note

Capture should be deliberately low-friction.

Exploratory testing loses value if the tester must leave the active
session repeatedly to document discoveries.

============================================================ 12. SESSION SUMMARY
============================================================

The right-side summary provides operational context.

Conceptually show real derived information such as:

Observations
Issues
Evidence
Notes
Exploration progress
Elapsed time
Started

Do NOT create a Quality Score.

Do NOT convert counts into an invented readiness percentage.

============================================================ 13. EXPLORATION PROGRESS
============================================================

The visual shows exploration coverage/progress.

This must NOT be assumed to mean:

Test Coverage
Requirement Coverage
Quality %
Pass Rate

Domain reconciliation must determine whether progress represents:

areas explored / intended areas

or another honest session-specific measure.

No fabricated quality metric.

============================================================ 14. COMPLETE SESSION
============================================================

Completing an Exploratory Session means:

the exploratory activity has ended.

It does NOT mean:

Application Passed
Quality Passed
All Issues Resolved
All Defects Closed

Completion and quality outcome remain separate concepts.

============================================================ 15. PAUSE
============================================================

The visual contains Pause.

Treat this as a product requirement to reconcile.

Do not create pause/resume semantics from the mock-up until repository
analysis determines the correct session lifecycle.

============================================================ 16. MOBILE
============================================================

Mobile is first-class for this workspace.

Do not squeeze the three desktop columns.

Use dedicated mobile surfaces such as:

Overview
Activity
Capture
Summary

The tester must be able to capture:

Observation
Evidence
Issue
Note

quickly from mobile.

Preserve established APZQEP bottom navigation.

============================================================ 17. APPLICATION / ENVIRONMENT
============================================================

The Session belongs to:

qep_application

Environment must reuse:

qep_application_environment

from Phase 1E.

Do not create parallel Application or Environment stores.

============================================================ 18. RELATIONSHIP TO TEST CASES
============================================================

Do not require an Exploratory Session to have Test Cases.

A future session may optionally reference:

Requirement
Story
Acceptance Criterion
Test Case
Suite
Test Plan
Defect

if repository/domain reconciliation supports meaningful relationships.

But exploratory testing remains independently valid.

============================================================ 19. RELATIONSHIP TO EXECUTIONS
============================================================

Do NOT put Exploratory Session into:

qep-test-execution

merely because both involve testing.

Do NOT put it into:

qep-execution-workspace

merely because both are workspaces.

Domain reconciliation must determine the correct model.

The distinction established in Screen 1 remains authoritative:

TEST CASE ≠ EXPLORATORY SESSION.

============================================================ 20. SOURCE INDEPENDENCE
============================================================

No change.

Exploratory Session does not grant:

source.read
source.write

============================================================ 21. NOT AUTHORISED
============================================================

Do not implement:

AI-generated observations
AI exploratory testing
automatic issue classification
automatic Defect creation
SSH
Terminal
Source write
Release aggregate
new Evidence store
new Defect store
new Application store
schemas or migrations
an Exploratory Session backend
Screen 2 in code

============================================================ 22. SAMPLE DATA
============================================================

All content shown in the visual is illustrative only.

Including:

EXS-101
Checkout Flow Exploration
tester names
dates
duration
observations
issues
Evidence counts
notes
progress percentages
activity events

Do not seed this data merely to reproduce the visual.

============================================================ 23. VISUAL CONSISTENCY
============================================================

Desktop light and dark must use identical geometry.

Mobile light and dark must use identical geometry.

Theme changes appearance only.

The visual language must remain consistent with the accepted APZQEP
Phase 1–4 product.

============================================================ 24. RECORD
============================================================

Authority image:

docs/frontend/apzqep-redesign/visuals/phase-5/
02-exploratory-session-workspace-authority.png

This specification:

docs/frontend/apzqep-redesign/
APZQEP-PHASE-5-SCREEN-2-EXPLORATORY-SESSION-WORKSPACE.md

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

Next authorised activity is domain reconciliation. Do not implement Phase 5.
