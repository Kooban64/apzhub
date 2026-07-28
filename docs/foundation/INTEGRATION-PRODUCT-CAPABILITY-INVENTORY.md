# APZHUB Integration & Product Capability Inventory

> **Purpose:** Authoritative inventory of completed programmes, packages, and OSS/native integrations  
> **Authority:** Repository package manifests + Knowledge Foundation catalogues / CURRENT-STATE / ACTIVE-BACKLOG / completion reports  
> **Rule:** Do **not** invent milestones. Prefer **disk package versions** + **completion reports** + **CURRENT-MILESTONE**.  
> **Generated / reconciled:** 2026-07-18 — **APZHUB-KF-001**; AI bootstrap **APZHUB-KF-002**  
> **Current programme stop:** [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) — **OSS-100-12+ ACCEPTED / CLOSED** (provisioning **0.1.0**); PRH / Event Bus / outbox accepted; SDK **OSS-100-11** frozen  
> **AI entry:** [AI-MANIFEST](./AI-MANIFEST.md)

---

## How to read this inventory

| Column        | Meaning                                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **State**     | `Architecture Frozen` · `closed/frozen` · `PRODUCTION_READY_WITH_LIMITATIONS` · `CERTIFIED_WITH_LIMITATIONS` · `Planned` · `Superseded` · `Absent on disk` |
| **Version**   | From `package.json` on disk unless noted                                                                                                                   |
| **Remaining** | Only items explicitly listed in ACTIVE-BACKLOG / CURRENT-MILESTONE as awaiting owner                                                                       |

---

## A. Integrations present on disk (`integrations/`)

| Engine (hidden)    | APZHUB capability               | Package                              | Version (disk) | Implemented milestones (KF-attested)                                | Certification / architecture                                                                  | Remaining backlog (explicit)                            |
| ------------------ | ------------------------------- | ------------------------------------ | -------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Plane**          | Projects                        | `@apzhub/integration-plane`          | **0.6.0**      | OSS-101-01…10 (Wave 1 closed)                                       | **Certified Reference Adapter** (OSS-101-10)                                                  | Projects UI deferred; no further OSS-101 stories listed |
| **Zammad**         | Support                         | `@apzhub/integration-zammad`         | **0.6.0**      | OSS-102-01…08; OSS-110-10…14                                        | Wave 2 **CERTIFIED_WITH_LIMITATIONS**; UI **PRODUCTION_READY_WITH_LIMITATIONS** (OSS-110-14)  | No further OSS-102 stories listed                       |
| **Meilisearch**    | Search engine (platform Search) | `@apzhub/integration-meilisearch`    | **0.1.0**      | APZSEARCH-005 (+ platform 001–008 / publication 009–019 consume it) | Search Platform + Publication **Architecture Frozen** (008 / 019)                             | Further Search needs ADR + owner                        |
| **n8n**            | Workflow Engine                 | `@apzhub/integration-n8n`            | **0.1.0**      | APZWORKFLOW-006…011                                                 | Official Reference Adapter; wave **frozen**; read-only; **PRODUCTION_READY_WITH_LIMITATIONS** | **APZWORKFLOW-012** roadmap only                        |
| **GitHub Actions** | CI/CD (APZ TCMS)                | `@apzhub/integration-github-actions` | **0.1.0**      | APZTCMS-016…020                                                     | CI/CD Reference Adapter **frozen**; vertical **PRODUCTION_READY_WITH_LIMITATIONS** (019)      | Standard remains frozen                                 |
| **GitLab CI**      | CI/CD (APZ TCMS)                | `@apzhub/integration-gitlab-ci`      | **0.1.0**      | R12-TCMS-01 / APZHUB-1.2-007                                        | Metadata/read-only Reference Adapter (mirrors GHA posture)                                    | No dispatch/rerun/cancel/download                       |

**Absent on disk (no `integrations/{id}/` directory):** Paperless-ngx · Grafana · Prometheus · Loki · Kiwi TCMS · Greenbone · MobSF · Faraday.

