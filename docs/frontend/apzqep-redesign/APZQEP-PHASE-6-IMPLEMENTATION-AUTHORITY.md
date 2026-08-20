# APZQEP Phase 6 — Implementation authority

**Status:** AUTHORISED — implementation **CLOSED · ACCEPTED**  
**Acceptance:** [APZQEP-PHASE-6-ACCEPTANCE.md](./APZQEP-PHASE-6-ACCEPTANCE.md)  
**Date:** 2026-08-20  
**Phase 5:** CLOSED · ACCEPTED  
**Phase 7:** NOT STARTED  
**Report:** [APZQEP-PHASE-6-REPORT.md](./APZQEP-PHASE-6-REPORT.md)

Visual authorities (do not redesign):

| Screen                     | Visual                                                                                                               | Lock                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1 Quality Risk             | [visuals/phase-6/01-quality-risk-authority.png](./visuals/phase-6/01-quality-risk-authority.png)                     | [SCREEN-1](./APZQEP-PHASE-6-SCREEN-1-QUALITY-RISK.md)           |
| 2 Release Readiness        | [visuals/phase-6/02-release-readiness-authority.png](./visuals/phase-6/02-release-readiness-authority.png)           | [SCREEN-2](./APZQEP-PHASE-6-SCREEN-2-RELEASE-READINESS.md)      |
| 3 Quality Gates            | [visuals/phase-6/03-quality-gates-authority.png](./visuals/phase-6/03-quality-gates-authority.png)                   | [SCREEN-3](./APZQEP-PHASE-6-SCREEN-3-QUALITY-GATES.md)          |
| 4 Certification / Go-No-Go | [visuals/phase-6/04-certification-go-no-go-authority.png](./visuals/phase-6/04-certification-go-no-go-authority.png) | [SCREEN-4](./APZQEP-PHASE-6-SCREEN-4-CERTIFICATION-GO-NO-GO.md) |

Domain authority: [APZQEP-PHASE-6-DOMAIN-LOCK.md](./APZQEP-PHASE-6-DOMAIN-LOCK.md).  
Reconciliation: [APZQEP-PHASE-6-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-6-DOMAIN-RECONCILIATION-REPORT.md).  
Inventory: [APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md) — **APPROVED WITHOUT CHANGE**.

Owner implementation authorisation covers the finite inventory **P6-01 through P6-16** only, in the mandated wave order (domain integrity before presentation). P6-11 through P6-14 must be correct before Screen 4 is considered delivered.

This phase:

- Creates a **new PostgreSQL Quality Risk SoR** and retires the JSON ledger as SoR.
- Creates **new bounded Quality Gate definition + immutable evaluation** authorities.
- Derives **Current Readiness Posture** (no score) and snapshots it at Certification.
- **Extends** existing F4 Certification (`qep_qo_document`, `f4_certification_evaluation`) with `GO | CONDITIONAL_GO | NO_GO | DEFER`, dual authority, Certification Exception, Blocking Gate enforcement, Environment snapshot, and SCM identity.

It does **not** create `qep_release`, `qep_release_candidate`, a parallel Certification store, a second Evidence/Defect/Application/Environment store, Gate Sets, Gate Templates, a generic rule/workflow engine, quality/readiness scores, automatic or AI Certification, SSH, Terminal, Source write, or Phase 7.

## Owner decisions (closed)

1. Quality Risk SoR = NEW PostgreSQL. JSON ledger retired as SoR. Additive migration only where a safe application mapping exists.
2. Scope = application-only via `qep_application`.
3. Quality Gates = NEW bounded QEP definition + evaluation. Do not reuse F4 `gate_f4_*` or TCMS certification gates.
4. Certification = EXTEND F4 in place. No parallel store.
5. Outcomes = `GO | CONDITIONAL_GO | NO_GO | DEFER`. Preserve historical GO/NO_GO.
6. Decision context = Application + Environment + `qep_scm_change_event` identity. Environment must be snapshotted. No Release / Release Candidate aggregate.
7. Failed Blocking Gate rule is explicit and has no silent bypass.
8. Dual authority retained (`quality_certifier` + `quality_co_approver`).
9. Product wording = **Current Readiness Posture** (not Recommended Posture).

Light and dark use identical geometry. Mobile is a responsive transformation. Domain semantics remain identical.
