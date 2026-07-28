# APZHUB Product Catalogue (Enterprise Architecture)

> **Programme:** APZHUB-ARCHITECTURE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Portfolio SoT:** [APZHUB-PRODUCT-PORTFOLIO](../products/APZHUB-PRODUCT-PORTFOLIO.md) · [PORTFOLIO-RELEASE-REGISTER](../releases/PORTFOLIO-RELEASE-REGISTER.md)  
> **KF index (may lag SemVer):** [foundation/PRODUCT-CATALOGUE](../foundation/PRODUCT-CATALOGUE.md) — prefer this EA file + Portfolio for maturity/version  
> **Date:** 2026-07-19

---

## Purpose

EA inventory of **user-facing products**. Definition Packs live under `docs/products/{id}/`.

---

## Product inventory

### APZ Projects

| Field                     | Value                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Purpose                   | Project & task Workbench over Plane CE                                                                             |
| Business owner            | Product Owner (Projects)                                                                                           |
| Maturity                  | **Production**                                                                                                     |
| Current version / release | **1.1.0**                                                                                                          |
| Workbench module          | `services/projects/manifests/projects/module.yaml`                                                                 |
| Dependencies              | Platform HTTP tasks/projects · Search · IAM                                                                        |
| Integrations              | Plane **0.6.0**                                                                                                    |
| Platform services         | ProjectService / task path via gateway                                                                             |
| Documentation             | [docs/products/projects/](../products/projects/) · [releases/projects/1.1.0](../releases/projects/1.1.0/README.md) |
| Known limitations         | [KNOWN-LIMITATIONS](../products/projects/KNOWN-LIMITATIONS.md)                                                     |
| Future roadmap            | Patch 1.1.x / Minor 1.2.0 / Major 2.0.0 — Owner Approval required                                                  |

### APZ Time

| Field                     | Value                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| Purpose                   | Time tracking Workbench over Kimai CE                                                               |
| Business owner            | Product Owner (Time)                                                                                |
| Maturity                  | **Production**                                                                                      |
| Current version / release | **1.0.0** Phase 1                                                                                   |
| Workbench module          | `services/time/manifests/time/module.yaml`                                                          |
| Dependencies              | Time Platform Services · HTTP `/api/v1/time/*` · Kimai                                              |
| Integrations              | Kimai **0.2.0** CERTIFIED_DOMAIN                                                                    |
| Platform services         | TimeTracking / Timesheet / Activity / Customer / Tag / …                                            |
| Documentation             | [docs/products/time/](../products/time/) · [releases/time/1.0.0](../releases/time/1.0.0/README.md)  |
| Known limitations         | [KNOWN-LIMITATIONS](../products/time/KNOWN-LIMITATIONS.md) — no cross-product deep integrations yet |
| Future roadmap            | 1.0.x / 1.1.0 / 2.0.0 — Owner Approval required                                                     |

### APZ Support

| Field                     | Value                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Purpose                   | Support / ticketing Workbench over Zammad CE                                                                   |
| Business owner            | Product Owner (Support)                                                                                        |
| Maturity                  | **Production** (PRWL)                                                                                          |
| Current version / release | **1.0.0**                                                                                                      |
| Workbench module          | Support module under `apps/web` (OSS-110-13/14)                                                                |
| Dependencies              | Support services · HTTP support-* · Search-support                                                             |
| Integrations              | Zammad **0.6.0** CERTIFIED_WITH_LIMITATIONS                                                                    |
| Platform services         | Support* services via gateway                                                                                  |
| Documentation             | [docs/products/support/](../products/support/) · [releases/support/1.0.0](../releases/support/1.0.0/README.md) |
| Known limitations         | No Event Bus publish; no attachments/realtime notify as certified                                              |
| Future roadmap            | Major **2.0** planning Awaiting Acceptance — impl not authorised                                               |

### APZ Documents

| Field                     | Value                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| Purpose                   | Document SoR / Workbench (native platform)                                                     |
| Business owner            | Product Owner (Documents)                                                                      |
| Maturity                  | **Production** (platform PRWL, architecture frozen) · commercial **1.0.0** Awaiting Acceptance |
| Current version / release | Commercial SemVer **1.0.0** (APZ-DOCUMENTS-002) — APZDOCS-006 platform baseline                |
| Workbench module          | Document Workbench (platform docs surfaces)                                                    |
| Dependencies              | Document Platform Services · Search (where published) · IAM                                    |
| Integrations              | **No** Paperless adapter on disk                                                               |
| Platform services used    | Document* services via gateway                                                                 |
| Documentation             | [docs/products/documents/](../products/documents/)                                             |
| Known limitations         | Uploads/OCR/Event Bus etc. excluded from cert non-goals                                        |
| Future roadmap            | Product SemVer only with Owner Approval                                                        |