**Present domain adapter (no Time product UI):** Kimai — `@apzhub/integration-kimai` **0.2.0** (APZHUB-INTEGRATION-KIMAI-002 **ACCEPTED** · CERTIFIED_DOMAIN).

**Present Analytics provider foundation (no Analytics Services/UI):** Metabase — `@apzhub/integration-metabase` **0.1.0** (APZHUB-INTEGRATION-METABASE-001 **ACCEPTED** · CERTIFIED_FOUNDATION).

**Present Analytics contracts:** `@apzhub/analytics-contracts` **0.1.0** (APZHUB-PLATFORM-ANALYTICS-003 **ACCEPTED**).

**Present Analytics Platform Services (no HTTP/UI):** `@apzhub/platform-services` **0.27.0** · `services/analytics/service.yaml` **0.1.0** (APZHUB-PLATFORM-ANALYTICS-004 **Awaiting Acceptance**).

---

## B. OSS nine-wave roadmap vs repository reality

| Wave | Engine                                          | APZHUB name                          | Repository reality                                                                                                                       |
| ---- | ----------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Plane                                           | Projects                             | **Implemented** — `integrations/plane` **0.6.0**; Wave 1 closed                                                                          |
| 2    | Zammad                                          | Support                              | **Implemented** — adapter + Support platform/HTTP/UI (OSS-110-10…14)                                                                     |
| 3    | Kimai                                           | Time Tracking                        | **Production** — Kimai **0.2.0** + services **0.26.1** + HTTP **1.10.0** + Workbench **1.0.0** ACCEPTED                                  |
| 4    | Paperless-ngx                                   | Documents                            | **No Paperless adapter.** Native Documents platform exists (**APZDOCS-001…006**, architecture frozen)                                    |
| 5    | Metabase                                        | Analytics                            | **Foundation ACCEPTED** — `integrations/metabase` **0.1.0**; contracts `@apzhub/analytics-contracts` **0.1.0**; no Analytics Services/UI |
| 6    | n8n                                             | Automation / Workflow Engine         | **Implemented** — `integrations/n8n` **0.1.0**; frozen                                                                                   |
| 7    | Kiwi TCMS                                       | Testing                              | **SUPERSEDED** by APZ TCMS (ADR-0059); no Kiwi adapter                                                                                   |
| 8    | Greenbone / Faraday (+ Grafana/Prometheus/Loki) | Security Ops / Observability engines | **Not implemented** as OSS adapters. Native Observability SoR (**APZOBSERVE-006**) frozen metadata plane                                 |
| 9    | MobSF                                           | Mobile Security                      | **Not implemented**                                                                                                                      |

---

## C. Platform programmes (completed / frozen)

