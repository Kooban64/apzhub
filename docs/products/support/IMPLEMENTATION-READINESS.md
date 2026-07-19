# APZ Support — Implementation Readiness

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [support/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Overall status

# Production

## Dimension assessment

| Dimension               | Status                                                                      | Notes |
| ----------------------- | --------------------------------------------------------------------------- | ----- |
| Business readiness      | PASS                                                                        |       |
| Architecture readiness  | PASS — Wave 2 closed                                                        |       |
| Platform dependencies   | PASS                                                                        |       |
| Provisioning readiness  | PASS                                                                        |       |
| Governance readiness    | PASS                                                                        |       |
| Integration readiness   | PASS — Zammad 0.6.0                                                         |       |
| Testing readiness       | PASS — certification/e2e suites present                                     |       |
| Certification readiness | PASS — certified with limitations                                           |       |
| Operational readiness   | PARTIAL — production ops depend on deployed Zammad + documented limitations |       |

## Blockers / notes

None for continued production use within certified limitations; further scope needs Owner approval

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

**APZ Support is not authorised for a new implementation programme by this document alone.**
