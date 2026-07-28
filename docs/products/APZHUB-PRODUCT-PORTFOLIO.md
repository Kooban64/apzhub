# APZHUB Product Portfolio & Roadmap

> **Programme:** APZHUB-PRODUCTS-001  
> **Title:** Product Portfolio & Roadmap  
> **Classification:** Documentation only — no production code, package, or architecture changes  
> **Status:** Complete — awaiting Owner review  
> **Authority:** Knowledge Foundation catalogues + disk inventory ([INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](../foundation/INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md), [PRODUCT-CATALOGUE](../foundation/PRODUCT-CATALOGUE.md), [CURRENT-STATE](../foundation/CURRENT-STATE.md))  
> **Complements:** [APZHUB-PRODUCTS-000](./README.md) Product Engineering Framework · historical [PCS-001 Strategy](../strategy/APZHUB-Product-Portfolio-Strategy.md)  
> **Quality baseline:** [APZHUB-QA-002](../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) **PRODUCTION READY** (Owner ACCEPTED)  
> **Rule:** Does **not** authorise any product implementation. Does **not** invent programme IDs.

---

## 1. Purpose

This document is the **authoritative strategic product portfolio** for Phase 3 Product Engineering. It defines vision, business value, delivery order, dependencies, platform usage, maturity, and roadmap shape for every planned product.

Platform Foundation is **CLOSED**. Products **extend** the platform; they do **not** redesign it.

```text
Platform Engineering (COMPLETE · PRODUCTION READY)
              ↓ enables
Product Engineering (ACTIVE — portfolio defined; no implementation authorised)
```

---

## 2. Portfolio overview

| User-facing product | Portfolio folder                                                                       | Type                              | Primary commercial role         |
| ------------------- | -------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------- |
| **APZ Projects**    | [projects/](./projects/)                                                               | Productivity product (OSS-backed) | Suite                           |
| **APZ Time**        | [time/](./time/)                                                                       | Productivity product (OSS-backed) | Suite                           |
| **APZ Support**     | [support/](./support/)                                                                 | Productivity product (OSS-backed) | Suite                           |
| **APZ Documents**   | [documents/](./documents/) · [apz-documents/](./apz-documents/) (Release 1.0 planning) | Platform-native documents product | Suite                           |
| **APZ Analytics**   | [analytics/](./analytics/) · [apz-analytics/](./apz-analytics/)                        | Productivity product (OSS-backed) | Suite                           |
| **APZ Workflow**    | [workflow/](./workflow/)                                                               | Workflow / automation product     | Suite                           |
| **Law Platform**    | [law/](./law/)                                                                         | Vertical product (native)         | **Primary commercial offering** |

Related platform / specialised products (indexed in KF; not Phase 3 portfolio folders above): **APZ TCMS** (Testing) — commercial SemVer **1.0.0** [evidence](../releases/tcms/1.0.0/README.md) (APZ-TCMS-002 **ACCEPTED / CLOSED**); **APZ Law** — commercial SemVer **1.0.0** [evidence](../releases/law/1.0.0/README.md) (APZ-LAW-002 **ACCEPTED / CLOSED**); Platform Administration / Identity / Configuration / Notifications / Observability / Metrics / Search / Reporting — see [PRODUCT-CATALOGUE](../foundation/PRODUCT-CATALOGUE.md).

---

## 3. Product entries

### 3.1 APZ Projects

| Field                     | Detail                                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**               | Plan and deliver work — projects, tasks, sprints — under APZHUB branding                                                                                 |
| **Business value**        | Core productivity spine for delivery teams; feeds Search, Notifications, Activity, Reporting                                                             |
| **Primary users**         | Project managers, engineers, delivery leads                                                                                                              |
| **Major capabilities**    | Projects, tasks, sprints, assignments, status transitions (via Platform Services)                                                                        |
| **Platform dependencies** | Workbench · IAM/Authz · Search · Notifications · Activity · Events/Outbox · Gateway                                                                      |
| **External integrations** | **Plane** (hidden) — `@apzhub/integration-plane` **0.6.0** Certified Reference Adapter (OSS-101 Wave 1 closed)                                           |
| **Current maturity**      | **Production** — **1.1.0** current Production Release (**ACCEPTED / CLOSED**); Phase 1 APZHUB-PROJECTS-001 **ACCEPTED / CLOSED**; documented limitations |
| **Future roadmap**        | Patch **1.1.x** / Minor **1.2.0** / Major **2.0.0** only under Owner Approval; Plane expansion only via ADR + Owner                                      |
| **Known limitations**     | [projects/KNOWN-LIMITATIONS.md](./projects/KNOWN-LIMITATIONS.md); engine branding must remain masked                                                     |

