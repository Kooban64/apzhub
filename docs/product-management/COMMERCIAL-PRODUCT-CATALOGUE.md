# APZHUB Commercial Product Catalogue

> **Programme:** APZHUB-PRODUCT-MANAGEMENT-001  
> **Classification:** DOCUMENTATION ONLY  
> **Engineering portfolio SoT:** [APZHUB-PRODUCT-PORTFOLIO](../products/APZHUB-PRODUCT-PORTFOLIO.md)  
> **EA inventory:** [architecture/PRODUCT-CATALOGUE](../architecture/PRODUCT-CATALOGUE.md)  
> **SemVer:** [PORTFOLIO-RELEASE-REGISTER](../releases/PORTFOLIO-RELEASE-REGISTER.md)  
> **Date:** 2026-07-19

---

## Purpose

Commercial packaging card for every APZ product: market, persona, deployment, licensing, edition, pricing model (principles), value, dependencies, cadence, direction.

**No prices. No entitlement enforcement.**

---

## APZ Projects

| Field                     | Value                                                                    |
| ------------------------- | ------------------------------------------------------------------------ |
| Purpose                   | Plan and deliver work — projects, tasks, sprints — under APZHUB branding |
| Target market             | Delivery teams, professional services, mid-market ops                    |
| Customer persona          | P-PM, P-ENG ([PERSONA-CATALOGUE](./PERSONA-CATALOGUE.md))                |
| Deployment model          | Self-hosted primary; Hybrid optional later                               |
| Licensing                 | Open Source engines (Plane CE) + Commercial APZHUB module                |
| Edition                   | Community → Enterprise (see [matrix](./PRODUCT-EDITION-MATRIX.md))       |
| Pricing model             | Edition ladder · optional seats/org · suite bundle                       |
| Primary value proposition | Unified project Workbench without exposing Plane                         |
| Dependencies              | Platform Gateway/IAM/Workbench · Search · Plane **0.6.0**                |
| Release cadence           | Owner-gated Patch **1.1.x** / Minor **1.2.0** / Major **2.0.0**          |
| Future direction          | Maintain Production **1.1.0**; expand only under Approval                |
| Current SemVer            | **1.1.0** Production                                                     |

---

## APZ Time

| Field                     | Value                                                            |
| ------------------------- | ---------------------------------------------------------------- |
| Purpose                   | Capture billable and non-billable time against work context      |
| Target market             | Services firms, Law adjacency, project cost tracking             |
| Customer persona          | P-ENG, P-FIN, P-LAW                                              |
| Deployment model          | Self-hosted primary                                              |
| Licensing                 | Open Source engines (Kimai CE) + Commercial APZHUB module        |
| Edition                   | Community → Enterprise                                           |
| Pricing model             | Edition ladder · suite attach · Law pack adjacency               |
| Primary value proposition | Time tracking in Workbench without exposing Kimai                |
| Dependencies              | Time Platform Services · HTTP `/api/v1/time/*` · Kimai **0.2.0** |
| Release cadence           | Owner-gated **1.0.x** / **1.1.0** / **2.0.0**                    |
| Future direction          | Approvals/reporting UI under Approval; cross-product links later |
| Current SemVer            | **1.0.0** Production Phase 1                                     |

---

## APZ Support

| Field                     | Value                                                                      |
| ------------------------- | -------------------------------------------------------------------------- |
| Purpose                   | Support / ticketing and knowledge inside APZHUB                            |
| Target market             | Internal IT / customer service desks seeking suite consolidation           |
| Customer persona          | P-AGENT, P-CUST, P-PO                                                      |
| Deployment model          | Self-hosted primary                                                        |
| Licensing                 | Open Source engines (Zammad CE) + Commercial APZHUB module                 |
| Edition                   | Community → Enterprise                                                     |
| Pricing model             | Edition ladder · suite spine                                               |
| Primary value proposition | Service desk UX without exposing Zammad                                    |
| Dependencies              | Support services · Search · Zammad **0.6.0**                               |
| Release cadence           | **1.0.x** / **1.1.0** / Major **2.0.0** (2.0 planning Awaiting Acceptance) |
| Future direction          | Major 2.0 only after Owner Acceptance of planning + Approval to implement  |
| Current SemVer            | **1.0.0** Production (PRWL)                                                |

---

## APZ Documents

| Field                     | Value                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Purpose                   | Enterprise document metadata, versions, discovery                                                            |
| Target market             | Knowledge-heavy orgs; Law document plane                                                                     |
| Customer persona          | P-KM, P-LAW, P-PARA                                                                                          |
| Deployment model          | Self-hosted (platform PostgreSQL SoR)                                                                        |
| Licensing                 | Commercial APZHUB (native SoR) — no Paperless adapter on disk                                                |
| Edition                   | Professional+ primary; Community limited                                                                     |
| Pricing model             | Suite attach · Law pack include                                                                              |
| Primary value proposition | Permissioned document plane shared across products                                                           |
| Dependencies              | Document* platform services · Search publication · IAM                                                       |
| Release cadence           | [apz-documents](../products/apz-documents/README.md) · [releases/documents](../releases/documents/README.md) |
| Future direction          | Patch/Minor/Major naming only; Paperless only via ADR + Owner                                                |
| Current SemVer            | **1.0.0** — PRODUCTION_READY_WITH_LIMITATIONS — **ACCEPTED / CLOSED** (APZ-DOCUMENTS-002)                    |

---

## APZ Analytics

