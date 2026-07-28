# APZQEP-CERT-070A — Test Plans Workbench Component Certification

> **Programme:** APZQEP-CERT-070A
> **Status:** **CERTIFIED / APPROVED / CLOSED**
> **Date prepared:** 2026-07-28
> **Date closed:** 2026-07-28
> **Owner Decision:** [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) — **CERTIFIED / APPROVED / CLOSED**
> **Package:** `@apzhub/qep-test-plans` **0.2.0 WORKBENCH COMPONENT CERTIFIED**
> **Certified class:** **WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS**
> **Freeze:** **NOT AUTHORISED** (Capability Certification / Freeze remain further, separate Owner gates)
> **Nature:** Independent Component Certification (Workbench) — assurance only, no engineering
> **Authorises next:** **APZQEP-CERT-080A — Test Plans Integrated Capability Certification** — see [../capability-certification/README.md](../capability-certification/README.md)

## Scope statement

This programme was **Workbench Component Certification** — independent assurance evaluating the Test Plans Workbench (presentation layer) **as delivered** under `APZQEP-ENG-070A`, which is **ACCEPTED / CLOSED** (2026-07-28). It was explicitly **not** Test Plans Capability Certification, which requires the Domain, Infrastructure, and Workbench components to be assessed together as a single certified capability (typically at **1.0.0**) — that programme, **APZQEP-CERT-080A**, is now in progress; see [../capability-certification/README.md](../capability-certification/README.md). See [OES-CERTIFICATION-LEVELS.md](../../../engineering/oes/OES-CERTIFICATION-LEVELS.md).

No production code, no React/Next.js edits, and no remediation were performed under this programme — see [OES-CERTIFICATION-INDEPENDENCE.md](../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md).

## Baselines (cited, immutable)

```text
APZQEP-ARCH-014          ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED
APZQEP-OES-ENG-070A      ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED
APZQEP-ENG-070A          ACCEPTED / APPROVED / PROGRAMME CLOSED (2026-07-28)
Domain 0.1.0             CERTIFIED (CERT-060A)
Infrastructure 0.2.0     INFRASTRUCTURE COMPONENT CERTIFIED (CERT-060B)
```

## Pack

| Document                                             | Path                                                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Owner Certification Decision                         | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) — **CERTIFIED / APPROVED / CLOSED**             |
| Owner Summary                                        | [OWNER-SUMMARY.md](./OWNER-SUMMARY.md)                                                       |
| Certification Report                                 | [CERTIFICATION-REPORT.md](./CERTIFICATION-REPORT.md)                                         |
| Workbench Component Certification Report (assurance) | [WORKBENCH-COMPONENT-CERTIFICATION-REPORT.md](./WORKBENCH-COMPONENT-CERTIFICATION-REPORT.md) |
| Evidence Pack                                        | [EVIDENCE-PACK.md](./EVIDENCE-PACK.md)                                                       |
| Quality Gates                                        | [QUALITY-GATES.md](./QUALITY-GATES.md)                                                       |
| Operational Readiness                                | [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md)                                       |
| Known Limitations Review                             | [KNOWN-LIMITATIONS-REVIEW.md](./KNOWN-LIMITATIONS-REVIEW.md)                                 |
| Version Recommendation                               | [VERSION-RECOMMENDATION.md](./VERSION-RECOMMENDATION.md)                                     |
| Release Recommendation                               | [RELEASE-RECOMMENDATION.md](./RELEASE-RECOMMENDATION.md)                                     |
| COMPLETE                                             | [COMPLETE.md](./COMPLETE.md)                                                                 |

## Lifecycle

```text
CERT-060A CERTIFIED · Domain 0.1.0
  → CERT-060B CERTIFIED · Infrastructure 0.2.0
  → ARCH-014 ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED
  → OES-ENG-070A ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED
  → ENG-070A ACCEPTED / APPROVED / PROGRAMME CLOSED
  → APZQEP-CERT-070A CERTIFIED / APPROVED / CLOSED  ← this pack
  → APZQEP-CERT-080A CERTIFIED / APPROVED / CLOSED — Test Plans Integrated Capability Certification (see ../capability-certification/) · @apzhub/qep-test-plans 1.0.0 CERTIFIED
  → APZQEP-FREEZE-080A FROZEN / APPROVED / CLOSED (see ../freeze/) — @apzhub/qep-test-plans 1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED
```

## STOP

```text
Programme: APZQEP-CERT-070A
Status: CERTIFIED
APPROVED
CLOSED

@apzhub/qep-test-plans 0.2.0 WORKBENCH COMPONENT CERTIFIED
FREEZE NOT AUTHORISED

NEXT: APZQEP-CERT-080A — Test Plans Integrated Capability Certification
```
