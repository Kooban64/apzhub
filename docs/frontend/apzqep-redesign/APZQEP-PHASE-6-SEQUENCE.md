# APZQEP Phase 6 — visual sequence

**Status:** Screens 1–4 **LOCKED**. Implementation **CLOSED · ACCEPTED** — [acceptance](./APZQEP-PHASE-6-ACCEPTANCE.md).  
**Date:** 2026-08-20  
**Phase 5:** CLOSED · ACCEPTED — [APZQEP-PHASE-5-ACCEPTANCE.md](./APZQEP-PHASE-5-ACCEPTANCE.md)  
**Phase 7:** NOT STARTED — [APZQEP-PHASE-7-SEQUENCE.md](./APZQEP-PHASE-7-SEQUENCE.md)

Phase 6 is **Quality Risk + Release Readiness / Gates / Certification**. Implementation of P6-01–P6-16 is **CLOSED · ACCEPTED**.

```text
SCREEN 1 — Quality Risk                         LOCKED
SCREEN 2 — Release Readiness                    LOCKED
SCREEN 3 — Quality Gates                        LOCKED
SCREEN 4 — Certification / Go-No-Go             LOCKED

PHASE 6 VISUAL DESIGN                           COMPLETE
DOMAIN RECONCILIATION                           ACCEPTED
DOMAIN LOCK                                     RECORDED
IMPLEMENTATION INVENTORY                        APPROVED
PHASE 6 IMPLEMENTATION                          CLOSED · ACCEPTED
OWNER CLOSURE                                   PASS
RELEASE AGGREGATE                               NOT REQUIRED
RELEASE CANDIDATE AGGREGATE                     NOT REQUIRED
READINESS SCORE                                 REJECTED
PHASE 7                                         NOT STARTED
```

## Method (frozen)

```text
Visual 1 → Visual 2 → Visual 3 → Visual 4
→ domain reconciliation
→ finite inventory
→ implementation
```

## Screens

| Screen                     | Status                                                                                                                                         | Intent                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 1 Quality Risk             | **LOCKED** — [lock](./APZQEP-PHASE-6-SCREEN-1-QUALITY-RISK.md) · [visual](./visuals/phase-6/01-quality-risk-authority.png)                     | Working risk register. Signal ≠ Risk.                  |
| 2 Release Readiness        | **LOCKED** — [lock](./APZQEP-PHASE-6-SCREEN-2-RELEASE-READINESS.md) · [visual](./visuals/phase-6/02-release-readiness-authority.png)           | Decision briefing. **READINESS ≠ SCORE.**              |
| 3 Quality Gates            | **LOCKED** — [lock](./APZQEP-PHASE-6-SCREEN-3-QUALITY-GATES.md) · [visual](./visuals/phase-6/03-quality-gates-authority.png)                   | Fact → condition → evaluation. Gate ≠ Certification.   |
| 4 Certification / Go-No-Go | **LOCKED** — [lock](./APZQEP-PHASE-6-SCREEN-4-CERTIFICATION-GO-NO-GO.md) · [visual](./visuals/phase-6/04-certification-go-no-go-authority.png) | Human decision. Current Readiness Posture is advisory. |

Domain lock: [APZQEP-PHASE-6-DOMAIN-LOCK.md](./APZQEP-PHASE-6-DOMAIN-LOCK.md)  
Reconciliation: [APZQEP-PHASE-6-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-6-DOMAIN-RECONCILIATION-REPORT.md)  
Inventory: [APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md)

Approved chain:

```text
Application + Environment + SCM identity
      ↓
Quality Facts → Risks → Gates → Current Readiness Posture
      ↓
Certification → GO / CONDITIONAL_GO / NO_GO / DEFER
```

A failed Blocking Gate never yields ordinary GO. CONDITIONAL_GO requires an authorised Certification Exception.

## Explicitly out of this sequence (until authorised)

- `qep_release` / `qep_release_candidate`
- Gate Sets / Templates, generic rule/workflow engine
- Quality / readiness / Gate scores
- Automatic or AI Certification
- Parallel Certification store
- SSH, Terminal, Source write, nine-role catalogue
- Phase 7

## Next Owner action

Phase 6 is **CLOSED**. Phase 7 Screens 1–4 are **LOCKED**. Visual design **COMPLETE**. Domain reconciliation is **NEXT**. Do not implement Phase 7.
