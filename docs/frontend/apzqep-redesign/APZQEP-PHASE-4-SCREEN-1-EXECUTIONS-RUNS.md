# APZQEP Phase 4 — Screen 1 visual authority (Executions / Runs)

**Record:** APZQEP REDESIGN / PHASE 4 / SCREEN 1 / EXECUTIONS / RUNS / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-19  
**Authority image:** [visuals/phase-4/01-executions-runs-authority.png](./visuals/phase-4/01-executions-runs-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for APZQEP Executions / Runs. It is the operational doorway for Phase 4. Screens 2–4 go deeper (manual workspace, automated detail, result / evidence / defect / retest). Do not design or implement those from this screen.

Phase 3 is **CLOSED and ACCEPTED**. Phase 4 visual design is **COMPLETE**. Domain reconciliation is **NEXT**. Phase 4 implementation is **NOT AUTHORISED**.

```text
SCREEN 1 — Executions / Runs                    LOCKED
SCREEN 2 — Manual Test Execution Workspace      LOCKED
SCREEN 3 — Automated Execution Detail           LOCKED
SCREEN 4 — Execution Result / Evidence / Defect / Retest  LOCKED

PHASE 4 VISUAL DESIGN                           COMPLETE
DOMAIN RECONCILIATION                           NEXT
PHASE 4 IMPLEMENTATION                          NOT AUTHORISED
```

---

# APZQEP REDESIGN — PHASE 4 VISUAL AUTHORITY

# SCREEN 1 — EXECUTIONS / RUNS

# PHASE 4 FOUR-SCREEN CONTEXT

Phase 3 is CLOSED and ACCEPTED.

Phase 4 implementation is NOT AUTHORISED.

The supplied image is the approved visual direction for:

PHASE 4
SCREEN 1 — EXECUTIONS / RUNS

Record the visual and this specification as VISUAL AUTHORITY ONLY.

DO NOT IMPLEMENT PHASE 4.

============================================================

1. PHASE 4 PURPOSE
   \============================================================

Phase 4 designs the operational execution experience of APZQEP.

Phases 1–3 established:

Application
→ Requirements
→ User Stories
→ Acceptance Criteria
→ Test Cases
→ Test Suites
→ Test Plans
→ Execution Strategy

Phase 4 continues:

Test Plan
↓
Execution
↓
┌──────────────┬────────────────┐
│ │ │
Manual Automated Mixed
│ │ │
└──────────────┴────────────────┘
↓
Test Results
↓
┌────────┴────────┐
▼ ▼
Evidence Defect
↓
Fix
↓
Retest
↓
Verified

This phase must turn the existing execution capabilities into a coherent
customer-facing quality execution experience.

============================================================ 2. THE FOUR PHASE 4 SCREENS
============================================================

Phase 4 will be designed through FOUR visual authorities.

SCREEN 1 — EXECUTIONS / RUNS
STATUS: CURRENT (now LOCKED)

Purpose:
Single operational view of executions across Plans, environments,
methods and underlying execution engines.

---

SCREEN 2 — MANUAL TEST EXECUTION WORKSPACE
STATUS: NEXT

Purpose:
The tester's primary working surface.

Conceptually:

Test Case context
│
▼
Current Step
Action
Test Data
Expected Result
│
▼
Actual Result
Pass / Fail / Blocked
Evidence
Defect
│
▼
Next Step

This will be the signature manual-testing experience.

DO NOT DESIGN OR IMPLEMENT IT FROM Screen 1.

---

SCREEN 3 — AUTOMATED EXECUTION DETAIL
STATUS: PENDING

Purpose:
Present automated execution coherently inside APZQEP regardless of the
underlying provider/tool.

Examples of capability resolution may include:

Browser Automation → Playwright
SAST → Semgrep
DAST → ZAP
Performance → k6

These are examples only.

APZQEP remains the product.

It must NOT become a clone of Playwright, GitHub Actions, ZAP or another
provider dashboard.

---

SCREEN 4 — EXECUTION RESULT / EVIDENCE / DEFECT / RETEST
STATUS: PENDING

Purpose:
Deep inspection of a completed or failed Test Case execution.

This is where we close the quality loop:

Acceptance Criterion
→ Test Case
→ Execution
→ Step Results
→ Evidence
→ Defect
→ Fix
→ Retest
→ Verified

This screen will also reconcile historical execution snapshots.

============================================================ 3. SCREEN 1 PURPOSE
============================================================

Executions / Runs answers:

"What testing is happening, what has happened, and what needs attention?"

It is an operational surface.

It is NOT:

a Test Plan
a Test Case Library
a CI dashboard
an automation-provider dashboard
a Release dashboard
a generic KPI dashboard

============================================================ 4. PRODUCT TERMINOLOGY
============================================================

Primary customer terminology:

Executions

Individual execution records may use:

Execution

The word "Run" may appear naturally in names such as:

Sprint Regression — Run 5

but do not introduce another Run SoR merely because the visual uses the
word.

Use existing execution authority.

============================================================ 5. TWO EXECUTION ENGINES
============================================================

Phase 3 established that APZQEP has two genuine execution capabilities:

qep-test-execution

and

qep-execution-workspace

KEEP BOTH.

Do not merge them.

Do not create a third execution store.

Screen 1 provides ONE customer-facing Executions experience over the
appropriate records from both engines.

The customer must not need to understand internal package architecture.

============================================================ 6. DESKTOP COMPOSITION
============================================================

Preserve the accepted APZQEP shell.

Header:

APZ | APZQEP | Application | Search QEP... | + Create Execution | Bell | User

Sidebar remains the accepted QEP Master IA.

Quality area includes:

Requirements
User Stories
Acceptance Criteria
Test Cases
Test Suites
Test Plans
Executions
Defects

Executions is selected.

Do not restore legacy QEP navigation.

============================================================ 7. PAGE HEADER
============================================================

Title:

Executions

Supporting language:

View and monitor test executions across all plans and environments.

Primary action:

- Create Execution

IMPORTANT:

The presence of this button in the visual does NOT authorise an execution
creation workflow yet.

Domain reconciliation after all four visuals must determine what
"Create Execution" actually means across Test Plan, strategy and the two
execution engines.

============================================================ 8. PRIMARY VIEWS
============================================================

Target tabs:

All Executions
My Executions
By Status
By Plan
By Environment
By Type

These are filtered views over the same execution authority.

Do not create separate stores.

"My Executions" must use real assignment/ownership semantics.

Do not infer "my" from createdBy unless that is genuinely the domain rule.

============================================================ 9. FILTERS
============================================================

Desktop target filters:

Search executions
Status
Type
Environment
Plan
Date
Filters

Filters must operate on authoritative data.

No fake Release filter.

Release remains out of scope.

============================================================ 10. EXECUTION TABLE
============================================================

Target columns:

ID
Execution Name
Plan
Type
Environment
Method / Capability
Status
Result
Progress
Owner
Started
Updated

Only show fields that can be backed honestly.

Do not manufacture:

owner
progress
environment
method
result

when the execution record cannot resolve them.

Use:

Unavailable
—
or an honest empty state

where appropriate.

============================================================ 11. STATUS VS RESULT
============================================================

These are different concepts.

STATUS describes execution lifecycle.

Examples conceptually:

Queued
Running
In Progress
Completed
Blocked

RESULT describes quality outcome.

Examples conceptually:

Passed
Failed
Blocked
Not Run

Do not collapse:

Completed

into:

Passed.

A completed execution may contain failed tests.

The domain lock must reconcile exact enums with existing execution
engines.

============================================================ 12. PROGRESS
============================================================

Progress is derived.

Do not persist a manually editable percentage merely for this screen.

Possible derivation may use:

planned tests
completed tests
step completion
suite scope completion

depending on execution type.

Exact derivation comes from repository truth.

============================================================ 13. EXECUTION TYPE
============================================================

Customer-level types may conceptually include:

Automated
Manual
Mixed

Do not create these enums blindly.

Reconcile them against existing execution engine and strategy semantics.

"Mixed" should mean something real, not simply unknown.

============================================================ 14. METHOD / CAPABILITY
============================================================

Show product capability language first.

Examples:

Browser Automation
API Verification
Accessibility
SAST
DAST
Performance
Manual Verification

Configured provider may be shown secondarily where useful.

Example:

Browser Automation
Playwright

Do not make provider names the main APZQEP information architecture.

============================================================ 15. ENVIRONMENT
============================================================

Environment must resolve through authoritative Phase 1E
qep_application_environment where possible.

No second execution environment store.

Legacy labels must not be presented as authoritative environment objects
unless safely resolved.

============================================================ 16. EXECUTION TARGET
============================================================

Execution infrastructure remains distinct from execution surface.

Examples:

Surface:
Web

Environment:
QA

Infrastructure:
Managed Runner

Do not persist:

Web
API
Repository

as Phase 1E infrastructure target types.

============================================================ 17. ROW INTERACTION
============================================================

Selecting an execution should provide a compact operational Inspector or
navigate to Execution Detail according to the approved responsive pattern.

The user should be able to understand quickly:

Execution
Plan
Type
Method / Capability
Environment
Execution Target
Status
Result
Progress
Started
Owner

without opening internal engine records.

============================================================ 18. SUMMARY
============================================================

The visual includes an execution summary.

This is a DERIVED view.

Potential dimensions:

Passed
Failed
Blocked
In Progress
Not Started

Do not seed the illustrated numbers.

Do not invent results merely to populate the chart.

If authoritative aggregation is unavailable:

show an honest empty/unavailable state.

============================================================ 19. APPLICATION CONTEXT
============================================================

The Application selector remains authoritative.

When an Application is selected:

Executions should scope to that Application.

Unbound historical records must not be silently attached to the selected
Application.

Follow the Phase 1E canonical Application resolver.

============================================================ 20. PLAN CONTEXT
============================================================

Execution should resolve its Test Plan where a real relationship exists.

The Plan is the customer planning object.

Execution Plan remains internal/orchestration.

Do not show internal Execution Plan as a competing customer Plan column.

============================================================ 21. MANUAL EXECUTIONS
============================================================

Manual execution is first-class.

A manual execution should appear in the same Executions view as automated
testing.

Do not create a separate "Manual Testing" product silo.

Screen 2 will define the actual manual workspace.

============================================================ 22. AUTOMATED EXECUTIONS
============================================================

Automated executions also appear here.

This page gives operational status and navigation.

It does NOT expose enormous raw CI logs.

Screen 3 will define automated execution detail.

============================================================ 23. DEFECT RELATIONSHIP
============================================================

Where authoritative data exists, failed executions should be able to
indicate linked defects.

Do not turn this list into the Defect management screen.

Defect workflow remains the existing Defect domain.

============================================================ 24. EVIDENCE RELATIONSHIP
============================================================

Evidence belongs to the existing Evidence SoR.

Execution may indicate evidence exists.

Do not duplicate evidence into execution records.

Deep evidence interaction belongs primarily to Screen 4.

============================================================ 25. RETEST
============================================================

Retest is part of Phase 4's overall execution loop.

Do not create a separate Retest entity merely for Screen 1.

Existing Defect lifecycle already includes:

ready_for_retest
verified

The later visual/domain reconciliation must determine how a new execution
is linked as a retest of prior failed execution/defect.

============================================================ 26. EXECUTION SNAPSHOT
============================================================

Phase 3 carried:

EXECUTION SNAPSHOT: PARTIAL

Do not solve this from Screen 1 UI.

Carry the requirement forward:

historical execution must preserve the Test Case and scope actually
executed at that time.

Screen 4 will make this particularly important.

============================================================ 27. MOBILE
============================================================

Mobile is NOT the desktop table squeezed into a phone.

Use execution cards.

Each card should prioritise:

Execution identity
Name
Plan
Type
Environment
Method
Status / Result
Progress
Updated

Tap opens Execution Detail.

Filters use a mobile filter surface/sheet.

Primary mobile tabs can simplify to:

All
My Executions
By Status
More

while retaining the same information model.

============================================================ 28. MOBILE EXECUTION DETAIL
============================================================

The visual includes a compact detail concept.

This is navigational context for Screen 1 only.

Do not build the full manual or automated Execution Detail yet.

Those are Screens 2 and 3.

============================================================ 29. LIGHT / DARK
============================================================

MANDATORY:

Desktop light and desktop dark have IDENTICAL geometry.

Mobile light and mobile dark have IDENTICAL geometry.

Theme changes only visual treatment.

Do not change:

layout
information hierarchy
columns
navigation
actions
card structure
spacing logic

between themes.

============================================================ 30. SAMPLE DATA
============================================================

EVERY execution in the supplied visual is illustrative.

Examples such as:

EX-1021
Sprint Regression — Run 5
QA
Browser Automation
Playwright
65%
42 executions

are sample visual data only.

Do not seed them.

Do not treat them as domain requirements.

============================================================ 31. HONEST EMPTY STATES
============================================================

If there are no executions:

Do NOT show zero KPI cards everywhere.

Use a professional operational empty state.

Example concept:

No executions yet

Executions will appear here when testing is started from a Test Plan.

Do not imply success.

============================================================ 32. CREATE EXECUTION
============================================================

Do not implement the action yet.

After all four Phase 4 screens are locked, domain reconciliation must
determine:

Test Plan
→ Strategy
→ execution scope
→ execution engine
→ snapshot
→ Execution

before Create Execution is authorised.

============================================================ 33. DO NOT IMPLEMENT
============================================================

This visual does NOT authorise:

Phase 4 implementation
manual execution changes
automated execution changes
execution-engine merge
new execution store
snapshot migrations
Defect changes
Retest changes
SSH
Terminal
Source write
Release
AI

Record only.

============================================================ 34. RECORD
============================================================

Record supplied visual as:

APZQEP REDESIGN
PHASE 4
SCREEN 1
EXECUTIONS / RUNS
VISUAL AUTHORITY

Authority path:

docs/frontend/apzqep-redesign/visuals/phase-4/01-executions-runs-authority.png

Specification:

docs/frontend/apzqep-redesign/APZQEP-PHASE-4-SCREEN-1-EXECUTIONS-RUNS.md

============================================================ 35. PHASE 4 VISUAL REGISTER
============================================================

SCREEN 1 — Executions / Runs
LOCKED

SCREEN 2 — Manual Test Execution Workspace
LOCKED

SCREEN 3 — Automated Execution Detail
LOCKED

SCREEN 4 — Execution Result / Evidence / Defect / Retest
LOCKED

DOMAIN RECONCILIATION
NEXT

PHASE 4 IMPLEMENTATION
NOT AUTHORISED
