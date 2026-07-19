# APZ Workflow — Capabilities

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [workflow/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## User-facing product name

**APZ Workflow**

## Capability inventory (repository-evidenced)

- Workflow SoR metadata lifecycle (management plane)
- Templates / categories / folders / validation / capabilities / health / diagnostics (as certified)
- Workflow Engine read-only discovery and diagnostics
- n8n Reference Adapter metadata discovery

## Platform capabilities consumed (shared)

Workbench · Identity/AuthZ · API Gateway · (as applicable) Search · Notifications · Activity · Events/Outbox · Governance · Provisioning

## Explicitly out of scope / absent

See [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md). Do not invent capabilities.

## Service naming

App-layer services use APZHUB names (e.g. ProjectService, SupportService) — never engine brand names in UI.
