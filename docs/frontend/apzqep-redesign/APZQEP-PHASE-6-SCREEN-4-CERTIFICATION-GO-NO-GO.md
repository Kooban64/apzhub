# APZQEP Phase 6 — Screen 4 visual authority (Certification / Go-No-Go)

**Record:** APZQEP REDESIGN / PHASE 6 / SCREEN 4 / CERTIFICATION / GO-NO-GO / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-20  
**Authority image:** [visuals/phase-6/04-certification-go-no-go-authority.png](./visuals/phase-6/04-certification-go-no-go-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for APZQEP Certification / Go-No-Go. It is the **controlled human decision surface**, not a prettier readiness dashboard and not a certification engine.

Preserve:

```text
QUALITY FACTS → QUALITY RISK → QUALITY GATE CONDITIONS → GATE EVALUATIONS
    → RELEASE READINESS BRIEFING → HUMAN CERTIFICATION DECISION
```

Certification is the DECISION layer. It does not manufacture quality facts. No metric, Gate, Risk, readiness posture, algorithm, or AI may write the final decision. **Recommended Posture — AT RISK is advisory presentation only.** It is not Certification, not an automatic decision, and not an AI recommendation. A safer later label may be **Current Readiness Posture**.

GO, CONDITIONAL GO, NO-GO, and DEFER are distinct product concepts. DEFER ≠ NO-GO ≠ NOT READY. CONDITIONAL GO is not a weaker green badge and not an automatic result of one At Risk Gate. Decision justification is required. Do not create `qep_release` or `qep_release_candidate`. Do not create parallel Certification. Reconcile existing certification capability first. No scores. No Force GO. No Ignore Gate.

Phase 5 is **CLOSED · ACCEPTED**. Screens 1–4 are **LOCKED**. Phase 6 visual design is **COMPLETE**. Domain reconciliation is **NEXT**. Phase 6 implementation is **NOT AUTHORISED**. Phase 7 is **NOT STARTED**.

```text
SCREEN 1 — QUALITY RISK:
LOCKED

SCREEN 2 — RELEASE READINESS:
LOCKED

SCREEN 3 — QUALITY GATES:
LOCKED

SCREEN 4 — CERTIFICATION / GO-NO-GO:
LOCKED

PHASE 6 VISUAL DESIGN:
COMPLETE

DOMAIN RECONCILIATION:
NEXT

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED

PHASE 7:
NOT STARTED
```

---

# APZQEP REDESIGN — PHASE 6

# SCREEN 4 — CERTIFICATION / GO-NO-GO

# VISUAL AUTHORITY ONLY — NO IMPLEMENTATION

Current status:

SCREEN 1 — QUALITY RISK:
LOCKED

SCREEN 2 — RELEASE READINESS:
LOCKED

SCREEN 3 — QUALITY GATES:
LOCKED

SCREEN 4 — CERTIFICATION / GO-NO-GO:
LOCK THIS VISUAL

PHASE 6 VISUAL DESIGN:
COMPLETE AFTER THIS LOCK

DOMAIN RECONCILIATION:
NEXT

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED

============================================================

1. VISUAL AUTHORITY
   \============================================================

The attached image is visual authority for:

SCREEN 4 — CERTIFICATION / GO-NO-GO

Record it.

Do NOT implement.

Do NOT create schemas, migrations, APIs, Certification stores,
Release stores, waiver stores or decision engines.

The visual completes Phase 6 presentation design.

Domain reconciliation comes NEXT.

============================================================ 2. PURPOSE
============================================================

Certification / Go-No-Go is the controlled human decision workspace
for determining whether the selected delivery/readiness context may
proceed.

It brings together:

Readiness briefing
Quality Gate evaluations
Quality Risks
Evidence
authorised exceptions/waivers if they exist
human justification

and records the final decision.

Certification is the DECISION layer.

It does not manufacture the underlying quality facts.

============================================================ 3. COMPLETE PHASE 6 MODEL
============================================================

The four screens now establish:

QUALITY FACTS
↓
QUALITY RISK
↓
QUALITY GATE CONDITIONS
↓
GATE EVALUATIONS
↓
RELEASE READINESS BRIEFING
↓
HUMAN CERTIFICATION DECISION

Do not collapse these layers.

============================================================ 4. HUMAN DECISION IS AUTHORITATIVE
============================================================

Certification is a HUMAN decision.

No quality metric, Gate, Risk, readiness posture, algorithm or AI
may directly write the final certification decision.

The product presents the evidence.

An authorised human records the decision.

============================================================ 5. DECISION OPTIONS
============================================================

The visual establishes the product concepts:

GO

CONDITIONAL GO

NO-GO

DEFER

These are visual/product concepts pending domain reconciliation.

Do not create enums merely from this image.

Their semantics must be reconciled against the existing certification
capability.

============================================================ 6. GO
============================================================

Conceptually:

GO means the authorised decision-maker concludes that the applicable
quality conditions are sufficiently satisfied for the intended
decision context.

GO must have:

decision-maker
timestamp
decision context
justification
supporting facts/evidence

The exact durable model is not authorised yet.

============================================================ 7. CONDITIONAL GO
============================================================

Conceptually:

CONDITIONAL GO means progression is authorised subject to explicitly
recorded conditions, exceptions, accepted risks or required follow-up.

It is NOT:

a weaker green badge

or

an automatic result of having one At Risk Gate.

The conditions must be explicit and auditable.

============================================================ 8. NO-GO
============================================================

Conceptually:

NO-GO means progression is not authorised for the evaluated context.

The decision must state WHY.

A NO-GO decision must not mutate:

Gate results
Risks
Defects
Executions
Evidence

Those remain historical quality facts.

============================================================ 9. DEFER
============================================================

Conceptually:

DEFER means the decision is intentionally postponed because sufficient
decision information or authority is not yet available.

DEFER ≠ NO-GO.

DEFER ≠ NOT READY.

Do not collapse these concepts.

============================================================ 10. RECOMMENDED POSTURE
============================================================

The visual shows:

Recommended Posture
AT RISK

This is ADVISORY PRESENTATION ONLY.

It is NOT:

Certification
automatic decision
AI recommendation
decision engine output

Domain reconciliation must determine whether APZQEP should even retain
the word "Recommended".

A safer implementation may use:

Current Readiness Posture

rather than:

Recommended Posture.

Do not implement automated recommendations from the visual.

============================================================ 11. READINESS POSTURE ≠ CERTIFICATION
============================================================

Example:

Readiness Posture:
AT RISK

Certification Decision:
GO

may be valid IF:

the authorised decision-maker accepts the identified risk,
provides justification,
and applicable policy permits it.

Likewise:

Readiness Posture:
READY

does not force:

GO.

The human decision remains distinct.

============================================================ 12. GATE RESULTS
============================================================

Certification consumes Gate evaluations from Screen 3.

Show:

Passed
At Risk
Failed
Not Evaluated

using real Gate evaluations.

Do not recalculate Gates inside Certification.

============================================================ 13. BLOCKING GATES
============================================================

A failed Blocking Gate must be highly visible.

Whether a human may override/waive such a Gate is NOT decided by this
visual.

This is a critical domain reconciliation question.

Do not silently allow GO over a failed Blocking Gate.

============================================================ 14. QUALITY RISKS
============================================================

Certification consumes Quality Risks from Screen 1.

Show relevant:

Risk
Level
Status
Owner
mitigation/acceptance context where applicable

Do not duplicate Risk records.

Risk does not itself determine Certification.

============================================================ 15. EVIDENCE
============================================================

Existing Evidence SoR remains authoritative.

Certification should provide an evidence sufficiency view and access
to relevant supporting Evidence.

Do not create Certification Evidence as another Evidence store.

Certification may eventually snapshot/reference the Evidence used for
the decision.

Domain reconciliation must determine how.

============================================================ 16. DECISION JUSTIFICATION
============================================================

Decision Justification is REQUIRED.

A Certification decision must not be only:

GO

or:

NO-GO.

The authorised decision-maker must record the rationale.

The visual's free-text area establishes this product requirement.

Exact validation rules are not authorised yet.

============================================================ 17. DECISION OWNER
============================================================

A Certification decision requires an accountable human identity.

Reuse existing APZHUB identity/IAM.

Do not create a Certification people directory.

Display human-readable identity where available.

Avoid UUID-first presentation.

============================================================ 18. DECISION DATE / TIME
============================================================

Every recorded Certification decision must have authoritative time.

Do not rely on UI-local timestamps as the durable authority.

Exact audit/time semantics require reconciliation.

============================================================ 19. DECISION EXPIRY
============================================================

The visual contains:

Decision Expiry (optional)

This is a useful concept but remains provisional.

Domain reconciliation must determine whether Certification decisions
may:

expire
remain valid indefinitely
be superseded
be revoked

Do not implement expiry from the visual alone.

============================================================ 20. SUPPORTING RATIONALE
============================================================

The visual illustrates supporting rationale selections.

Examples include:

Readiness acceptable
Business impact accepted
Customer approval
Other

These are illustrative.

Do NOT create these as enums.

Domain reconciliation must determine whether structured rationale is
necessary in addition to mandatory justification.

============================================================ 21. EXCEPTIONS / WAIVERS
============================================================

The visual contains:

Exceptions / Waivers

This establishes a PRODUCT NEED for controlled exception visibility.

It does NOT yet authorise a Waiver aggregate.

Domain reconciliation must determine whether the repository needs:

Exception
Waiver
Risk Acceptance
Gate Override

or some combination.

Do not create all four.

============================================================ 22. EXCEPTION CONTROL
============================================================

If exceptions/waivers are authorised later, they must be:

explicit
authorised
traceable
time-bounded where appropriate
linked to the relevant Gate/Risk/context
historically immutable

No hidden override checkbox.

============================================================ 23. GATE OVERRIDE
============================================================

Do NOT implement:

"Ignore Gate"

or:

"Force GO"

as simple actions.

If a blocking Gate can legally/policy-wise be overridden, that must
occur through a controlled exception/waiver mechanism established by
domain reconciliation.

============================================================ 24. DECISION CONTEXT
============================================================

The visual illustrates:

Release / Candidate
Application
Environment
As-of

The actual authoritative decision context remains unresolved.

Do not create:

qep_release
qep_release_candidate

from this screen.

This is now a central reconciliation question.

============================================================ 25. AS-OF
============================================================

Certification is historical.

The decision must be based on quality state as it existed for the
decision context.

Domain reconciliation must determine what gets snapshotted versus
referenced.

A later Defect closure must NOT make an old NO-GO appear as though it
was based on clean quality.

============================================================ 26. CERTIFICATION SNAPSHOT
============================================================

Domain reconciliation must determine whether a Certification decision
must preserve an immutable snapshot of:

decision context
readiness posture
Gate evaluations
Quality Risks
Evidence references
Issues
exceptions/waivers
decision
justification
decision-maker
timestamp

Historical integrity is mandatory.

Do not implement the snapshot yet.

============================================================ 27. RECENT DECISIONS
============================================================

The visual includes Recent Decisions.

These must eventually represent genuine Certification records.

Potential information:

decision
context
version/build/candidate
decision-maker
timestamp

Do not synthesize them from current readiness.

============================================================ 28. HISTORY
============================================================

Certification requires strong history/auditability.

Potential events:

Certification started
Evidence reviewed
Exception attached
Decision recorded
Decision superseded
Decision expired
Decision revoked

These are conceptual examples only.

Use real events.

Do not manufacture history from current state.

============================================================ 29. IMMUTABILITY
============================================================

A recorded Certification decision must be historically truthful.

Do not simply PATCH:

GO → NO-GO

and erase history.

If the decision changes, domain reconciliation should determine whether
the correct model is:

new Certification
superseding decision
revocation
re-certification

Preserve previous decisions.

============================================================ 30. CERTIFICATION ≠ RELEASE
============================================================

Certification does not itself require APZQEP to own Release deployment.

APZQEP decides/records quality certification.

It does not necessarily:

deploy
publish
merge
release software

Do not turn Screen 4 into deployment orchestration.

============================================================ 31. EXISTING CERTIFICATION CAPABILITY
============================================================

Phase 0 established:

Certification evaluations exist.

Human GO / NO_GO decisions exist.

This capability MUST be reconciled before any new Certification store
is considered.

Do not create parallel Certification.

Extend the existing capability if semantically safe.

============================================================ 32. CONDITIONAL GO GAP
============================================================

Existing capability was previously described as:

GO / NO_GO

The visual introduces:

CONDITIONAL GO
DEFER

These are therefore explicit reconciliation items.

Do not assume the existing domain supports them.

============================================================ 33. READINESS SNAPSHOT
============================================================

Screen 4 contains a Readiness Snapshot tab.

This should ultimately show the quality posture used for the decision.

It must not silently show today's live state for an old Certification
unless clearly labelled as current/live context.

Historical decision evidence and live quality state must remain
distinguishable.

============================================================ 34. GATE RESULTS TAB
============================================================

Show the Gate evaluations relevant to this Certification context.

Historical Certification should preserve which evaluations informed
the decision.

============================================================ 35. RISKS TAB
============================================================

Show the Quality Risks relevant to the decision.

Do not mutate Risk lifecycle from Certification.

============================================================ 36. EVIDENCE TAB
============================================================

Show relevant existing Evidence.

Do not duplicate Evidence.

============================================================ 37. NOTES
============================================================

The visual includes Notes.

Domain reconciliation must determine whether these should reuse an
existing note/comment/activity capability or require bounded
Certification notes.

Do not create a generic note engine from this screen.

============================================================ 38. SUMMARY
============================================================

Summary should be an audit-ready decision summary.

Conceptually:

Decision
Decision-maker
Decision time
Decision context
Justification
Readiness posture
Gate outcomes
Key Risks
Evidence basis
Exceptions/waivers
conditions if Conditional Go

No quality score is required.

============================================================ 39. MOBILE
============================================================

Mobile is first-class for review.

Do not squeeze the desktop decision workspace into a narrow layout.

The visual establishes mobile surfaces for:

Decision
Gate Results
Risks
Evidence
Exceptions / Waivers
Recent Decisions

Recording a Certification decision on mobile must not bypass any
required controls.

============================================================ 40. LIGHT / DARK
============================================================

Desktop light/dark geometry:
IDENTICAL

Mobile light/dark geometry:
IDENTICAL

Maintain the accepted APZQEP visual system.

============================================================ 41. AUTHZ
============================================================

Certification is sensitive.

Domain reconciliation must inspect existing Certification permissions
and determine who may:

view Certification
start Certification
record decision
approve exception
supersede/revoke decision

Do not infer these privileges from QEP Master UX.

Server-side AuthZ remains authoritative.

============================================================ 42. NO AUTOMATION OF HUMAN DECISION
============================================================

Explicitly prohibited:

automatic GO
automatic CONDITIONAL GO
automatic NO-GO
automatic DEFER
AI Certification
AI decision approval
Gate engine writing Certification
readiness posture writing Certification

Automation may provide facts/evaluations.

The human decision is explicit.

============================================================ 43. NO SCORES
============================================================

Do not implement:

Certification Score
Release Score
Confidence Score
Decision Score
AI Confidence

Certification is justified by facts, Gates, Risks and Evidence.

============================================================ 44. RELEASE / RELEASE CANDIDATE
============================================================

STILL NOT AUTHORISED.

All four Phase 6 visuals are now available.

The Release/Release Candidate question must now be answered through
repository/domain reconciliation.

Do not create either object before that analysis.

============================================================ 45. DOMAIN QUESTIONS
============================================================

Carry these into Phase 6 reconciliation:

1. What existing Certification SoR exists?

2. Can it safely support the locked Screen 4?

3. What is the authoritative decision context?

4. Does APZQEP genuinely require Release?

5. Does it require Release Candidate?

6. Can an existing build/version/SCM concept provide the context?

7. Is Certification live-state based or snapshot based?

8. What must be immutable at decision time?

9. How are Gate evaluations attached/frozen?

10. How are Quality Risks attached/frozen?

11. How is Evidence attached/frozen?

12. How are Phase 5 Issues represented?

13. Is CONDITIONAL GO required as a durable decision?

14. Is DEFER required as a durable decision?

15. What exactly is a Conditional Go condition?

16. Can a failed Blocking Gate be overridden?

17. If yes, what controlled mechanism authorises it?

18. Is the correct concept Exception, Waiver, Risk Acceptance,
    Gate Override, or a bounded combination?

19. Who may authorise exceptions?

20. Do exceptions expire?

21. Can Certifications expire?

22. Can Certifications be revoked?

23. How are decisions superseded without rewriting history?

24. How is re-certification represented?

25. What existing audit/event capabilities can be reused?

26. What AuthZ exists today for certification decisions?

27. How does Readiness consume Gate results?

28. Is readiness posture derived, persisted or snapshotted?

29. Does the illustrative "Recommended Posture" survive reconciliation,
    or should it become "Current Readiness Posture"?

30. What is the minimum new domain required for all four locked screens?

============================================================ 46. PHASE 6 VISUAL DESIGN LOCK
============================================================

After recording Screen 4, the visual set is:

SCREEN 1 — QUALITY RISK
LOCKED

SCREEN 2 — RELEASE READINESS
LOCKED

SCREEN 3 — QUALITY GATES
LOCKED

SCREEN 4 — CERTIFICATION / GO-NO-GO
LOCKED

PHASE 6 VISUAL DESIGN:
COMPLETE

DOMAIN RECONCILIATION:
NEXT

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED

============================================================ 47. RECORD
============================================================

Store the supplied visual as:

docs/frontend/apzqep-redesign/visuals/phase-6/
04-certification-go-no-go-authority.png

Create:

docs/frontend/apzqep-redesign/
APZQEP-PHASE-6-SCREEN-4-CERTIFICATION-GO-NO-GO.md

Do not implement.

Return only:

SCREEN 4 — CERTIFICATION / GO-NO-GO:
LOCKED

PHASE 6 VISUAL DESIGN:
COMPLETE

DOMAIN RECONCILIATION:
NEXT

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED

PHASE 7:
NOT STARTED

STOP.