| Field                     | Value                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Purpose                   | Cross-product analytics and dashboards                                                                            |
| Target market             | Executives and ops leaders                                                                                        |
| Customer persona          | P-EXEC, P-PRAC, P-PO                                                                                              |
| Deployment model          | Self-hosted (Metabase CE provider)                                                                                |
| Licensing                 | Commercial APZHUB + Open Source Metabase CE                                                                       |
| Edition                   | Production Release **1.0.0** (documented limitations) — Awaiting Acceptance                                       |
| Pricing model             | Add-on / Enterprise attach (commercial terms Owner-gated)                                                         |
| Primary value proposition | Decision support without exposing BI engine branding                                                              |
| Dependencies              | Workbench · IAM · Analytics Platform Services · Metabase **0.1.0**                                                |
| Release cadence           | [apz-analytics pack](../products/apz-analytics/README.md) · [releases/analytics](../releases/analytics/README.md) |
| Future direction          | 1.0.x / 1.1.0 / 2.0.0 only with Owner Approval                                                                    |
| Current SemVer            | **1.0.0** — **Production** (PRWL) · recommendation **PRODUCTION READY**                                           |

---

## APZ Workflow

| Field                     | Value                                                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Purpose                   | Enterprise Workflow Automation Platform                                                                                       |
| Target market             | Executives · Managers · Ops · Support · Compliance · Finance · Projects · Developers · Administrators                         |
| Customer persona          | P-AUTO, P-IT, P-PO, P-EXEC, P-OPS                                                                                             |
| Deployment model          | Self-hosted; n8n CE primary provider (brand masked)                                                                           |
| Licensing                 | Commercial APZHUB Workflow + Open Source n8n where used                                                                       |
| Edition                   | Enterprise emphasis; Community metadata-only until execute GA                                                                 |
| Pricing model             | Enterprise step-up · execute capabilities Owner-gated                                                                         |
| Primary value proposition | Governed automation without engine-facing UX                                                                                  |
| Dependencies              | Workflow SoR · Integration SDK · n8n **0.1.0** · future HITL/execute plane                                                    |
| Release cadence           | Production **1.0.0** filed — [evidence](../releases/workflow/1.0.0/README.md); 1.0.x / 1.1.0 / 2.0.0 only with Owner Approval |
| Future direction          | 1.0.x / 1.1.0 / 2.0.0 only with Owner Approval                                                                                |
| Current SemVer            | **1.0.0** — **Production** (PRWL) · recommendation **PRODUCTION READY**                                                       |

---

## APZ TCMS

| Field                     | Value                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Purpose                   | Native testing & certification management                                                |
| Target market             | Engineering orgs needing ALM-quality evidence                                            |
| Customer persona          | P-QA, P-ENG, P-IT                                                                        |
| Deployment model          | Self-hosted with platform                                                                |
| Licensing                 | Commercial APZHUB (native; Kiwi path retired)                                            |
| Edition                   | Professional / Enterprise                                                                |
| Pricing model             | Quality add-on or Enterprise include                                                     |
| Primary value proposition | APZHUB-owned TCMS with CI metadata (GHA reference)                                       |
| Dependencies              | testing-* packages · GHA adapter **0.1.0** · Release governance models                   |
| Release cadence           | [apz-tcms](../products/apz-tcms/README.md) · [releases/tcms](../releases/tcms/README.md) |
| Future direction          | Patch/Minor/Major naming only; GitLab/AI only via Owner; no Kiwi resurrection            |
| Current SemVer            | **1.0.0** — PRODUCTION_READY_WITH_LIMITATIONS — **ACCEPTED / CLOSED** (APZ-TCMS-002)     |

---

## APZHUB Platform

| Field          | Value                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| Purpose        | Integrated enterprise operating platform portfolio                                                      |
| Current SemVer | **1.0.0** — PRODUCTION_READY_WITH_LIMITATIONS — Awaiting Acceptance (APZHUB-PORTFOLIO-001 Platform 1.0) |
| Evidence       | [releases/platform/1.0.0](../releases/platform/1.0.0/README.md)                                         |
| Dependencies   | All Production commercial products + shared platform capabilities                                       |

---

## APZ Law Platform

| Field                     | Value                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| Purpose                   | Legal practice management — matters, clients, documents, time, billing, trust                      |
| Target market             | Law firms and legal practices (primary commercial vertical)                                        |
| Customer persona          | P-LAW, P-PARA, P-PRAC, P-TRUST                                                                     |
| Deployment model          | Self-hosted / Hybrid (sovereign options for Government edition)                                    |
| Licensing                 | Commercial primary · Self Hosted / Hybrid                                                          |
| Edition                   | Enterprise / Government first; Partner/OEM possible                                                |
| Pricing model             | Vertical pack · edition ladder · suite attach                                                      |
| Primary value proposition | Practice operations on APZHUB platform — flagship commercial offer                                 |
| Dependencies              | Law app/schemas · Documents · Time adjacency · IAM · Search · Notifications                        |
| Release cadence           | [apz-law](../products/apz-law/README.md) · [releases/law](../releases/law/README.md)               |
| Future direction          | Patch/Minor/Major naming only; FIN-001 / Email SoR only via Owner; no Law redesign as silent patch |
| Current SemVer            | **1.0.0** — PRODUCTION_READY_WITH_LIMITATIONS — **ACCEPTED / CLOSED** (APZ-LAW-002)                |

---

## Related

- [PRODUCT-EDITION-MATRIX.md](./PRODUCT-EDITION-MATRIX.md)
- [COMMERCIAL-ROADMAP.md](./COMMERCIAL-ROADMAP.md)
- [PRODUCT-MANAGEMENT-HANDBOOK.md](./PRODUCT-MANAGEMENT-HANDBOOK.md)
