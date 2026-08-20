# APZQEP Phase 5 — Screen 1 visual authority (Exploratory Sessions)

**Record:** APZQEP REDESIGN / PHASE 5 / SCREEN 1 / EXPLORATORY SESSIONS / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-20  
**Authority image:** [visuals/phase-5/01-exploratory-sessions-authority.png](./visuals/phase-5/01-exploratory-sessions-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for APZQEP Exploratory Sessions. It is the operational doorway for Phase 5. Screens 2–3 are locked separately. Do not design Screen 4 from this screen.

Phase 4 is **CLOSED and ACCEPTED**. Phase 5 Screens 2–3 are **LOCKED**. Domain reconciliation is **NOT STARTED**. Phase 5 implementation is **NOT AUTHORISED**.

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

**Test Case ≠ Exploratory Session.** Phase 3/4 remains predefined verification. Phase 5 is investigation, observation, Evidence, and discovered issues. Do not reinterpret Exploratory Sessions as Test Cases, Executions, or Suites.

---

# APZQEP REDESIGN — PHASE 5

# SCREEN 1 — EXPLORATORY SESSIONS

# VISUAL AUTHORITY ONLY — NO IMPLEMENTATION

Phase 4 is CLOSED and ACCEPTED.

Phase 5 begins with visual design only.

The attached image is the VISUAL AUTHORITY for:

SCREEN 1 — EXPLORATORY SESSIONS

Do NOT implement Phase 5 yet.
Do NOT create schemas or migrations.
Do NOT manufacture an Exploratory Session backend.
Do NOT reinterpret exploratory testing as Test Cases.

============================================================
PHASE 5 VISUAL SET
============================================================

The planned four-screen visual set is:

SCREEN 1 — Exploratory Sessions
SCREEN 2 — Exploratory Session Workspace
SCREEN 3 — UI / UX Verification Plan
SCREEN 4 — UI / UX Verification Workspace

Screens 1–4 are locked. Visual design is complete. Domain reconciliation is next.

---

SCREEN 1 — EXPLORATORY SESSIONS
STATUS: LOCKED (this document)

Purpose:
Operational entry point for discovery-led testing.

Answers:
What exploratory testing is happening?
Who is performing it?
Against which Application / Environment?
What is currently in progress?
What has been completed?
What issues were discovered?
What Evidence was captured?

---

SCREEN 2 — EXPLORATORY SESSION WORKSPACE
STATUS: LOCKED

Purpose:
Live session work surface.

See [APZQEP-PHASE-5-SCREEN-2-EXPLORATORY-SESSION-WORKSPACE.md](./APZQEP-PHASE-5-SCREEN-2-EXPLORATORY-SESSION-WORKSPACE.md).

---

SCREEN 3 — UI / UX VERIFICATION PLANS
STATUS: LOCKED

Purpose:
Experience-verification planning: viewports/devices, usability,
accessibility, responsive behaviours, visual checks, expected
design/reference context.

Not a second Test Plan system. See [APZQEP-PHASE-5-SCREEN-3-UI-UX-VERIFICATION-PLANS.md](./APZQEP-PHASE-5-SCREEN-3-UI-UX-VERIFICATION-PLANS.md).

---

SCREEN 4 — UI / UX VERIFICATION WORKSPACE
STATUS: LOCKED

Purpose:
Live verification workspace. See [APZQEP-PHASE-5-SCREEN-4-UI-UX-VERIFICATION-WORKSPACE.md](./APZQEP-PHASE-5-SCREEN-4-UI-UX-VERIFICATION-WORKSPACE.md).

============================================================
PURPOSE
============================================================

Exploratory Sessions is the operational entry point for
discovery-led testing.

Exploratory testing is NOT a substitute for scripted Test Cases.

A Test Case begins with predefined verification.

An Exploratory Session begins with a charter / objective and allows
the tester to investigate, observe and learn.

It is NOT:

- a Test Case Library
- an Execution / Run list
- a Test Plan
- a Defect queue
- an Evidence library
- a quality-score dashboard
- an automation-provider screen

============================================================
VISUAL AUTHORITY
============================================================

The attached image controls the intended:

- geometry
- information hierarchy
- density
- shell continuity with Phases 1–4
- tabs
- filters
- table composition
- summary cards
- mobile transformation (cards, not a squeezed table)
- light/dark equivalence

Do not redesign Screen 1 from memory. Match the authority image.

============================================================
DESKTOP
============================================================

Match the attached visual authority.

Preserve the established APZQEP shell and Phase 1–4 visual language.

Primary surface:

Exploratory Sessions

Subtitle direction (illustrative in the visual):

Discover, explore and learn from the system.
Capture observations, evidence and issues.

Tabs:

All Sessions
My Sessions
By Status
By Application
By Tester
Recent

Filters:

Search
Status
Application
Tester
Environment
Date

Primary action:

- New Session

Session list should conceptually support:

Session ID
Session Name / Charter
Application
Tester
Environment
Status
Duration
Started
Updated
Issues
Evidence

Summary information may show real derived counts such as:

Sessions
In Progress
Completed
Issues Found
Evidence Items

These are operational counts.

Do NOT create a fabricated quality score.

============================================================
STATUS
============================================================

The visual illustrates:

Draft
Planned
In Progress
Completed
Blocked

These are VISUAL concepts only at this stage.

Domain reconciliation must determine the final durable lifecycle.

Do not create enums from the mock-up.

============================================================
MOBILE
============================================================

Mobile is a genuine responsive work surface.

Do not squeeze the desktop table.

Use:

session cards
search/filter access
My Sessions
status views
session summary/detail

Preserve the existing APZQEP mobile navigation pattern.

============================================================
APPLICATION CONTEXT
============================================================

Exploratory Sessions belong to a registered qep_application.

Use the existing APZQEP Application context visually.

Environment must ultimately resolve through the Phase 1E Application
Environment authority.

Do not create another Application or Environment concept.

============================================================
ISSUES
============================================================

'Issues' in the visual means observations/problems discovered during
exploration.

Do NOT assume every issue is automatically a Defect.

The later Session Workspace must allow deliberate promotion/linking to
the existing Defect SoR.

============================================================
EVIDENCE
============================================================

Evidence counts/references in the mock-up are illustrative.

Existing APZQEP Evidence remains authoritative.

Do not create an exploratory Evidence store.

============================================================
SOURCE
============================================================

No change to Source independence.

Exploratory testing does not imply:

source.read
source.write

============================================================
FROZEN FROM PHASE 4
============================================================

These remain frozen. Screen 1 must not reopen them.

1. Provider capabilities remain secondary to APZQEP product language.
2. Historical execution truth is immutable.
3. Rerun and Retest remain distinct even though both create a new Execution.

Scripted Test Case / Execution / Retest / Rerun stay on the Phase 3–4
model. Exploratory Sessions do not become a third execution store and
do not wrap `qep_test_execution` as if it were a charter.

============================================================
NOT AUTHORISED
============================================================

Do not implement:

AI exploratory testing
automatic Defect generation
SSH
Terminal
Source write
new Release entity
new Evidence store
new Defect store
new Application store
schemas or migrations
an Exploratory Session backend
Screen 1 in code

============================================================
SAMPLE DATA
============================================================

All values in the visual are illustrative only, including:

EXS-101
session names
people
durations
counts
issue totals
evidence totals
dates
status distribution

Do not seed these merely to reproduce the image.

============================================================
RECORD
============================================================

Authority image:

docs/frontend/apzqep-redesign/visuals/phase-5/
01-exploratory-sessions-authority.png

This specification:

docs/frontend/apzqep-redesign/
APZQEP-PHASE-5-SCREEN-1-EXPLORATORY-SESSIONS.md

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

Do not implement Screen 1.

Next authorised activity is domain reconciliation. Do not implement Phase 5.
