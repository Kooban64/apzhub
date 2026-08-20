# APZQEP Phase 6 — domain lock

**Status:** LOCKED  
**Date:** 2026-08-20  
**Authority:** Owner decisions on the accepted Phase 6 domain reconciliation.  
**Implementation:** **NOT AUTHORISED** until the finite implementation inventory is reviewed and explicitly authorised.

Reconciliation (accepted): [APZQEP-PHASE-6-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-6-DOMAIN-RECONCILIATION-REPORT.md)  
Inventory (for review, not authority): [APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md)  
Visuals: Screens [1](./APZQEP-PHASE-6-SCREEN-1-QUALITY-RISK.md)–[4](./APZQEP-PHASE-6-SCREEN-4-CERTIFICATION-GO-NO-GO.md) LOCKED.

This lock is subordinate to the Constitution and foundation documents 001–029. Phase 3–5 aggregates remain intact. Phase 4 execution engines remain intact. Phase 5 Observation / Issue / Note remain distinct from Risk, Gate, and Certification.

---

# OWNER DECISION — APZQEP PHASE 6 DOMAIN LOCK

The Phase 6 repository/domain reconciliation is **ACCEPTED**.

The nine Owner decisions are **RESOLVED** as follows.

============================================================

1. QUALITY RISK SOR
   \============================================================

APPROVED:

Create a new durable PostgreSQL QEP Quality Risk authority.

Do not retain the JSON risk ledger as the Screen 1 SoR.
Legacy data must be reconciled/migrated additively where appropriate.

============================================================ 2. QUALITY RISK SCOPE
============================================================

APPROVED:

Application-scoped for Phase 6.

Use `qep_application` as the application authority.

Do not introduce portfolio/cross-application Risk in Phase 6.

============================================================ 3. QUALITY GATE AUTHORITY
============================================================

APPROVED:

Create a new bounded APZQEP Quality Gate definition/evaluation authority.

Do not repurpose:

- orchestration/F4 evidence-presence Gates
- APZ-TCMS Gate/readiness models
- any scored quality model

Keep Gate Definition and Gate Evaluation distinct.

============================================================ 4. CERTIFICATION AUTHORITY
============================================================

APPROVED:

Extend the existing QEP F4 certification-runtime authority.

Certification currently lives through `qep_qo_document`.

Do not create a parallel Certification store.
Do not adopt APZ-TCMS `certification_record`.

============================================================ 5. CERTIFICATION DECISIONS
============================================================

APPROVED:

Extend the durable decision vocabulary to support:

GO
CONDITIONAL_GO
NO_GO
DEFER

Preserve existing historical GO / NO_GO decisions.

Do not collapse CONDITIONAL_GO or DEFER into the existing values.

============================================================ 6. DECISION CONTEXT
============================================================

APPROVED:

Do NOT create Release or Release Candidate aggregates.

Authoritative Certification context is:

`qep_application` +
`qep_application_environment` +
SCM/version identity from `qep_scm_change_event`

The Environment must be captured/snapshotted as part of the decision
context because `qep_scm_change_event` does not itself carry it.

Release Candidate may remain descriptive SCM/change-event language.
It is not an aggregate.

============================================================ 7. FAILED BLOCKING GATE
============================================================

APPROVED WITH THIS EXPLICIT RULE:

A failed Blocking Gate may NEVER result in an ordinary GO.

Where policy permits progression despite a failed Blocking Gate,
progression requires:

- an explicit bounded Certification Exception
- authorised approval
- recorded rationale
- affected Gate reference
- decision-context reference
- applicable conditions
- expiry/effective period where appropriate
- immutable audit history

and the resulting Certification decision must be:

CONDITIONAL_GO

not GO.

There must be no silent Gate override.

If no valid authorised exception exists, the failed Blocking Gate
prevents GO / CONDITIONAL_GO.

============================================================ 8. CERTIFICATION AUTHORITY / APPROVAL
============================================================

