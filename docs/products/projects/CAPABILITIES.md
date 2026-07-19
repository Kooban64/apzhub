# APZ Projects — Capabilities

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [projects/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## User-facing product name

**APZ Projects**

## Capability inventory (repository-evidenced)

- Projects lifecycle (list/create/update) via ProjectService / gateway.projects
- Tasks (create/update/status/assign)
- Sprints (create/complete)
- Search publication via `@apzhub/search-projects`
- Manifest permissions: projects.view, projects.manage, projects.task._, projects.sprint._, projects.admin

## Platform capabilities consumed (shared)

Workbench · Identity/AuthZ · API Gateway · (as applicable) Search · Notifications · Activity · Events/Outbox · Governance · Provisioning

## Explicitly out of scope / absent

See [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md). Do not invent capabilities.

## Service naming

App-layer services use APZHUB names (e.g. ProjectService, SupportService) — never engine brand names in UI.
