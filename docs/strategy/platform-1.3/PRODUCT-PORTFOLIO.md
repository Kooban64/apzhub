# Product Portfolio — APZHUB (Platform 1.2.0 Baseline → 1.3 Planning)

> **Programme:** APZHUB-PLAN-001  
> **Date:** 2026-07-22  
> **Honesty:** PRWL and STOP surfaces must not be overclaimed.

## Commercial products

| Product             | SemVer    | Purpose                                        | Current capability                                      | Maturity                 | Prod readiness | Outstanding                                  | Tech debt / KL         | Dependencies                | Business value          | Effort remaining                   | Strategic importance |
| ------------------- | --------- | ---------------------------------------------- | ------------------------------------------------------- | ------------------------ | -------------- | -------------------------------------------- | ---------------------- | --------------------------- | ----------------------- | ---------------------------------- | -------------------- |
| **APZHUB Platform** | **1.2.0** | Enterprise operating platform shell + services | Runtime, gateway, ops packaging, frozen architecture    | Production · Frozen      | **PRWL**       | KL-01…13 residuals; SemVer root drift        | KL-11/12               | All products                | Foundation              | Medium (hygiene)                   | **Critical**         |
| **APZ Projects**    | **1.1.0** | Plan/deliver work                              | Projects/tasks via Plane                                | Production (limitations) | Production     | Sprint CRUD · My Work depth · AU-*           | Product AU             | Plane · Search              | High                    | Medium                             | **High**             |
| **APZ Support**     | **1.0.0** | Service desk                                   | Tickets · webhook · binary attachments                  | Production               | **PRWL**       | **Realtime SUP-03** · attachment delete      | KL-05/10               | Zammad                      | High                    | Medium–High                        | **High**             |
| **APZ Time**        | **1.0.0** | Time capture                                   | Timesheets via Kimai · search-time publisher            | Production (limitations) | Production     | Approvals/reporting UI · live Search drain   | KL-01                  | Kimai · Search              | Medium–High             | Medium                             | **Medium–High**      |
| **APZ Documents**   | **1.0.0** | Document metadata SoR                          | Metadata-first · search publication                     | Production               | **PRWL**       | Binary/OCR/preview · Paperless               | KL-10 · DEF-05         | Search · storage            | High (Law)              | High (binary)                      | **High**             |
| **APZ TCMS**        | **1.0.0** | Testing & certification                        | Plans/runs · GHA · GitLab metadata                      | Production               | **PRWL**       | CI mutations (KL-03) · multi-CI              | KL-03                  | GHA/GitLab                  | Medium                  | Medium                             | **Medium**           |
| **APZ Law**         | **1.0.0** | Legal practice vertical                        | Matters/clients/docs/tasks/time/invoices/calendar/trust | Production               | **PRWL**       | UX polish · L1 cache · Email/FIN adjacency   | KL-04 · STOP Email/FIN | Platform · Documents · Time | **Critical** commercial | Medium (UX) / High (FIN/Email)     | **Critical**         |
| **APZ Analytics**   | **1.0.0** | Curated BI                                     | Metabase foundation · workbench                         | Production               | **PRWL**       | **Live embed** · registry SoR                | KL-10 · TD-12-08       | Metabase                    | Medium                  | Medium                             | **Medium**           |
| **APZ Workflow**    | **1.0.0** | Governed automation                            | Definitions/runs · journal SoR · **Execute gated**      | Production               | **PRWL**       | Designer adjacency · AU-* · **Execute STOP** | KL-09                  | n8n · Event Bus             | High                    | Medium (designer) / High (Execute) | **High**             |

## Platform capabilities

| Capability           | Purpose                       | Current capability                     | Maturity               | Prod readiness  | Outstanding                      | Strategic importance   |
| -------------------- | ----------------------------- | -------------------------------------- | ---------------------- | --------------- | -------------------------------- | ---------------------- |
| **Platform Runtime** | Bootstrap, registry, services | Delivered · frozen                     | Production             | **PRWL**        | Hygiene · SemVer                 | **Critical**           |
| **Workbench**        | DEF shell                     | Stable shell + modules                 | Stable                 | Production      | Product polish only              | **Critical**           |
| **Identity**         | Auth + Identity Admin SoR     | BetterAuth · APZIDENTITY frozen        | Frozen                 | PRWL            | Zero Trust hygiene slices        | **Critical**           |
| **Administration**   | Admin SoR / workbench         | APZADMIN frozen                        | Frozen                 | PRWL            | ADR-gated extensions             | **Medium**             |
| **Configuration**    | Config SoR                    | APZCONFIG frozen                       | Frozen                 | PRWL            | APZCONFIG-007 roadmap            | **Medium**             |
| **Notifications**    | Attention metadata            | SoR frozen · **no delivery providers** | PRWL · Needs expansion | PRWL (metadata) | Delivery providers (≠ Email SoR) | **Medium–High**        |
| **Search**           | Unified discovery             | Publishers present · drain incomplete  | PRWL · Needs expansion | PRWL            | **Live drain** (KL-01)           | **High**               |
| **Observe**          | Observability SoR             | Catalogue/runbooks · no live eval      | Frozen · Limited live  | PRWL            | **Live alerts** (KL-02)          | **High**               |
| **Metrics**          | Platform metrics SoR          | APZMETRICS frozen                      | Frozen                 | PRWL            | ADR-gated                        | **Medium**             |
| **Provisioning**     | Product provisioning MVP      | **0.1.0** closed                       | MVP                    | Accepted MVP    | Deeper flows if Owner elevates   | **Medium**             |
| **Mail / Email**     | Email SoR                     | **Absent**                             | STOP                   | Not ready       | Full SoR programme               | **High gap / blocked** |
| **Calendar**         | Law calendar                  | Bundled in Law 1.0.0                   | Inherited Law          | PRWL            | No standalone 1.3 epic required  | **Medium** (Law)       |

## Integrations (internal engines — never user-facing brands)

| Integration     | Package                      | Version   | Classification             | Outstanding                |
| --------------- | ---------------------------- | --------- | -------------------------- | -------------------------- |
| Plane           | `integration-plane`          | 0.6.0     | Certified Reference        | ADR for deeper coverage    |
| Kimai           | `integration-kimai`          | 0.2.0     | CERTIFIED_DOMAIN           | Product Time residuals     |
| Zammad          | `integration-zammad`         | 0.8.0     | CERTIFIED_WITH_LIMITATIONS | SUP-03 · attachment delete |
| Metabase        | `integration-metabase`       | 0.1.0     | CERTIFIED_FOUNDATION       | Live embed / domain cert   |
| n8n             | `integration-n8n`            | 0.1.0     | CERTIFIED_FOUNDATION       | **Execute gated**          |
| Meilisearch     | `integration-meilisearch`    | 0.1.0     | Search Reference           | Live drain                 |
| GitLab CI       | `integration-gitlab-ci`      | 0.1.0     | Metadata only              | Mutations                  |
| GitHub Actions  | `integration-github-actions` | 0.1.0     | Official CI Reference      | —                          |
| Integration SDK | `integration-sdk`            | **1.0.0** | **Frozen**                 | Unfreeze STOP              |

## Future products (not in 1.2.0 catalogue)

| Concept                              | Status           | Lane                     |
| ------------------------------------ | ---------------- | ------------------------ |
| Email / Communications product       | Absent           | **2.0 / dedicated**      |
| Finance / Trust extraction (FIN-001) | Not extracted    | **2.0 / dedicated**      |
| Standalone Calendar product          | Law-bundled only | Future if Owner elevates |
| Documents DMS (Paperless)            | Absent           | **2.0**                  |
