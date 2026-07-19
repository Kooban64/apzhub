# APZ Projects — Implementation Readiness

> **Programme:** APZHUB-PROJECTS-001 (**ACCEPTED / CLOSED**)  
> **Product Definition Pack**  
> **Portfolio:** [projects/](./README.md)  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Reference:** [Product Engineering Reference Implementation](../APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md)

---

## Overall status

# Production

**Path:** Architecture Ready → Implementation Ready (PRODUCTS-003) → In Development (APZHUB-PROJECTS-001) → **Production** (Owner ACCEPTED 2026-07-19).

Phase 1 Workbench is the certified production slice. Documented limitations remain in [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md).

## Dimension assessment

| Dimension               | Status                                                                       | Notes |
| ----------------------- | ---------------------------------------------------------------------------- | ----- |
| Business readiness      | PASS                                                                         |       |
| Architecture readiness  | PASS — Wave 1 frozen; Workbench consumes Platform HTTP only                  |       |
| Platform dependencies   | PASS                                                                         |       |
| Provisioning readiness  | PASS — module enabled; platform provisioning unchanged                       |       |
| Governance readiness    | PASS                                                                         |       |
| Integration readiness   | PASS — certified adapter unchanged (`integration-plane` **0.6.0**)           |       |
| Testing readiness       | PASS — unit + Playwright certification suites                                |       |
| Certification readiness | PASS — Phase 1 UI certification; Owner ACCEPTED                              |       |
| Operational readiness   | PARTIAL — depends on deployed connector instance + Search index (documented) |       |

## Implementation rule

Further scope beyond the accepted Phase 1 slice requires Owner Approval of a named programme. No Wave 1–exceeding engine capability without ADR + Owner.