| Programme                               | Milestones                                  | Classification / freeze                                                                         | Remaining (explicit)                                                             |
| --------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Outbox Workers (PCv2-02)**            | PCv2-02                                     | `@apzhub/platform-outbox` **0.1.0** — drain/retry/DLQ/replay MVP                                | Accepted / closed                                                                |
| **Platform Event Bus (OSS-100-12)**     | OSS-100-12                                  | `@apzhub/platform-event-bus` **0.1.0** — ingress, dispatch, outbox relay                        | Accepted / closed                                                                |
| **Knowledge Foundation Reconciliation** | APZHUB-KF-001                               | Documentation reconciled                                                                        | Complete                                                                         |
| **AI Bootstrap**                        | APZHUB-KF-002                               | AI-MANIFEST + AI-BOOTSTRAP                                                                      | Complete                                                                         |
| **Integration SDK**                     | OSS-100-01…11                               | **1.0.0** · **Architecture Frozen** · PRODUCTION_READY_WITH_LIMITATIONS                         | Ingress/bus OSS-100-12; provisioning OSS-100-12+ **0.1.0** **ACCEPTED / CLOSED** |
| **Search Platform**                     | APZSEARCH-001…008                           | **Architecture Frozen** · PRODUCTION_READY_WITH_LIMITATIONS                                     | Further Search needs ADR + owner                                                 |
| **Search Publication**                  | APZSEARCH-009…019                           | **Architecture Frozen** · PRODUCTION_READY_WITH_LIMITATIONS                                     | No APZSEARCH-020 authorised                                                      |
| **Documents**                           | APZDOCS-001…006                             | PRODUCTION_READY_WITH_LIMITATIONS · architecture frozen                                         | Complete                                                                         |
| **Reporting (platform)**                | APZREPORT-001…003                           | PRODUCTION_READY_WITH_LIMITATIONS                                                               | Complete                                                                         |
| **Workflow**                            | APZWORKFLOW-001…011                         | SoR + Engine **frozen** · PRODUCTION_READY_WITH_LIMITATIONS                                     | **APZWORKFLOW-012** roadmap only                                                 |
| **Metrics**                             | APZMETRICS-001…006                          | **closed/frozen** · Architecture Frozen                                                         | Further Metrics needs ADR + owner                                                |
| **Observability**                       | APZOBSERVE-001…006                          | **closed/frozen**                                                                               | Closed                                                                           |
| **Administration**                      | APZADMIN-001…006                            | **closed/frozen** · PRODUCTION_READY_WITH_LIMITATIONS                                           | Closed                                                                           |
| **Configuration**                       | APZCONFIG-001…006                           | **closed/frozen** · PRODUCTION_READY_WITH_LIMITATIONS                                           | **APZCONFIG-007** roadmap only                                                   |
| **Notifications**                       | APZNOTIFY-001…006                           | **closed/frozen** · PRODUCTION_READY_WITH_LIMITATIONS                                           | **APZNOTIFY-007** roadmap only                                                   |
| **Identity Administration**             | APZIDENTITY-001…006                         | **closed/frozen**                                                                               | Further Identity needs ADR + owner                                               |
| **APZ TCMS**                            | APZTCMS-001…024                             | Vertical slices PRODUCTION_READY_WITH_LIMITATIONS where certified; GHA Reference Adapter frozen | **GitLab CI** metadata adapter **0.1.0** (R12-TCMS-01) · **AI Assist** deferred  |
| **Law Platform**                        | LAW-001…015                                 | Milestone closed                                                                                | Product validation                                                               |
| **Trust Accounting**                    | LAW-015-*                                   | Closed                                                                                          | —                                                                                |
| **Platform Core v2**                    | PRH-001…018 · **PCv2-02** · **OSS-100-12+** | PRH / outbox / provisioning **ACCEPTED / CLOSED**                                               | M17 await owner                                                                  |
| **Support (platform spine)**            | OSS-110-01…14                               | CERTIFIED_WITH_LIMITATIONS / UI PRODUCTION_READY_WITH_LIMITATIONS                               | —                                                                                |

---

## D. Key package versions (disk)

| Package                                                  | Version    | Notes                                   |
| -------------------------------------------------------- | ---------- | --------------------------------------- |
| `@apzhub/integration-sdk`                                | **1.0.0**  | Architecture Frozen (OSS-100-11)        |
| `@apzhub/integration-plane`                              | **0.6.0**  | Wave 1 Reference Adapter                |
| `@apzhub/integration-zammad`                             | **0.6.0**  | Wave 2 certified                        |
| `@apzhub/integration-meilisearch`                        | **0.1.0**  | Search Reference Adapter                |
| `@apzhub/integration-n8n`                                | **0.1.0**  | Workflow Engine Reference Adapter       |
| `@apzhub/integration-github-actions`                     | **0.1.0**  | CI/CD Reference Adapter                 |
| `@apzhub/integration-gitlab-ci`                          | **0.1.0**  | GitLab CI Reference Adapter (metadata)  |
| `@apzhub/integration-search-sdk`                         | **0.1.0**  | Search Integration SDK                  |
| `@apzhub/platform-services`                              | **0.26.1** | Gateway facade + Time Platform Services |
| `@apzhub/platform-outbox`                                | **0.1.0**  | PCv2-02 outbox worker                   |
| `@apzhub/platform-event-bus`                             | **0.1.0**  | OSS-100-12 Event Bus + webhook ingress  |
| `@apzhub/search-contracts`                               | **0.4.0**  | Frozen Search Platform                  |
| `@apzhub/search-integration`                             | **0.2.0**  | Publication framework (frozen)          |
| `@apzhub/search-orchestrator`                            | **0.1.0**  | Publication orchestration (frozen)      |
| `@apzhub/search-publication-admin`                       | **0.1.0**  | Publication ops (frozen)                |
| `@apzhub/testing-contracts` / `persistence` / `services` | **0.11.0** | APZ TCMS                                |
| `@apzhub/document-contracts` / `core`                    | **0.3.0**  | Documents                               |
| `@apzhub/workflow-contracts`                             | **0.3.0**  | Workflow                                |
| `@apzhub/identity-contracts` / `core`                    | **0.2.0**  | Identity Administration                 |
| `@apzhub/admin-contracts` / `core`                       | **0.2.0**  | Administration (frozen)                 |
| `@apzhub/metrics-contracts` / `core`                     | **0.2.0**  | Metrics (frozen)                        |
| `@apzhub/observe-contracts` / `core`                     | **0.2.0**  | Observability (frozen)                  |
| `@apzhub/notification-contracts` / `core`                | **0.2.0**  | Notifications (frozen)                  |
| `@apzhub/configuration-contracts` / `core`               | **0.2.0**  | Configuration (frozen)                  |
| `@apzhub/reporting-contracts` / `core`                   | **0.1.0**  | Platform Reporting                      |

