# Owner Summary — APZQEP-CERT-080A

## Decision status

**CERTIFIED / APPROVED / CLOSED** — the Owner Certification Decision for `APZQEP-CERT-080A` has been recorded. See [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) for the full decision. `@apzhub/qep-test-plans` is promoted to **1.0.0 CERTIFIED**. The separate Owner Freeze Decision under **APZQEP-FREEZE-080A** has since been recorded — **FROZEN / APPROVED / CLOSED** (see [../freeze/README.md](../freeze/README.md) and [../freeze/OWNER-FREEZE-DECISION.md](../freeze/OWNER-FREEZE-DECISION.md)). `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED**.

## What this programme is

An **independent Capability Certification** of the complete Test Plans capability — Domain, Infrastructure, and Workbench assessed **together, end-to-end**, for the first time. Each layer has already been independently Component-Certified:

- **APZQEP-CERT-060A** — Domain **0.1.0 CERTIFIED** (**DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS**)
- **APZQEP-CERT-060B** — Infrastructure **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED** (**INFRASTRUCTURE_PRODUCTION_READY_WITH_LIMITATIONS**)
- **APZQEP-CERT-070A** — Workbench **0.2.0 WORKBENCH COMPONENT CERTIFIED** (**WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS**)

`APZQEP-CERT-080A` is the fourth and final certification gate for this capability — the **Capability Certification** referenced by [OES-CERTIFICATION-LEVELS.md](../../../../engineering/oes/OES-CERTIFICATION-LEVELS.md), following the pattern already established for Test Specifications (**CERT-050D**).

## What was assessed (no engineering performed)

- Verification that Domain, Infrastructure, and Workbench integrate correctly end-to-end as a single capability
- End-to-end workflow validation, citing and independently re-running existing Vitest/Playwright/Domain/Infrastructure tests
- Cross-layer contract integrity — the `availableActions` contract from Domain → Infrastructure → Workbench (UI)
- Lifecycle completeness across the full Test Plan lifecycle (Draft → Submitted → Approved/Rejected → Ready → In Execution → Completed → Archived, plus Cancel/Clone/Supersede/Assign/Schedule)
- Security and permission flow (`qep.plan.*` catalogue, server-authoritative authorisation)
- Audit and observability verification across all three layers
- Documentation completeness across all constituent packs and this Capability pack
- Consolidated review of known limitations (L-01, L-02, L-03, P-01…P-04, Domain limitations)
- Production readiness of the entire capability, taken as a whole
- Recommendations for capability class, 1.0.0 version promotion, and Freeze eligibility

## What was deliberately not performed (under CERT-080A itself)

- **No engineering, no remediation, no behavioural code changes** — per [OES-CERTIFICATION-INDEPENDENCE.md](../../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md)
- No new test authoring — only re-execution of existing test suites as independent assurance evidence
- No remediation of recorded limitations L-01, L-02, L-03, or P-01…P-04
- No Capability Freeze execution under CERT-080A — Freeze was a separate, subsequent Owner Decision under **APZQEP-FREEZE-080A** (as with CERT-050D → Owner Freeze Decision); it has since been recorded as **FROZEN / APPROVED / CLOSED**

## Decision recorded

| Topic              | Outcome                                                                                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Capability outcome | **PASS**                                                                                                                                                                                |
| Class              | **PRODUCTION_READY_WITH_LIMITATIONS**                                                                                                                                                   |
| Version            | Promoted **0.2.0 → 1.0.0** per Owner Certification Decision — see [VERSION-PROMOTION.md](./VERSION-PROMOTION.md) (**APPLIED**)                                                          |
| Freeze             | **FROZEN / APPROVED / CLOSED** under **APZQEP-FREEZE-080A** ([../freeze/README.md](../freeze/README.md)) — `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED** |
| Limitations        | Scope-defining (L-01 Compare deferred, L-02 items-on-DTO, L-03 coverage, P-01…P-04 test breadth) — do **not** block capability certification                                            |

## Owner Decision recorded

See [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) for the full decision:

**Option A — CERTIFIED / APPROVED / CLOSED** was selected — class **PRODUCTION_READY_WITH_LIMITATIONS** accepted; Version Promotion to **1.0.0** authorised and applied; Freeze eligibility recorded for a separate Owner Freeze Decision.

## Downstream

Following Option A: (1) package/module version promotion to **1.0.0** has been executed as CERT packaging (per [OES-CERTIFICATION-INDEPENDENCE.md](../../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md) §3) — see [VERSION-PROMOTION.md](./VERSION-PROMOTION.md); and (2) the separate Owner Freeze Decision under **APZQEP-FREEZE-080A** has been recorded — **FROZEN / APPROVED / CLOSED** — see [../freeze/README.md](../freeze/README.md). No further Test Plans work is authorised under existing identifiers; future work requires a new Owner-authorised programme.

## Programme status

```text
Programme: APZQEP-CERT-080A
Status: CERTIFIED
APPROVED
CLOSED

Programme: APZQEP-FREEZE-080A
Status: FROZEN
APPROVED
CLOSED

@apzhub/qep-test-plans
1.0.0
CERTIFIED
FROZEN
BASELINE ESTABLISHED

Authorised next delivery: none under existing identifiers — new Owner-authorised programme required
```
