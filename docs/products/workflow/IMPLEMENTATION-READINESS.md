# APZ Workflow — Implementation Readiness

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [workflow/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Overall status

# Production

## Dimension assessment

| Dimension               | Status                                           | Notes |
| ----------------------- | ------------------------------------------------ | ----- |
| Business readiness      | PASS                                             |       |
| Architecture readiness  | PASS — frozen                                    |       |
| Platform dependencies   | PASS                                             |       |
| Provisioning readiness  | PASS                                             |       |
| Governance readiness    | PASS                                             |       |
| Integration readiness   | PASS — n8n adapter 0.1.0                         |       |
| Testing readiness       | PASS — certification suites                      |       |
| Certification readiness | PASS — PRWL                                      |       |
| Operational readiness   | PARTIAL — read-only; live n8n optional/env-gated |       |

## Blockers / notes

None within frozen read-only/management scope; execution requires Owner + ADR

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

**APZ Workflow is not authorised for a new implementation programme by this document alone.**
