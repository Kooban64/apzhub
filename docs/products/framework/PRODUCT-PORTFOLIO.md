# Product Portfolio — Platform 1.4 Baseline

> **Programme:** APZHUB-PRODUCTS-002  
> **Authority:** Re-certifies portfolio against Platform 1.4 · complements [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md)  
> **Rule:** Documentation only — does not authorise implementation

## Engine classification summary

| Product         | Mode              | External engine (internal) | Strategic rationale                                                             |
| --------------- | ----------------- | -------------------------- | ------------------------------------------------------------------------------- |
| APZ Projects    | Platform-backed   | Plane                      | Mature CE project SoR; APZHUB owns UX, IAM, search, notifications               |
| APZ Support     | Platform-backed   | Zammad                     | Mature CE helpdesk SoR; brand-masked service desk inside APZHUB                 |
| APZ Time        | Platform-backed   | Kimai                      | CE time SoR; billing/utilisation adjacency                                      |
| APZ Analytics   | Platform-backed   | Metabase                   | CE BI engine; curated analytics without Metabase chrome                         |
| APZ Workflows   | Platform-backed   | n8n                        | CE automation engine; governed metadata/execute under freezes                   |
| APZ Documents   | Native APZHUB     | — (Paperless-ngx future)   | Metadata SoR on platform today; Paperless only via ADR + Owner                  |
| APZ Search      | Native / Platform | Meilisearch (index)        | Platform Search Service product surface; derived index not business SoR         |
| APZ TCMS        | Native APZHUB     | —                          | Commercial testing differentiator; native quality/intelligence SoR              |
| APZ Law         | Native APZHUB     | —                          | Primary commercial vertical; native practice SoR on platform PostgreSQL         |
| Future Products | TBD               | TBD                        | Owner-authorised only; classify Native vs Platform-backed at Architecture stage |

---

## APZ Projects

| Field                 | Detail                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------- |
| **Purpose**           | Plan and deliver work — projects, tasks, sprints — under APZHUB branding                    |
| **Platform services** | Workbench · IAM/Authz · Search · Notifications · Activity · Events · Gateway · Provisioning |
| **External engine**   | Plane (hidden) — `@apzhub/integration-plane`                                                |
| **Ownership**         | Product Owner: Projects · Integration Owner: Plane adapter                                  |
| **Maturity**          | **Production** — SemVer **1.1.0** ACCEPTED / CLOSED                                         |
| **Future roadmap**    | Patch 1.1.x / Minor 1.2.0 / Major 2.0.0 only under Owner Approval                           |

## APZ Support

| Field                 | Detail                                                                               |
| --------------------- | ------------------------------------------------------------------------------------ |
| **Purpose**           | Support requests, knowledge, organisations inside APZHUB                             |
| **Platform services** | Workbench · IAM/Authz · Search · Notifications · Gateway · Events                    |
| **External engine**   | Zammad (hidden) — `@apzhub/integration-zammad`                                       |
| **Ownership**         | Product Owner: Support                                                               |
| **Maturity**          | **Production** — **1.0.0** PRWL; Playwright residuals on product backlog (OQ-PW-001) |
| **Future roadmap**    | Packaging polish · Support 2.0 planning Owner-gated                                  |

## APZ Time

| Field                 | Detail                                                        |
| --------------------- | ------------------------------------------------------------- |
| **Purpose**           | Billable/non-billable time against work context               |
| **Platform services** | Workbench · IAM/Authz · Gateway · Events · Reporting (future) |
| **External engine**   | Kimai — `@apzhub/integration-kimai`                           |
| **Ownership**         | Product Owner: Time                                           |
| **Maturity**          | **Production** — **1.0.0** Phase 1 ACCEPTED / CLOSED          |
| **Future roadmap**    | Approvals/reporting UI only under Owner Approval              |

## APZ Analytics

