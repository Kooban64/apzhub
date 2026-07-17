# APZHUB Product Catalogue

> **Purpose:** Index of APZHUB products and their status  
> **Audience:** Product owners, architects, engineers, AI agents  
> **Authoritative references:** [Product Portfolio Strategy](../strategy/APZHUB-Product-Portfolio-Strategy.md) · [002 — Terminology](../002-product-naming-positioning-terminology-standard.md)  
> **Related documents:** [OSS-CATALOGUE](./OSS-CATALOGUE.md) · [PLATFORM-CAPABILITY-CATALOGUE](./PLATFORM-CAPABILITY-CATALOGUE.md)  
> **Reading order:** After Master Brief  
> **Last updated:** 2026-07-16  
> **Current status:** Active — **APZIDENTITY-001 complete** (Identity Administration Foundation); **APZADMIN-006 complete** (Administration SoR **frozen**); **APZCONFIG-006 complete** (Configuration SoR **frozen**); **APZNOTIFY-006 complete** (Notification SoR **frozen**); **APZWORKFLOW-011 complete** (Workflow Engine wave **frozen**); Search **APZSEARCH-015 complete**; **APZSEARCH-016** deferred; Documents vertical **PRODUCTION_READY_WITH_LIMITATIONS** (APZDOCS-006)

---

## Product classification

| Product                 | Type                | App / Module                         | Status                              | Commercial                      |
| ----------------------- | ------------------- | ------------------------------------ | ----------------------------------- | ------------------------------- |
| **Platform**            | Core                | `apps/web`                           | v2 certified                        | Internal + future SaaS          |
| **Law Platform**        | Vertical            | `apps/law-platform`                  | Validation advanced                 | **Primary commercial offering** |
| **Trust Accounting**    | Law capability      | Law app module                       | Milestone closed (LAW-015)          | Part of Law offering            |
| **Financial Engine**    | Shared engine       | —                                    | **DEFER EXTRACTION** (FIN-001)      | Future licensed component       |
| **Projects**            | Productivity module | Wave 1 adapter certified; UI planned | `@apzhub/integration-plane` v0.6.0  | Bundled in suite                |
| **Documents**           | Platform capability | **APZDOCS-006 complete** — **PRODUCTION_READY_WITH_LIMITATIONS** (metadata path; no binary HTTP) | Stable (architecture frozen) | Bundled                         |
| **Workflow**            | Platform capability | **APZWORKFLOW-011 complete** — SoR + Engine wave **frozen**; `@apzhub/integration-n8n` **0.1.0** official Reference Adapter (**PRODUCTION_READY_WITH_LIMITATIONS**) | **APZWORKFLOW-012** roadmap only | Bundled                         |
| **Configuration**       | Platform capability | **APZCONFIG-006 complete** — SoR wave **frozen** (**PRODUCTION_READY_WITH_LIMITATIONS**); metadata management plane only | **APZCONFIG-007** roadmap only | Bundled                         |
| **Identity Administration** | Platform capability | **APZIDENTITY-001 complete** — SoR foundation (`@apzhub/identity-*` **0.1.0**); metadata only (not authentication) | **APZIDENTITY-002** next | Bundled                         |
| **Administration**      | Platform capability | **APZADMIN-006 complete** — SoR wave **frozen** (**PRODUCTION_READY_WITH_LIMITATIONS**); metadata governance plane only; Platform Operations separate | Closed | Bundled                         |
| **Notifications**       | Platform capability | **APZNOTIFY-006 complete** — SoR wave **frozen** (**PRODUCTION_READY_WITH_LIMITATIONS**); metadata plane only | **APZNOTIFY-007** roadmap only | Bundled                         |
| **Search**              | Platform capability | **APZSEARCH-015 complete** — publication ecosystem **PRODUCTION_READY_WITH_LIMITATIONS**; platform query vertical still **PRODUCTION_READY_WITH_LIMITATIONS** (008) | **APZSEARCH-016** deferred | Bundled                         |
| **Time Tracking**       | Productivity module | Planned                              | OSS Wave (Kimai)                    | Bundled                         |
| **Support**             | Productivity module | Wave 2 CLOSED — CERTIFIED_WITH_LIMITATIONS; UI delivered (OSS-110-13); UI cert → OSS-110-14 | `@apzhub/integration-zammad` v0.6.0 | Bundled                         |
| **Analytics**           | Productivity module | Planned                              | OSS Wave 5                          | Bundled                         |
| **Automation**          | Productivity module | Engine metadata via Workflow Engine Reference Adapter (`@apzhub/integration-n8n`) — read-only wave closed | Future execution under new milestone | Bundled                         |
| **APZ TCMS**            | Native product      | **APZREPORT-003 complete** — Reporting **PRODUCTION_READY_WITH_LIMITATIONS** | Document consumers later | Bundled / enterprise cert tier  |
| **Testing**             | Workbench module    | Module of APZ TCMS (`testing`) — enabled workbench | Certification views within module   | Bundled                         |
| **Security Ops**        | Ops module          | Planned                              | OSS Wave 8–9                        | Enterprise add-on               |
| **Quality Engineering** | *(superseded name)* | Superseded by **APZ TCMS**           | See APZTCMS backlog                 | —                               |
| **Exchange (APZEX)**    | Vertical            | Not started                          | Unchartered                         | Future commercial               |
| **Banking (APZBNK)**    | Vertical            | Not started                          | Unchartered                         | Future commercial               |

