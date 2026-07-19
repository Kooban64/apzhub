# APZ Time — Capabilities

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [time/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## User-facing product name

**APZ Time**

## Capability inventory (repository-evidenced)

### Product (APZ Time Workbench)

- Time entries / approvals / reporting UI — **planned only** (not on disk)

### Platform layers available to a future product (not product capabilities)

- Time Platform Services + `/api/v1/time/*` HTTP — **ACCEPTED** with Kimai domain limitations (may return **501**)
- Kimai foundation ops/health — **ACCEPTED**
- Approvals / Reporting UI / Analytics — **absent**

## Platform capabilities consumed (shared)

Workbench shell · Identity/AuthZ · API Gateway · (as applicable) Search · Notifications · Activity · Events/Outbox · Governance · Provisioning

## Explicitly out of scope / absent

See [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md). Do not invent capabilities.

## Service naming

App-layer services use APZHUB names (e.g. ProjectService, SupportService) — never engine brand names in UI.
