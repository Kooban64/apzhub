# APZQEP Phase 5 — domain lock

**Status:** LOCKED  
**Date:** 2026-08-20  
**Authority:** Owner decisions on the accepted Phase 5 domain reconciliation.  
**Implementation:** **NOT AUTHORISED** until a finite implementation inventory is reviewed and explicitly authorised.

Reconciliation (accepted): [APZQEP-PHASE-5-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-5-DOMAIN-RECONCILIATION-REPORT.md)  
Visuals: Screens [1](./APZQEP-PHASE-5-SCREEN-1-EXPLORATORY-SESSIONS.md)–[4](./APZQEP-PHASE-5-SCREEN-4-UI-UX-VERIFICATION-WORKSPACE.md) LOCKED.

This lock is subordinate to the Constitution and foundation documents 001–029. It does not replace certified QEP aggregates. Phase 3 Test Plan / Test Case / Suite boundaries remain intact. Phase 4 execution engines remain intact.

Option B (extend Test Plan into UI/UX planning) is **rejected**.

---

# OWNER DECISION — APZQEP PHASE 5 DOMAIN LOCK

Phase 5 Domain Reconciliation is ACCEPTED.

The following Owner decisions are now AUTHORITATIVE.

============================================================

1. EXPERIENCE PLAN
   \============================================================

DECISION:

NEW LIGHTWEIGHT AGGREGATE — APPROVED

Create a dedicated Experience Plan domain concept when Phase 5
implementation is authorised.

It is NOT:

a replacement for Test Plan
a subtype pretending to be a Test Plan
an Execution Plan
a Test Case container
a second generic testing plan system

Its bounded responsibility is:

structured UI/UX experience-verification planning.

It defines only the concepts required by the locked Screen 3 and
Screen 4 experience:

Application
Environment context
mission/objective
scope
verification disciplines
experience contexts
verification criteria
ownership/status/lifecycle context

Do not copy the Phase 3 Test Plan model.

Do not duplicate:

Test Case membership
Suite membership
Execution Strategy
execution runner configuration

unless a future explicit relationship requires it.

============================================================ 2. TWO WORKFLOW ROOTS
============================================================

DECISION:

TWO DISTINCT WORKFLOW ROOTS — APPROVED

Root A:

EXPLORATORY SESSION

Root B:

UI/UX VERIFICATION ACTIVITY

Do NOT create one generic quality-session root with:

type = exploratory | ui_ux

The workflows have different semantics.

============================================================ 3. EXPLORATORY SESSION
============================================================

Exploratory Session is a NEW aggregate.

Its bounded responsibility is:

charter-driven exploratory quality investigation.

Conceptual ownership:

Application
Environment
Charter
Areas to Explore
Tester
Lifecycle
Timing
Shared quality capture relationships
Activity/history

It does NOT own:

Test Cases
Test Case steps
Pass/Fail execution
Suite execution
Evidence binary/storage authority
Defect authority

============================================================ 4. EXPLORATORY CHARTER
============================================================

Charter is owned by / extends the Exploratory Session aggregate.

Do NOT create an independent Charter aggregate unless implementation
analysis proves a technical necessity.

Conceptually:

Mission / Objective
Scope
Areas to Explore

Areas to Explore are prompts, not Test Case steps.

============================================================ 5. EXPERIENCE PLAN
============================================================

Experience Plan is a NEW lightweight aggregate.

Its bounded responsibility is:

what structured experience verification should be performed.

It may define:

Application
Environment context
Mission / Objective
Scope
Verification Disciplines
Experience Contexts
Verification Criteria
Owner
Lifecycle

It does NOT itself represent live verification.

============================================================ 6. UI/UX VERIFICATION ACTIVITY
============================================================

UI/UX Verification Activity is a NEW workflow aggregate.

It represents:

a live verification of an Experience Plan.

It is NOT:

qep-test-execution
qep-execution-workspace
qep-verification
Execution Plan