---

### 3.2 APZ Time

| Field                     | Detail                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| **Purpose**               | Capture billable and non-billable time against work context                                   |
| **Business value**        | Revenue recognition, utilisation, Law billing adjacency, project cost signals                 |
| **Primary users**         | Practitioners, project staff, finance ops                                                     |
| **Major capabilities**    | Time entries, timesheets, activities, customers, tags (stack); approvals/reporting UI planned |
| **Platform dependencies** | Workbench · IAM/Authz · Gateway · Events · Search (future) · Reporting                        |
| **External integrations** | **Kimai** — `@apzhub/integration-kimai` **0.2.0** **CERTIFIED_DOMAIN**                        |
| **Current maturity**      | **Production** — **1.0.0** Phase 1 (**ACCEPTED / CLOSED**; documented limitations)            |
| **Future roadmap**        | Patch **1.0.x** / Minor **1.1.0** / Major **2.0.0** — Owner Approval required                 |
| **Known limitations**     | See pack KNOWN-LIMITATIONS — Phase 1 excludes approvals/reporting UI/analytics                |

---

### 3.3 APZ Support

| Field                     | Detail                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| **Purpose**               | Customer / internal support requests, knowledge articles, organisations/groups                    |
| **Business value**        | Service desk experience inside APZHUB; reduces tool sprawl                                        |
| **Primary users**         | Support agents, customers (where enabled), service managers                                       |
| **Major capabilities**    | Requests, articles, organisations, groups, users, search, analytics (platform spine)              |
| **Platform dependencies** | Workbench · IAM/Authz · Search · Notifications · Gateway · Events                                 |
| **External integrations** | **Zammad** (hidden) — `@apzhub/integration-zammad` **0.6.0**; Wave 2 closed                       |
| **Current maturity**      | **Production** (certified with limitations — OSS-110-14 UI **PRODUCTION_READY_WITH_LIMITATIONS**) |
| **Future roadmap**        | Product packaging, UX polish, deeper Zammad capabilities under Owner-approved programmes          |
| **Known limitations**     | Certification retains documented limitations; no new OSS-102 stories listed                       |

---

### 3.4 APZ Documents

| Field                     | Detail                                                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**               | Enterprise document metadata, versions, and discovery inside APZHUB                                                                                                        |
| **Business value**        | Single document plane for products (incl. Law); searchable, permissioned content                                                                                           |
| **Primary users**         | Knowledge workers, legal staff, project teams                                                                                                                              |
| **Major capabilities**    | Document metadata SoR, versions, permissions, Search publication, Workbench                                                                                                |
| **Platform dependencies** | Document contracts/core/persistence · Search · IAM/Authz · Gateway · Workbench                                                                                             |
| **External integrations** | **Native platform Documents** (APZDOCS-001…006 frozen). **No Paperless-ngx adapter** on disk                                                                               |
| **Current maturity**      | **Production** — SemVer **1.0.0** PRWL · APZ-DOCUMENTS-002 **ACCEPTED / CLOSED** · recommendation **PRODUCTION READY** ([evidence](../releases/documents/1.0.0/README.md)) |
| **Future roadmap**        | Patch/Minor/Major naming only; optional Paperless only via ADR + Owner                                                                                                     |
| **Known limitations**     | Metadata-first posture; binary/engine choices constrained by freeze; no Paperless adapter                                                                                  |

---

### 3.5 APZ Analytics

| Field                     | Detail                                                                                                                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**               | Cross-product analytics and dashboards for operators and leaders                                                                                                                    |
| **Business value**        | Decision support without exposing Metabase (or other) branding                                                                                                                      |
| **Primary users**         | Executives, ops leads, product owners                                                                                                                                               |
| **Major capabilities**    | Curated suites · dashboards · datasets · reports · saved · search · health · diagnostics                                                                                            |
| **Platform dependencies** | Workbench · IAM/Authz · Analytics Platform Services · Gateway                                                                                                                       |
| **External integrations** | **Metabase** — `@apzhub/integration-metabase` **0.1.0** CERTIFIED_FOUNDATION                                                                                                        |
| **Current maturity**      | **Production** — **1.0.0** (**Awaiting Acceptance** APZ-ANALYTICS-002 **ACCEPTED / CLOSED**; PRODUCTION_READY_WITH_LIMITATIONS) · [evidence](../releases/analytics/1.0.0/README.md) |
| **Future roadmap**        | 1.0.x / 1.1.0 / 2.0.0 naming only — Owner Approvals required; no AI/SQL/external BI without Approval                                                                                |
| **Known limitations**     | [apz-analytics/KNOWN-LIMITATIONS.md](./apz-analytics/KNOWN-LIMITATIONS.md) — no live embed; in-memory registry MVP; Metabase foundation                                             |

