# APZQEP Phase 4 — Screen 3 visual authority (Automated Execution Detail)

**Record:** APZQEP REDESIGN / PHASE 4 / SCREEN 3 / AUTOMATED EXECUTION DETAIL / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-19  
**Authority image:** [visuals/phase-4/03-automated-execution-detail-authority.png](./visuals/phase-4/03-automated-execution-detail-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for APZQEP Automated Execution Detail. It is an APZQEP quality-management experience around automated execution — not a Playwright, GitHub Actions, Jenkins, ZAP, Semgrep, or k6 dashboard.

The generated board contains an incorrect explanatory label referring to “Manual Test Execution Workspace”. **Ignore that label.** Product name for this authority is **Automated Execution Detail**.

Screen 2 remains the human tester workspace. Screen 3 is where a user observes/investigates an automated execution. Screen 4 closes the result / evidence / defect / retest loop.

Phase 4 visual design is **COMPLETE**. Domain reconciliation is **NEXT**. Phase 4 implementation is **NOT AUTHORISED**.

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

# SCREEN 3 — AUTOMATED EXECUTION DETAIL

Phase 4 visual register:

SCREEN 1 — Executions / Runs
LOCKED

SCREEN 2 — Manual Test Execution Workspace
LOCKED

SCREEN 3 — Automated Execution Detail
CURRENT (now LOCKED)

SCREEN 4 — Execution Result / Evidence / Defect / Retest
LOCKED

DOMAIN RECONCILIATION
NEXT

PHASE 4 IMPLEMENTATION
NOT AUTHORISED

The supplied image establishes the approved visual direction for
SCREEN 3 — AUTOMATED EXECUTION DETAIL.

The generated image contains an incorrect explanatory label referring
to "Manual Test Execution Workspace".

IGNORE THAT LABEL.

The screen itself is authority for AUTOMATED EXECUTION DETAIL.

Record only. DO NOT IMPLEMENT.

============================================================

1. PURPOSE
   \============================================================

Screen 3 answers:

"What happened during this automated execution?"

It gives APZQEP users one coherent view of an automated execution
regardless of the underlying automation provider.

Conceptually:

Test Plan
↓
Execution Strategy
↓
Automated Execution
↓
Execution Scope Snapshot
↓
Automation Provider
↓
Individual Test Results
↓
Evidence / Artifacts / Logs
↓
Failures
↓
Defects

============================================================ 2. APZQEP OWNS THE EXPERIENCE
============================================================

This is an APZQEP screen.

It is NOT:

a Playwright dashboard
a GitHub Actions dashboard
a Jenkins dashboard
a ZAP dashboard
a Semgrep dashboard
a k6 dashboard

External tools perform specialised execution.

APZQEP provides the quality-management experience around those
executions.

============================================================ 3. PROVIDER ABSTRACTION
============================================================

Product concepts remain primary.

Examples:

Browser Automation
API Verification
SAST
DAST
Performance
Accessibility

Provider resolution is secondary.

Example:

Browser Automation
Playwright

not:

PLAYWRIGHT TEST DASHBOARD

The same screen geometry should work when the provider changes.

============================================================ 4. HEADER
============================================================

Execution identity should establish:

Execution ID
Execution Name
Status

and where authoritative:

Plan
Type
Environment
Started
Owner

Example:

EX-1021
Sprint Regression — Run 5
Completed

is illustrative only.

============================================================ 5. PRIMARY TABS
============================================================

Target information architecture:

Overview
Test Cases
Results
Logs
Artifacts
Defects
History

These are views of ONE execution.

Do not create separate execution objects for each tab.

============================================================ 6. OVERVIEW
============================================================

Overview provides operational understanding without requiring users to
inspect raw automation output.

Primary areas:

Execution Summary
Strategy
Environment & Target
Execution Progress
Recent Failures
Recent Defects

This is not intended as another generic KPI dashboard.

============================================================ 7. EXECUTION SUMMARY
============================================================

Show derived execution outcome where authoritative.

Potential dimensions:

Passed
Failed
Blocked
Not Run

and:

Total Test Cases
Executed
Pass Rate

All values must derive from real execution results.

Do not persist manually editable summary percentages.

Do not seed the mock numbers.

============================================================ 8. STATUS VS RESULT
============================================================

Preserve the distinction established in Screen 1.

STATUS:

Queued
Running
Completed
etc.

RESULT:

Passed
Failed
Blocked
Not Run

A Completed execution can contain failures.

Never equate:

Completed = Passed.

============================================================ 9. STRATEGY
============================================================

Show the strategy that actually produced this execution.

Conceptual fields:

Verification Capability
Execution Surface
Browser / Device where applicable
Test Data reference
Capability Mapping
Execution Target
CI Pipeline where applicable

These must resolve from authoritative Plan Strategy / execution snapshot
data.

Do not reconstruct today's latest Plan configuration and pretend it was
the historical execution strategy.

============================================================ 10. EXAMPLE STRATEGY
============================================================

The visual illustrates something similar to:

Browser Automation
Playwright

Execution Surface
Web

Browser
Chrome

Test Data
QA dataset

Capability Mapping
Browser Automation → Playwright

Execution Target
Managed Runner

This is illustrative only.

Do not hard-code these values.

============================================================ 11. ENVIRONMENT & TARGET
============================================================

Keep the Phase 3 separation:

CAPABILITY
what kind of verification

SURFACE
what is being exercised

ENVIRONMENT
application environment

INFRASTRUCTURE TARGET
where execution occurs

PROVIDER
what performs the verification

Example:

Browser Automation
→ Web
→ QA
→ Managed Runner
→ Playwright

Do not collapse these concepts.

============================================================ 12. ENVIRONMENT
============================================================

Application Environment must resolve through Phase 1E authority wherever
possible.

Example:

QA

may additionally resolve useful context such as:

application URL
region
timezone

if these are authoritative.

Do not create a second Environment SoR.

============================================================ 13. EXECUTION TARGET
============================================================

Execution Target must use Phase 1E infrastructure semantics.

Existing target types include concepts such as:

managed_runner
ci_pipeline
remote_host

Do not persist:

web
api
repository

as infrastructure target types.

============================================================ 14. EXECUTION ENGINE
============================================================

Internal execution-engine information may be useful diagnostically but
must not dominate customer UX.

If displayed, it should be secondary.

The user should understand:

Automated

before needing to understand which internal package handled the record.

============================================================ 15. TEST CASES TAB
============================================================

Test Cases shows the immutable execution scope.

Each row should make clear:

Test Case ID
Test Case name
execution/result state
duration where authoritative

Potential result concepts:

Passed
Failed
Blocked
Not Run

Do not read the current mutable Suite and present that as historical
execution scope.

============================================================ 16. EXECUTION SCOPE SNAPSHOT
============================================================

This is critical.

If execution began with:

TS-10
TS-11
TS-12

and the Suite later becomes:

TS-10
TS-11
TS-12
TS-13

the historical execution remains:

TS-10
TS-11
TS-12

Screen 3 must ultimately read immutable execution scope.

Phase 4 domain reconciliation must close the snapshot gap carried from
Phase 3.

============================================================ 17. TEST CASE SNAPSHOT
============================================================

Likewise, historical automated results must resolve against the Test Case
definition actually executed.

Do not silently render today's latest:

Action
Expected Result
Test Data references

against an old execution.

============================================================ 18. RESULTS TAB
============================================================

Results is the structured quality interpretation of the execution.

It should allow users to understand:

which Test Cases passed
which failed
which were blocked
which were not run
where failure occurred

without requiring raw logs.

============================================================ 19. FAILURE DETAIL
============================================================

Failure information should make useful context visible.

Conceptually:

Test Case
Step where applicable
Result
Failure message
Timestamp

Provider-native details may be available deeper in the record.

Do not dump raw logs into the main Results view.

============================================================ 20. LOGS
============================================================

Logs provide technical execution detail.

APZQEP should:

display or reference useful execution logs
preserve provenance
support investigation

but must not become a full CI log-management product.

Where logs are external, durable references may be preferable to copying
unbounded log data.

Domain reconciliation must inspect repository truth.

============================================================ 21. ARTIFACTS
============================================================

Automation may produce:

screenshots
videos
traces
reports
coverage files
security reports
performance reports
other machine artefacts

These must reconcile with the existing Evidence SoR.

Do not create a competing Artifact/Evidence store merely for automation.

============================================================ 22. EVIDENCE NORMALISATION
============================================================

Provider artefacts should become useful APZQEP quality evidence where
appropriate.

Conceptually:

Playwright screenshot
→ Evidence

automation trace
→ Evidence / execution artefact reference

security report
→ Evidence / report reference

Do not assume every provider output must be copied into Evidence storage.

Reconciliation determines reference vs ingestion.

============================================================ 23. DEFECTS
============================================================

The Defects tab presents defects linked to this execution.

Use existing Defect SoR.

Do not create:

automation defects

as a separate defect domain.

============================================================ 24. AUTOMATIC DEFECT CREATION
============================================================

The visual does NOT authorise automatic defect creation.

An automated failure may be:

test defect
environment failure
infrastructure failure
product defect
expected negative result
flaky execution

Therefore:

FAILED AUTOMATION

must not automatically mean:

CREATE DEFECT.

Later domain rules may support controlled workflows.

============================================================ 25. RECENT FAILURES
============================================================

Overview may surface recent failures as an attention mechanism.

It should answer:

What failed?
Where?
When?

Selecting one should eventually lead toward Screen 4 deep inspection.

Do not make this another failure store.

============================================================ 26. RECENT DEFECTS
============================================================

Likewise, show relevant linked Defects where authoritative.

Useful concepts:

Defect ID
Title
Severity
Status

All come from existing Defect authority.

============================================================ 27. HISTORY
============================================================

History is execution history/audit context.

It may include:

created
queued
started
provider accepted
test result events
completed
evidence attached
defect linked

depending on actual event/audit capabilities.

Do not fabricate history.

============================================================ 28. RERUN
============================================================

The visual contains a Rerun action.

This establishes a product concept, NOT implementation authority.

A rerun must eventually create a NEW execution.

It must not erase or reset the historical execution.

Conceptually:

EX-100
Failed
↓
Rerun
↓
EX-101
New Execution

Exact relationship requires domain reconciliation.

============================================================ 29. RERUN VS RETEST
============================================================

Do not treat these as automatically identical.

RERUN may mean:

repeat automation due to environment/flaky/infrastructure reason

RETEST may mean:

verify a defect fix against previously failed quality behaviour

Screen 4 will establish the retest experience.

Domain reconciliation must decide the durable relationships.

============================================================ 30. EXPORT
============================================================

The visual illustrates Export.

This does not authorise new reporting infrastructure.

If existing reporting/export capabilities support it, they may later be
used.

Otherwise treat the visual action as pending reconciliation.

============================================================ 31. PROGRESS
============================================================

Execution progress is derived.

Potential concepts:

executed / scope
percentage
duration

Do not manually persist a progress percentage merely for this UI.

============================================================ 32. PASS RATE
============================================================

Pass Rate is also derived.

It is not:

coverage
quality score
release readiness

Do not turn pass rate into an overall quality verdict.

============================================================ 33. COVERAGE
============================================================

Execution results and requirements coverage remain different.

Example:

17 / 18 tests executed

does NOT mean:

94% requirements coverage.

Preserve Phase 2/3 semantics.

============================================================ 34. MOBILE
============================================================

Mobile is a responsive execution investigation experience.

Do not squeeze desktop cards/tables into the phone.

The visual establishes focused mobile views for:

Overview
Strategy
Test Cases
Results
Execution Timeline

These are views of the same Execution.

============================================================ 35. MOBILE OVERVIEW
============================================================

Prioritise:

Execution identity
Status
Plan
Type
Environment
Started
Progress
Result summary
Strategy summary

Users should understand the execution quickly.

============================================================ 36. MOBILE TEST CASES
============================================================

Use a vertical result list.

Each Test Case should expose enough information to identify:

identity
name
result

Tap for deeper result inspection.

============================================================ 37. MOBILE RESULTS
============================================================

Prioritise:

result summary
recent failures
linked defects

Do not present desktop tables at mobile width.

============================================================ 38. MOBILE TIMELINE
============================================================

Execution timeline should provide useful operational history.

Example concepts:

execution started
provider accepted
test started
test failed
execution completed

Only display events backed by real data.

============================================================ 39. LIGHT / DARK
============================================================

Desktop light/dark:

IDENTICAL GEOMETRY.

Mobile light/dark:

IDENTICAL GEOMETRY.

Theme changes appearance only.

============================================================ 40. SAMPLE DATA
============================================================

ALL visible values are illustrative.

This includes:

EX-1021
Sprint Regression — Run 5
17/18
72%
QA
Chrome
Managed Runner
Playwright
DEF-*
Jane Smith
timestamps
durations
failure counts

Do not seed them.

Do not convert them into requirements.

============================================================ 41. SCREEN 2 VS SCREEN 3
============================================================

Keep the distinction extremely clear.

SCREEN 2:

Human tester is DOING the test.

Primary question:

"What do I need to do now, and what did I observe?"

SCREEN 3:

User is OBSERVING/INVESTIGATING an automated execution.

Primary question:

"What happened during this automated execution?"

Do not combine them into one overloaded screen.

============================================================ 42. SCREEN 4 HANDOFF
============================================================

When a user selects a particular executed Test Case/result/failure, the
experience should be able to lead to Screen 4.

Screen 4 will answer:

"What exactly happened to this verification, what proves it, what defect
resulted, and what happened on retest?"

Do not design Screen 4 from this instruction.

============================================================ 43. DOMAIN QUESTIONS TO CARRY
============================================================

After Screen 4 is locked, reconciliation must answer at minimum:

1. How are automated provider executions correlated to APZQEP Execution?
2. Which engine owns which automated execution records?
3. How are Plan strategy snapshots preserved?
4. How is Suite/Test Case execution scope snapshotted?
5. How are Test Case definitions snapshotted?
6. How are provider results normalised?
7. How are result states mapped across providers?
8. How are provider logs retained/referenced?
9. How are provider artefacts reconciled with Evidence?
10. How are failures linked to Test Cases/steps?
11. How are Defects linked from automated execution?
12. What does Rerun create?
13. How does Rerun differ from Retest?
14. How do both execution engines appear through one product experience?
15. What constitutes immutable historical execution truth?

============================================================ 44. DO NOT IMPLEMENT
============================================================

Do not implement:

Screen 3
Phase 4
provider integrations
execution-engine changes
snapshot changes
Evidence changes
Defect changes
Rerun
Retest
Release
SSH
Terminal
Source write
AI

Record visual authority only.

============================================================ 45. RECORD
============================================================

Record as:

APZQEP REDESIGN
PHASE 4
SCREEN 3
AUTOMATED EXECUTION DETAIL
VISUAL AUTHORITY

Authority image:

docs/frontend/apzqep-redesign/visuals/phase-4/03-automated-execution-detail-authority.png

Specification:

docs/frontend/apzqep-redesign/APZQEP-PHASE-4-SCREEN-3-AUTOMATED-EXECUTION-DETAIL.md

============================================================ 46. PHASE 4 VISUAL REGISTER
============================================================

SCREEN 1 — Executions / Runs
LOCKED

SCREEN 2 — Manual Test Execution Workspace
LOCKED

SCREEN 3 — Automated Execution Detail
LOCKED after recording

SCREEN 4 — Execution Result / Evidence / Defect / Retest
LOCKED

DOMAIN RECONCILIATION
NEXT

PHASE 4 IMPLEMENTATION
NOT AUTHORISED
