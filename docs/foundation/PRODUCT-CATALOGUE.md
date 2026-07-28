# APZHUB Product Catalogue

> **Purpose:** Index of APZHUB products and their status  
> **Audience:** Product owners, architects, engineers, AI agents  
> **Authoritative references:** [APZHUB Product Portfolio (PRODUCTS-001)](../products/APZHUB-PRODUCT-PORTFOLIO.md) · [Product Portfolio Strategy (PCS-001 historical)](../strategy/APZHUB-Product-Portfolio-Strategy.md) · [002 — Terminology](../002-product-naming-positioning-terminology-standard.md)  
> **Related documents:** [OSS-CATALOGUE](./OSS-CATALOGUE.md) · [PLATFORM-CAPABILITY-CATALOGUE](./PLATFORM-CAPABILITY-CATALOGUE.md) · [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](./INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md)  
> **Reading order:** After Master Brief  
> **Last updated:** 2026-07-18  
> **Current status:** Active — reconciled under **APZHUB-KF-001** to repository + completion reports. Engineering packages unchanged since **OSS-100-11** (Integration SDK **1.0.0** · Architecture Frozen).

---

## Product classification

| Product                     | Type                          | App / Module                                                                                                                                                      | Status                                                                                         | Commercial                      |
| --------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------- |
| **Platform**                | Core                          | `apps/web`                                                                                                                                                        | v2 certified                                                                                   | Internal + future SaaS          |
| **Law Platform**            | Vertical                      | `apps/law-platform`                                                                                                                                               | **Production 1.0.0** (PRWL · ACCEPTED)                                                         | **Primary commercial offering** |
| **Trust Accounting**        | Law capability                | Law app module                                                                                                                                                    | Milestone closed (LAW-015)                                                                     | Part of Law offering            |
| **Financial Engine**        | Shared engine                 | —                                                                                                                                                                 | **DEFER EXTRACTION** (FIN-001)                                                                 | Future licensed component       |
| **Projects**                | Productivity module           | Wave 1 adapter certified; UI deferred                                                                                                                             | `@apzhub/integration-plane` **0.6.0**                                                          | Bundled in suite                |
| **Documents**               | Platform + commercial product | **APZDOCS-006** PRWL (frozen) · commercial **1.0.0** **ACCEPTED** (APZ-DOCUMENTS-002) · **PRODUCTION READY**                                                      | Native platform (not Paperless adapter)                                                        | Bundled                         |
| **Workflow**                | Platform capability           | **APZWORKFLOW-011** — SoR + Engine wave **frozen**; `@apzhub/integration-n8n` **0.1.0**                                                                           | **PRODUCTION_READY_WITH_LIMITATIONS**                                                          | Bundled                         |
| **Configuration**           | Platform capability           | **APZCONFIG-006** — SoR wave **frozen**                                                                                                                           | **PRODUCTION_READY_WITH_LIMITATIONS**; metadata plane                                          | Bundled                         |
| **Identity Administration** | Platform capability           | **APZIDENTITY-006** — SoR wave **frozen**; identity-* contracts/core **0.2.0**, persistence **0.1.0**                                                             | Metadata only (not authentication)                                                             | Bundled                         |
| **Administration**          | Platform capability           | **APZADMIN-006** — SoR wave **frozen**                                                                                                                            | **PRODUCTION_READY_WITH_LIMITATIONS**                                                          | Bundled                         |
| **Notifications**           | Platform capability           | **APZNOTIFY-006** — SoR wave **frozen**                                                                                                                           | **PRODUCTION_READY_WITH_LIMITATIONS**; metadata plane                                          | Bundled                         |
| **Observability**           | Platform capability           | **APZOBSERVE-006** — SoR wave **frozen**                                                                                                                          | Metadata SoR (not Grafana/Prometheus/Loki adapters)                                            | Bundled                         |
| **Metrics**                 | Platform capability           | **APZMETRICS-006** — SoR wave **frozen** / **Architecture Frozen**                                                                                                | Metadata SoR                                                                                   | Bundled                         |
| **Search**                  | Platform capability           | **APZSEARCH-008** + **019** — Platform + Publication **Architecture Frozen**                                                                                      | **PRODUCTION_READY_WITH_LIMITATIONS**                                                          | Bundled                         |
| **Reporting**               | Platform capability           | **APZREPORT-003** — **PRODUCTION_READY_WITH_LIMITATIONS**                                                                                                         | Platform reporting + QEP/TCMS consumer                                                         | Bundled                         |
| **Time Tracking**           | Productivity module           | Not started on disk                                                                                                                                               | Planned OSS (Kimai) — no package                                                               | Bundled                         |
| **Support**                 | Productivity module           | Wave 2 **CLOSED** — CERTIFIED_WITH_LIMITATIONS; UI **PRODUCTION_READY_WITH_LIMITATIONS** (OSS-110-14)                                                             | `@apzhub/integration-zammad` **0.6.0**                                                         | Bundled                         |
| **Analytics**               | Productivity module           | Not started on disk                                                                                                                                               | Planned OSS (Metabase)                                                                         | Bundled                         |
| **Automation**              | Productivity module           | Engine metadata via n8n Reference Adapter (`@apzhub/integration-n8n` **0.1.0**) — read-only wave closed                                                           | Frozen under APZWORKFLOW-011                                                                   | Bundled                         |
| **APZ QEP**                 | Native product (official)     | Requirements **1.0.0 CERTIFIED / FROZEN** · `@apzhub/qep-traceability` **1.0.0 CERTIFIED / FROZEN** · `@apzhub/lifecycle-engine` **0.1.0** · `@apzhub/search-qep` | ENG-030A Parts 1–2 **ACCEPTED**; ARCH-008 **ACCEPTED**; ENG-030C Workbench awaiting acceptance | Bundled / enterprise cert tier  |
| **APZ TCMS**                | _(former product name)_       | Historical commercial name — see **APZ QEP** · packs preserved under `apz-tcms/` / `apztcms/` / `releases/tcms/`                                                  | Preserved evidence                                                                             | —                               |
| **Testing**                 | Workbench module              | Module of APZ QEP (`testing` code id — rename later) — enabled workbench                                                                                          | Certification views within module                                                              | Bundled                         |
| **Security Ops**            | Ops module                    | Not started on disk                                                                                                                                               | Planned OSS Wave 8–9                                                                           | Enterprise add-on               |
| **Quality Engineering**     | Product direction (QEP)       | Official product identity **APZ QEP** — [baselines/](../products/apzqep/requirements/baselines/README.md)                                                         | APZQEP-ENG-020E **ACCEPTED / CLOSED / COMPLETE**                                               | Bundled / enterprise cert tier  |
| **Exchange (APZEX)**        | Vertical                      | Not started                                                                                                                                                       | Unchartered                                                                                    | Future commercial               |
| **Banking (APZBNK)**        | Vertical                      | Not started                                                                                                                                                       | Unchartered                                                                                    | Future commercial               |

