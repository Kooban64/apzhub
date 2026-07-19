# APZ Projects — Known Limitations

> **Release baseline:** APZ Projects **1.1.0** — current Production Release (**ACCEPTED / CLOSED**)  
> **Product Definition Pack**  
> **Portfolio:** [projects/](./README.md)  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Known limitations (repository-documented)

- Engine branding must remain masked (no engine names in user-facing UI)
- Optional engine capabilities (analytics, webhooks) not in Wave 1 certification scope — require ADR + Owner
- Sprint **list/CRUD HTTP** is not exposed; sprint views derive groups from task `sprintId` fields on `/api/v1/tasks` (honesty labels in UI as of 1.1)
- Roadmap is due-date ordering of Platform tasks (not a separate engine roadmap API surface)
- My Work requires project selection + assignee filter (cross-project aggregation not on Wave 1 HTTP list contract without `projectId`). Release 1.1 defaults assignee to session user and restores last project in sessionStorage only.
- Task **status transition** targets are limited to workflow `statusId` values already present on loaded project tasks — Wave 1 HTTP has no project status catalogue endpoint
- Search results depend on Platform Search index population for the `projects` product
- Product health view surfaces Platform API health + Search diagnostics/audit (connector ops remain platform-owned)
- Assignee UI uses Platform user ids (no people-picker directory HTTP in this release)

## Honesty rule

Limitations must remain visible in certification and product docs. Do not silently treat limited surfaces as complete.