It consumes the authoritative Experience Plan and records the actual
verification activity required by Screen 4.

============================================================ 7. SHARED QUALITY CAPTURE
============================================================

The following are shared Phase 5 quality-capture primitives:

OBSERVATION
ISSUE
NOTE

They may be used by:

Exploratory Session
UI/UX VERIFICATION ACTIVITY

Do not duplicate them per workflow.

============================================================ 8. OBSERVATION
============================================================

Observation is NEW.

It means:

something deliberately recorded by a tester during quality activity.

Observation does NOT imply:

failure
Defect
Issue
Test Case result

Existing Test Execution/QI uses of the word "observation" remain
unchanged.

Do not migrate them.

Do not reinterpret them as the Phase 5 Observation object.

============================================================ 9. ISSUE
============================================================

Issue is NEW.

Issue means:

an Observation or concern deliberately elevated for review.

Issue ≠ Defect.

An Issue may later be:

dismissed
resolved
linked to existing Defect
promoted through human-controlled creation of a Defect

Existing Defect remains the only Defect SoR.

============================================================ 10. NOTE
============================================================

Note is NEW lightweight quality-capture data.

Note remains distinct from:

Observation
Issue
Evidence
Defect

Do not create unnecessary workflow around Notes.

============================================================ 11. UI/UX CRITERION
============================================================

UI/UX Criterion is NEW.

It belongs to Experience Plan semantics.

It represents a structured experience-verification condition.

It is NOT automatically:

Acceptance Criterion
Test Case
Test Case step

It may later trace to those objects where meaningful.

Do not distort the existing Test Case model.

============================================================ 12. CRITERION RESULT
============================================================

Criterion Result is NEW Phase 5 verification semantics.

It must remain separate from Test Execution result semantics.

Do not map it automatically onto:

Passed
Failed
Blocked
Not Run

Use the smallest vocabulary justified by the locked workspace and
repository reconciliation.

Final enum naming may be established during implementation, but it
must preserve the distinction between:

verification completion/state
and
quality concern discovered.

============================================================ 13. VERIFICATION DISCIPLINE
============================================================

EXTEND existing vocabulary/patterns where appropriate.

Product concepts remain:

Functional UX
Responsive
Usability
Accessibility
Visual

Do not migrate existing Specification types.

Existing:

usability
accessibility
mobile
web
desktop

remain Test Case classifications.

============================================================ 14. EXPERIENCE CONTEXT
============================================================

Experience Context is NEW.

It represents the customer experience surface being verified.

Potential dimensions:

device class
viewport width
viewport height
orientation
browser
browser version
operating system
device profile

It is NOT:

qep_application_environment
Execution Target
managed_runner
ci_pipeline
remote_host

Environment and Experience Context remain separate concepts.

============================================================ 15. VIEWPORT MATRIX
============================================================

DERIVED ONLY.

Do NOT create a Viewport Matrix table.

Derive Screen 4 matrix from:

planned Experience Contexts +
actual UI/UX Verification Activity/results.

============================================================ 16. PROGRESS
============================================================

DERIVED ONLY.

Do not persist fabricated progress percentages.

Exploratory progress:

derive from objectively completed Areas to Explore where applicable.

UI/UX progress:

derive from planned/applicable Criteria and Experience Context
verification.

Progress means:

work completion

not:

quality
readiness
UX score
accessibility score.

============================================================ 17. LIFECYCLE
============================================================

EXTEND existing APZQEP lifecycle patterns.

Do not reuse Test Execution tables.

Implement only lifecycle states genuinely required by the locked
Phase 5 workflows.

Pause/resume behaviour should follow established execution/session
patterns without sharing the wrong aggregate.

============================================================ 18. ACTIVITY / HISTORY
============================================================

EXTEND existing audit/activity patterns.

Do not create a duplicate generic history engine.

History must be based on real recorded events.

No synthetic history derived from current state.

============================================================ 19. EVIDENCE
============================================================

Existing Evidence SoR is AUTHORITATIVE.

