# APZQEP Phase 4 — Screen 2 visual authority (Manual Test Execution Workspace)

**Record:** APZQEP REDESIGN / PHASE 4 / SCREEN 2 / MANUAL TEST EXECUTION WORKSPACE / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-19  
**Authority image:** [visuals/phase-4/02-manual-test-execution-workspace-authority.png](./visuals/phase-4/02-manual-test-execution-workspace-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for the APZQEP Manual Test Execution Workspace. Desktop is a three-area operational surface: **Test Case context → Current Step → Execution/result capture**. Mobile uses focused screens, not three squeezed columns.

The password-like test data in the visual is **illustrative mock only**. It is **not** authority to store, display, or persist credentials or other secrets.

Phase 3 is **CLOSED**. Phase 4 visual design is **COMPLETE**. Domain reconciliation is **NEXT**. Phase 4 implementation is **NOT AUTHORISED**.

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

# SCREEN 2 — MANUAL TEST EXECUTION WORKSPACE

Phase 3 is CLOSED.

Phase 4 visual register:

SCREEN 1 — Executions / Runs
LOCKED

SCREEN 2 — Manual Test Execution Workspace
CURRENT (now LOCKED)

SCREEN 3 — Automated Execution Detail
LOCKED

SCREEN 4 — Execution Result / Evidence / Defect / Retest
LOCKED

DOMAIN RECONCILIATION
NEXT

PHASE 4 IMPLEMENTATION
NOT AUTHORISED

The supplied image is the approved visual direction for Screen 2.

Record it as VISUAL AUTHORITY ONLY.

DO NOT IMPLEMENT.

============================================================

1. PURPOSE
   \============================================================

This is the primary workspace used by a human tester while manually
executing a Test Case.

The tester must be able to:

understand what is being tested
→ understand the current step
→ perform the action
→ compare actual behaviour with expected behaviour
→ record the result
→ capture evidence
→ raise a defect
→ continue to the next step

without leaving the execution context unnecessarily.

============================================================ 2. CORE EXECUTION MODEL
============================================================

The conceptual execution chain is:

Test Plan
↓
Execution Strategy
↓
Execution
↓
Test Case Snapshot
↓
Step Snapshot
↓
Human performs Action
↓
Actual Result
↓
Pass / Fail / Blocked
↓
Evidence / Defect
↓
Next Step

The Test Case definition is NOT edited here.

This workspace captures EXECUTION RESULTS against an immutable execution
snapshot.

============================================================ 3. CRITICAL DEFINITION VS EXECUTION BOUNDARY
============================================================

Phase 3 established definition steps:

Action
Test Data description/reference
Expected Result

Phase 4 execution adds:

Actual Result
Result
Evidence
Defect relationship

Therefore:

DEFINITION

Action
Test Data
Expected Result

must remain separate from:

EXECUTION

Actual Result
Pass / Fail / Blocked
Evidence
Defect

Do not write execution results back into Test Case definition records.

============================================================ 4. DESKTOP GEOMETRY
============================================================

The visual establishes THREE primary working areas:

LEFT
Test Case Context

CENTRE
Current Step

RIGHT
Execution Result

Conceptually:

┌────────────────┬────────────────────────┬─────────────────┐
│ TEST CASE │ CURRENT STEP │ EXECUTION │
│ │ │ │
│ Identity │ Step 2 of 6 │ Result │
│ Suite │ │ │
│ Priority │ Action │ Pass │
│ Type │ │ Fail │
│ Automation │ Test Data │ Blocked │
│ Preconditions │ │ │
│ ACs │ Expected Result │ Actual Result │
│ │ │ Evidence │
│ │ │ Raise Defect │
└────────────────┴────────────────────────┴─────────────────┘

The centre is the tester's focus.

Do not turn the screen into a generic form.

============================================================ 5. EXECUTION HEADER
============================================================

Header context should make clear:

Execution ID
Execution name
Execution status

and where authoritative:

Plan
Type
Environment
Started
Owner

Example visual data such as:

EX-1021
Sprint Regression — Run 5
Running

is illustrative only.

Use real records.

============================================================ 6. EXECUTION LIFECYCLE ACTIONS
============================================================

The visual illustrates actions such as:

Pause
Complete

Do NOT blindly implement these labels or lifecycle transitions.

Domain reconciliation after all four visuals must inspect both existing
execution engines and determine authoritative lifecycle behaviour.

The visual authority is that execution-level actions belong in the
execution header.

Not that these exact states must exist.

============================================================ 7. TEST CASE CONTEXT
============================================================

The left area provides enough context to execute confidently without
navigating back to the Test Case Designer.

Target information:

Test Case identifier
Title
approval/status where authoritative
Suite/context
Priority where authoritative
Type
Automation capability/mapping
Preconditions
Acceptance Criteria

This information is READ-ONLY execution context.

Do not make Test Case definition editable here.

============================================================ 8. ACCEPTANCE CRITERIA
============================================================

Acceptance Criteria shown here must come from authoritative Phase 2/3
traceability.

The tester should understand:

WHY this Test Case exists
and
WHAT behaviour it verifies.

Do not create execution-local copies of Acceptance Criteria as a new SoR.

Historical execution snapshot requirements will be reconciled later.

============================================================ 9. CURRENT STEP
============================================================

The centre panel is the dominant work surface.

Show clearly:

Step n of m

Action

Test Data

Expected Result

These values come from the execution snapshot, not the latest mutable
Test Case definition.

This distinction is essential.

============================================================ 10. TEST DATA
============================================================

The supplied visual contains illustrative password-like test data.

THIS IS NOT AUTHORITY TO STORE OR DISPLAY RAW SECRETS.

Test Data may represent:

safe literal test values
fixture references
dataset references
generated data
masked values
secure references

depending on repository truth.

Passwords, tokens, API keys, private keys and other secrets must not be
persisted in Test Case definitions or exposed merely because the mock-up
shows a value.

Domain reconciliation must determine safe resolution behaviour.

============================================================ 11. EXPECTED RESULT
============================================================

Expected Result is definition/snapshot truth.

It is READ-ONLY during execution.

The tester compares observed behaviour against it.

Do not allow the tester to rewrite Expected Result to make an execution
pass.

============================================================ 12. RESULT CAPTURE
============================================================

The right Execution panel gives explicit result controls.

Target product concepts:

Pass
Fail
Blocked

Do not automatically add additional result states until reconciled with
the existing execution engines.

Selecting a result records the outcome for THIS EXECUTION STEP.

It does not alter Test Case definition.

============================================================ 13. ACTUAL RESULT
============================================================

Actual Result is the tester's factual observation.

Example:

"Login succeeded and dashboard displayed."

or:

"Login request returned HTTP 500."

It should not require the tester to rewrite the expected result.

Actual Result belongs to the execution step result.

============================================================ 14. PASS
============================================================

Pass means the observed behaviour satisfied the expected result for the
executed step.

A Pass does not mean:

entire Test Case passed
entire Suite passed
Plan passed
Release passed

Higher-level outcomes must be derived from execution state.

============================================================ 15. FAIL
============================================================

Fail means observed behaviour did not satisfy the expected result.

Fail may lead to:

Evidence
Defect

but do not assume every failed step automatically creates a Defect.

The tester must be able to record a failure without fabricating a Defect.

============================================================ 16. BLOCKED
============================================================

Blocked means the tester could not meaningfully complete the verification
because a prerequisite or external condition prevented execution.

Blocked is not the same as Failed.

Domain reconciliation must map this onto existing result semantics.

============================================================ 17. EVIDENCE
============================================================

Evidence capture is integrated into execution.

Target interaction:

Upload / Attach Evidence

Possible evidence may include:

image
video
document
log
execution artefact

according to existing Evidence SoR capabilities.

DO NOT create another evidence store.

Evidence must preserve existing provenance/integrity behaviour.

============================================================ 18. EVIDENCE OWNERSHIP
============================================================

Evidence should be relatable to:

Execution
and where supported:
Execution Step

This allows us to answer:

"What evidence proves this particular result?"

Do not merely attach everything to the Test Case definition.

============================================================ 19. RAISE DEFECT
============================================================

The tester may raise a Defect from execution context.

This must reuse the existing Defect SoR.

The action should carry useful context automatically where authoritative:

Application
Test Case
Execution
Step
Expected Result
Actual Result
Evidence
Environment
Plan

but the tester remains responsible for reviewing the defect.

Do not silently create defects for every failure.

============================================================ 20. DEFECT TRACEABILITY
============================================================

Desired trace:

Requirement
→ User Story
→ Acceptance Criterion
→ Test Case
→ Execution
→ Step Result
→ Defect

Reuse existing traceability and Defect relationships.

No parallel defect model.

============================================================ 21. SAVE STEP RESULT
============================================================

The visual distinguishes:

Save Step Result

from:

Save & Next

This is intentional.

Conceptually:

SAVE STEP RESULT
records the current step without navigating.

SAVE & NEXT
records the current step and moves to the next executable step.

Exact transaction semantics must be reconciled against the existing
execution engine.

Do not implement yet.

============================================================ 22. STEP NAVIGATION
============================================================

Tester must be able to understand:

current step
completed steps
remaining steps
step result state

The visual uses numbered progress navigation.

This is approved direction.

Do not assume the tester may freely rewrite historical completed steps.

Domain reconciliation must determine edit/reopen behaviour.

============================================================ 23. OVERALL PROGRESS
============================================================

Overall execution progress is derived.

Example concept:

3 / 6 completed

Do not allow manual percentage editing.

Progress must be based on authoritative execution-step state.

============================================================ 24. TEST LIST
============================================================

The mobile visual includes a Test list.

This represents navigation between Test Cases within the execution scope.

It does NOT create another Suite or Plan membership model.

The list must derive from the immutable execution scope established when
the execution begins.

============================================================ 25. EXECUTION SCOPE
============================================================

The tester must execute the scope that was actually instantiated.

If the Suite or Test Plan changes after execution starts, the active or
historical execution must not silently gain new Test Cases.

Phase 3 carried snapshot integration as PARTIAL.

Phase 4 domain reconciliation must close this properly.

============================================================ 26. MANUAL VS AUTOMATED
============================================================

This screen is specifically the MANUAL execution workspace.

It may also be appropriate for a human verification step inside a mixed
Plan.

Do not force automated Test Cases through this interaction.

Screen 3 defines automated execution detail.

============================================================ 27. AUTOMATION INFORMATION
============================================================

The Test Case context may show:

Automatable
Automation available
Browser Automation / Playwright available

where backed by real mapping.

This is informational.

The tester is currently performing a manual execution.

Do not execute Playwright from this visual merely because a mapping exists.

============================================================ 28. MOBILE PRINCIPLE
============================================================

Mobile is a FIRST-CLASS tester experience.

It must be practical for a tester holding a phone while verifying another
device, terminal, physical workflow or application.

Do not squeeze the three desktop columns into the phone.

============================================================ 29. MOBILE WORKFLOW
============================================================

The visual establishes focused mobile surfaces.

Primary execution screen:

Execution identity
Step n of m
Action
Test Data
Expected Result
Previous / Next
step progress

Then focused result capture:

Result
Actual Result
Evidence
Raise Defect
Save Step Result
Save & Next

Then Test Case context when needed:

Test Case
Suite
Priority
Type
Automation
Preconditions
Acceptance Criteria

Then Test list:

execution-scope Test Cases
individual execution state

These are views of ONE execution workspace.

============================================================ 30. MOBILE NAVIGATION
============================================================

The user must be able to move naturally between:

Current Step
Execution Result
Test Case Context
Tests

without losing unsaved work.

Exact route/drawer/sheet implementation is not authorised yet.

The visual controls information architecture, not routing mechanics.

============================================================ 31. UNSAVED STATE
============================================================

Domain reconciliation must determine behaviour when the tester:

enters Actual Result
selects Fail
attaches Evidence

and attempts to navigate away before saving.

Do not silently discard execution work.

Do not invent autosave without examining existing write semantics.

============================================================ 32. OFFLINE / CONNECTIVITY
============================================================

The visual does NOT authorise offline execution.

Do not add local offline execution storage merely because mobile is
supported.

If connectivity failure occurs, use honest failure/retry behaviour from
existing platform patterns.

Offline execution may be evaluated separately later.

============================================================ 33. EXECUTION COMPLETION
============================================================

Completing the final step does not automatically mean the Execution
result is Passed.

Overall result must derive from recorded step outcomes and authoritative
execution semantics.

For example conceptually:

all required steps Pass
→ candidate Passed

any required step Fail
→ Failed

blocked required step
→ Blocked / incomplete according to domain rules

Exact calculation comes during reconciliation.

============================================================ 34. DEFECT DOES NOT CHANGE RESULT
============================================================

Creating a Defect does not magically change a failed step into another
state.

Execution result and Defect lifecycle are separate but related.

Likewise:

Defect fixed

does not rewrite the historical failed execution.

It leads to RETEST.

============================================================ 35. RETEST
============================================================

Do not implement retest from this screen yet.

Carry the relationship forward:

Failed Execution
→ Defect
→ Fixed
→ Ready for Retest
→ New Execution / Retest
→ Verified

Screen 4 will define this interaction more precisely.

============================================================ 36. EXECUTION SNAPSHOT
============================================================

The workspace MUST eventually execute against immutable snapshot truth.

At execution start, historical truth must preserve:

Test Case identity
Test Case version/reference
steps
Action
safe Test Data reference/description
Expected Result
scope

The execution workspace must not render a mutable latest Test Case and
pretend it was what was executed historically.

This is a mandatory Phase 4 domain reconciliation topic.

============================================================ 37. LIGHT / DARK
============================================================

Desktop light and dark:

IDENTICAL GEOMETRY.

Mobile light and dark:

IDENTICAL GEOMETRY.

Theme changes presentation only.

Do not create different layouts.

============================================================ 38. RESPONSIVE BEHAVIOUR
============================================================

Desktop:
three-area operational workspace.

Tablet:
may collapse Test Case context while preserving Current Step + Execution.

Mobile:
focused execution surfaces.

The tester's current step remains the primary focus at every size.

============================================================ 39. HONESTY
============================================================

All values shown in the supplied visual are illustrative:

EX-1021
TS-38
Sprint Regression
Authentication Suite
AC-1
AC-2
Jane Smith
Playwright
password example
step counts
progress

Do not seed or hard-code them.

Use real data only.

============================================================ 40. DO NOT IMPLEMENT
============================================================

This instruction does NOT authorise:

Phase 4 implementation
execution schema changes
snapshot migrations
manual execution engine changes
Defect changes
Evidence changes
retest changes
offline mode
SSH
Terminal
Source write
Release
AI

Record visual authority only.

============================================================ 41. DOMAIN QUESTIONS TO CARRY
============================================================

After all four Phase 4 screens are locked, reconciliation must answer:

1. Which execution engine owns manual Test Case execution?
2. How is Plan/Suite scope instantiated?
3. How are Test Case definitions snapshotted?
4. How are definition steps snapshotted?
5. How is safe Test Data represented/resolved?
6. What are authoritative step-result states?
7. Can completed steps be reopened/edited?
8. What constitutes overall Test Case result?
9. What constitutes overall Execution result?
10. How does Evidence bind to execution/step?
11. How does Raise Defect work from both execution engines?
12. How is unsaved state handled?
13. How are execution-scope Test Cases navigated?
14. How does pause/resume work?
15. How does execution completion work?
16. How does failed execution lead to Retest?
17. How do the two execution engines appear in one customer experience?
18. How is historical execution guaranteed immutable?

============================================================ 42. RECORD
============================================================

Record supplied visual as:

APZQEP REDESIGN
PHASE 4
SCREEN 2
MANUAL TEST EXECUTION WORKSPACE
VISUAL AUTHORITY

Authority path:

docs/frontend/apzqep-redesign/visuals/phase-4/02-manual-test-execution-workspace-authority.png

Specification:

docs/frontend/apzqep-redesign/APZQEP-PHASE-4-SCREEN-2-MANUAL-EXECUTION.md

============================================================ 43. PHASE 4 VISUAL REGISTER
============================================================

SCREEN 1 — Executions / Runs
LOCKED

SCREEN 2 — Manual Test Execution Workspace
LOCKED after recording

SCREEN 3 — Automated Execution Detail
LOCKED

SCREEN 4 — Execution Result / Evidence / Defect / Retest
LOCKED

DOMAIN RECONCILIATION
NEXT

PHASE 4 IMPLEMENTATION
NOT AUTHORISED
