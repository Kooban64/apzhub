# APZQEP Phase 4 — Screen 4 visual authority (Execution Result / Evidence / Defect / Retest)

**Record:** APZQEP REDESIGN / PHASE 4 / SCREEN 4 / EXECUTION RESULT / EVIDENCE / DEFECT / RETEST / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-19  
**Authority image:** [visuals/phase-4/04-execution-result-evidence-defect-retest-authority.png](./visuals/phase-4/04-execution-result-evidence-defect-retest-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for APZQEP Execution Result / Evidence / Defect / Retest. It closes the operational quality loop. It is **not** automation-specific: the same product screen must also work for manually executed Test Cases.

The generated board contains an incorrect explanatory heading referring to “SCREEN 3 — AUTOMATED EXECUTION DETAIL”. **Ignore that heading.** Product name for this authority is **Execution Result / Evidence / Defect / Retest**.

Phase 4 visual design is **COMPLETE** after this recording. Domain reconciliation is **NEXT**. Phase 4 implementation is **NOT AUTHORISED**.

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

# SCREEN 4 — EXECUTION RESULT / EVIDENCE / DEFECT / RETEST

Phase 4 visual register:

SCREEN 1 — Executions / Runs
LOCKED

SCREEN 2 — Manual Test Execution Workspace
LOCKED

SCREEN 3 — Automated Execution Detail
LOCKED

SCREEN 4 — Execution Result / Evidence / Defect / Retest
CURRENT (now LOCKED)

DOMAIN RECONCILIATION
NEXT — AFTER THIS VISUAL IS RECORDED

PHASE 4 IMPLEMENTATION
NOT AUTHORISED

The supplied image establishes the approved visual direction for
SCREEN 4 — EXECUTION RESULT / EVIDENCE / DEFECT / RETEST.

IMPORTANT:

The generated board contains an incorrect explanatory heading referring
to "SCREEN 3 — AUTOMATED EXECUTION DETAIL".

IGNORE THAT HEADING.

This image is authority for:

SCREEN 4
EXECUTION RESULT / EVIDENCE / DEFECT / RETEST.

Record only.

DO NOT IMPLEMENT.

============================================================

1. PURPOSE
   \============================================================

Screen 4 answers:

"What exactly happened when this Test Case was executed,
what proves the result,
what defect resulted,
and what happened when we tested it again?"

This is the deepest quality-verification view in Phase 4.

It closes the operational chain:

Requirement
↓
User Story
↓
Acceptance Criterion
↓
Test Case
↓
Execution
↓
Step Results
↓
Evidence
↓
Defect
↓
Fix
↓
Retest
↓
Verified

============================================================ 2. THIS IS AN EXECUTED TEST CASE RESULT
============================================================

The primary object shown to the user is an executed Test Case result
inside an Execution.

Conceptually:

Execution EX-...
↓
Executed Test Case TS-...
↓
Snapshot
↓
Step Results
↓
Outcome

Do not create a new generic "Result" SoR merely because the screen is
called Execution Result.

============================================================ 3. CUSTOMER LANGUAGE
============================================================

Use product language:

Execution
Test Case
Step
Result
Evidence
Defect
Retest

Do not expose internal package names as product concepts.

The two execution engines remain implementation details beneath the
customer experience.

============================================================ 4. DESKTOP COMPOSITION
============================================================

The visual establishes a detailed investigation workspace.

Primary header:

Test Case ID + Test Case name
Result badge

Execution context beneath:

Execution
Plan
Environment
Type
Method
Executed
Duration
Owner

Primary tabs:

Summary
Steps
Evidence
Defects
History
Linked Records

The exact count badges must come from real data.

============================================================ 5. SUMMARY VIEW
============================================================

Summary should allow a user to understand the result without opening
multiple systems.

Primary areas:

Test Case Context
Execution Summary
Immutable Snapshot
Outcome Overview
Step Results
Failure Details
Evidence / Artifacts
Linked Defect status

Do not turn this into another generic dashboard.

============================================================ 6. TEST CASE CONTEXT
============================================================

Show relevant definition context such as:

Suite
Priority
Type
Automation Capability
Automation Mapping
Preconditions
Acceptance Criteria

where backed by authoritative data.

This context is READ-ONLY.

Do not edit Test Case definition from historical execution result.

============================================================ 7. ACCEPTANCE CRITERIA
============================================================

Show the Acceptance Criteria verified by the executed Test Case.

This allows the user to understand:

"What requirement behaviour did this failed/passed result actually
verify?"

Use Phase 2/3 traceability.

Do not create execution-local Acceptance Criterion records.

============================================================ 8. IMMUTABLE EXECUTION SNAPSHOT
============================================================

This is now a REQUIRED product concept.

Historical result must preserve what was actually executed.

At minimum reconcile:

Test Case identity
Test Case version/reference
Suite/scope context where applicable
Steps
Action
safe Test Data reference/description
Expected Result
Plan context
Strategy context where required

The user must not see today's changed Test Case definition presented as
historical truth.

============================================================ 9. SNAPSHOT VISUAL TREATMENT
============================================================

The visual deliberately presents Snapshot as an explicit trustworthy
concept.

Use language such as:

Snapshot
Immutable
Sealed

only where repository/domain truth supports those guarantees.

Do not label something "sealed" if it can still be mutated.

============================================================ 10. DEFINITION CHANGE AFTER EXECUTION
============================================================

Required historical behaviour:

Execution occurs against Test Case v1

later:

Test Case definition changes to v2

historical execution must still show:

v1

It must NOT silently render v2.

============================================================ 11. SCOPE CHANGE AFTER EXECUTION
============================================================

Likewise:

Suite at execution time:

TS-10
TS-11
TS-12

Suite later becomes:

TS-10
TS-11
TS-12
TS-13

historical execution scope remains the original scope.

This closes the snapshot limitation carried from Phase 3.

============================================================ 12. STEP RESULTS
============================================================

Steps must clearly distinguish:

Definition snapshot:

Action
Test Data
Expected Result

from:

Execution result:

Actual Result
Result
Duration
Evidence
Defect relationship

Do not contaminate Test Case definition with execution-state fields.

============================================================ 13. STEP RESULT STATES
============================================================

The visual uses:

Passed
Failed
Blocked
Not Run

These are product-direction concepts.

Domain reconciliation must map them against authoritative existing
execution-engine states.

Do not invent a third result vocabulary.

============================================================ 14. FAILED STEP
============================================================

Selecting a failed step should expose failure detail.

Useful information may include:

Action
Expected Result
Actual Result
Failure message
Error information
Captured timestamp
Duration
Evidence
Defect

depending on authoritative execution data.

============================================================ 15. AUTOMATED FAILURE
============================================================

For automated execution, provider diagnostic information may include:

error message
request/response reference
stack/trace reference
provider result
automation artefact

APZQEP should normalise the quality meaning while preserving useful
technical detail.

Do not copy an entire provider dashboard into this screen.

============================================================ 16. MANUAL FAILURE
============================================================

The same product screen must also work for manually executed Test Cases.

Manual failure may show:

tester observation
Actual Result
screenshots/video
notes
linked Defect

Therefore Screen 4 is not automation-specific.

============================================================ 17. EVIDENCE TAB
============================================================

Evidence must use the existing Evidence SoR.

Potential evidence:

screenshot
video
document
log
trace
report
other supported artefact

Do not create a second Evidence store.

============================================================ 18. EVIDENCE TRACEABILITY
============================================================

Evidence should be traceable to the most precise authoritative context
available.

Conceptually:

Evidence
→ Execution
→ Executed Test Case

and where supported:

Evidence
→ Execution Step

This lets APZQEP answer:

"What proves this particular result?"

============================================================ 19. EVIDENCE INTEGRITY
============================================================

Preserve existing Evidence provenance, hashing/sealing and access
behaviour.

Do not weaken Evidence integrity to simplify this UI.

============================================================ 20. PROVIDER ARTIFACTS
============================================================

Automation providers may produce:

screenshots
videos
traces
reports
logs

Domain reconciliation must decide whether each artefact is:

ingested into Evidence
referenced by Evidence
or retained as execution artefact metadata

Do not blindly duplicate provider data.

============================================================ 21. DEFECT TAB
============================================================

Defects use the existing Defect SoR.

Show defects linked to this executed Test Case / execution.

Useful concepts:

Defect ID
Title
Severity
Status
Created
Owner/assignee where authoritative

Do not add a separate execution-defect domain.

============================================================ 22. DEFECT CREATION
============================================================

From a failed result, the user may create/link a Defect.

This action should eventually carry authoritative context such as:

Application
Execution
Test Case
Step
Expected Result
Actual Result
Environment
Evidence

The tester must be able to review the Defect before creation.

Do not automatically create a Defect merely because a Test Case failed.

============================================================ 23. EXISTING DEFECT LIFECYCLE
============================================================

Preserve the existing lifecycle:

new
→ triaged
→ assigned
→ in_progress
→ fixed
→ ready_for_retest
→ verified
→ closed

plus existing terminal/exception states.

Do not replace this lifecycle for Phase 4.

============================================================ 24. DEFECT FIX DOES NOT CHANGE HISTORY
============================================================

This is critical.

Original execution:

FAILED

Defect later:

FIXED

must NOT mutate the original historical execution into:

PASSED.

Historical result remains Failed.

============================================================ 25. RETEST
============================================================

Retest is now explicitly part of Screen 4.

Conceptually:

Failed Execution Result
↓
Defect
↓
Fixed
↓
Ready for Retest
↓
Create Retest
↓
NEW Execution
↓
Passed / Failed / Blocked
↓
Defect Verified or returned to workflow

Do not overwrite the original execution.

============================================================ 26. RETEST IS A NEW EXECUTION
============================================================

Required product rule:

RETEST
=

NEW EXECUTION

with durable relationship to the prior failure/Defect.

Conceptually:

EX-100
TS-47
FAILED
↓
DEF-25
↓
FIXED
↓
RETEST
↓
EX-116
TS-47
PASSED

Both EX-100 and EX-116 remain historical truth.

============================================================ 27. RETEST RELATIONSHIP
============================================================

Domain reconciliation must determine the durable relationship.

At minimum we need to be able to answer:

What execution is this retesting?

Which Defect triggered the retest?

Which Test Case was retested?

What was the new result?

Do not create a separate Retest SoR unless repository analysis proves
that necessary.

Preferred conceptual model:

Execution
→ relationship/type
→ previous Execution / Defect.

============================================================ 28. CREATE RETEST ACTION
============================================================

The visual includes:

Create Retest

This establishes the product concept.

It does NOT authorise implementation yet.

Domain reconciliation must determine:

eligibility
scope
snapshot
Plan relationship
strategy
environment
execution engine
Defect relationship

before implementation.

============================================================ 29. RETEST ELIGIBILITY
============================================================

Do not allow arbitrary records to be called retests.

A retest should originate from real quality context such as:

failed verification
linked Defect
Defect ready_for_retest

Exact rule comes during reconciliation.

============================================================ 30. RETEST SCOPE
============================================================

A retest may not always mean rerunning an entire Plan.

Potential scopes include:

failed Test Case
specific affected Test Cases
Suite
broader Plan scope

Do not decide this from the mock-up alone.

Domain reconciliation must inspect existing execution capabilities.

============================================================ 31. RETEST STRATEGY
============================================================

A retest should not blindly inherit today's latest execution strategy.

The user must eventually know what environment/method/target will be used.

Reconciliation must determine:

inherit prior strategy
use current Plan strategy
explicitly choose strategy
or controlled combination

No implementation yet.

============================================================ 32. RETEST RESULT
============================================================

If retest passes:

new Execution Result = Passed

original Execution Result = Failed

Defect may become eligible for:

verified

according to existing Defect workflow.

Do not automatically close the Defect solely because an execution
passed unless existing workflow explicitly authorises it.

============================================================ 33. RETEST FAILURE
============================================================

If the retest fails:

new Execution Result = Failed

Defect should remain/re-enter the appropriate lifecycle state according
to authoritative Defect behaviour.

Do not erase previous retest history.

============================================================ 34. RERUN VS RETEST
============================================================

Lock the conceptual distinction:

RERUN

Repeat an execution, often because of:

flaky automation
infrastructure failure
environment issue
diagnostic need

RETEST

Verify quality behaviour after a defect/fix cycle.

Both create NEW executions.

They are not necessarily the same business action.

============================================================ 35. HISTORY TAB
============================================================

History should help reconstruct what happened.

Potential events:

execution created
execution started
step result recorded
execution completed
evidence attached
Defect created
Defect fixed
ready for retest
retest created
retest completed
Defect verified

Only show events supported by real audit/event data.

Do not fabricate timeline events.

============================================================ 36. LINKED RECORDS
============================================================

Linked Records provides cross-domain traceability without overloading
Summary.

Potential links:

Requirement
User Story
Acceptance Criterion
Test Case
Suite
Test Plan
Execution
Evidence
Defect
Retest Execution

Only display real relationships.

============================================================ 37. QUALITY CHAIN
============================================================

This screen should eventually make the APZQEP chain inspectable:

Requirement
→ Story
→ AC
→ Test Case
→ Execution
→ Result
→ Evidence
→ Defect
→ Retest
→ Verified

This is one of the central differentiators of APZQEP.

============================================================ 38. RESULT DOES NOT EQUAL COVERAGE
============================================================

Preserve prior semantics.

Passed Test Case:

does not automatically mean all Acceptance Criteria are covered.

Failed Test Case:

does not remove its traceability relationship.

Coverage and execution outcome remain separate.

============================================================ 39. OUTCOME OVERVIEW
============================================================

The visual includes derived outcome summaries.

Potential dimensions:

Passed steps
Failed steps
Blocked steps
Not Run steps

plus completion.

These are derived.

Do not store another editable score.

============================================================ 40. MOBILE
============================================================

Mobile must support real investigation.

Do not squeeze the desktop workspace.

The visual establishes focused views:

Summary
Steps
Step Detail
Evidence
Defects

and later Retest/History as appropriate.

============================================================ 41. MOBILE SUMMARY
============================================================

Prioritise:

Execution
Test Case
Result
Plan
progress/outcome
navigation to Steps / Evidence / Defects

The user should understand the quality outcome immediately.

============================================================ 42. MOBILE STEPS
============================================================

Show a clear vertical list:

step number
Action
Result

Selecting a step opens its detail.

============================================================ 43. MOBILE STEP DETAIL
============================================================

Show:

Action
Expected Result
Actual Result
Result
Error/failure detail
Evidence

This is read/investigation mode.

It is distinct from Screen 2's active manual execution workspace.

============================================================ 44. MOBILE EVIDENCE
============================================================

Evidence should be practical to inspect from mobile.

Show:

type
name/reference
size/time where useful
relationship

Use existing secure evidence access.

============================================================ 45. MOBILE DEFECT
============================================================

Show the linked Defect succinctly:

ID
Title
Severity
Status

and allow navigation into the existing Defect experience.

============================================================ 46. LIGHT / DARK
============================================================

Desktop light and dark must have IDENTICAL GEOMETRY.

Mobile light and dark must have IDENTICAL GEOMETRY.

Theme changes treatment only.

============================================================ 47. SAMPLE DATA
============================================================

ALL values in the supplied visual are illustrative.

Including:

EX-1021
TS-47
DEF-245
Sprint Regression
Authentication Suite
QA
Playwright
Managed Runner
AC-*
timestamps
counts
error messages
URLs
screenshots
percentages

Do not seed them.

Do not treat them as domain facts.

============================================================ 48. TWO EXECUTION ENGINES
============================================================

Preserve both existing execution engines.

Screen 4 must ultimately work over both where relevant.

Do not merge them merely to simplify UI.

Do not create a third execution store.

============================================================ 49. SOURCE / SSH / TERMINAL
============================================================

Nothing in this visual authorises:

Source write
SSH execution
Terminal

Those remain separate future decisions.

============================================================ 50. AI
============================================================

AI remains out of Phase 4 implementation.

Do not add:

AI failure analysis
AI defect generation
AI evidence interpretation
AI retest selection

from this visual.

Those may be valuable later, but are not authorised now.

============================================================ 51. DOMAIN RECONCILIATION — NEXT
============================================================

Once this Screen 4 visual is recorded, all four Phase 4 visual authorities
are locked.

The NEXT step is repository/domain reconciliation.

NOT implementation.

Reconciliation must examine actual existing execution, evidence, defect,
automation and Phase 3 snapshot capabilities against the four visuals.

============================================================ 52. REQUIRED DOMAIN RECONCILIATION QUESTIONS
============================================================

At minimum answer:

EXECUTION AUTHORITY

1. Which engine owns manual Test Case execution?
2. Which engine owns automated execution?
3. How are both represented as one customer Execution?
4. Is a composition/read-model required?

SCOPE / SNAPSHOT

5. How is Plan scope instantiated?
6. How is Suite membership snapshotted?
7. How is Test Case definition snapshotted?
8. How are steps snapshotted?
9. How is Plan Strategy snapshotted?
10. How is Environment snapshotted/referenced?
11. How is safe Test Data snapshotted/referenced?
12. Can historical snapshot records mutate?

MANUAL EXECUTION

13. What are authoritative step-result states?
14. How are Actual Result and result persisted?
15. Can completed steps be reopened?
16. How does pause/resume work?
17. How is overall Test Case outcome derived?
18. How is overall Execution outcome derived?

AUTOMATION

19. How are provider runs correlated to Execution?
20. How are provider results normalised?
21. How are logs stored/referenced?
22. How are provider artefacts mapped to Evidence?
23. How are automated failures mapped to Test Case/step?

EVIDENCE

24. Can Evidence bind to Execution?
25. Can Evidence bind to execution step?
26. What provenance/sealing behaviour already exists?
27. What extension is actually required?

DEFECT

28. How does manual execution raise Defect?
29. How does automated execution link Defect?
30. Can Defect link to execution step?
31. What Phase 3 defect-link tables already exist?
32. What remains unproven vs genuinely missing?

RETEST

33. What durable relationship represents Retest?
34. Is Retest simply a new Execution with relationship metadata?
35. How is prior Execution linked?
36. How is triggering Defect linked?
37. How is retest scope determined?
38. How is retest strategy determined?
39. What happens when retest passes?
40. What happens when retest fails?
41. How is Defect verification kept human-controlled?

RERUN

42. What durable relationship represents Rerun?
43. How is Rerun distinguished from Retest?

CUSTOMER EXPERIENCE

44. What API/read-model powers Executions Screen 1?
45. What API powers manual Screen 2?
46. What API powers automated Screen 3?
47. What API powers Screen 4?
48. How do we prevent internal execution architecture leaking into UX?

SECURITY

49. How are test-data secrets prevented from entering definitions/snapshots?
50. How is Evidence access controlled?
51. How is tenant/application isolation preserved?

MIGRATION

52. What schema changes are genuinely required?
53. What existing certified tables can be extended?
54. What compatibility adapters are required?
55. Is any historical data migration required?
56. Can all changes remain additive?

============================================================ 53. NO DOMAIN DECISIONS FROM VISUAL ALONE
============================================================

Do not answer those questions by inventing a greenfield architecture.

Inspect repository truth first.

Preference remains:

EXTEND
RECONCILE
COMPOSE

rather than:

REPLACE
DUPLICATE
PARALLEL STORE.

============================================================ 54. DO NOT IMPLEMENT
============================================================

This instruction does NOT authorise:

Screen 4 implementation
Phase 4 implementation
schema migrations
execution changes
Evidence changes
Defect changes
Retest
Rerun
provider integration
SSH
Terminal
Source write
Release
AI

Record visual only.

============================================================ 55. RECORD
============================================================

Record as:

APZQEP REDESIGN
PHASE 4
SCREEN 4
EXECUTION RESULT / EVIDENCE / DEFECT / RETEST
VISUAL AUTHORITY

Authority image:

docs/frontend/apzqep-redesign/visuals/phase-4/04-execution-result-evidence-defect-retest-authority.png

Specification:

docs/frontend/apzqep-redesign/APZQEP-PHASE-4-SCREEN-4-EXECUTION-RESULT-RETEST.md

============================================================ 56. PHASE 4 VISUAL REGISTER
============================================================

SCREEN 1 — Executions / Runs
LOCKED

SCREEN 2 — Manual Test Execution Workspace
LOCKED

SCREEN 3 — Automated Execution Detail
LOCKED

SCREEN 4 — Execution Result / Evidence / Defect / Retest
LOCKED after recording

PHASE 4 VISUAL DESIGN
COMPLETE after recording

DOMAIN RECONCILIATION
NEXT

PHASE 4 IMPLEMENTATION
NOT AUTHORISED
