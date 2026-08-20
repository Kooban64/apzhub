# APZQEP Phase 6 — Screen 1 visual authority (Quality Risk)

**Record:** APZQEP REDESIGN / PHASE 6 / SCREEN 1 / QUALITY RISK / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-20  
**Authority image:** [visuals/phase-6/01-quality-risk-authority.png](./visuals/phase-6/01-quality-risk-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for APZQEP Quality Risk. It is a working risk register, not a dashboard. Desktop is a dense operational view; mobile is a first-class risk workflow (list, filters, risk level, detail, summary), not a compressed table.

Phase 5 is **CLOSED · ACCEPTED**. Screens 2–4 are **not locked**. Domain reconciliation is **NOT STARTED**. Phase 6 implementation is **NOT AUTHORISED**.

```text
SCREEN 1 — QUALITY RISK:
LOCKED

SCREEN 2 — RELEASE READINESS:
NEXT

SCREEN 3 — QUALITY GATES:
PENDING

SCREEN 4 — CERTIFICATION / GO-NO-GO:
PENDING

PHASE 6 VISUAL DESIGN:
IN PROGRESS

DOMAIN RECONCILIATION:
NOT STARTED

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED
```

**Quality signal ≠ Quality Risk.** Failed tests, Defects, coverage gaps, Exploratory Issues, UI/UX Issues, missing Evidence, and failed Gates may support a Risk. They are not automatically Risks. Do not invent scores, Gate logic, readiness calculations, or a Release aggregate from this screen.

---

# APZQEP REDESIGN — PHASE 6

# SCREEN 1 — QUALITY RISK

# VISUAL AUTHORITY ONLY — NO IMPLEMENTATION

Phase 5 is COMPLETE and CLOSED.

Phase 6 begins with VISUAL DESIGN ONLY.

The attached image is the VISUAL AUTHORITY for:

SCREEN 1 — QUALITY RISK

Do NOT implement Phase 6.
Do NOT create schemas or migrations.
Do NOT replace the existing risk ledger.
Do NOT invent quality-risk calculations.

============================================================
PHASE 6 VISUAL SET
============================================================

SCREEN 1 — Quality Risk
LOCK THIS VISUAL

SCREEN 2 — Release Readiness
NEXT

SCREEN 3 — Quality Gates
PENDING

SCREEN 4 — Certification / Go-No-Go
PENDING

DOMAIN RECONCILIATION
NOT STARTED

PHASE 6 IMPLEMENTATION
NOT AUTHORISED

============================================================

1. PURPOSE
   \============================================================

Quality Risk is the central operational register for risks that may
affect:

quality outcomes
customer experience
verification confidence
release/readiness decisions

It must answer:

What quality risks exist?
Which require attention?
Why are they risks?
What quality evidence supports them?
Who owns them?
What is being done?
How are they changing?

This is NOT merely a generic enterprise risk register.

It is APZQEP's quality-risk work surface.

============================================================ 2. IMPORTANT REPOSITORY REALITY
============================================================

Phase 0 established that existing QEP risk is weak:

- manual/file-ledger based
- not an aggregation of quality signals
- not a mature quality-risk SoR
- no authoritative RAG/readiness scoring

Therefore this visual MUST NOT be interpreted as permission to create
a new risk backend.

After Screens 1–4 are locked, domain reconciliation must determine
whether the existing risk capability is:

REUSED
EXTENDED
or requires a new durable authority.

Do not decide that now.

============================================================ 3. DESKTOP COMPOSITION
============================================================

Match the attached visual authority.

Use the existing APZQEP shell.

Primary title:

Quality Risk

Primary action:

- Create Risk

Primary navigation views:

All Risks
My Risks
By Application
By Status
By Risk Level
By Domain
By Owner
Recent

The main surface is a dense operational risk register.

============================================================ 4. RISK REGISTER
============================================================

Conceptually support:

Risk ID
Risk Title
Description
Domain
Risk Level
Status
Owner
Updated
Impact
Likelihood
Trend
Linked Records

The exact durable schema is NOT authorised by this visual.

Do not manufacture fields simply because they appear as columns.

============================================================ 5. QUALITY-RISK DOMAINS
============================================================

The visual illustrates examples such as:

Functional Quality
Accessibility
Responsive Design
Test Reliability
Defect Management
Usability
Third-Party Dependency
Security

These are examples of quality-risk classification.

Do not create an enum directly from the mock-up.

Domain reconciliation must inspect existing APZQEP risk and quality
vocabulary first.

============================================================ 6. RISK LEVEL
============================================================

The visual uses:

High
Medium
Low

This is PRODUCT PRESENTATION at this stage.

Do not assume the durable risk model is a three-value enum.

Domain reconciliation must inspect:

existing risk fields
impact
likelihood
severity concepts
risk scoring

before defining persistence.

============================================================ 7. IMPACT
============================================================

Impact represents the potential consequence if the risk materialises.

This is distinct from:

Defect severity
Test Case result
Issue state
readiness state

Do not reuse Defect severity merely because both use terms such as
High/Medium/Low.

============================================================ 8. LIKELIHOOD
============================================================

Likelihood represents the assessed probability of the risk occurring
or continuing to affect quality.

It is independent from Impact.

Do not manufacture an automatic probability model.

============================================================ 9. RISK LEVEL DERIVATION
============================================================

The visual displays Risk Level alongside Impact and Likelihood.

This does NOT authorise a specific matrix or formula.

Domain reconciliation must determine whether Risk Level is:

explicitly assessed
derived from Impact × Likelihood
or represented by an existing risk model.

Do not invent mathematics simply to reproduce the visual.

============================================================ 10. STATUS
============================================================

The visual illustrates concepts such as:

Identified
Investigating
Active
Mitigating
Closed

These remain visual concepts.

Do not create lifecycle enums from the image.

The repository must be reconciled first.

============================================================ 11. TREND
============================================================

Trend indicates whether exposure appears to be:

Increasing
Stable
Decreasing

or equivalent.

Trend must be based on real assessment/history.

Do not derive trend merely because:

a Defect was opened
a Test failed
a count changed

unless the eventual domain model explicitly defines that behaviour.

============================================================ 12. RISK ≠ QUALITY SIGNAL
============================================================

This distinction is critical.

A:

failed Test
Defect
coverage gap
Exploratory Issue
UI/UX Issue
missing Evidence
failed Gate

may contribute to understanding a Risk.

It is NOT automatically a Risk.

Quality Risk requires deliberate risk context.

Do not automatically manufacture one Risk for every quality signal.

============================================================ 13. LINKED QUALITY RECORDS
============================================================

A Quality Risk should eventually be able to link meaningfully to
existing APZQEP records.

Potential examples:

Requirement
User Story
Acceptance Criterion
Test Case
Suite
Test Plan
Execution
Defect
Evidence
Exploratory Session
Observation
Issue
Experience Plan
UI/UX Verification
Application

These relationships must be real.

Do not create fake linkage merely to populate counts.

============================================================ 14. PHASE 5 RELATIONSHIPS
============================================================

Phase 5 established:

Observation ≠ Issue ≠ Defect.

Preserve this.

Likewise:

Observation ≠ Risk
Issue ≠ Risk
Defect ≠ Risk

Any of these may SUPPORT or motivate a Risk.

Risk remains its own quality-management concept.

============================================================ 15. OWNERSHIP
============================================================

Every managed Quality Risk should have clear ownership where required.

The visual shows Owner.

Do not create another people directory.

Reuse existing APZHUB/QEP identity and AuthZ capabilities.

Display human-readable identity where available.

Do not deliberately expose UUIDs as the primary UX.

============================================================ 16. APPLICATION CONTEXT
============================================================

Quality Risk operates within the existing:

qep_application

context.

The Application selector follows the established APZQEP behaviour.

New application-scoped risks must be application-safe and tenant-safe.

Do not create another Application concept.

============================================================ 17. CROSS-APPLICATION RISK
============================================================

Do not assume from the visual that every future risk must belong to
exactly one Application.

Domain reconciliation must determine whether APZQEP needs:

application-specific risks only

or

application-specific + portfolio/cross-application quality risks.

Do not solve this from the UI.

============================================================ 18. SUMMARY
============================================================

The visual includes operational summary information such as:

Total Risks
Active
Investigating
Mitigating
Recently Closed
High Risk
Risks by Level

These must be derived from real records.

Do NOT introduce:

Quality Score
Readiness %
Release Score
Risk-adjusted Quality %
AI Risk Score

============================================================ 19. RISK DISTRIBUTION
============================================================

Charts are supporting views of the same authoritative risk data.

Do not create analytics-specific stores.

The distribution visual should derive from the risk register.

============================================================ 20. FILTERING
============================================================

Conceptually support filtering by:

Status
Risk Level
Domain
Owner
Updated
Application

and search.

Filters are product interaction requirements.

They are not necessarily persisted domain concepts.

============================================================ 21. RISK DETAIL
============================================================

Although Screen 1 is primarily the register, selecting a Risk should
provide sufficient inspection context.

Conceptually include:

Risk identity
Description
Domain
Status
Risk Level
Impact
Likelihood
Trend
Owner
Application
linked quality records

The exact inspector/detail model will be reconciled later.

Do not create another Phase 6 visual screen merely for Risk Detail
unless explicitly authorised.

============================================================ 22. CREATE RISK
============================================================

The visual establishes:

- Create Risk

This represents deliberate human creation.

Do not implement automatic risk creation from quality signals.

Later phases may assist humans with detection/recommendation, but that
is NOT authorised here.

============================================================ 23. MOBILE
============================================================

Mobile is first-class.

Do NOT squeeze the desktop register into a tiny table.

The visual establishes mobile surfaces for:

Risk list
Filters
Risk Level
Risk Detail
Summary

Use cards/compact rows and dedicated detail surfaces.

Preserve established APZQEP mobile navigation.

============================================================ 24. LIGHT / DARK
============================================================

Desktop light and dark:

IDENTICAL GEOMETRY.

Mobile light and dark:

IDENTICAL GEOMETRY.

Theme changes appearance only.

Maintain the accepted APZQEP visual system from Phases 1–5.

============================================================ 25. RELATIONSHIP TO RELEASE READINESS
============================================================

Quality Risk will eventually contribute context to:

SCREEN 2 — Release Readiness

But this visual does NOT define readiness calculations.

A High Risk does not automatically mean:

NO-GO

unless an explicit future Gate/Policy says so.

Do not implement readiness logic from Screen 1.

============================================================ 26. RELATIONSHIP TO QUALITY GATES
============================================================

A Quality Gate may eventually evaluate risk conditions such as:

no unresolved Critical/High blocking risk

but that belongs to:

SCREEN 3 — QUALITY GATES

Do not put Gate logic into the Risk aggregate now.

============================================================ 27. RELATIONSHIP TO CERTIFICATION
============================================================

Risk information will eventually inform the human:

Certification / Go-No-Go

decision.

Risk does not itself certify anything.

============================================================ 28. RELEASE
============================================================

DO NOT CREATE A RELEASE AGGREGATE.

Phase 6 visual design must complete first.

Release/candidate context will be explicitly reconciled after
Screens 1–4.

Do not manufacture:

qep_release
qep_release_candidate

from Screen 1.

============================================================ 29. SOURCE INDEPENDENCE
============================================================

No change.

Quality Risk does not grant:

source.read
source.write.

============================================================ 30. NOT AUTHORISED
============================================================

Do not implement:

Phase 6 backend
new Risk SoR
Release aggregate
Release Candidate aggregate
Quality Gate backend
readiness calculation
quality score
risk score algorithm
automatic Risk creation
automatic NO-GO
AI risk assessment
AI recommendations
SSH
Terminal
Source write
Phase 7

============================================================ 31. SAMPLE DATA
============================================================

All records and values shown in the visual are illustrative only.

Including:

QR-001 etc.
risk names
owners
dates
counts
levels
status
impact
likelihood
trend
linked-record counts
charts

Do not seed these values merely to reproduce the image.

============================================================ 32. DOMAIN QUESTIONS TO CARRY FORWARD
============================================================

Do NOT answer these while recording Screen 1.

Carry them into Phase 6 domain reconciliation:

1. Can the existing risk ledger become the Quality Risk authority?

2. Is Quality Risk application-scoped only or may it be
   portfolio/cross-application?

3. What is the durable Risk lifecycle?

4. How are Impact and Likelihood represented?

5. Is Risk Level stored or derived?

6. How is Trend represented and historically justified?

7. How should existing quality objects link to a Risk?

8. Should Risk support mitigation/actions separately?

9. How should risk history/audit work?

10. How does Quality Risk later feed Release Readiness?

11. How can Gates reference Risk without coupling the Risk aggregate
    to Gate logic?

12. Does Phase 6 genuinely require a Release/Release Candidate
    aggregate?

============================================================ 33. RECORD
============================================================

Store the supplied visual as:

docs/frontend/apzqep-redesign/visuals/phase-6/
01-quality-risk-authority.png

Create:

docs/frontend/apzqep-redesign/
APZQEP-PHASE-6-SCREEN-1-QUALITY-RISK.md

Record:

SCREEN 1 — QUALITY RISK:
LOCKED

SCREEN 2 — RELEASE READINESS:
NEXT

SCREEN 3 — QUALITY GATES:
PENDING

SCREEN 4 — CERTIFICATION / GO-NO-GO:
PENDING

PHASE 6 VISUAL DESIGN:
IN PROGRESS

DOMAIN RECONCILIATION:
NOT STARTED

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED

STOP.

Wait for Screen 2 visual authority.