---

## Law Platform

| Field              | Detail                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| **Purpose**        | Legal practice management — matters, clients, documents, billing, trust                                 |
| **Architecture**   | [Law Platform Reference Architecture](../architecture/APZHUB-Law-Platform-Reference-Architecture.md)    |
| **Capability map** | [Law Capability Map](../architecture/APZHUB-Law-Capability-Map.md)                                      |
| **Backlog**        | [LAW Platform Backlog](../backlog/LAW-Platform-Backlog.md) — LAW-001–015                                |
| **Readiness**      | [Law Platform Readiness](../reviews/APZHUB-Law-Platform-Readiness.md) — APPROVED FOR PRODUCT VALIDATION |
| **Release**        | [Law Platform v1.0](../releases/APZHUB-Law-Platform-v1.0.md) (planning baseline)                        |

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

## Projects (OSS-backed — planned)

| Field                | Detail                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| **User-facing name** | Projects                                                                                       |
| **Engine**           | Plane (hidden)                                                                                 |
| **Service**          | `ProjectService`                                                                               |
| **Adapter**          | `PlaneAdapter` (not implemented)                                                               |
| **Architecture**     | [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md) |
| **ADR**              | [ADR-0047](../adr/ADR-0047-projects-plane-integration-architecture.md)                         |
| **Status**           | OSS-101-01–03 complete; adapter blocked until OSS-100-05                                       |

---

## Financial Engine

| Field         | Detail                                                                   |
| ------------- | ------------------------------------------------------------------------ |
| **Decision**  | **DEFER EXTRACTION**                                                     |
| **Review**    | [FIN-001 Architecture Review](../reviews/FIN-001-Architecture-Review.md) |
| **Rationale** | Law Platform validation priority; extraction premature                   |

---

## APZ TCMS (Testing & Certification)

| Field                | Detail                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| **Product**          | APZ TCMS — APZHUB Test & Certification Management System                                       |
| **User-facing**      | Testing (Activity Bar); Certification views within module                                      |
| **Module ID**        | `testing`                                                                                      |
| **Services**         | `TestingService`, `CertificationService`                                                       |
| **SoR**              | Platform PostgreSQL (metadata); S3-compatible evidence blobs                                   |
| **Architecture**     | [APZ TCMS Reference Architecture](../architecture/APZHUB-APZ-TCMS-Reference-Architecture.md)   |
| **Vision**           | [APZ TCMS Product Vision](../strategy/APZHUB-APZ-TCMS-Product-Vision.md)                       |
| **ADR**              | [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)                            |
| **Backlog**          | [APZTCMS-Backlog](../backlog/APZTCMS-Backlog.md)                                               |
| **Packages**         | testing-contracts **0.9.0** · testing-persistence **0.9.0** · testing-services **0.9.0** · platform **0.12.0** · `@apzhub/integration-github-actions` **0.1.0** |
| **Status**           | APZTCMS-021 **complete** — Engineering Intelligence domain services; stop before APZTCMS-022 |
| **Certification**    | [Engineering Intelligence Architecture](../architecture/APZHUB-APZ-TCMS-Engineering-Intelligence-Architecture.md) · [APZTCMS-021 Completion Report](../sprint/APZTCMS-021-completion-report.md) · [CI/CD Reference Adapter Standard](../architecture/APZHUB-CICD-Reference-Adapter-Standard.md) |
| **Supersedes**       | QE product naming; Kiwi TCMS as user-facing / SoR Testing engine                               |

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
