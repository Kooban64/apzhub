# APZQEP Phase 3 — Screen 1 visual authority (Test Case Library)

**Record:** APZQEP REDESIGN / PHASE 3 / SCREEN 1 / TEST CASE LIBRARY / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-19  
**Authority image:** [visuals/phase-3/01-test-case-library-authority.png](./visuals/phase-3/01-test-case-library-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for the APZQEP Test Case Library. Implementation, when later authorised, must reproduce this geometry — not reinterpret it into cards, a dashboard, a Playwright catalogue, or the old Test Specification workbench.

This visual does **not** authorise a new Test Case backend. Phase 0 established a durable **Specification** capability. Specification vs Test Case reconciliation belongs in the consolidated Phase 3 domain lock, after Screens 2–4.

Phase 2 remains **CLOSED**. Phase 3 implementation is **NOT AUTHORISED**.

```text
SCREEN 1 — Test Case Library        LOCKED
SCREEN 2 — Test Case Designer       LOCKED
SCREEN 3 — Test Suites              LOCKED
SCREEN 4 — Test Plans               LOCKED

DOMAIN RECONCILIATION               NEXT
PHASE 3 IMPLEMENTATION              NOT AUTHORISED
```

---

# APZQEP REDESIGN — PHASE 3 VISUAL AUTHORITY

# SCREEN 1 — TEST CASE LIBRARY

Attached visual is the APPROVED DESIGN DIRECTION for the APZQEP
Test Case Library.

DO NOT IMPLEMENT PHASE 3 YET.

Record this visual and this specification as design authority only.

Phase 2 remains CLOSED.
Phase 3 implementation is NOT AUTHORISED.

============================================================

1. PURPOSE
   \============================================================

The Test Case Library is the central reusable verification library for
the selected APZQEP Application.

It answers:

"What tests exist for this Application, what do they verify, and how
are they intended to be executed?"

It is NOT:

- a dashboard
- a Test Plan
- an Execution Run
- an automation-provider screen
- a Playwright catalogue
- a CI dashboard

The library contains reusable test definitions.

============================================================ 2. VISUAL AUTHORITY
============================================================

The attached image controls the intended:

- geometry
- information hierarchy
- density
- navigation
- filtering
- table composition
- overview panel
- Inspector behaviour
- mobile transformation
- light/dark equivalence

Desktop Light and Desktop Dark MUST have identical geometry.

Mobile Light and Mobile Dark MUST have identical geometry.

Theme changes presentation only.

Do not reinterpret the visual into cards or a generic dashboard.

============================================================ 3. APZQEP SHELL
============================================================

Preserve the accepted APZQEP shell from Phases 1 and 2:

APZ | APZQEP | Application selector | Search QEP... | + Create | Bell | User

Application context comes from:

qep_application

Test Cases shown in the library must therefore belong to the selected
authoritative Application.

Do not restore the old flattened QEP catalogue.

============================================================ 4. MASTER NAVIGATION
============================================================

The visual extends the accepted Master IA.

Relevant definition/verification sequence:

QUALITY

Requirements
User Stories
Acceptance Criteria
Test Cases

TESTING

Test Suites
Test Plans
Executions
Defects

REPORTS

Traceability
Quality Reports

ADMIN

Applications
Environments
Execution Targets
Integrations
People & Access
Settings

Only real authorised surfaces should ultimately be active.

Do not manufacture functionality merely because it appears in the
target navigation.

============================================================ 5. TEST CASE LIBRARY
============================================================

Primary workspace:

Test Case Library

Supporting copy:

Centralised library of reusable test cases for your organisation/application.

Tabs:

All Test Cases
My Test Cases
By Status
By Type
By Tag

These are alternative views over the SAME Test Case SoR.

Do not create separate stores for each view.

============================================================ 6. FILTER / ACTION BAR
============================================================

Target controls:

Search test cases...

Type
Status
Priority
Tags
Filters

- Add Test Case

Filters should be compact.

Do not create large filter cards or dashboard controls.

============================================================ 7. TABLE
============================================================

Desktop target columns:

ID
Title
Type
Priority
Status
Automation
Owner
Updated
Tags

The exact fields implemented later must be reconciled against repository
truth.

The visual's example rows are SAMPLE DATA ONLY.

DO NOT seed:

TC-101
TC-102
TC-103
etc.

DO NOT seed sample users, counts, tags or statuses merely to make the
screen resemble the visual.

============================================================ 8. TEST CASE — PRODUCT CONCEPT
============================================================

APZQEP product language should present this object to the customer as:

TEST CASE

A Test Case describes:

WHAT is being verified
HOW it is verified
WHAT result is expected
WHAT conditions/data are required

Conceptually:

Test Case
├── Purpose
├── Preconditions
├── Steps
├── Expected Results
├── Test Data
├── Tags
├── Verification links
└── Execution method

However:

Phase 0 established that the repository currently has a durable
Specification capability rather than a fully reconciled Test Case SoR.

DO NOT create a new Test Case backend from this visual instruction.

That reconciliation belongs in the consolidated Phase 3 domain lock.

============================================================ 9. TEST TYPE
============================================================

The visual illustrates types such as:

Functional
API
Accessibility
Security
Performance

These communicate the desired product experience.

Do not blindly create these enums.

Before implementation Cursor must reconcile:

- existing Specification types
- existing Verification types
- automation classifications
- QEP domain vocabulary

We want one coherent Test Case type model, not overlapping enums.

============================================================ 10. PRIORITY
============================================================

Priority is test importance, not defect severity.

The visual uses:

High
Medium
Low

Do not confuse this with existing Defect severity:

critical
major
minor
trivial

Those are different concepts.

============================================================ 11. STATUS
============================================================

The visual demonstrates states such as:

Draft
In Review
Approved
Deprecated

This expresses the desired lifecycle concept.

The final Phase 3 domain instruction must reconcile these with the
existing Specification lifecycle.

Do not introduce another competing lifecycle from the visual alone.

============================================================ 12. AUTOMATION
============================================================

The library must distinguish execution intent/capability such as:

Manual
Automated

But:

"Automated" does NOT mean the Test Case itself contains a Playwright
script.

The eventual relationship should conceptually allow:

Test Case
↓
Execution Method
↓
Manual
or
Automation Mapping
↓
appropriate tool/provider

Existing APZQEP automation assets and mappings must be reconciled.

Do not make provider names primary Test Case navigation.

============================================================ 13. LIBRARY OVERVIEW
============================================================

The right-side Library Overview is a compact contextual summary.

The visual illustrates:

Total Test Cases
Approved
In Review
Draft
Deprecated
Automated
Manual

and:

Top Types
Top Tags

These values must be derived from authoritative data.

DO NOT seed the visual's example counts:

248
156
32
28
12
184
64

If the API cannot derive a value honestly:

Unavailable

or omit it.

The Overview is NOT a quality score.

============================================================ 14. ROW SELECTION
============================================================

Selecting a Test Case should open the accepted contextual Inspector.

The user should not have to navigate away merely to inspect a test.

Inspector conceptually shows:

TC-101
Login with valid credentials
Approved

Functional
High

Verify user can log in with valid username and password.

Tabs:

Details
Preconditions
Steps
Expected
More

Information:

Type
Priority
Status
Automation
Owner
Updated
Tags

Primary action:

Edit

The Inspector is contextual inspection/edit entry, not a second
independent Test Case application.

============================================================ 15. OPEN TEST CASE
============================================================

A deliberate open action should eventually lead to the full:

TEST CASE DESIGNER

That is Phase 3 Screen 2.

Do NOT design or implement that screen from assumptions yet.

A separate visual authority will follow.

============================================================ 16. TRACEABILITY
============================================================

Phase 2 established:

Requirement
↓
User Story
↓
Acceptance Criterion

Phase 3 must ultimately connect:

Acceptance Criterion
↓
Test Case

Therefore Test Case must eventually expose real verification
relationships.

Conceptually:

TC-101 verifies:

AC-001
AC-004
AC-007

But only real trace relationships may be shown.

Do not infer linkage from:

names
titles
filenames
tags
source paths

============================================================ 17. COVERAGE VS RESULT
============================================================

Preserve the Phase 2 distinction:

COVERAGE
Does a Test Case verify the Acceptance Criterion?

RESULT
What happened when that Test Case was executed?

A Test Case existing does not mean:

PASS

A Test Case linked to an AC means the AC has verification coverage.

Execution determines result.

============================================================ 18. REUSABILITY
============================================================

Test Cases are reusable definitions.

A Test Case may eventually participate in:

multiple Suites
multiple Test Plans
multiple Executions

Do not duplicate the Test Case merely because it is used in more than
one Plan.

Conceptually:

                    ┌── Suite A

Test Case ──────────┼── Suite B
├── Plan X
└── Plan Y

============================================================ 19. TEST SUITES
============================================================

The navigation includes Test Suites.

A Suite is a reusable grouping of Test Cases.

It is NOT:

- a Test Plan
- an Execution
- a folder pretending to be a Suite

Suite visual/domain authority will follow separately.

============================================================ 20. TEST PLANS
============================================================

The navigation includes Test Plans.

A Test Plan will ultimately define:

WHAT is being tested
WHICH Test Cases/Suites are included
WHERE tests execute
HOW tests execute
WHICH tools/capabilities are required
WHEN / under what quality objective

Do not implement this from Screen 1.

Test Plan visual authority will follow.

============================================================ 21. EXECUTION
============================================================

A Test Case definition is NOT an execution record.

Preserve separation:

Test Case
↓
Test Plan
↓
Execution
↓
Result
↓
Evidence / Defect

The repository currently contains multiple execution concepts identified
during Phase 0.

Do not resolve them from this visual alone.

============================================================ 22. TOOLS
============================================================

Do NOT put Playwright, ZAP, Semgrep, Nuclei, etc. directly into the
primary Test Case navigation.

Tools belong to execution strategy / automation mapping.

Future example:

Functional UI
→ Playwright

Accessibility
→ accessibility capability

API
→ API runner

Security DAST
→ ZAP

Manual UX
→ QEP manual execution

But these mappings must be deliberate and supported by actual
capabilities.

============================================================ 23. SOURCE
============================================================

Test Cases may eventually reference Source context.

But Source remains independently permissioned.

QEP Test Case access
!=
source.read

QEP Test Case edit
!=
source.write

Do not enable Source editing.

Do not enable Terminal.

Do not enable SSH execution.

============================================================ 24. AI — FUTURE DIRECTION
============================================================

Do not implement AI yet.

But preserve the future workflow:

Requirement

- User Stories
- Acceptance Criteria
- authorised Source context
- application/environment information
  ↓
  APZQEP AI
  ↓
  Proposed Test Cases
  ↓
  Human Review
  ↓
  Accept / Modify / Reject
  ↓
  authoritative Test Case records

AI-generated proposals must ultimately use the SAME Test Case domain.

No AI Test Case store.

============================================================ 25. MOBILE
============================================================

The attached mobile layouts are visual authority.

Mobile should transform the desktop workspace into:

Test Case Library
tabs
search/filter
compact Test Case rows/cards
primary Add Test Case action

Selection/open:

Test Case context
Details
Preconditions
Steps
Expected
More

Do not horizontally squeeze the desktop table.

Mobile must remain genuinely usable for reviewing test definitions.

============================================================ 26. MOBILE OVERVIEW
============================================================

Library Overview may become a separate mobile panel/sheet as shown.

It should not permanently consume the narrow Test Case list viewport.

Same data.
Different responsive presentation.

============================================================ 27. LIGHT / DARK STANDARD
============================================================

This is mandatory across APZQEP:

LIGHT
and
DARK

must have identical:

geometry
content
navigation
information hierarchy
actions
Inspector structure
responsive behaviour

Only visual theme changes.

No more light/dark layout divergence.

============================================================ 28. HONESTY
============================================================

The supplied image contains illustrative data.

DO NOT INVENT:

248 Test Cases
156 Approved
184 Automated
64 Manual
owners
tags
timestamps
test types
statuses
coverage
results
automation mappings

Use real data or honest empty/unavailable states.

============================================================ 29. DO NOT IMPLEMENT YET
============================================================

This visual does NOT authorise:

Test Case schema changes
Specification migration
Test Case APIs
Test Case Designer
Test Suites
Test Plans
Execution redesign
tool selection
AI generation
Source write
Terminal
SSH execution
Phase 3 implementation

Record only.

============================================================ 30. RECORD
============================================================

Record supplied visual as:

APZQEP REDESIGN
PHASE 3
SCREEN 1
TEST CASE LIBRARY
VISUAL AUTHORITY

The visual set now begins:

SCREEN 1 — Test Case Library LOCKED
SCREEN 2 — Test Case Designer LOCKED
SCREEN 3 — Test Suites LOCKED
SCREEN 4 — Test Plans LOCKED

DOMAIN RECONCILIATION NEXT
PHASE 3 IMPLEMENTATION NOT AUTHORISED

STOP.

Await domain reconciliation (not implementation).
