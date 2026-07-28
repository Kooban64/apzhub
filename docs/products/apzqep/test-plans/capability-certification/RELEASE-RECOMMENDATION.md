# Release Recommendation — APZQEP-CERT-080A

| Field | Value |
| ----- | ----- |
| Recommendation | **CAPABILITY CERTIFIED** — class **PRODUCTION_READY_WITH_LIMITATIONS**; promoted to **1.0.0** per Owner Certification Decision |
| Binding | **BINDING** — Owner Certification Decision recorded: **CERTIFIED / APPROVED / CLOSED** (see [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)) |
| Date | 2026-07-28 |

## Recommendation statement

The Test Plans capability — Domain, Infrastructure, and Workbench, all independently Component-Certified and assessed together end-to-end under APZQEP-CERT-080A — has been **Capability Certified** at class **PRODUCTION_READY_WITH_LIMITATIONS**, with Version Promotion to **1.0.0 APPLIED** and Freeze eligibility recorded (subject to a separate Owner Freeze Decision, now sought under **APZQEP-FREEZE-080A**), mirroring the CERT-050D → Owner Freeze Decision precedent for Test Specifications.

## Conditions satisfied

1. Owner recorded a Certification Decision for **APZQEP-CERT-080A** in [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) — **CERTIFIED**.
2. Version Promotion **0.2.0 → 1.0.0** executed as a subsequent, explicitly Owner-authorised CERT packaging action — see [VERSION-PROMOTION.md](./VERSION-PROMOTION.md) (**APPLIED**).
3. Known limitations (L-01, L-02, L-03, P-01…P-04) remain documented under **PRODUCTION_READY_WITH_LIMITATIONS**.
4. Freeze eligibility is recorded ([FREEZE-NOTICE.md](./FREEZE-NOTICE.md)); Freeze itself requires a **separate** Owner Freeze Decision, now sought under **APZQEP-FREEZE-080A** ([../freeze/README.md](../freeze/README.md)) — not granted by Certification alone.
5. Future changes to Domain, Infrastructure, or Workbench proceed only via new, separately authorised Engineering programmes.

## Owner Decision recorded

| Option | Effect |
| ------ | ------ |
| **A — CERTIFIED / APPROVED / CLOSED** (selected) | Capability certified at class **PRODUCTION_READY_WITH_LIMITATIONS**; Version Promotion to 1.0.0 applied; Freeze eligibility recorded (not granted); programme closed |
| B — CONDITIONAL / HOLD | Not selected |
| C — NOT CERTIFIED | Not selected |

## STOP

```text
Programme: APZQEP-CERT-080A
Status: CERTIFIED
APPROVED
CLOSED

@apzhub/qep-test-plans 1.0.0 CERTIFIED
PRODUCTION_READY_WITH_LIMITATIONS
FREEZE ELIGIBLE / NOT YET AUTHORISED

Authorised next: APZQEP-FREEZE-080A — AWAITING OWNER FREEZE DECISION
```
