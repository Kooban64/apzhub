# APZQEP Phase 6 — Screen 3 visual authority (Quality Gates)

**Record:** APZQEP REDESIGN / PHASE 6 / SCREEN 3 / QUALITY GATES / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-20  
**Authority image:** [visuals/phase-6/03-quality-gates-authority.png](./visuals/phase-6/03-quality-gates-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for APZQEP Quality Gates. It is an operational Gate register, not a dashboard and not a certification engine.

Preserve:

```text
QUALITY FACT → GATE CONDITION → GATE EVALUATION → READINESS CONTEXT → HUMAN CERTIFICATION
```

A Gate does **not** manufacture quality facts. A failed blocking Gate is consequential and visible, but it does **not** write GO / CONDITIONAL GO / NO-GO. Those belong to Screen 4.

Gate Status ≠ Execution Result ≠ Readiness Posture ≠ Certification Decision. Coverage ≠ Result. Status ≠ Result. Observation ≠ Issue ≠ Defect ≠ Risk. No Gate weighting, Gate score, or AI evaluation. Sample Gates (QG-001, etc.) are illustrative only — do not seed them. Do not create `qep_release` or `qep_release_candidate`.

Phase 5 is **CLOSED · ACCEPTED**. Screens 1–2 are **LOCKED**. Screen 4 is **not locked**. Domain reconciliation is **NOT STARTED**. Phase 6 implementation is **NOT AUTHORISED**.

```text
SCREEN 1 — QUALITY RISK:
LOCKED

SCREEN 2 — RELEASE READINESS:
LOCKED

SCREEN 3 — QUALITY GATES:
LOCKED

SCREEN 4 — CERTIFICATION / GO-NO-GO:
NEXT

PHASE 6 VISUAL DESIGN:
IN PROGRESS

DOMAIN RECONCILIATION:
NOT STARTED

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED
```

---

# APZQEP REDESIGN — PHASE 6

# SCREEN 3 — QUALITY GATES

# VISUAL AUTHORITY ONLY — NO IMPLEMENTATION

Current status:

SCREEN 1 — QUALITY RISK:
LOCKED

SCREEN 2 — RELEASE READINESS:
LOCKED

SCREEN 3 — QUALITY GATES:
LOCK THIS VISUAL

SCREEN 4 — CERTIFICATION / GO-NO-GO:
NEXT

PHASE 6 VISUAL DESIGN:
IN PROGRESS

DOMAIN RECONCILIATION:
NOT STARTED

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED

============================================================

1. VISUAL AUTHORITY
   \============================================================

The attached image is visual authority for:

SCREEN 3 — QUALITY GATES

Record the visual.

Do NOT implement.

Do NOT create schemas, migrations, APIs or Gate engines.

Do NOT infer durable enums or rules from sample content.

============================================================ 2. PURPOSE
============================================================

Quality Gates define explicit, inspectable quality conditions against
which a defined delivery/readiness context can be evaluated.

A Gate answers:

"What quality condition must be satisfied?"

and an evaluation answers:

"Was that condition satisfied for this context, using these facts?"

Quality Gates transform quality facts into explicit decision conditions.

============================================================ 3. CORE MODEL
============================================================

Preserve this conceptual separation:

QUALITY FACT
↓
GATE CONDITION
↓
GATE EVALUATION
↓
READINESS CONTEXT
↓
HUMAN CERTIFICATION DECISION

These are not interchangeable concepts.

============================================================ 4. GATE ≠ QUALITY FACT
============================================================

A Gate does not create:

Requirements
Acceptance Criteria
Test Cases
Executions
Defects
Evidence
Issues
Observations
Quality Risks

It evaluates authoritative facts from their existing SoRs.

============================================================ 5. EXAMPLES
============================================================

The visual contains illustrative Gates such as:

No Critical Defects
Acceptance Criteria Coverage
Execution Success
High Priority Defects
Evidence Sufficiency
Test Plan Coverage
Risk Exposure
Security Vulnerabilities

These are EXAMPLES ONLY.

Do not seed them.

Do not create rule types from the mock-up.

Domain reconciliation must determine which facts can actually be
evaluated reliably.

============================================================ 6. ACTIVE GATES
============================================================

The primary workspace is an operational Gate register.

Conceptually expose:

Gate identity
Gate name
Description
Scope
Type
Status
Last Evaluation
Trend
Failure Impact
Actions

The exact persistence model is NOT authorised yet.

============================================================ 7. GATE STATUS
============================================================

The visual illustrates:

Passed
At Risk
Failed
Not Evaluated

These are presentation concepts until domain reconciliation.

Critically:

Gate Status ≠ Execution Result
Gate Status ≠ Readiness Posture
Gate Status ≠ Certification Decision

============================================================ 8. GATE TYPE
============================================================

The visual establishes the product distinction:

BLOCKING
NON-BLOCKING

Conceptually:

Blocking Gate
= failure prevents an unconditional positive certification outcome
unless an authorised exception/waiver mechanism permits otherwise.

Non-Blocking Gate
= contributes decision information without independently preventing
progression.

This is conceptual authority only.

Exact semantics require reconciliation.

============================================================ 9. NO AUTOMATIC CERTIFICATION
============================================================

A failed blocking Gate must be visible and consequential.

But Gate evaluation does NOT itself write:

GO
CONDITIONAL GO
NO-GO

Those belong to Screen 4 Certification.

Do not implement automatic certification from Gate status.

============================================================ 10. GATE CONDITION
============================================================

A Gate must eventually contain an explicit inspectable condition.

Conceptual examples:

Open Critical Defects = 0

Mandatory Acceptance Criteria coverage = complete

Required Test Plan execution completed

Required Evidence present

Unresolved blocking Quality Risks = 0

Required accessibility verification completed

These examples do NOT authorise a rule DSL or schema.

============================================================ 11. EXPLAINABILITY
============================================================

Every Gate evaluation must ultimately be explainable.

The product must be able to answer:

What condition was evaluated?

Against which context?

Which authoritative quality facts were used?

What were the observed values?

Why did the Gate pass/fail/remain unevaluated?

When was it evaluated?

Which Gate definition/version was used?

Do not build opaque scoring.

============================================================ 12. GATE EVALUATION
============================================================

Gate Definition and Gate Evaluation are distinct concepts.

GATE DEFINITION:
the quality condition/policy.

GATE EVALUATION:
the result of applying that definition to a particular decision context.

Do not mutate historical evaluations merely because the Gate definition
later changes.

============================================================ 13. HISTORY
============================================================

Historical Gate evaluations matter.

If:

Gate v1 passes

then the Gate definition changes

the previous evaluation must remain historically truthful.

Do not rewrite previous decision evidence.

============================================================ 14. GATE VERSIONING
============================================================

The visual does not define a version model.

However, domain reconciliation must explicitly inspect whether Gate
definitions require immutable/versioned configuration for auditability.

Do not invent versioning now.

============================================================ 15. SCOPE
============================================================

The visual illustrates scope such as:

Release / Candidate

This is NOT authority for a Release aggregate.

Domain reconciliation still needs to establish the real decision context.

Possible future scopes may include:

Application
Environment
delivery candidate
build/version
release/candidate
other existing authoritative context

Do not decide now.

============================================================ 16. APPLICATION
============================================================

Reuse:

qep_application

No second Application authority.

Application isolation must remain server-enforced.

============================================================ 17. ENVIRONMENT
============================================================

Reuse:

qep_application_environment

A Gate may legitimately evaluate differently by Environment.

Do not create a Gate-specific Environment store.

============================================================ 18. QUALITY FACT SOURCES
============================================================

Potential authoritative Gate inputs include existing:

Requirements
User Stories
Acceptance Criteria
Traceability
Test Cases
Suites
Test Plans
Executions
Defects
Evidence
Exploratory Sessions
Issues
Experience Plans
UI/UX Verification
Quality Risks

Each must remain authoritative in its own domain.

============================================================ 19. COVERAGE CONDITIONS
============================================================

Coverage Gates must use real traceability.

Preserve:

Coverage ≠ Result.

For example:

AC coverage

is different from:

tests passing.

============================================================ 20. EXECUTION CONDITIONS
============================================================

Execution Gates use the Phase 4 customer-facing execution composition.

Preserve:

Status ≠ Result.

Do not evaluate raw automation provider runs as customer Executions.

============================================================ 21. DEFECT CONDITIONS
============================================================

Use the existing Defect SoR and its actual severity/lifecycle.

Do not create Gate-specific defect classifications.

============================================================ 22. EVIDENCE CONDITIONS
============================================================

Use the existing Evidence SoR.

A Gate may eventually require specific Evidence.

But:

Evidence count ≠ Evidence sufficiency.

The condition must state what evidence is actually required.

============================================================ 23. QUALITY RISK CONDITIONS
============================================================

Quality Gates may evaluate Screen 1 Quality Risk facts.

Example concept:

"No unresolved blocking Quality Risk."

But Risk remains independently managed.

Gate evaluation must not mutate the Risk.

============================================================ 24. PHASE 5 ISSUES
============================================================

An Issue may be relevant to a Gate.

But:

Issue ≠ Defect
Issue ≠ Risk
Issue ≠ automatic Gate failure

Any Gate condition involving Issues must be explicit.

============================================================ 25. GATE SETS
============================================================

The visual introduces Gate Sets.

Examples shown are illustrative.

Conceptually a Gate Set is a reusable collection of Gate definitions
for a defined quality policy/context.

Potential examples:

Release Readiness
Security & Compliance
Quality Baseline
Customer Experience

Do NOT create these sets from the mock-up.

Domain reconciliation must determine whether the existing repository
already contains an equivalent concept.

============================================================ 26. TEMPLATES
============================================================

The visual contains a Templates navigation concept.

This means reusable Gate configuration may be useful.

It does NOT authorise a template backend.

Reconcile first.

============================================================ 27. ACTIVE / ARCHIVED
============================================================

The visual implies Gate lifecycle management.

Do not derive durable lifecycle enums from:

Active
Archive

until repository reconciliation.

============================================================ 28. EVALUATION SUMMARY
============================================================

The evaluation summary must derive from actual Gate evaluations.

It may show counts of:

Passed
At Risk
Failed
Not Evaluated

Do not turn those counts into a hidden readiness score.

============================================================ 29. RECENT EVALUATIONS
============================================================

Show real Gate evaluation events.

Conceptually:

Gate
result
evaluation time
reason/context

Do not synthesize history from current Gate state.

============================================================ 30. FAILURE IMPACT
============================================================

The visual includes Failure Impact.

This represents the consequence of Gate failure for the decision process.

Examples in the visual are illustrative.

Domain reconciliation must determine whether this is:

Blocking/Non-Blocking only

or

a richer policy concept.

Do not invent a second risk-severity system.

============================================================ 31. TREND
============================================================

The visual contains Trend.

Trend must be based on genuine evaluation history.

For example:

previous evaluations vs current evaluation.

Do not infer trend from arbitrary count movement.

============================================================ 32. CREATE GATE
============================================================

The visual establishes:

- Create Gate

This means APZQEP needs a controlled Gate-definition workflow if the
domain reconciliation supports it.

It does NOT authorise implementation now.

============================================================ 33. GATE DETAIL
============================================================

Selecting a Gate should eventually expose:

Gate identity
Description
Condition
Scope
Type
Current evaluation
Facts used
Observed values
Failure reason
Evaluation history
Gate definition history where applicable

Do not hide the condition behind a simple coloured badge.

============================================================ 34. READINESS RELATIONSHIP
============================================================

Screen 2 Release Readiness consumes Gate evaluations.

It does not own Gate definitions.

Conceptually:

QUALITY FACTS
↓
QUALITY GATES
↓
READINESS BRIEFING

The briefing explains the current decision posture.

============================================================ 35. CERTIFICATION RELATIONSHIP
============================================================

Screen 4 Certification consumes:

Readiness briefing
Gate evaluations
Quality Risks
Evidence
Exceptions/waivers if authorised
human judgement

Gate evaluation does not itself become Certification.

============================================================ 36. EXCEPTIONS / WAIVERS
============================================================

Do NOT implement these yet.

However, this is now an explicit domain reconciliation question.

If a blocking Gate fails, APZQEP may need controlled:

exception
waiver
risk acceptance

before a conditional decision can be issued.

Do not assume the mechanism.

Screen 4 will help define it.

============================================================ 37. NO HIDDEN WEIGHTING
============================================================

Explicitly prohibit:

Gate weighting
weighted readiness
gate score
quality score
confidence score
AI score

unless later domain analysis explicitly authorises such a model.

A Gate should be understandable as a condition, not a mysterious number.

============================================================ 38. EVALUATION TIMING
============================================================

Domain reconciliation must determine whether Gate evaluation is:

on demand
event-triggered
scheduled
at Certification
or a combination.

Do not infer this from the Refresh control.

============================================================ 39. SNAPSHOT / AS-OF
============================================================

Historical decision integrity is important.

Domain reconciliation must determine whether an Evaluation snapshots:

Gate definition
decision context
input facts/references
observed values
result
reason
evaluation timestamp

This will be critical for Certification.

============================================================ 40. MOBILE
============================================================

Mobile is first-class.

Do NOT squeeze the desktop Gate register into a narrow table.

The visual establishes mobile compositions for:

Gate summary
Active Gates
Gate Detail
Evaluation Summary
Gate Sets

Same domain.
Same APIs.
Responsive presentation.

============================================================ 41. LIGHT / DARK
============================================================

Desktop light/dark:

IDENTICAL GEOMETRY.

Mobile light/dark:

IDENTICAL GEOMETRY.

Theme changes appearance only.

============================================================ 42. RELEASE
============================================================

STILL NOT AUTHORISED.

Do not create:

qep_release
qep_release_candidate

from Screen 3.

============================================================ 43. NOT AUTHORISED
============================================================

Do not implement:

Phase 6
Gate backend
Gate rule engine
Gate DSL
Gate templates
Gate Sets
Release
Release Candidate
readiness scoring
automatic Certification
automatic GO/NO-GO
waiver backend
AI gate evaluation
AI decision recommendation
SSH
Terminal
Source write
Phase 7

============================================================ 44. DOMAIN QUESTIONS TO CARRY FORWARD
============================================================

Carry these into Phase 6 reconciliation:

1. Does an existing Gate definition authority exist?

2. Does an existing Gate evaluation authority exist?

3. Are current orchestration Gates reusable or merely advisory?

4. What is the authoritative Gate decision context?

5. Is a Release/Release Candidate aggregate actually required?

6. How should Gate definitions be versioned?

7. What gets snapshotted during evaluation?

8. Which existing quality facts are safely evaluable?

9. What is Blocking vs Non-Blocking semantically?

10. Is At Risk a genuine evaluation result or presentation state?

11. What should Not Evaluated mean?

12. Do Gate Sets require their own durable aggregate?

13. Are Gate Templates genuinely required?

14. How are Gates activated/deactivated/archived?

15. How are Gate evaluations triggered?

16. How does evaluation history remain immutable?

17. Can Gate conditions span multiple Applications?

18. How should Environment-specific Gates work?

19. Is a controlled exception/waiver/risk-acceptance mechanism required?

20. What is the exact relationship:
    Gate → Readiness → Certification?

============================================================ 45. RECORD
============================================================

Store the supplied visual as:

docs/frontend/apzqep-redesign/visuals/phase-6/
03-quality-gates-authority.png

Create:

docs/frontend/apzqep-redesign/
APZQEP-PHASE-6-SCREEN-3-QUALITY-GATES.md

Record:

SCREEN 1 — QUALITY RISK:
LOCKED

SCREEN 2 — RELEASE READINESS:
LOCKED

SCREEN 3 — QUALITY GATES:
LOCKED

SCREEN 4 — CERTIFICATION / GO-NO-GO:
NEXT

PHASE 6 VISUAL DESIGN:
IN PROGRESS

DOMAIN RECONCILIATION:
NOT STARTED

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED

STOP.

Wait for Screen 4 visual authority.