---

## Law Platform

| Field                         | Detail                                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                   | Legal practice management — matters, clients, documents, billing, trust                                                                |
| **Architecture**              | [Law Platform Reference Architecture](../architecture/APZHUB-Law-Platform-Reference-Architecture.md)                                   |
| **Capability map**            | [Law Capability Map](../architecture/APZHUB-Law-Capability-Map.md)                                                                     |
| **Backlog**                   | [LAW Platform Backlog](../backlog/LAW-Platform-Backlog.md) — LAW-001–015                                                               |
| **Readiness**                 | [Law Platform Readiness](../reviews/APZHUB-Law-Platform-Readiness.md) — APPROVED FOR PRODUCT VALIDATION                                |
| **Release**                   | [Law Platform v1.0](../releases/APZHUB-Law-Platform-v1.0.md) (planning baseline)                                                       |
| **Commercial SemVer**         | **1.0.0** PRWL — [evidence](../releases/law/1.0.0/README.md) · APZ-LAW-002 **ACCEPTED / CLOSED** · recommendation **PRODUCTION READY** |
| **Commercial planning (PDS)** | [docs/products/apz-law/](../products/apz-law/README.md) — APZ-LAW-001 **ACCEPTED** · path Existing Platform → Commercial Packaging     |
| **Definition Pack**           | [docs/products/law/](../products/law/README.md) — PRODUCTS-002                                                                         |

### Law domains delivered

Matters, Clients, Documents, Tasks, Time Entries, Invoices, Calendar, Trust Accounting (LAW-015 closed).

---

## Trust Accounting

| Field            | Detail                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------- |
| **Purpose**      | Client trust fund management, reconciliation, compliance                                |
| **Architecture** | [LAW Trust Reference Architecture](../architecture/LAW-Trust-Reference-Architecture.md) |
| **ADRs**         | ADR-0036–0039 (planning, accepted)                                                      |
| **Status**       | Milestone closed (LAW-015-14)                                                           |
| **Release**      | [LAW Trust v1.0](../releases/LAW-Trust-v1.0.md)                                         |

---

## Projects (OSS-backed)

