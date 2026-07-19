# APZ Support — Vision

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [support/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Vision

Customer and internal support requests, knowledge articles, organisations and groups inside APZHUB.

## Business value

Service desk experience without exposing Zammad branding; reduces tool sprawl.

## Primary users

Support agents, customers (where enabled), service managers.

## Success outcomes (evidence-based)

- Users interact with **APZ Support** through APZHUB Workbench and Platform APIs only
- Backend engine brands (if any) remain hidden
- Product extends platform capabilities without redesigning frozen subsystems

## Non-goals

- Redesigning Platform Foundation or frozen SDKs
- Inventing capabilities not evidenced on disk or in KF
- Authorising implementation by this document alone

## Maturity (portfolio)

**Production** — see [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md) and [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md).

## Implementation rule

A product may enter implementation only when:

1. This Product Definition Pack is complete
2. Architecture is Owner-approved
3. Dependencies are available on the platform
4. Product is marked **Implementation Ready** in [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md)

Until then: **no production code** for this product programme.
