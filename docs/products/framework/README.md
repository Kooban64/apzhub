# APZHUB-PRODUCTS-002 — Product Engineering Framework Certification

> **Status:** **ACCEPTED**  
> **Classification:** PRODUCT ENGINEERING  
> **Lifecycle:** Product Portfolio  
> **Baseline:** APZHUB Platform 1.4 (**PRODUCTION READY WITH OPERATIONAL QUALIFICATIONS**)  
> **Reference:** Platform-1.4-CERT-001 · APZHUB-PRODUCTS-000 · Platform Delivery Standard  
> **Date:** 2026-07-23  
> **Rule:** Framework only — **no** product implementation · **no** Platform 1.4 modification · **no** Platform 2.0

## Purpose

Establish the **official Product Engineering Framework** that every APZHUB product shall follow after Platform 1.4 certification. Platform Engineering is **CLOSED**. Product Engineering is the **default** development activity.

## Pack

| Document             | Path                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| Engineering standard | [PRODUCT-ENGINEERING-STANDARD.md](./PRODUCT-ENGINEERING-STANDARD.md)     |
| Lifecycle            | [PRODUCT-LIFECYCLE.md](./PRODUCT-LIFECYCLE.md)                           |
| Architecture         | [PRODUCT-ARCHITECTURE-STANDARD.md](./PRODUCT-ARCHITECTURE-STANDARD.md)   |
| Quality              | [PRODUCT-QUALITY-STANDARD.md](./PRODUCT-QUALITY-STANDARD.md)             |
| Certification        | [PRODUCT-CERTIFICATION-STANDARD.md](./PRODUCT-CERTIFICATION-STANDARD.md) |
| Portfolio            | [PRODUCT-PORTFOLIO.md](./PRODUCT-PORTFOLIO.md)                           |
| Roadmap              | [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md)                               |
| Governance           | [PRODUCT-GOVERNANCE.md](./PRODUCT-GOVERNANCE.md)                         |
| Repository structure | [PRODUCT-REPOSITORY-STANDARD.md](./PRODUCT-REPOSITORY-STANDARD.md)       |
| Completion           | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)                           |
| Owner acceptance     | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                             |

## Relationship to prior programmes

| Programme                                  | Role                                                                                                           |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| APZHUB-PRODUCTS-000                        | Original Product Engineering Framework (retained under `docs/products/`) — **predecessor**                     |
| APZHUB-PRODUCTS-001                        | Product Portfolio & Roadmap — retained; this pack re-certifies portfolio against Platform 1.4                  |
| Historical PRODUCTS-002 (Definition Packs) | Earlier ACCEPTED readiness packs — artefacts retained; **ID reused** by Owner for this Framework Certification |
| **This programme**                         | Binding Framework Certification under Platform 1.4 Maintenance Mode                                            |

Where this pack and PRODUCTS-000 conflict, **this pack prevails** after Owner Acceptance of APZHUB-PRODUCTS-002.

## Authorisation boundary

```text
Platform 1.4 CERTIFIED → Maintenance Mode
        ↓ enables
Product Engineering Framework (this programme)
        ↓ enables (after Owner Framework Acceptance)
Named product programmes only (each requires separate Owner Approval)
```

## Downstream

**ACCEPTED.** Binding Product Engineering Framework. Next gate: [APZHUB-PRODUCTS-003 Product Definition Standard](../definition/README.md). Do **not** implement products without Definition Business Approval + named programmes. Do **not** modify Platform 1.4. Do **not** begin Platform 2.0.