Search publication adapters (frozen wave): `search-projects` **0.1.0** · `search-support` **0.1.0** · `search-documents` **0.1.0** · `search-testing` **0.1.1** · `search-reporting` **0.1.0**. Additive Release 1.2: `search-time` **0.1.0** (R12-SEARCH-01) · `search-law` **0.1.0** (R12-SEARCH-02).

---

## E. Product capabilities (user-facing)

| Capability                                            | Type                                                           | Implementation path                                 | Status                                                                                |
| ----------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Projects**                                          | OSS-backed                                                     | Plane adapter + platform services; UI deferred      | Adapter certified                                                                     |
| **Support**                                           | OSS-backed                                                     | Zammad adapter + Support HTTP/UI                    | CERTIFIED_WITH_LIMITATIONS / UI PRODUCTION_READY_WITH_LIMITATIONS                     |
| **Documents**                                         | Native platform                                                | APZDOCS (not Paperless)                             | PRODUCTION_READY_WITH_LIMITATIONS · frozen                                            |
| **Search**                                            | Native platform + Meilisearch adapter                          | APZSEARCH 001–019                                   | Architecture Frozen                                                                   |
| **Workflow**                                          | Native SoR + n8n adapter                                       | APZWORKFLOW 001–011                                 | Frozen                                                                                |
| **Testing / Certification**                           | Native APZ TCMS                                                | APZTCMS 001–024                                     | GHA adapter frozen; GitLab metadata adapter 0.1.0 (R12-TCMS-01)                       |
| **Reporting**                                         | Native platform (+ TCMS reporting)                             | APZREPORT 001–003                                   | PRODUCTION_READY_WITH_LIMITATIONS                                                     |
| **Time Tracking**                                     | OSS (Kimai) · Production                                       | APZ Time **1.0.0**                                  | Adapter **0.2.0** CERTIFIED_DOMAIN; Workbench **1.0.0** Phase 1 **ACCEPTED / CLOSED** |
| **Analytics**                                         | Metabase **0.1.0** + contracts **0.1.0** + services **0.27.0** | —                                                   | Adapter + contracts + Platform Services; HTTP/UI **not started**                      |
| **Observability (ops SoR)**                           | Native metadata SoR                                            | APZOBSERVE 001–006                                  | Frozen — **not** Grafana/Prometheus/Loki adapters                                     |
| **Metrics (SoR)**                                     | Native metadata SoR                                            | APZMETRICS 001–006                                  | Frozen                                                                                |
| **Administration / Config / Notify / Identity Admin** | Native SoR waves                                               | APZADMIN / APZCONFIG / APZNOTIFY / APZIDENTITY …006 | Frozen / closed                                                                       |
| **Law Platform / Trust**                              | Native vertical                                                | LAW-001…015                                         | Milestone closed                                                                      |
| **Security Ops**                                      | Planned OSS                                                    | —                                                   | **Not started**                                                                       |