---

### 3.6 APZ Workflow

| Field                     | Detail                                                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**               | Define, govern, and observe automation workflows under APZHUB                                                                                             |
| **Business value**        | Orchestration across products without n8n-facing UX                                                                                                       |
| **Primary users**         | Automation builders, ops, product admins                                                                                                                  |
| **Major capabilities**    | Definitions · runs · schedules · tasks · approvals · notifications · health/diagnostics · Workbench                                                       |
| **Platform dependencies** | Workflow contracts/core/persistence · Integration SDK · Gateway · Workbench · Authz · Workflow Platform Services/HTTP                                     |
| **External integrations** | **n8n** — `@apzhub/integration-n8n` **0.1.0** CERTIFIED_FOUNDATION; future providers planned                                                              |
| **Current maturity**      | **Production** — **1.0.0** (**ACCEPTED / CLOSED** APZ-WORKFLOW-002; PRODUCTION_READY_WITH_LIMITATIONS) · [evidence](../releases/workflow/1.0.0/README.md) |
| **Future roadmap**        | 1.0.x / 1.1.0 / 2.0.0 naming only — Owner Approvals required; no designer/AI/extra providers/execute unlock without Approval                              |
| **Known limitations**     | [apz-workflow/KNOWN-LIMITATIONS.md](./apz-workflow/KNOWN-LIMITATIONS.md) — n8n foundation execute limits; in-memory modes; no designer-first UX           |

---

### 3.7 Law Platform

| Field                     | Detail                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**               | Legal practice management — matters, clients, documents, time, billing, trust                                            |
| **Business value**        | **Primary commercial vertical**; demonstrates APZHUB as an enterprise operating platform                                 |
| **Primary users**         | Lawyers, paralegals, practice managers, trust accountants                                                                |
| **Major capabilities**    | Matters · Clients · Documents · Tasks · Time · Invoices · Calendar · Trust Accounting (LAW-015 closed)                   |
| **Platform dependencies** | Workbench · IAM/Authz · Search/Knowledge · Notifications · Activity · Documents patterns · Events/Outbox · Gateway       |
| **External integrations** | Native Law persistence (platform PostgreSQL schemas); consumes platform capabilities — not Plane/Zammad for core Law SoR |
| **Current maturity**      | **Production** — SemVer **1.0.0** PRWL · APZ-LAW-002 **ACCEPTED / CLOSED** ([evidence](../releases/law/1.0.0/README.md)) |
| **Future roadmap**        | Patch/Minor/Major naming only; polish / OBS / FIN-001 / Email SoR only via Owner                                         |
| **Known limitations**     | Placeholder UX surfaces remain in places; Financial Engine extraction **deferred** (FIN-001)                             |

---

## 4. Dependency matrix

```text
┌─────────────────────────────────────────────────────────────────┐
│                     PLATFORM (COMPLETE)                         │
│  Runtime · IAM · Authz · Workbench · Gateway · Search · Events  │
│  Notifications · Activity · Config · Admin · Observe · Metrics  │
│  Outbox · Event Bus · Provisioning · Integration SDK (frozen)   │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┏━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━┓
                ▼                               ▼
        PRODUCT PORTFOLIO                 SHARED CAPABILITIES
   Projects · Time · Support          Search publication · Documents
   Documents · Analytics              Reporting · Workflow SoR/Engine
   Workflow · Law Platform            Identity Admin · Notifications
                │                               │
                └───────────────┬───────────────┘
                                ▼
                        INTEGRATIONS (adapters)
           Plane · Zammad · Meilisearch · n8n · GitHub Actions
           Kimai **0.2.0** · (Metabase · Paperless — planned / absent)
```

| Product       | Requires platform       | Shared capabilities used                           | Integration (today)                     |
| ------------- | ----------------------- | -------------------------------------------------- | --------------------------------------- |
| APZ Projects  | Gateway, Workbench, IAM | Search, Events, Notifications                      | Plane **0.6.0**                         |
| APZ Time      | Gateway, Workbench, IAM | Reporting (future), Events                         | Kimai **0.2.0**                         |
| APZ Support   | Gateway, Workbench, IAM | Search, Notifications                              | Zammad **0.6.0**                        |
| APZ Documents | Gateway, Workbench, IAM | Search publication, Permissions                    | Native Documents SoR                    |
| APZ Analytics | Gateway, Workbench, IAM | Metrics/Reporting adjacency                        | Metabase **0.1.0** CERTIFIED_FOUNDATION |
| APZ Workflow  | Gateway, Workbench, IAM | Workflow SoR/Engine, Integration SDK               | n8n **0.1.0**                           |
| Law Platform  | Gateway, Workbench, IAM | Documents, Search, Notifications, Activity, Outbox | Native Law schemas                      |

