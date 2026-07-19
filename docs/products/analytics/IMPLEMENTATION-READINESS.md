# APZ Analytics — Implementation Readiness

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [analytics/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Overall status

# Concept

## Dimension assessment

| Dimension               | Status                                                    | Notes |
| ----------------------- | --------------------------------------------------------- | ----- |
| Business readiness      | PARTIAL — value stated; requirements not detailed on disk |       |
| Architecture readiness  | FAIL                                                      |       |
| Platform dependencies   | PARTIAL — platform ready; Analytics product absent        |       |
| Provisioning readiness  | FAIL — product not registered                             |       |
| Governance readiness    | FAIL — product manifests/permissions absent               |       |
| Integration readiness   | FAIL — Metabase absent                                    |       |
| Testing readiness       | FAIL                                                      |       |
| Certification readiness | FAIL                                                      |       |
| Operational readiness   | FAIL                                                      |       |

## Blockers / notes

Greenfield product; strategy/ADR required before Architecture Ready

## Allowed maturity values

Concept · Planning · Architecture Ready · Implementation Ready · In Development · Production

## Implementation entry criteria

## Implementation rule

A product may enter implementation only when:

1. This Product Definition Pack is complete
2. Architecture is Owner-approved
3. Dependencies are available on the platform
4. Product is marked **Implementation Ready** in [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md)

Until then: **no production code** for this product programme.

**APZ Analytics is not authorised for a new implementation programme by this document alone.**