---

## F. Awaiting owner (from CURRENT-MILESTONE / ACTIVE-BACKLOG)

No item below is authorised for implementation until Owner Approval of a recommended programme:

1. ~~**PRH-012–018** Production Hardening~~ — **accepted / closed**
2. ~~**OSS-100-12** Event Bus / webhook ingress~~ — **accepted / closed** (`@apzhub/platform-event-bus` **0.1.0**)
3. ~~**OSS-100-12+** product provisioning flows~~ — **accepted / closed** (`@apzhub/platform-provisioning` **0.1.0**)
4. ~~**PCv2-02**~~ — **accepted / closed** (`@apzhub/platform-outbox` **0.1.0**)
5. M17 CI/CD / GitLab CI (future) — no single actionable backlog ID
6. AI Assist (deferred)
7. Roadmap-only: **APZCONFIG-007** · **APZNOTIFY-007** · **APZWORKFLOW-012**
8. Next OSS productivity wave (**Kimai** / **Paperless** / **Metabase** / Security Ops) — planned in OSS catalogue, not approved as CURRENT-MILESTONE

---

## G. Catalogue reconciliation status

Under **APZHUB-KF-001**, PRODUCT-CATALOGUE, OSS-CATALOGUE, INTEGRATION-CATALOGUE, APZTCMS-Backlog, APZTCMS-Milestone-Roadmap, CURRENT-STATE, PACKAGE-CATALOGUE, DOCUMENT-MAP, and related indexes were updated to match disk. Prior drift listed in the pre-reconciliation inventory is **resolved** in those documents.

If a future change creates new drift, prefer disk `package.json` + completion reports over catalogues until the next KF reconciliation.

---

## H. Direct answers to common “what exists?” questions

| Question                                               | Answer from repository                                                                                                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Is **APZ Testing / APZ TCMS** implemented?             | **Yes** — native packages through APZTCMS-024; Workbench/HTTP/gateway present; not Kiwi                                                                                           |
| Is **Kiwi TCMS** integrated?                           | **No** — path superseded (ADR-0059); no `integrations/kiwi`                                                                                                                       |
| Is **Zammad / Support** done?                          | **Yes** — adapter 0.6.0 + Support vertical/UI certified with limitations                                                                                                          |
| Is **Kimai** started?                                  | **Yes** — **0.2.0** CERTIFIED_DOMAIN; APZ Time **1.0.0** Production (**ACCEPTED**)                                                                                                |
| Is **Paperless** started?                              | **No** adapter; native Documents platform is separate and frozen                                                                                                                  |
| Is **Metabase / Grafana / Prometheus / Loki** started? | **Metabase foundation** `@apzhub/integration-metabase` **0.1.0** on disk; Grafana/Prometheus/Loki adapters **No**; native Metrics/Observability SoRs are metadata governance only |
| Is **n8n** started?                                    | **Yes** — frozen Workflow Engine Reference Adapter 0.1.0                                                                                                                          |
| Is **Meilisearch** started?                            | **Yes** — Search Reference Adapter 0.1.0; Search programmes frozen                                                                                                                |
| What is the current stop?                              | **ANALYTICS-004** Awaiting Acceptance; no Analytics HTTP/Workbench without named Approval; Support **2.0** planning also Awaiting Acceptance                                      |

---

## See also

- [CURRENT-MILESTONE](./CURRENT-MILESTONE.md)
- [CURRENT-STATE](./CURRENT-STATE.md)
- [ACTIVE-BACKLOG](./ACTIVE-BACKLOG.md)
- [APZHUB-KF-001 Completion Report](./completion-reports/APZHUB-KF-001-completion-report.md)
- [OSS-CATALOGUE](./OSS-CATALOGUE.md)
- [INTEGRATION-CATALOGUE](./INTEGRATION-CATALOGUE.md)
- [PRODUCT-CATALOGUE](./PRODUCT-CATALOGUE.md)
- [PACKAGE-CATALOGUE](./PACKAGE-CATALOGUE.md)
