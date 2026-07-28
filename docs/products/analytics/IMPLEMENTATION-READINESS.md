# APZ Analytics — Implementation Readiness

> **Programme:** APZHUB-PRODUCTS-002 (baseline) · **APZ-ANALYTICS-001** (Release 1.0 assessment)  
> **Product Definition Pack**  
> **Portfolio:** [analytics/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · [apz-analytics pack](../apz-analytics/IMPLEMENTATION-READINESS.md)  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Overall status

# Planning

**Canonical Release 1.0 assessment:** [../apz-analytics/IMPLEMENTATION-READINESS.md](../apz-analytics/IMPLEMENTATION-READINESS.md)

**Recommendation:** **READY WITH CONDITIONS** — not Implementation Ready.

---

## Dimension assessment (summary)

| Dimension               | Status                                             | Notes |
| ----------------------- | -------------------------------------------------- | ----- |
| Business readiness      | PARTIAL — Release 1.0 scope defined                |       |
| Architecture readiness  | FAIL — ADR + AnalyticsService absent               |       |
| Platform dependencies   | PARTIAL — platform ready; Analytics product absent |       |
| Provisioning readiness  | FAIL — product not registered                      |       |
| Governance readiness    | FAIL — product manifests/permissions absent        |       |
| Integration readiness   | FAIL — Metabase absent                             |       |
| Testing readiness       | FAIL — plan only                                   |       |
| Certification readiness | FAIL — plan only                                   |       |
| Operational readiness   | FAIL                                               |       |
| Documentation readiness | PASS — Definition Pack + Release 1.0 pack          |       |

## Blockers / notes

Metabase integration **ABSENT**. No Analytics product services/HTTP/module. Do not confuse Metrics/Reporting/Observability SoRs with APZ Analytics.

## Allowed maturity values

Concept · Planning · Architecture Ready · Implementation Ready · In Development · Production

## Implementation rule

A product may enter implementation only when:

1. This Product Definition Pack is complete
2. Architecture is Owner-approved
3. Dependencies are available on the platform
4. Product is marked **Implementation Ready** in the canonical readiness doc
5. Named Owner Approval of an implementation programme

Until then: **no production code** for this product programme.

**APZ Analytics is not authorised for a new implementation programme by this document alone.**