**Layer rule (mandatory):** Module → Platform Service → Connector → Engine. Products never call engines or connectors directly.

---

## 5. Recommended delivery order

Strategic recommendation only. **Does not authorise implementation.** **Does not invent programme IDs.**

| Order | Product           | Rationale                                                                                   |
| ----- | ----------------- | ------------------------------------------------------------------------------------------- |
| **1** | **Law Platform**  | Highest commercial value; deepest vertical delivery; primary offering                       |
| **2** | **APZ Support**   | Already production-certified with limitations; high user impact; packaging/polish           |
| **3** | **APZ Projects**  | **Production 1.1.0** (**ACCEPTED / CLOSED**); further releases Owner-gated                  |
| **4** | **APZ Documents** | Platform Documents production-ready; product packaging + Law adjacency                      |
| **5** | **APZ Workflow**  | Engine/SoR frozen; product UX and governed expansion under Owner control                    |
| **6** | **APZ Time**      | **Production 1.0.0** — further releases Owner-gated                                         |
| **7** | **APZ Analytics** | **Production 1.0.0** — further releases Owner-gated (Awaiting Acceptance APZ-ANALYTICS-002) |

Scoring dimensions used: business value · technical readiness · platform maturity · user impact · implementation complexity.

---

## 6. Portfolio maturity assessment

| Product       | Maturity              | Evidence summary                                                                                             |
| ------------- | --------------------- | ------------------------------------------------------------------------------------------------------------ |
| APZ Projects  | **Production**        | **1.1.0** ACCEPTED/CLOSED — current Production Release; limitations documented                               |
| APZ Time      | **Production**        | **1.0.0** Phase 1 ACCEPTED/CLOSED — limitations documented                                                   |
| APZ Support   | **Production**        | **1.0.0** SemVer packaging (OSS-110 PRWL) — [evidence](../releases/support/1.0.0/README.md)                  |
| APZ Documents | **Production**        | APZDOCS wave frozen PRWL                                                                                     |
| APZ Analytics | **Production**        | **1.0.0** PRWL — Awaiting Acceptance (APZ-ANALYTICS-002) · [evidence](../releases/analytics/1.0.0/README.md) |
| APZ Workflow  | **Production**        | **1.0.0** PRWL — Awaiting Acceptance (APZ-WORKFLOW-002) · [evidence](../releases/workflow/1.0.0/README.md)   |
| Law Platform  | **Production** (PRWL) | SemVer **1.0.0** · APZ-LAW-002 **ACCEPTED** · [evidence](../releases/law/1.0.0/README.md)                    |

### Maturity legend

| Level                | Meaning                                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| Concept              | Intent only                                                                     |
| Planning             | Roadmapped; no substantive delivery                                             |
| Architecture Ready   | Architecture/adapters ready; product delivery incomplete                        |
| Implementation Ready | Ready to start an Owner-approved programme                                      |
| In Development       | Active product delivery / validation                                            |
| Production           | Certified / frozen production slices in use (may retain documented limitations) |

---

## 7. Cross-cutting rules

1. **Quality:** Every future product programme inherits [QA-002 PRODUCTION READY](../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) gates (typecheck, lint, format, tests, audit, docs).
2. **SDK freeze:** `@apzhub/integration-sdk` **1.0.0** Architecture Frozen — changes require ADR + Owner.
3. **Naming:** User-facing names only (Projects, Support, …) — never Plane, Zammad, Kimai, Metabase, n8n in UI.
4. **Authorisation:** No product code until explicit Owner Approval of a named product programme.
5. **KF authority:** Platform catalogues and freezes remain authoritative for platform capabilities.

---

## 8. Navigation

| Document                                                                                              | Role                       |
| ----------------------------------------------------------------------------------------------------- | -------------------------- |
| [PRODUCT-DOCUMENT-MAP](./PRODUCT-DOCUMENT-MAP.md)                                                     | Product docs index         |
| [PRODUCT-ENGINEERING-HANDBOOK](./PRODUCT-ENGINEERING-HANDBOOK.md)                                     | How products are built     |
| [PRODUCT-CATALOGUE](../foundation/PRODUCT-CATALOGUE.md)                                               | KF product index           |
| [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](../foundation/INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md) | Disk + programme inventory |
| [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md)                                               | Authorisation stop         |

---

## 9. Confirmation

- Documentation only
- No production code / package / architecture changes
- No programme IDs invented
- No product implementation authorised or recommended as next engineering programme

**STOP.** Await Owner review of APZHUB-PRODUCTS-001.
