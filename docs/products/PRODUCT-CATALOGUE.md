# APZHUB Product Catalogue

| Field      | Value                                                                    |
| ---------- | ------------------------------------------------------------------------ |
| Document   | APZHUB Product Catalogue (portfolio operational index)                   |
| Programme  | **APZHUB-FOUNDATION-002**                                                |
| Status     | **IN FORCE**                                                             |
| Date       | 2026-08-14                                                               |
| Deep index | [../foundation/PRODUCT-CATALOGUE.md](../foundation/PRODUCT-CATALOGUE.md) |
| Strategy   | [APZHUB-PRODUCT-PORTFOLIO.md](./APZHUB-PRODUCT-PORTFOLIO.md)             |

---

## Purpose

Operational catalogue of APZHUB products for portfolio governance. Detailed historical notes remain in the foundation catalogue; **this file is the portfolio status index**.

---

## Catalogue

| Product             | Purpose                                      | Owner | Current version                               | Availability                      | Dependencies                      | Status              | Engineering             | Release                     |
| ------------------- | -------------------------------------------- | ----- | --------------------------------------------- | --------------------------------- | --------------------------------- | ------------------- | ----------------------- | --------------------------- |
| **APZHUB Platform** | Enterprise operating platform / workbench    | APZOR | Platform baseline **1.2.0** PRWL              | Production (PRWL)                 | PostgreSQL · Redis · Better Auth  | Maintained          | Complete (foundation)   | Closed                      |
| **APZ Law**         | Legal practice management                    | APZOR | **1.0.0** PRWL                                | Production                        | Platform                          | Maintained          | Complete                | Closed                      |
| **APZ Projects**    | Project / work management (Plane CE adapter) | APZOR | Adapter `@apzhub/integration-plane` **0.6.0** | Production (adapter); UI deferred | Integration SDK **1.0.0** · Plane | Maintained          | Wave 1 closed           | Adapter certified           |
| **APZ Time**        | Time tracking (Kimai path)                   | APZOR | Production (portfolio)                        | Production                        | Integration SDK · Kimai           | Maintained          | Per portfolio           | Production                  |
| **APZ Support**     | Support / ticketing (Zammad adapter)         | APZOR | `@apzhub/integration-zammad` **0.6.0**        | Production (PRWL)                 | Integration SDK · Zammad          | Maintained          | Wave 2 closed           | Certified w/ limitations    |
| **APZ Documents**   | Document management                          | APZOR | Commercial **1.0.0**                          | Production                        | Platform native                   | Maintained          | Complete                | Closed                      |
| **APZ QEP**         | Quality Engineering Platform                 | APZOR | **V1.1 Enterprise Quality Baseline**          | **PRODUCTION READY**              | Platform · QEP packages           | **Active product**  | **SPR-210 in progress** | V1.1 closed · 200 DELIVERED |
| **Integration SDK** | Adapter framework                            | APZOR | `@apzhub/integration-sdk` **1.0.0**           | Production                        | Platform                          | Frozen / maintained | Complete                | 1.0.0                       |

### APZ QEP package baseline

| Package                      | Version   | Notes                                                                      |
| ---------------------------- | --------- | -------------------------------------------------------------------------- |
| `@apzhub/qep-evidence`       | **1.0.0** | Durable local storage default outside tests; object store remains residual |
| `@apzhub/qep-test-execution` | **1.0.1** | Production patch baseline                                                  |
| `@apzhub/qep-requirements`   | **1.0.0** | CERTIFIED / FROZEN                                                         |
| `@apzhub/qep-test-plans`     | **1.0.0** | CERTIFIED / FROZEN                                                         |
| Traceability / Verification  | **1.0.0** | CERTIFIED / FROZEN                                                         |

APZQEP V1.1 is **PRODUCTION READY · CLOSED**. SPR-APZQEP-200 (201–204) is
**COMPLETE · DELIVERED**. The authorised follow-on
[SPR-APZQEP-210](../sprint/SPR-APZQEP-210-product-definition-closeout.md)
closes remaining product-definition / USER-WORKFLOWS MVP gaps (auth seed,
catalogue honesty, Risk/Admin/Audit/Design surfaces, readiness waivers).
Caps A–F are **not** reopened. APZQEP-166 and external AI providers remain
**not authorised**.

---

## Portfolio rule

Future product work proceeds through **Owner-authorised product engineering / enhancement programmes**. Cross-cutting standards proceed through **APZHUB Governance**, not product-local governance proliferation.

Governance entry points:

- [../governance/APZHUB-ENGINEERING-STANDARD.md](../governance/APZHUB-ENGINEERING-STANDARD.md)
- [../governance/APZHUB-LIFECYCLE-STANDARD.md](../governance/APZHUB-LIFECYCLE-STANDARD.md)
- [../governance/APZHUB-AI-OPERATIONAL-FRAMEWORK.md](../governance/APZHUB-AI-OPERATIONAL-FRAMEWORK.md)

---

## STOP

```text
APZHUB PRODUCT CATALOGUE
IN FORCE
APZQEP v1.1 = PRODUCTION READY / ACTIVE PRODUCT
FOUNDATION GOVERNANCE = COMPLETE
```