| Field                 | Detail                                                        |
| --------------------- | ------------------------------------------------------------- |
| **Purpose**           | Cross-product analytics and dashboards                        |
| **Platform services** | Workbench · IAM/Authz · Analytics Platform Services · Gateway |
| **External engine**   | Metabase — `@apzhub/integration-metabase`                     |
| **Ownership**         | Product Owner: Analytics                                      |
| **Maturity**          | **Production** — **1.0.0** PRWL                               |
| **Future roadmap**    | No AI/SQL/external BI/live embed without Approval             |

## APZ Workflows

| Field                 | Detail                                                                              |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Purpose**           | Govern and observe automation workflows                                             |
| **Platform services** | Workflow contracts/core/persistence · Integration SDK · Gateway · Workbench · Authz |
| **External engine**   | n8n — `@apzhub/integration-n8n`                                                     |
| **Ownership**         | Product Owner: Workflow                                                             |
| **Maturity**          | **Production** — **1.0.0** PRWL; execute gated                                      |
| **Future roadmap**    | Designer/AI/extra providers/execute unlock require Approval                         |

## APZ Documents

| Field                 | Detail                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------- |
| **Purpose**           | Document metadata, versions, discovery                                                  |
| **Platform services** | Document contracts/core/persistence · Search · IAM/Authz · Gateway · Workbench          |
| **External engine**   | **None today** (Native SoR). Strategic optional engine: **Paperless-ngx** (not on disk) |
| **Ownership**         | Product Owner: Documents                                                                |
| **Maturity**          | **Production** — **1.0.0** PRWL · APZ-DOCUMENTS-002 ACCEPTED / CLOSED                   |
| **Future roadmap**    | Paperless adapter only via Product ADR + Owner                                          |

## APZ Search

| Field                 | Detail                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------- |
| **Purpose**           | Unified discovery across products                                                         |
| **Platform services** | Platform Search Service · providers · Gateway · Authz                                     |
| **External engine**   | Search index engines (e.g. Meilisearch) behind connectors — index is **derived**, not SoR |
| **Ownership**         | Platform Search capability · product surfaces consume providers                           |
| **Maturity**          | Platform capability **Production** (frozen search wave)                                   |
| **Future roadmap**    | Semantic/AI-ready without redesign; no module standalone search UIs                       |

## APZ TCMS

| Field                 | Detail                                                                      |
| --------------------- | --------------------------------------------------------------------------- |
| **Purpose**           | Test case management / engineering intelligence                             |
| **Platform services** | Workbench · IAM/Authz · Testing services · Gateway · Search (as applicable) |
| **External engine**   | **Native APZHUB**                                                           |
| **Ownership**         | Product Owner: TCMS                                                         |
| **Maturity**          | **Production** — SemVer **1.0.0** · APZ-TCMS-002 ACCEPTED / CLOSED          |
| **Future roadmap**    | Patch/Minor/Major Owner-gated; a11y residuals on product backlog            |

## APZ Law

| Field                 | Detail                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| **Purpose**           | Legal practice management — matters, clients, documents, time, billing, trust                     |
| **Platform services** | Workbench · IAM/Authz · Search · Notifications · Activity · Documents patterns · Events · Gateway |
| **External engine**   | **Native APZHUB** (platform PostgreSQL Law schemas)                                               |
| **Ownership**         | Product Owner: Law (primary commercial vertical)                                                  |
| **Maturity**          | **Production** — **1.0.0** PRWL · APZ-LAW-002 ACCEPTED / CLOSED                                   |
| **Future roadmap**    | FIN-001 / Email SoR / polish only via Owner; commercial packaging path documented                 |

## Future Products

| Candidate areas                         | Notes                                                        |
| --------------------------------------- | ------------------------------------------------------------ |
| APZ Notify (product packaging)          | Platform notification plane exists; durable runtime flag OFF |
| Observability / Admin product packaging | Administration Workspace permission-gated                    |
| Additional verticals                    | Require Vision → Architecture → Owner Programme Approval     |

Future products must declare Native vs Platform-backed at Architecture stage and follow this framework without exception.
