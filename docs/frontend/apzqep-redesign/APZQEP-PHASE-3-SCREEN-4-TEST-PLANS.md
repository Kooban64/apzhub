# APZQEP Phase 3 — Screen 4 visual authority (Test Plans / Execution Strategy)

**Record:** APZQEP REDESIGN / PHASE 3 / SCREEN 4 / TEST PLANS / EXECUTION STRATEGY / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-19  
**Authority image:** [visuals/phase-3/04-test-plans-execution-strategy-authority.png](./visuals/phase-3/04-test-plans-execution-strategy-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for APZQEP Test Plans and Execution Strategy. Implementation, when later authorised, must reproduce this geometry.

Phase 2 remains **CLOSED**. Phase 3 implementation is **NOT AUTHORISED**. Domain reconciliation is **NEXT**.

This screen **resolves** the Screen 2 ambiguity: Execution Method / Environment / Target / Tool belong authoritatively to the **Test Plan execution strategy**, not to the reusable Test Case definition.

```text
SCREEN 1 — Test Case Library               LOCKED
SCREEN 2 — Test Case Designer              LOCKED
SCREEN 3 — Test Suites                     LOCKED
SCREEN 4 — Test Plans / Execution Strategy LOCKED

DOMAIN RECONCILIATION                      NEXT
PHASE 3 IMPLEMENTATION                     NOT AUTHORISED
```

---

# APZQEP REDESIGN — PHASE 3 VISUAL AUTHORITY

# SCREEN 4 — TEST PLANS / EXECUTION STRATEGY

Attached visual is the APPROVED DESIGN DIRECTION for APZQEP
Test Plans and Execution Strategy.

DO NOT IMPLEMENT PHASE 3 YET.

Record this visual and specification as design authority only.

Phase 2 remains CLOSED.
Phase 3 implementation remains NOT AUTHORISED.

This screen also resolves an important design ambiguity carried from
Screen 2.

============================================================

1. PURPOSE
   \============================================================

A Test Plan answers:

"What testing will we perform for this quality objective, using which
Test Cases/Suites, how will those tests execute, where will they execute,
and what execution capabilities are required?"

A Test Plan is NOT:

- a Test Case
- a Test Suite
- an Execution/Run
- a CI pipeline
- an automation provider
- a Release entity
- a dashboard

Conceptually:

Test Cases
│
├─────────────┐
▼ ▼
Test Suites Individual Tests
│ │
└──────┬──────┘
▼
TEST PLAN
│
├── Scope
├── Execution Strategy
├── Environment
├── Execution Target
├── Tool / Capability
├── Test Data Source
└── Scheduling / execution context
│
▼
EXECUTION
│
┌──────┴──────┐
▼ ▼
Evidence Defects

============================================================ 2. VISUAL AUTHORITY
============================================================

The attached image controls:

- geometry
- information hierarchy
- Test Plans list
- Plan Overview
- Plan Detail
- Execution Strategy
- responsive transformation
- light/dark equivalence

Light and dark MUST use identical geometry.

Mobile is the responsive form of the same product surface.

Sample values in the visual are illustrative only.

============================================================ 3. APZQEP SHELL
============================================================

Preserve the accepted shell:

APZ | APZQEP | Application selector | Search QEP... | + Create | Bell | User

Application context comes from qep_application.

A Test Plan belongs to the selected authoritative Application.

Do not restore legacy QEP navigation.

============================================================ 4. TEST PLANS LIST
============================================================

Primary workspace:

Test Plans

Purpose:

Plan, organise and execute defined testing activities.

Target views:

All Plans
My Plans
By Status
By Environment
By Release

IMPORTANT:

"By Release" expresses the future target UX.

There is currently NO authoritative Release aggregate.

Therefore do NOT implement fake Release filtering until that domain exists.

It may be omitted or shown honestly unavailable during implementation.

============================================================ 5. PLAN TABLE
============================================================

Target information where repository truth supports it:

ID
Name
Type
Environment
Status
Progress
Execution Window
Owner
Updated

Release/Cycle must NOT become a fake authoritative field simply because
it appears in the visual.

The domain reconciliation must inspect existing Test Plan and Execution
Plan capabilities first.

============================================================ 6. PLAN VS SUITE
============================================================

Lock this distinction:

TEST CASE
Reusable verification definition.

TEST SUITE
Reusable collection/grouping of Test Cases.

TEST PLAN
A deliberate testing scope plus execution strategy.

EXECUTION
A specific execution instance/result.

Therefore:

Suite ≠ Plan
Plan ≠ Run
Suite ≠ Run

A Plan may include:

Suite A
Suite B
TC-105
TC-291

without copying those Test Cases into a new store.

============================================================ 7. EXECUTION STRATEGY — AUTHORITATIVE LOCATION
============================================================

This resolves the ambiguity carried from Screen 2.

Execution Method / Environment / Execution Target / Tool belong
authoritatively to the TEST PLAN EXECUTION STRATEGY, not to the reusable
Test Case definition.

Example:

Test Case:
TC-101 Login with valid credentials

Plan A:
Automated
Playwright
QA
Web / Chrome

Plan B:
Automated
Playwright
Staging
Web / Firefox

Plan C:
Manual
QEP Manual Execution
UAT
Web / Mobile

SAME TEST CASE.

Different execution strategies.

Therefore DO NOT permanently bind TC-101 itself to:

Playwright
QA
Chrome
specific remote host
specific environment

unless an existing automation mapping expresses compatibility rather than
a mandatory execution context.

============================================================ 8. SCREEN 2 RECONCILIATION
============================================================

Screen 2 Test Case Designer visually showed:

Execution Method
Environment
Target

Interpret those fields as:

DEFAULT / CAPABILITY / LATEST CONTEXT where repository truth supports it,

NOT the authoritative execution assignment.

Preferred Test Case concepts are:

Execution capability:
Manual / Automatable / Automated mapping available

Automation mapping:
existing supported automation asset

Compatibility:
where genuinely required

The Plan chooses the actual execution strategy.

The final Phase 3 domain reconciliation must implement this distinction.

============================================================ 9. EXECUTION STRATEGY MODEL
============================================================

A Test Plan may contain multiple strategy groups.

Example:

TEST GROUP / SCOPE METHOD TOOL / CAPABILITY
Functional UI Automated Playwright
API Verification Automated API Runner
Accessibility Automated axe
Security SAST Automated Semgrep
Security DAST Automated ZAP
Performance Automated k6
Manual Exploratory Manual QEP Manual Session

Then:

ENVIRONMENT
QA / Staging / authorised Application environment

EXECUTION TARGET
Web / Chrome
API Gateway
Repository
Remote Host
Web / Mobile
etc.

DATA SOURCE
Managed Test Data
Synthetic Data
Source Code
Dynamic Test Data
Exploratory

Only supported values may exist.

Do not seed these examples.

============================================================
9A. TOOL NAMES ARE NOT PRODUCT CONFIGURATION
============================================================

Playwright, Semgrep, OWASP ZAP, k6, axe, API Runner, etc. in the visual
are **illustrative** of what a configured execution capability _could
resolve to_.

They are **not** fixed product configuration and **not** the product IA.

Product-level concepts are capabilities first:

Browser Automation
API Verification
Accessibility
SAST
DAST
Dependency Analysis
Performance
Manual Verification

Where useful, the configured tool may be shown beside the capability:

Browser Automation → Playwright
SAST → Semgrep
DAST → ZAP

Do not create:

Playwright Test Plan
ZAP Test Plan
Semgrep Test Plan

as different product concepts. APZQEP owns the Plan. Tools execute parts of it.

============================================================ 10. TOOL / CAPABILITY
============================================================

This is where the Owner question:

"Where do we specify which tests/tools need to run?"

is answered.

The Test Plan Execution Strategy is the authoritative orchestration layer.

Tool selection must resolve through existing APZQEP capabilities,
automation mappings and integrations.

============================================================ 11. PROVIDER ABSTRACTION
============================================================

Ordinary APZQEP UX should describe capabilities first.

Where useful, the configured tool may be shown.

Provider/tool names are not the product IA.

============================================================ 12. ENVIRONMENT
============================================================

Environment must use the authoritative Application Environment model
created in Phase 1E.

Do not create a second Test Plan environment catalogue.

Conceptually:

Application
└── Environments
├── Development
├── QA
├── Staging
└── Production where authorised

Plan strategy references those environments.

============================================================ 13. EXECUTION TARGET
============================================================

Execution Target must use the Phase 1E Application Execution Target model.

Possible configured target types may include:

Web
API
Repository
Remote Host

according to actual domain support.

Do not store raw credentials on the Plan.

Remote Host remains:

credentialRef only

No passwords.
No private keys.

============================================================ 14. SSH / REMOTE HOST
============================================================

The existence of Remote Host as an execution target does NOT authorise SSH
execution yet.

The Plan may eventually express:

Execution Target:
QA Remote Host

Working Root:
/opt/application

But Phase 3 visual authority does NOT authorise:

SSH connection execution
arbitrary command execution
shell
Terminal
RCE

Those require their own controlled capability later.

============================================================ 15. SOURCE
============================================================

Source may be an execution input/context.

For example:

Security SAST
Environment/Context:
CI / Source

Target:
Repository

But:

QEP Test Plan access != source.read
QEP Test Plan edit != source.write

Source remains independently permissioned.

============================================================ 16. PLAN CONTENT
============================================================

A Plan should eventually support:

Plan identity
Objective
Scope
Owner
Status

Included Suites
Included Test Cases

Execution Strategy groups

Environment(s)
Execution Target(s)

Test Data strategy

Entry/exit conditions where supported

Execution history

Do not create fields merely because traditional test-management products
have them.

Reconcile against existing Plan/Execution Plan capabilities.

============================================================ 17. PLAN DETAIL
============================================================

The visual shows a Plan Detail mobile/workspace concept.

Target tabs:

Details
Strategy
Suites
Executions

Potentially:

Test Cases
History

depending on the final domain reconciliation.

The Plan Detail must remain an operational work surface, not a dashboard.

============================================================ 18. EXECUTION STRATEGY DETAIL
============================================================

The Strategy tab should clearly answer for each group:

WHAT
Functional UI

METHOD
Automated

CAPABILITY / TOOL
Browser Automation / Playwright

WHERE
QA

TARGET
Web / Chrome

DATA
Managed Test Data

OWNER
where supported

This must be readable by a QA lead without understanding provider architecture.

============================================================ 19. PLAN PROGRESS
============================================================

Progress must be derived from actual execution state.

Do not allow a user to type:

65%

Conceptually it may derive from:

planned executions
completed executions
required tests
executed tests

The exact calculation must be established during domain reconciliation.

No fake progress bars.

============================================================ 20. PLAN STATUS
============================================================

Visual examples include:

Planned
Not Started
In Progress
Completed

Do not blindly create this enum.

Reconcile with existing qep-plans and execution-plan lifecycle.

Use one coherent lifecycle.

============================================================ 21. EXECUTION WINDOW
============================================================

The visual shows execution windows.

This is useful but must not be confused with Release.

A Plan may have:

plannedStart
plannedEnd

where supported.

No Release aggregate is created merely to give the Plan dates.

============================================================ 22. RELEASE
============================================================

Release remains a genuine known gap.

DO NOT create a Release entity in Phase 3.

DO NOT bind Plans to arbitrary release strings as though they were an
authoritative Release.

If existing historical strings exist:

display them honestly as legacy/reference context only.

Release aggregate design remains later work.

============================================================ 23. TEST DATA
============================================================

Execution Strategy should be capable of describing the data requirement.

Examples conceptually:

Managed Test Data
Synthetic
Fixture
Dynamic
External
None

Do not put secrets or sensitive test data values directly into the Plan
when a reference can be used.

The domain lock must determine whether existing Test Data capability exists
before adding anything.

============================================================ 24. MANUAL TESTING
============================================================

Manual testing is first-class.

A Plan may contain:

Manual Functional
Manual UX
Manual Exploratory

Do not make automation mandatory.

The actual manual Execution Workspace will be designed in a later phase.

Exploratory remains a known domain gap and must not be invented here.

============================================================ 25. AUTOMATION
============================================================

Existing APZQEP automation capability must be reused.

Conceptually:

Test Case
↓
Automation Mapping
↓
Plan Execution Strategy
↓
Execution

Do not duplicate automation scripts inside the Test Plan.

Do not turn the Test Plan into CI YAML.

============================================================ 26. SUITE MEMBERSHIP
============================================================

Screen 3 established:

Suite = reusable grouping of Test Cases.

Plan may reference a Suite.

At execution planning time, the system must be able to resolve the Suite's
membership deterministically.

The domain lock must decide whether execution snapshots Suite membership at
Plan/Run creation so historical results do not change when the Suite later
changes.

Do not decide this through UI code.

============================================================ 27. EXECUTION SNAPSHOT PRINCIPLE
============================================================

Carry this into domain reconciliation:

A historical execution must remain historically true.

If:

Suite A contains TC-1, TC-2, TC-3

and Plan P executes it,

then Suite A later adds TC-4,

the old execution must NOT suddenly claim TC-4 was part of that execution.

The final domain design must preserve execution scope snapshots or equivalent
historical integrity.

============================================================ 28. AI — FUTURE
============================================================

Do not implement AI in Phase 3.

Future flow:

Requirements
Stories
Acceptance Criteria
Source
Application context
existing Test Cases
↓
APZQEP AI
↓
Proposed Test Plan
Proposed Test Cases
Proposed Suite composition
Proposed Execution Strategy
Suggested capabilities/tools
↓
Human Review
↓
Authoritative records

No AI Plan store.

No silent AI execution.

============================================================ 29. OVERVIEW PANELS
============================================================

The visual shows:

Plans Overview
Execution by Environment
Execution by Type

These are derived contextual summaries.

Do not seed sample counts.

Do not invent pie/donut data.

If there is no authoritative aggregation:

Unavailable
or omit.

============================================================ 30. MOBILE
============================================================

Mobile must preserve the same information model.

Primary flow:

Test Plans
→ Plan
→ Strategy
→ Suites
→ Executions

Do not squeeze the desktop table.

Execution Strategy must be readable as compact strategy cards/rows.

Light/dark mobile geometry must match.

============================================================ 31. HONESTY
============================================================

The image contains illustrative:

TP-001
Authentication Regression
v1.4.0
owners
dates
percentages
environments
tools
counts
charts

NONE are authorised data.

Use real data only.

============================================================ 32. DO NOT IMPLEMENT YET
============================================================

This instruction does NOT authorise:

Plan schema changes
Execution Plan replacement
Test Case migration
Suite membership changes
execution redesign
Release entity
SSH execution
Terminal
Source write
AI
Phase 3 implementation

Record only.

============================================================ 33. DOMAIN QUESTIONS NOW LOCKED FOR RECONCILIATION
============================================================

After this screen, Phase 3 domain reconciliation MUST resolve:

1. Existing Specification → product Test Case
2. First-class Action / Test Data / Expected Result steps
3. Test Case lifecycle/type vocabulary
4. Existing Suite → Test Case membership
5. Suite human-readable key collision with Specification TS-*
6. Existing Test Plan vs Execution Plan responsibilities
7. Test Case execution capability vs Plan execution assignment
8. Automation mapping ownership
9. Environment reference → Phase 1E Environment
10. Execution Target → Phase 1E target
11. Test Data model/reference
12. Plan → Suite/Test Case membership
13. Historical execution scope snapshot
14. AC → Test Case → Execution/Evidence/Defect traceability
15. Existing dual execution model implications

Do not solve these by creating parallel stores.

============================================================ 34. RECORD
============================================================

Record supplied visual as:

APZQEP REDESIGN
PHASE 3
SCREEN 4
TEST PLANS / EXECUTION STRATEGY
VISUAL AUTHORITY

Phase 3 visual set:

SCREEN 1 — Test Case Library LOCKED
SCREEN 2 — Test Case Designer LOCKED
SCREEN 3 — Test Suites LOCKED
SCREEN 4 — Test Plans / Execution Strategy LOCKED

DOMAIN RECONCILIATION NEXT
PHASE 3 IMPLEMENTATION NOT AUTHORISED

STOP.

Do not implement Phase 3.
