# APZ Analytics — Architecture

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [analytics/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Purpose

Cross-product analytics and dashboards for operators and leaders under APZHUB branding.

## Primary users

Executives, ops leads, product owners.

## Boundary statement

Products extend the platform. **APZ Analytics does not redesign** frozen Platform Foundation, Integration SDK **1.0.0**, or other Architecture Frozen subsystems without ADR + Owner.

## Request path (mandatory)

```text
Client / Module UI
  → APZHUB API Gateway
  → Auth → Authz → Validation
  → Platform Service
  → Service Connector (Adapter)   # when OSS-backed
  → Backend Engine                # when OSS-backed
```

Native products use Platform Services → platform persistence (still no Module → DB bypass).

## Major workflows

- Planned: open Analytics workspace → browse governed dashboards
- None implemented

## Platform services consumed

Planned AnalyticsService (OSS catalogue) — **ABSENT**. Do not confuse with platform Metrics/Reporting/Observability SoRs.

## Required integrations

**Metabase** (planned) — **ABSENT on disk**.

## Events published

- None on disk

## Events consumed

None on disk.

## Security model

Future: platform AuthN/AuthZ; Metabase credentials connector-internal.

## Provisioning model

Future product activation via platform-provisioning.

## Extension points

None present.

## Platform work still required

- Metabase Integration SDK adapter
- Platform Analytics service + gateway/HTTP/Workbench
- Clear boundary vs Metrics/Reporting SoRs (already frozen platform capabilities)

## Architecture references

- [APZHUB-PRODUCT-PORTFOLIO §3.5](../APZHUB-PRODUCT-PORTFOLIO.md)
- [OSS-CATALOGUE](../../foundation/OSS-CATALOGUE.md) Wave 5
- [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](../../foundation/INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md)
- [Product Portfolio Strategy (historical)](../../strategy/APZHUB-Product-Portfolio-Strategy.md)

## Related standards

- [PRODUCT-ARCHITECTURE-STANDARD](../PRODUCT-ARCHITECTURE-STANDARD.md)
- [003 System Architecture](../../003-overall-system-architecture-design-principles.md)

## Implementation rule

A product may enter implementation only when:

1. This Product Definition Pack is complete
2. Architecture is Owner-approved
3. Dependencies are available on the platform
4. Product is marked **Implementation Ready** in [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md)

Until then: **no production code** for this product programme.