EXTEND relationships only.

Evidence may attach to appropriate Phase 5 context such as:

Exploratory Session
Observation
Issue
UI/UX Verification Activity
Criterion
Experience Context

Do not create another Evidence store.

============================================================ 20. DEFECT
============================================================

Existing Defect SoR is AUTHORITATIVE.

EXTEND relationships only.

Issue → Defect creation/linking is deliberate and human-controlled.

No automatic Defect creation.

============================================================ 21. APPLICATION
============================================================

Reuse:

qep_application

All new Phase 5 workflow roots must be Application-bound.

No unbound new Phase 5 records.

============================================================ 22. ENVIRONMENT
============================================================

Reuse:

qep_application_environment

Extend only where immutable verification-time context requires it.

Do not create another Environment authority.

============================================================ 23. TRACEABILITY
============================================================

Extend existing traceability.

Allow meaningful optional relationships to existing:

Requirement
User Story
Acceptance Criterion
Test Case
Suite
Test Plan
Evidence
Defect

Do not require Exploratory Session or Experience Plan to originate
from these objects.

============================================================ 24. AUTHZ
============================================================

Extend existing QEP permission families.

Do not create the nine-role catalogue in Phase 5.

Server-side AuthZ remains authoritative.

============================================================ 25. TENANT / APPLICATION ISOLATION
============================================================

Must remain:

TENANT ISOLATION: PASS
APPLICATION ISOLATION: PASS

Every Phase 5 relationship must validate tenant and Application
boundaries server-side.

============================================================ 26. SOURCE
============================================================

SOURCE INDEPENDENCE remains PASS.

Phase 5 grants neither:

source.read
nor
source.write.

============================================================ 27. EXPLICITLY PROHIBITED DOMAIN OBJECTS
============================================================

Do NOT create:

qep_ui_ux_execution

a second Test Plan system

a third generic execution store

a Viewport Matrix table

another Evidence store

another Defect store

another Application store

another Environment store

a generic quality_session replacing both workflow roots

a migration of existing Test Execution observations into Phase 5
Observations.

============================================================ 28. DOMAIN SHAPE
============================================================

The approved conceptual shape is:

EXPLORATORY SESSION
|
+-- Charter
+-- Areas to Explore
|
+---- shared Observation
+---- shared Issue
+---- shared Note
+---- existing Evidence
+---- existing Defect

EXPERIENCE PLAN
|
+-- Disciplines
+-- Experience Contexts
+-- Criteria
|
+--> UI/UX VERIFICATION ACTIVITY
|
+-- Criterion Results
+-- Experience Context activity
|
+---- shared Observation
+---- shared Issue
+---- shared Note
+---- existing Evidence
+---- existing Defect

============================================================ 29. DOMAIN LOCK STATUS
============================================================

```text
PHASE 5 DOMAIN RECONCILIATION:
ACCEPTED

EXPERIENCE PLAN:
NEW LIGHTWEIGHT AGGREGATE — APPROVED

WORKFLOW ROOTS:
TWO — APPROVED

EXPLORATORY SESSION:
NEW

UI/UX VERIFICATION ACTIVITY:
NEW

SHARED QUALITY CAPTURE:
APPROVED

TE OBSERVATIONS:
REMAIN TE-ONLY

VIEWPORT MATRIX:
DERIVED

PROGRESS:
DERIVED

EVIDENCE:
EXISTING SOR

DEFECT:
EXISTING SOR

APPLICATION:
EXISTING SOR

ENVIRONMENT:
EXISTING SOR

THIRD EXECUTION STORE:
PROHIBITED

SECOND TEST PLAN SYSTEM:
PROHIBITED
```

============================================================ 30. NEXT STEP
============================================================

Do NOT implement from this lock.

Finite inventory (for Owner review, not an implementation authorisation):
[APZQEP-PHASE-5-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-5-IMPLEMENTATION-INVENTORY.md)

Do not implement until that inventory has been reviewed and explicitly
authorised by Owner.