### APZ Analytics

| Field                     | Value                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| Purpose                   | Analytics / dashboards (Metabase CE provider)                                                     |
| Business owner            | Product Owner (Analytics)                                                                         |
| Maturity                  | **Production** — **1.0.0** (PRWL) · Awaiting Acceptance APZ-ANALYTICS-002                         |
| Current version / release | **1.0.0** — [releases/analytics/1.0.0/](../releases/analytics/1.0.0/README.md)                    |
| Workbench module          | `analytics` **0.1.0** · `/workspace/analytics/*`                                                  |
| Dependencies              | Analytics Platform Services · Gateway · IAM                                                       |
| Integrations              | Metabase **0.1.0** CERTIFIED_FOUNDATION                                                           |
| Platform services used    | Analytics services (`@apzhub/platform-services` **0.28.0**)                                       |
| Documentation             | [docs/products/analytics/](../products/analytics/) · [apz-analytics/](../products/apz-analytics/) |
| Known limitations         | [apz-analytics/KNOWN-LIMITATIONS.md](../products/apz-analytics/KNOWN-LIMITATIONS.md)              |
| Future roadmap            | 1.0.x / 1.1.0 / 2.0.0 only with Owner Approval                                                    |

### APZ Workflow

| Field                     | Value                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Purpose                   | Enterprise Workflow Automation Platform (n8n primary provider)                                               |
| Business owner            | Product Owner (Workflow) / Platform                                                                          |
| Maturity                  | **Production** — **1.0.0** PRWL · APZ-WORKFLOW-002 Awaiting Acceptance · recommendation **PRODUCTION READY** |
| Current version / release | **1.0.0** — [evidence](../releases/workflow/1.0.0/README.md)                                                 |
| Workbench module          | `/workspace/workflow` (commercial) · SoR/Engine facets remain                                                |
| Dependencies              | Workflow Platform Services · HTTP · Integration SDK · n8n                                                    |
| Integrations              | n8n **0.1.0** CERTIFIED_FOUNDATION; future providers post-1.0                                                |
| Platform services used    | Workflow* services via gateway                                                                               |
| Documentation             | [apz-workflow/](../products/apz-workflow/) · [releases/workflow/1.0.0](../releases/workflow/1.0.0/)          |
| Known limitations         | [apz-workflow/KNOWN-LIMITATIONS.md](../products/apz-workflow/KNOWN-LIMITATIONS.md)                           |
| Future roadmap            | 1.0.x / 1.1.0 / 2.0.0 naming only — Owner Approval required                                                  |

### APZ TCMS

| Field                     | Value                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| Purpose                   | Native testing / quality management (supersedes Kiwi SoR)                                   |
| Business owner            | Product Owner (Quality / TCMS)                                                              |
| Maturity                  | **Production** (PRWL where certified)                                                       |
| Current version / release | testing-* **0.11.0** vertical; GHA adapter **0.1.0** frozen                                 |
| Workbench module          | Testing Workbench (APZTCMS-010+)                                                            |
| Dependencies              | testing-* packages · CI metadata adapters · Release governance models                       |
| Integrations              | GitHub Actions **0.1.0** (reference); Kiwi **Retired**                                      |
| Platform services used    | Testing* / gateway.testing.*                                                                |
| Documentation             | testing architecture + APZTCMS sprint docs · [products/testing](../products/) where present |
| Known limitations         | See vertical-slice certification (PRWL)                                                     |
| Future roadmap            | Maintenance under Owner Approval                                                            |

### APZ Law Platform

| Field                     | Value                                                               |
| ------------------------- | ------------------------------------------------------------------- |
| Purpose                   | Legal practice management vertical                                  |
| Business owner            | Product Owner (Law)                                                 |
| Maturity                  | **In Development** / validation                                     |
| Current version / release | No Production SemVer in Portfolio Release Register                  |
| Workbench module          | `apps/law-platform`                                                 |
| Dependencies              | Platform Core · Law domain packages · Trust Accounting docs         |
| Integrations              | Law-specific (see Law architecture index) — not Plane/Kimai/Zammad  |
| Platform services used    | Law domain services (app-scoped)                                    |
| Documentation             | [docs/products/law/](../products/law/) · Law reference architecture |
| Known limitations         | Commercial validation incomplete; not in Production SemVer register |
| Future roadmap            | Commercial validation path — Owner-gated product releases           |

---

## Related

- [ENTERPRISE-ARCHITECTURE-CATALOGUE.md](./ENTERPRISE-ARCHITECTURE-CATALOGUE.md)
- [ARCHITECTURE-MATURITY-MATRIX.md](./ARCHITECTURE-MATURITY-MATRIX.md)
