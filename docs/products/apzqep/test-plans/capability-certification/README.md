# APZQEP-CERT-080A — Test Plans Integrated Capability Certification

> **Programme:** APZQEP-CERT-080A
> **Title:** Test Plans Integrated Capability Certification
> **Certification level:** **Capability Certification** (Domain + Infrastructure + Workbench, assessed together) — not a further Component Certification
> **Status:** **CERTIFIED / APPROVED / CLOSED**
> **Date prepared:** 2026-07-28
> **Owner Decision:** [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) — **CERTIFIED / APPROVED / CLOSED**
> **Package:** `@apzhub/qep-test-plans` **1.0.0 CERTIFIED** (Domain + Infrastructure + Workbench all Component-CERTIFIED, now integrated at Capability level)
> **Capability class:** **PRODUCTION_READY_WITH_LIMITATIONS**
> **Version:** Promoted **0.2.0 → 1.0.0** per Owner Certification Decision — see [VERSION-PROMOTION.md](./VERSION-PROMOTION.md) (**APPLIED**)
> **Freeze:** **FROZEN / APPROVED / CLOSED** under **APZQEP-FREEZE-080A** — see [Owner Freeze Decision](../freeze/OWNER-FREEZE-DECISION.md) and [freeze pack](../freeze/README.md); `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED**
> **Nature:** Independent assurance — no engineering, no remediation, no behavioural code changes ([OES-CERTIFICATION-INDEPENDENCE.md](../../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md))

## Scope statement

This programme is **Capability Certification** — independent assurance evaluating the complete Test Plans capability (Domain + Infrastructure + Workbench, integrated end-to-end) as three already Component-Certified layers assessed **together** for the first time. It follows the pattern established by **APZQEP-CERT-050D** (Test Specifications Capability Certification) and is distinct from the three preceding Component Certifications (**CERT-060A** Domain, **CERT-060B** Infrastructure, **CERT-070A** Workbench), each of which certified a single layer in isolation. See [OES-CERTIFICATION-LEVELS.md](../../../../engineering/oes/OES-CERTIFICATION-LEVELS.md).

No production code, no React/Next.js edits, no migrations, and no remediation were performed under this programme.

## Baselines consumed (all closed/certified, immutable)

```text
APZQEP-ARCH-013                 ACCEPTED / ARCHITECTURE BASELINED / CLOSED
APZQEP-OES-ENG-060A              ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED
APZQEP-ENG-060A                  ACCEPTED / APPROVED / CLOSED
APZQEP-CERT-060A                 CERTIFIED / APPROVED / CLOSED — Domain 0.1.0 CERTIFIED (DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS)
APZQEP-OES-ENG-060B               ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED
APZQEP-ENG-060B                  ACCEPTED WITH RECORDED LIMITATIONS / CLOSED
APZQEP-CERT-060B                 CERTIFIED / APPROVED / CLOSED — Infrastructure 0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED
APZQEP-ARCH-014                  ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED
APZQEP-OES-ENG-070A               ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED
APZQEP-ENG-070A                  ACCEPTED / APPROVED / PROGRAMME CLOSED
APZQEP-CERT-070A                 CERTIFIED / APPROVED / CLOSED — Workbench 0.2.0 WORKBENCH COMPONENT CERTIFIED
Document 000 / OES-000 / OES-001 / OES-002
OES-CERTIFICATION-INDEPENDENCE / OES-CERTIFICATION-LEVELS
→ APZQEP-CERT-080A CERTIFIED / APPROVED / CLOSED — @apzhub/qep-test-plans 1.0.0 CERTIFIED  ← this pack
```

## Pack

| Document | Path |
| -------- | ---- |
| Owner Certification Decision (template, PENDING) | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) |
| Owner Summary | [OWNER-SUMMARY.md](./OWNER-SUMMARY.md) |
| Certification Report | [CERTIFICATION-REPORT.md](./CERTIFICATION-REPORT.md) |
| Completion Report | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md) |
| Architecture Review (cross-layer integration) | [ARCHITECTURE-REVIEW.md](./ARCHITECTURE-REVIEW.md) |
| Engineering Review (consolidated Domain/Infra/Workbench) | [ENGINEERING-REVIEW.md](./ENGINEERING-REVIEW.md) |
| Evidence Pack | [EVIDENCE-PACK.md](./EVIDENCE-PACK.md) |
| Quality Gates | [QUALITY-GATES.md](./QUALITY-GATES.md) |
| Test Results | [TEST-RESULTS.md](./TEST-RESULTS.md) |
| Security Review | [SECURITY-REVIEW.md](./SECURITY-REVIEW.md) |
| Performance Review | [PERFORMANCE-REVIEW.md](./PERFORMANCE-REVIEW.md) |
| Operational Readiness | [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md) |
| Accessibility Review | [ACCESSIBILITY-REVIEW.md](./ACCESSIBILITY-REVIEW.md) |
| Known Limitations (consolidated) | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md) |
| Version Promotion (recommendation only) | [VERSION-PROMOTION.md](./VERSION-PROMOTION.md) |
| Release Recommendation | [RELEASE-RECOMMENDATION.md](./RELEASE-RECOMMENDATION.md) |
| Release Notes (draft, 1.0.0) | [RELEASE-NOTES.md](./RELEASE-NOTES.md) |
| Freeze Notice (eligibility recommendation only) | [FREEZE-NOTICE.md](./FREEZE-NOTICE.md) |

## Lifecycle

```text
CERT-060A CERTIFIED · Domain 0.1.0
  → CERT-060B CERTIFIED · Infrastructure 0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED
  → ARCH-014 ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED
  → OES-ENG-070A ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED
  → ENG-070A ACCEPTED / APPROVED / PROGRAMME CLOSED
  → CERT-070A CERTIFIED / APPROVED / CLOSED · Workbench 0.2.0 WORKBENCH COMPONENT CERTIFIED
  → APZQEP-CERT-080A CERTIFIED / APPROVED / CLOSED · @apzhub/qep-test-plans 1.0.0 CERTIFIED  ← this pack
  → Version Promotion 1.0.0 APPLIED
  → APZQEP-FREEZE-080A FROZEN / APPROVED / CLOSED (separate programme, see ../freeze/) — @apzhub/qep-test-plans 1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED
```

## Permanent release evidence

[docs/releases/apzqep/test-plans/1.0.0/](../../../../releases/apzqep/test-plans/1.0.0/README.md) — **CERTIFIED / FROZEN / BASELINE ESTABLISHED** — `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN**

## Freeze programme (separate, closed)

**APZQEP-FREEZE-080A — Test Plans Capability Freeze Decision** — **FROZEN / APPROVED / CLOSED**. See [../freeze/README.md](../freeze/README.md) and [Owner Freeze Decision](../freeze/OWNER-FREEZE-DECISION.md). `@apzhub/qep-test-plans` **1.0.0** is now the frozen production baseline. No further Test Plans work authorised under existing identifiers; future work requires a new Owner-authorised programme.

## STOP

```text
Programme: APZQEP-CERT-080A
Status: CERTIFIED
APPROVED
CLOSED

@apzhub/qep-test-plans
1.0.0
CERTIFIED
FROZEN
BASELINE ESTABLISHED
PRODUCTION_READY_WITH_LIMITATIONS

Programme: APZQEP-FREEZE-080A
Status: FROZEN
APPROVED
CLOSED

Authorised next delivery: none under existing identifiers — new Owner-authorised programme required
```