APPROVED:

Retain the existing certifier + co-approver authority model.

Do not simplify to a single decision owner in Phase 6.

Any future relaxation requires a separate Owner decision.

============================================================ 9. POSTURE WORDING
============================================================

APPROVED:

Replace:

Recommended Posture

with:

Current Readiness Posture

APZQEP presents the explainable current quality posture.

It does not recommend the human Certification decision.

============================================================
ARCHITECTURAL LOCKS
============================================================

```text
READINESS SCORE:                 REJECTED
QUALITY SCORE:                   REJECTED
GATE WEIGHTING:                  REJECTED
AUTOMATIC CERTIFICATION:         PROHIBITED
AI CERTIFICATION:                PROHIBITED
RELEASE AGGREGATE:               NOT REQUIRED
RELEASE CANDIDATE AGGREGATE:     NOT REQUIRED
QUALITY RISK:                    NEW QEP AUTHORITY
QUALITY GATES:                   NEW QEP AUTHORITY
CERTIFICATION:                   EXTEND EXISTING F4 AUTHORITY
EVIDENCE:                        REUSE EXISTING SOR
DEFECT:                          REUSE EXISTING SOR
APPLICATION:                     REUSE qep_application
ENVIRONMENT:                     REUSE qep_application_environment
SCM/VERSION IDENTITY:            REUSE qep_scm_change_event
PHASE 5 ISSUE:                   REUSE
SOURCE INDEPENDENCE:             PRESERVE
```

Quality signal ≠ Quality Risk. Coverage ≠ Result. Status ≠ Result.
Observation ≠ Issue ≠ Defect ≠ Risk.
Gate evaluation ≠ Current Readiness Posture ≠ Certification decision.
DEFER ≠ NO_GO ≠ NOT READY.
CONDITIONAL_GO ≠ a weaker GO badge.

Approved chain:

```text
Application + Environment + SCM identity
      ↓
Quality Facts
      ↓
Quality Risks
      ↓
Quality Gates
      ↓
Current Readiness Posture
      ↓
Certification
      ↓
GO / CONDITIONAL_GO / NO_GO / DEFER
```

============================================================
EXPLICITLY PROHIBITED
============================================================

Do NOT create:

`qep_release`
`qep_release_candidate`
Gate Sets
Gate Templates
generic rule engine
generic workflow engine
quality score
readiness score
Gate weighting
new Evidence store
new Defect store
new Application store
new Environment store
parallel Certification store
AI Certification
automatic GO / CONDITIONAL_GO / NO_GO / DEFER
SSH
Terminal
Source write
Phase 7 objects

F4 orchestration evidence-presence Gates remain SCM-change advisory until
a later Owner instruction bridges or retires them. They are **not** Screen 3.

APZ-TCMS `testing_risk`, `testing_release*`, `testing_certification_*`,
and scored readiness remain **other-product**. Do not adopt them as APZQEP SoR.

============================================================
DOMAIN LOCK STATUS
============================================================

```text
PHASE 6 DOMAIN RECONCILIATION:
ACCEPTED

OWNER DECISIONS:
RESOLVED (9)

QUALITY RISK:
NEW

QUALITY GATES:
NEW

CERTIFICATION:
EXTEND F4

DECISION CONTEXT:
APPLICATION + ENVIRONMENT + qep_scm_change_event

FAILED BLOCKING GATE:
CONDITIONAL_GO ONLY, VIA CERTIFICATION EXCEPTION — NEVER ORDINARY GO

DUAL AUTHORITY:
RETAINED

POSTURE WORDING:
CURRENT READINESS POSTURE

RELEASE / RELEASE CANDIDATE AGGREGATES:
NOT REQUIRED
```

============================================================
NEXT STEP
============================================================

Do NOT implement from this lock.

Finite inventory (for Owner review, not an implementation authorisation):
[APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md)

Do not implement until that inventory has been reviewed and explicitly
authorised by Owner.
