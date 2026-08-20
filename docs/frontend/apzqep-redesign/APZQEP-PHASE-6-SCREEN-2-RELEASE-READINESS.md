# APZQEP Phase 6 — Screen 2 visual authority (Release Readiness)

**Record:** APZQEP REDESIGN / PHASE 6 / SCREEN 2 / RELEASE READINESS / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-20  
**Authority image:** [visuals/phase-6/02-release-readiness-authority.png](./visuals/phase-6/02-release-readiness-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for APZQEP Release Readiness. It is a **decision briefing**, not the decision itself and not a score dashboard.

**Correction recorded with the lock:** the mock-up’s **74% Overall Readiness** and percentage target are **illustrative placeholders only**. They are **not** authorised product semantics. If domain reconciliation cannot prove an objective denominator, implementation must use an explainable posture (Ready / At Risk / Not Ready / Insufficient Data, or equivalent) rather than invent a percentage.

Phase 5 is **CLOSED · ACCEPTED**. Screen 1 is **LOCKED**. Screens 3–4 are **not locked**. Domain reconciliation is **NOT STARTED**. Phase 6 implementation is **NOT AUTHORISED**.

```text
SCREEN 1 — QUALITY RISK:
LOCKED

SCREEN 2 — RELEASE READINESS:
LOCKED

SCREEN 3 — QUALITY GATES:
NEXT

SCREEN 4 — CERTIFICATION / GO-NO-GO:
PENDING

PHASE 6 VISUAL DESIGN:
IN PROGRESS

DOMAIN RECONCILIATION:
NOT STARTED

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED
```

Three layers (keep separate):

1. **Quality facts** — Requirements, AC coverage, Test Cases, Executions, Defects, Evidence, Phase 5 findings, Quality Risks.
2. **Quality Gates** — explicit conditions on those facts (Screen 3).
3. **Human decision** — Certification / GO — CONDITIONAL GO — NO-GO (Screen 4).

**READINESS ≠ SCORE.** Coverage ≠ Result. Status ≠ Result. Observation ≠ Issue ≠ Defect ≠ Risk. High Risk ≠ automatic NO-GO. Readiness does not certify.

Do not create `qep_release` or `qep_release_candidate` from this visual.

---

# APZQEP REDESIGN — PHASE 6

# SCREEN 2 — RELEASE READINESS

# VISUAL AUTHORITY ONLY — NO IMPLEMENTATION

Phase 6 status:

SCREEN 1 — QUALITY RISK
LOCKED

SCREEN 2 — RELEASE READINESS
LOCK THIS VISUAL

SCREEN 3 — QUALITY GATES
NEXT

SCREEN 4 — CERTIFICATION / GO-NO-GO
PENDING

PHASE 6 VISUAL DESIGN
IN PROGRESS

DOMAIN RECONCILIATION
NOT STARTED

PHASE 6 IMPLEMENTATION
NOT AUTHORISED

============================================================

1. VISUAL AUTHORITY
   \============================================================

The attached image is the visual authority for:

SCREEN 2 — RELEASE READINESS

Do NOT implement.

Do NOT create schemas or migrations.

Do NOT create a Release or Release Candidate aggregate from this visual.

IMPORTANT CORRECTION:

The mock-up contains an illustrative:

74% Overall Readiness

and percentage-based target.

These are NOT authorised product semantics.

Treat them as visual placeholders showing where overall decision context
may appear.

Do NOT implement a readiness percentage or readiness score unless Phase 6
domain reconciliation proves an objective and defensible model.

============================================================ 2. PURPOSE
============================================================

Release Readiness is the evidence-based decision workspace answering:

"Is this Application / delivery candidate sufficiently verified for the
intended deployment or release decision?"

It must show WHY something appears ready, at risk, incomplete, or blocked.

Readiness must be explainable from actual APZQEP quality information.

It is NOT merely a dashboard.

============================================================ 3. CORE PRINCIPLE
============================================================

READINESS ≠ SCORE

The primary model is:

QUALITY FACTS +
QUALITY RISKS +
QUALITY GATES +
EVIDENCE
=

EXPLAINABLE READINESS POSTURE

Do not reduce the product to a weighted percentage.

============================================================ 4. READINESS CONTEXT
============================================================

The visual establishes a decision context containing conceptually:

Release / Candidate
Application
Environment
As-of date/time

However:

Release and Release Candidate are NOT currently authoritative APZQEP
aggregates.

Do not create them from the visual.

Domain reconciliation must determine what the actual decision context is.

============================================================ 5. RELEASE / CANDIDATE QUESTION
============================================================

This is now an explicit Phase 6 domain question.

Determine later whether readiness should be evaluated against:

Application + Environment

Application + named delivery candidate

Application + build/version

Application + Release aggregate

Application + Release Candidate aggregate

or another existing authoritative object.

Do not answer from the visual.

============================================================ 6. READINESS POSTURE
============================================================

The product requires a high-level posture.

Conceptually it may communicate:

Ready
At Risk
Not Ready
Insufficient Data

or equivalent.

This is NOT yet an authorised durable enum.

Domain reconciliation must determine:

whether posture is derived
whether Gates determine posture
whether human judgement participates
whether it is persisted or computed.

============================================================ 7. READINESS DIMENSIONS
============================================================

The visual establishes the important underlying dimensions:

Requirements Readiness
Test Coverage
Execution Success
Defect Health
Evidence Sufficiency
Risk Exposure

These are product concepts.

Their exact calculation is NOT authorised by this image.

============================================================ 8. REQUIREMENTS READINESS
============================================================

This dimension should ultimately expose facts such as:

Requirements
User Stories
Acceptance Criteria
coverage/linkage
uncovered Acceptance Criteria
unverified criteria

Use existing Phase 2 authorities.

Do not invent requirement completeness.

============================================================ 9. TEST COVERAGE
============================================================

Use the existing distinction established earlier:

COVERAGE ≠ RESULT

Coverage answers:

What intended verification has coverage?

It does not answer:

Did the verification pass?

Potential facts include:

Acceptance Criteria with Test Case coverage
uncovered Acceptance Criteria
Test Cases
Suites
planned verification scope

Use real traceability.

============================================================ 10. EXECUTION SUCCESS
============================================================

Execution is a separate dimension.

Use the customer-facing execution composition established in Phase 4.

Potential facts include:

Executed
Passed
Failed
Blocked
Not Run
In Progress

Preserve:

Status ≠ Result.

Do not count raw provider automation runs as customer Executions.

============================================================ 11. DEFECT HEALTH
============================================================

Use the existing Defect SoR.

Potential facts include:

open Defects
critical/high-impact Defects
ready-for-retest
reopened
verified
closed

Do not create another defect/readiness store.

Defect severity must remain the existing APZQEP vocabulary.

============================================================ 12. EVIDENCE SUFFICIENCY
============================================================

Evidence remains the existing Evidence SoR.

This dimension should answer whether required quality claims are supported
by appropriate Evidence.

Do not equate:

Evidence count

with:

Evidence sufficiency.

Domain reconciliation must determine how sufficiency is established.

This may ultimately depend on Gate requirements rather than a score.

============================================================ 13. QUALITY RISK EXPOSURE
============================================================

Use Screen 1 Quality Risk.

Readiness must expose relevant:

High
Medium
Low

or whatever durable risk representation is ultimately approved.

But:

High Risk ≠ automatic NO-GO

unless an explicit Gate/policy makes it blocking.

============================================================ 14. PHASE 5 QUALITY INFORMATION
============================================================

Readiness must be capable of incorporating meaningful Phase 5 information.

Potential inputs include:

Exploratory Sessions
unresolved Exploratory Issues
UI/UX Verification activities
unresolved UI/UX Issues
verification criteria
Evidence

Do NOT automatically treat:

Observation

as a readiness failure.

Observation ≠ Issue ≠ Defect ≠ Risk.

============================================================ 15. KEY INDICATORS
============================================================

The visual shows indicator bars.

These represent concise views of underlying quality facts.

They are NOT permission to invent weighted quality scores.

If a percentage is eventually shown, it must have a transparent,
objective denominator.

Examples:

Covered AC / applicable AC
Passed completed Executions / applicable completed Executions

Not:

"Defect Health = 71%"

unless the domain model defines exactly what 71% means.

============================================================ 16. COVERAGE AT A GLANCE
============================================================

This area should expose real traceability facts.

Conceptually:

Requirements total
Acceptance Criteria total
Test Cases
Test Suites
Covered ACs
Uncovered ACs
Covered Test Cases
Uncovered Test Cases

Use existing SoRs and derived read models.

No separate readiness coverage store.

============================================================ 17. DEFECT OVERVIEW
============================================================

Expose actual Defect state.

Conceptually group by:

severity
status
blocking relevance

Do not manufacture a separate "release defect" entity merely because
the screen is Release Readiness.

Relationship to decision context must be reconciled.

============================================================ 18. EVIDENCE OVERVIEW
============================================================

Expose Evidence relevant to the selected readiness context.

Potential categories may include:

Screenshots
Test Reports
Logs
Documents
Other supported Evidence

The visual's categories are illustrative.

Do not create enums from them.

============================================================ 19. QUALITY RISK OVERVIEW
============================================================

Expose Quality Risks relevant to the readiness context.

Allow drill-through to Screen 1.

Do not duplicate the Risk register.

============================================================ 20. ISSUES
============================================================

The visual includes an Issues navigation area.

This may include relevant Phase 5 Issues.

Issue remains:

Issue ≠ Defect.

Domain reconciliation must determine how unresolved Issues affect
readiness and Gates.

Do not automatically classify every Issue as blocking.

============================================================ 21. GATE PREVIEW
============================================================

This is one of the most important parts of Screen 2.

Release Readiness should preview actual Quality Gate evaluation.

Conceptually:

Passed
At Risk
Failed
Not Evaluated

However, Screen 2 does NOT define the Gate domain.

SCREEN 3 — QUALITY GATES

will define the actual gate-management experience.

Do not create Gate rules from this mock-up.

============================================================ 22. GATES DETERMINE DECISION CONDITIONS
============================================================

Readiness facts and Gate decisions must remain distinct.

Example:

FACT:
2 critical Defects remain open.

GATE:
No open Critical Defects permitted.

GATE RESULT:
Failed.

This is preferable to:

"Defect Health = 42%, therefore Not Ready."

The former is explainable and auditable.

============================================================ 23. READINESS POSTURE VS GATE RESULT
============================================================

Do not collapse:

Readiness Posture
Gate Result
Certification Decision

These are different concepts.

Conceptually:

Readiness
= current quality posture

Gate Result
= evaluation of explicit quality conditions

Certification
= final controlled human decision

Screen 4 will define Certification / Go-No-Go.

============================================================ 24. NO AUTOMATIC GO/NO-GO
============================================================

Release Readiness does NOT make the final release decision.

It informs the decision.

No automatic:

GO
NO-GO
Certification

is authorised.

============================================================ 25. RECENT ACTIVITY
============================================================

The visual includes a recent activity timeline.

Use real activity/history.

Potential events:

Execution completed
Risk updated
Evidence added
Defect created
Gate evaluated
Exploratory Session completed
UI/UX Verification completed

Do not synthesise events from current state.

============================================================ 26. DEEP REVIEW
============================================================

The visual establishes tabs such as:

Overview
Requirements
Test Coverage
Executions
Defects
Evidence
Quality Risks
Issues
Summary

These are contextual deep-review surfaces.

They should compose existing product authorities.

Do not create duplicate stores for each tab.

============================================================ 27. SUMMARY
============================================================

Summary should ultimately provide an explainable decision briefing.

It should answer:

What is ready?
What is incomplete?
What is blocking?
What requires human judgement?
What Evidence supports the posture?
Which Gates have not passed?

Do not turn Summary into another KPI dashboard.

============================================================ 28. AS-OF TIME
============================================================

The visual contains:

As of

This is important.

Readiness is time-sensitive.

Domain reconciliation must determine whether the workspace evaluates:

live current state

or

an immutable/snapshotted readiness evaluation.

This becomes particularly important for Certification.

Do not decide from the visual.

============================================================ 29. ENVIRONMENT
============================================================

Reuse:

qep_application_environment

Do not create another Environment authority.

Readiness may legitimately differ by Environment.

============================================================ 30. APPLICATION
============================================================

Reuse:

qep_application.

Application isolation remains mandatory.

============================================================ 31. MOBILE
============================================================

Mobile is a real decision-review experience.

Do not squeeze desktop cards onto mobile.

The visual establishes focused mobile surfaces such as:

Overall Readiness
Key Indicators
Gate Preview
Coverage
Recent Activity

The same underlying decision context and data must be used.

============================================================ 32. LIGHT / DARK
============================================================

Desktop light/dark geometry:

IDENTICAL.

Mobile light/dark geometry:

IDENTICAL.

Maintain accepted APZQEP visual language.

============================================================ 33. RELEASE ENTITY
============================================================

STILL NOT AUTHORISED.

Do not create:

qep_release
qep_release_candidate

until Screens 3 and 4 are locked and domain reconciliation proves what
object actually requires readiness/gates/certification.

============================================================ 34. QUALITY SCORES
============================================================

Explicitly prohibited at this stage:

Overall Quality Score
Release Score
UX Score
Risk-adjusted Score
AI Readiness Score

The illustrative 74% gauge in the visual is NOT implementation authority.

If reconciliation cannot justify a mathematically meaningful readiness
percentage, replace that presentation during implementation with an
explainable posture rather than inventing one.

============================================================ 35. NOT AUTHORISED
============================================================

Do not implement:

Phase 6
Release aggregate
Release Candidate aggregate
readiness score
weighted quality model
automatic GO/NO-GO
Quality Gate backend
Certification backend
AI readiness analysis
AI decision recommendation
SSH
Terminal
Source write
Phase 7

============================================================ 36. DOMAIN QUESTIONS TO CARRY FORWARD
============================================================

Do NOT answer these now.

Carry forward:

1. What is the authoritative readiness decision context?

2. Is a Release aggregate genuinely required?

3. Is a Release Candidate aggregate genuinely required?

4. Is readiness live or snapshotted?

5. What determines the high-level readiness posture?

6. Are readiness dimensions independently derived facts?

7. Which dimensions can honestly use percentages?

8. What defines Evidence Sufficiency?

9. How do Phase 5 Issues contribute without becoming Defects?

10. How do Quality Risks contribute without automatically blocking?

11. How do Gates consume quality facts?

12. Does Gate evaluation determine readiness posture?

13. What gets frozen for Certification?

14. How should readiness history be represented?

15. What existing certification capability can be extended?

============================================================ 37. RECORD
============================================================

Store the supplied visual as:

docs/frontend/apzqep-redesign/visuals/phase-6/
02-release-readiness-authority.png

Create:

docs/frontend/apzqep-redesign/
APZQEP-PHASE-6-SCREEN-2-RELEASE-READINESS.md

Record:

SCREEN 1 — QUALITY RISK:
LOCKED

SCREEN 2 — RELEASE READINESS:
LOCKED

SCREEN 3 — QUALITY GATES:
NEXT

SCREEN 4 — CERTIFICATION / GO-NO-GO:
PENDING

PHASE 6 VISUAL DESIGN:
IN PROGRESS

DOMAIN RECONCILIATION:
NOT STARTED

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED

STOP.

Wait for Screen 3 visual authority.