| Field                | Detail                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| **User-facing name** | Projects                                                                                       |
| **Engine**           | Plane (hidden)                                                                                 |
| **Service**          | `ProjectService`                                                                               |
| **Adapter**          | `@apzhub/integration-plane` **0.6.0** — **Certified Reference Adapter** (OSS-101-10)           |
| **Architecture**     | [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md) |
| **ADR**              | [ADR-0047](../adr/ADR-0047-projects-plane-integration-architecture.md)                         |
| **Status**           | OSS-101-01…10 **complete** (Wave 1 closed); Projects UI deferred                               |

---

## Financial Engine

| Field         | Detail                                                                   |
| ------------- | ------------------------------------------------------------------------ |
| **Decision**  | **DEFER EXTRACTION**                                                     |
| **Review**    | [FIN-001 Architecture Review](../reviews/FIN-001-Architecture-Review.md) |
| **Rationale** | Law Platform validation priority; extraction premature                   |

---

## APZ QEP (Quality Engineering Platform) — formerly APZ TCMS

| Field               | Detail                                                                                                                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Product**         | **APZ QEP** — APZ Quality Engineering Platform (official)                                                                                                                                                                                                                                                                |
| **Former name**     | APZ TCMS — Test Case Management System (historical documentation preserved)                                                                                                                                                                                                                                              |
| **Official root**   | [docs/products/apzqep/](../products/apzqep/README.md) · Lifecycle [APZQEP-ENG-020C](../products/apzqep/requirements/lifecycle/README.md) · Content versioning [APZQEP-ENG-020D](../products/apzqep/requirements/versioning/README.md) · Baselines [APZQEP-ENG-020E](../products/apzqep/requirements/baselines/README.md) |
| **User-facing**     | Testing (Activity Bar — code rename later); Certification / quality views within product                                                                                                                                                                                                                                 |
| **Module ID**       | `testing` (code id unchanged this programme)                                                                                                                                                                                                                                                                             |
| **Services**        | `TestingService`, `CertificationService` (implementation unchanged this programme)                                                                                                                                                                                                                                       |
| **SoR**             | Platform PostgreSQL (metadata); S3-compatible evidence blobs — QEP remains SoR; AI never SoR                                                                                                                                                                                                                             |
| **Architecture**    | Historical: [APZ TCMS Reference Architecture](../architecture/APZHUB-APZ-TCMS-Reference-Architecture.md) — QEP architecture later under authorised programme                                                                                                                                                             |
| **Vision**          | Official: [PRODUCT-VISION](../products/apzqep/PRODUCT-VISION.md) · Historical: [APZ TCMS Product Vision](../strategy/APZHUB-APZ-TCMS-Product-Vision.md)                                                                                                                                                                  |
| **ADR**             | [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md) (historical TCMS native architecture — preserved)                                                                                                                                                                                                    |
| **Backlog**         | Historical: [APZTCMS-Backlog](../backlog/APZTCMS-Backlog.md) · last closed: **APZQEP-ENG-050A** · next: Owner Acceptance of **APZQEP-ENG-050B**                                                                                                                                                                          |
| **Packages (disk)** | `@apzhub/qep-requirements` **1.0.0** · `@apzhub/qep-traceability` **1.0.0** · `@apzhub/qep-verification` **1.0.0** — all **CERTIFIED / FROZEN** · `@apzhub/qep-test-specifications` **0.2.0** (domain + infrastructure) · `@apzhub/lifecycle-engine` **0.1.0** · `@apzhub/search-qep` · testing-*                        |
| **Status**          | Requirements / Traceability / Verification **1.0.0 CERTIFIED / FROZEN**; ARCH-011 / ENG-050A **ACCEPTED**; ENG-050B **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**; historical APZTCMS preserved                                                                                                                            |

| **Certification** | Historical commercial **1.0.0** PRWL under former name; Vertical / GHA slices **PRODUCTION_READY_WITH_LIMITATIONS** where certified |
| **Supersedes** | Former “APZ TCMS” as official product name; Kiwi TCMS as user-facing / SoR Testing engine (unchanged) |

---

## Product boundaries

| Rule                              | Detail                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| Products consume Platform Core    | Identity, authz, workbench, events, search                                               |
| Products never duplicate Platform | No product-local IAM or ops                                                              |
| User-facing terminology           | APZHUB names only — see [002](../002-product-naming-positioning-terminology-standard.md) |
| Workbench is shared               | Both `apps/web` and `apps/law-platform` use same shell patterns                          |

See [Platform Boundary Review](../reviews/APZHUB-Platform-Boundary-Review.md).

---

## Product validation strategy

- [Product Validation Strategy](../strategy/APZHUB-Product-Validation-Strategy.md)
- [Law Platform Validation Strategy](../strategy/APZHUB-Law-Platform-Validation-Strategy.md)

Products validate Platform Core — not the reverse.
