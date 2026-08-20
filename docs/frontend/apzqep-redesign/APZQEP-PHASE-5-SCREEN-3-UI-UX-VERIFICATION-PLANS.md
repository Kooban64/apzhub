# APZQEP Phase 5 — Screen 3 visual authority (UI / UX Verification Plans)

**Record:** APZQEP REDESIGN / PHASE 5 / SCREEN 3 / UI / UX VERIFICATION PLANS / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-20  
**Authority image:** [visuals/phase-5/03-ui-ux-verification-plans-authority.png](./visuals/phase-5/03-ui-ux-verification-plans-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for APZQEP UI / UX Verification Plans. It is the planning surface for structured experience verification. Screen 4 will define the active workspace. Do not design Screen 4 from this screen.

**Annotation error:** the right-hand explanatory panel in the supplied board retains residual **Exploratory Sessions** wording. **Ignore that wording.** The actual Screen 3 UI and this instruction are authoritative.

This is **not a second Test Plan system**. The visual defines what the user needs from UI/UX planning. After Screen 4, domain reconciliation compares this planning need against existing Test Plan, Test Case, Evidence, Defect, and Phase 1E Environment domains before deciding what must actually be added.

Phase 4 is **CLOSED and ACCEPTED**. Screens 1–4 are **LOCKED**. Domain reconciliation is **NEXT**. Phase 5 implementation is **NOT AUTHORISED**.

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

Keep three concepts separate: **Test Case** (predefined verification) ≠ **Exploratory Session** (discovery) ≠ **UI / UX Verification** (structured experience verification).

---

# APZQEP REDESIGN — PHASE 5

# SCREEN 3 — UI / UX VERIFICATION PLANS

# VISUAL AUTHORITY ONLY — NO IMPLEMENTATION

Phase 5 visual status:

SCREEN 1 — Exploratory Sessions
LOCKED

SCREEN 2 — Exploratory Session Workspace
LOCKED

SCREEN 3 — UI / UX Verification Plans
LOCKED (this document)

SCREEN 4 — UI / UX Verification Workspace
LOCKED

DOMAIN RECONCILIATION
NEXT

PHASE 5 IMPLEMENTATION
NOT AUTHORISED

The attached image is the VISUAL AUTHORITY for Screen 3.

IMPORTANT:
The right-hand explanatory annotation in the supplied image contains
residual "Exploratory Sessions" wording.

IGNORE that wording.

The actual Screen 3 UI and THIS instruction define the authority.

Do not implement.
Do not create schemas.
Do not create migrations.

============================================================

1. PURPOSE
   \============================================================

UI / UX Verification Plans define structured experience verification
across:

applications
environments
devices
viewports
browsers/platforms
experience criteria

This is NOT general exploratory testing.

It is also NOT merely another ordinary Test Plan.

Its purpose is to organise deliberate verification of the customer's
actual interface and experience.

============================================================ 2. PRODUCT DISTINCTION
============================================================

Keep these concepts separate:

TEST CASE
Predefined functional/technical verification.

EXPLORATORY SESSION
Discovery-led investigation.

UI / UX VERIFICATION
Structured verification of interface and experience behaviour.

Do not collapse all three into one generic testing object merely because
they can all produce Evidence and Defects.

============================================================ 3. PRIMARY SURFACE
============================================================

Match the attached visual authority.

Primary title:

UI / UX Verification Plans

Primary action:

- New UI / UX Plan

Conceptually provide views such as:

All Plans
My Plans
By Application
By Environment
By Device
By Tester
Recent

============================================================ 4. PLAN LIST
============================================================

The primary desktop list should conceptually support:

Plan ID
Plan Name
Application
Environment
Devices / Viewports
Tester / Owner
Type
Status
Updated
Cases / Checks
Issues
Evidence

Exact durable fields must wait for domain reconciliation.

Do not manufacture backend fields simply because the visual contains
columns.

============================================================ 5. VERIFICATION DISCIPLINES
============================================================

UI / UX Verification must ultimately support structured disciplines such
as:

Functional UX
Responsive
Usability
Accessibility
Visual / presentation verification

These are quality disciplines.

Do not assume the visual labels are final persisted enums.

Domain reconciliation will determine representation.

============================================================ 6. DEVICES AND VIEWPORTS
============================================================

This capability must recognise that UI behaviour can differ across:

Desktop
Tablet
Mobile

and potentially:

browser
operating system
viewport dimensions
orientation
device profile

Do not treat "Mobile" as merely a responsive rendering of the APZQEP
application itself.

This screen is describing TARGET EXPERIENCE CONTEXT being verified.

============================================================ 7. ENVIRONMENT
============================================================

Environment must reuse the existing Phase 1E:

qep_application_environment

authority.

Do not create a UI/UX-specific Environment store.

============================================================ 8. APPLICATION
============================================================

Every new UI / UX Verification Plan belongs to:

qep_application

Use existing Application authority and selector behaviour.

No parallel Application concept.

============================================================ 9. WHAT IS BEING VERIFIED
============================================================

A UI / UX Plan should eventually be able to express verification scope
such as:

screen/page
journey/flow
component
responsive behaviour
visual behaviour
interaction behaviour
usability criterion
accessibility criterion

Do not define the durable schema yet.

Screen 4 and domain reconciliation will determine the correct model.

============================================================ 10. FUNCTIONAL UX
============================================================

Functional UX concerns whether the interface behaves correctly from the
user's perspective.

Examples:

controls behave as expected
navigation is understandable
validation is presented correctly
states and feedback are clear
interaction does not confuse the user

Do not duplicate ordinary backend/functionality Test Cases unnecessarily.

============================================================ 11. RESPONSIVE VERIFICATION
============================================================

Responsive verification concerns behaviour across target presentation
contexts.

Examples:

layout adaptation
navigation changes
content overflow
touch usability
orientation
breakpoints
component resizing
visibility

This must eventually support explicit target contexts rather than
"looks okay on mobile" prose.

============================================================ 12. USABILITY
============================================================

Usability verification concerns the human experience.

Examples:

clarity
discoverability
consistency
feedback
error recovery
task friction
interaction comprehension

Do not automatically turn subjective observations into failed Test Cases.

============================================================ 13. ACCESSIBILITY
============================================================

Accessibility is a first-class verification discipline.

Potential context may include:

keyboard operation
focus behaviour
semantic structure
labels
contrast
screen-reader compatibility
zoom/reflow

Do NOT hard-code an accessibility standard/version from the visual.

Domain reconciliation must determine how standards/profiles are
represented.

============================================================ 14. VISUAL VERIFICATION
============================================================

Visual verification may eventually compare:

actual UI
against
approved/reference presentation

but this visual does NOT authorise:

pixel-perfect automated comparison
screenshot diff engine
visual AI
design-file integration

Those require later reconciliation.

============================================================ 15. PLAN ≠ EXECUTION
============================================================

This screen defines PLANS.

It does not represent actual verification execution.

Screen 4 will define the active:

UI / UX Verification Workspace.

Preserve:

Plan
≠
Execution / Verification activity

============================================================ 16. PLAN SUMMARY
============================================================

The visual contains summary counts.

Only show real derived metrics later.

Conceptually these may include:

Total Plans
In Progress
Completed
Planned
Issues Found
Evidence Items

Do NOT create:

UI Quality Score
UX Score
Accessibility Score
Readiness %

unless a future explicitly authorised model defines one.

============================================================ 17. ISSUES
============================================================

Issue follows the same important distinction established for exploratory
testing:

Issue ≠ Defect

A UI/UX verification issue may be:

observation
usability concern
accessibility concern
responsive problem
visual discrepancy
functional UX problem

Promotion/linking to existing Defect SoR must be deliberate.

============================================================ 18. EVIDENCE
============================================================

Use the existing APZQEP Evidence SoR.

Potential Evidence may eventually include:

screenshots
screen recordings
accessibility reports
browser output
responsive captures
documents
supported verification artefacts

Do not create another Evidence store.

============================================================ 19. RELATIONSHIP TO TEST CASES
============================================================

Do not assume every UI/UX verification check must be a Test Case.

Some structured functional checks may legitimately relate to an existing
Test Case.

Some experience criteria may be specific to UI/UX Verification.

Domain reconciliation must decide the relationship after Screen 4 is
locked.

============================================================ 20. RELATIONSHIP TO REQUIREMENTS / AC
============================================================

UI/UX verification may eventually trace to:

Requirement
User Story
Acceptance Criterion

where meaningful.

Do not manufacture traceability solely to populate the UI.

============================================================ 21. MOBILE
============================================================

The attached visual establishes the responsive Plan experience.

Mobile should provide:

focused plan list/cards
filters
By Status
My Plans
Plan Summary

Do not squeeze the desktop table.

Preserve established APZQEP mobile navigation.

============================================================ 22. STATUS
============================================================

The visual illustrates statuses such as:

Draft
Planned
In Progress
Completed
Blocked

These remain visual concepts.

Do not create lifecycle enums until domain reconciliation.

============================================================ 23. SOURCE INDEPENDENCE
============================================================

No change.

UI / UX Verification does not automatically grant:

source.read
source.write

============================================================ 24. NOT AUTHORISED
============================================================

Do not implement:

AI visual analysis
AI usability scoring
automatic Defect creation
pixel-diff infrastructure
Playwright visual snapshots
BrowserStack integration
device farms
Figma integration
SSH
Terminal
Source write
Release aggregate
new Evidence store
new Defect store
new Application store
schemas or migrations
a second Test Plan store
Screen 3 in code

Tool/provider decisions come later.

============================================================ 25. SAMPLE DATA
============================================================

Everything shown is illustrative only, including:

UXP-101
plan names
device lists
people
counts
issues
Evidence totals
progress
dates
status distributions

Do not seed sample data merely to reproduce the visual.

============================================================ 26. VISUAL CONSISTENCY
============================================================

Desktop light/dark geometry must match.

Mobile light/dark geometry must match.

Maintain the accepted APZQEP visual system from Phases 1–5.

============================================================ 27. RECORD
============================================================

Authority image:

docs/frontend/apzqep-redesign/visuals/phase-5/
03-ui-ux-verification-plans-authority.png

This specification:

docs/frontend/apzqep-redesign/
APZQEP-PHASE-5-SCREEN-3-UI-UX-VERIFICATION-PLANS.md

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
