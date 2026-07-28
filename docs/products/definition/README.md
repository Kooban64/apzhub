# APZHUB-PRODUCTS-003 — Product Definition Standard

> **Status:** **ACCEPTED**  
> **Classification:** PRODUCT GOVERNANCE  
> **Lifecycle:** Product Engineering  
> **Baseline:** Certified Platform 1.4  
> **Reference:** Platform-1.4-CERT-001 · APZHUB-PRODUCTS-002 · Platform Delivery Standard  
> **Date accepted:** 2026-07-24  
> **Rule:** Methodology only — Product Definition may commence only after Requirements Approval (PRODUCTS-004)

## Purpose

Create the official **APZHUB Product Definition Standard** — applied **after** approved Requirements (PRODUCTS-004).

No product may enter Architecture, Engineering Design, Implementation, or coding until:

1. Requirements Engineering Standard (PRODUCTS-004) is Owner-**ACCEPTED** and the change’s Requirements Baseline is **APPROVED**, and
2. This Definition Standard is Owner-**ACCEPTED**, and
3. That product’s Definition pack is complete and Business-approved per this methodology.

## Pack

| Document             | Path                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| Definition standard  | [PRODUCT-DEFINITION-STANDARD.md](./PRODUCT-DEFINITION-STANDARD.md)   |
| Reusable template    | [PRODUCT-DEFINITION-TEMPLATE.md](./PRODUCT-DEFINITION-TEMPLATE.md)   |
| Lifecycle            | [PRODUCT-LIFECYCLE.md](./PRODUCT-LIFECYCLE.md)                       |
| Business standard    | [PRODUCT-BUSINESS-STANDARD.md](./PRODUCT-BUSINESS-STANDARD.md)       |
| Architecture handoff | [PRODUCT-ARCHITECTURE-HANDOFF.md](./PRODUCT-ARCHITECTURE-HANDOFF.md) |
| Security standard    | [PRODUCT-SECURITY-STANDARD.md](./PRODUCT-SECURITY-STANDARD.md)       |
| AI standard          | [PRODUCT-AI-STANDARD.md](./PRODUCT-AI-STANDARD.md)                   |
| Testing standard     | [PRODUCT-TESTING-STANDARD.md](./PRODUCT-TESTING-STANDARD.md)         |
| Release standard     | [PRODUCT-RELEASE-STANDARD.md](./PRODUCT-RELEASE-STANDARD.md)         |
| Roadmap standard     | [PRODUCT-ROADMAP-STANDARD.md](./PRODUCT-ROADMAP-STANDARD.md)         |
| Definition checklist | [PRODUCT-DEFINITION-CHECKLIST.md](./PRODUCT-DEFINITION-CHECKLIST.md) |
| Completion           | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)                       |
| Owner acceptance     | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                         |

## Relationship

| Programme                                       | Role                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| Platform-1.4-CERT-001                           | Platform certified — frozen baseline                                                  |
| APZHUB-PRODUCTS-002                             | Product Engineering Framework — **ACCEPTED**                                          |
| Historical PRODUCTS-003 (Readiness Advancement) | Earlier IR advancement artefact — **ID reused** by Owner for this Definition Standard |
| **This programme**                              | Binding Product Definition Methodology                                                |

Where this pack and earlier PRODUCTS-000 lifecycle docs conflict on the **Definition → Architecture gate**, **this pack prevails** after Owner Acceptance.

## Gate

```text
Requirements Engineering (PRODUCTS-004)
  → Requirements Approval
  → Product Definition (this standard)
  → Business Approval
  → Architecture   ← FORBIDDEN until Definition accepted for that product
  → …
```

## Downstream

**ACCEPTED.** Binding Definition Standard. Next gate: [APZHUB-PRODUCTS-004 Requirements Engineering](../requirements/README.md). Do **not** commence Product Definition for a change until Requirements Baseline is Approved.
