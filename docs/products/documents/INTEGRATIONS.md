# APZ Documents — Integrations

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [documents/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Integration summary

Native platform Documents SoR (APZDOCS-001…006). **No Paperless-ngx adapter** on disk.

## Adapter rules

- Adapters live under `integrations/` and use `@apzhub/integration-sdk` **1.0.0** (Architecture Frozen)
- Modules never import adapter clients
- Engine brand names never appear in user-facing UI

## Inventory authority

- [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](../../foundation/INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md)
- [OSS-CATALOGUE](../../foundation/OSS-CATALOGUE.md)
- [INTEGRATION-CATALOGUE](../../foundation/INTEGRATION-CATALOGUE.md)

## Status

Documented against disk: present versions are authoritative; **ABSENT** means not on disk.
