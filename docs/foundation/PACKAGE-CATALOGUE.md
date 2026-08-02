# APZHUB Package Catalogue

> **Purpose:** Index of all monorepo packages and applications  
> **Audience:** Engineers, AI agents  
> **Authoritative references:** [004 — Technology Stack](../004-technology-stack-repository-standards-development-environment.md) · [Platform Package Review](../reviews/APZHUB-Platform-Package-Review.md)  
> **Related documents:** [REPOSITORY-GUIDE](./REPOSITORY-GUIDE.md) · [PLATFORM-CAPABILITY-CATALOGUE](./PLATFORM-CAPABILITY-CATALOGUE.md)  
> **Reading order:** With Repository Guide  
> **Last updated:** 2026-07-18
> **Current status:** Active — reconciled under **APZHUB-KF-001**. Integration SDK **1.0.0** Architecture Frozen (OSS-100-11); APZMETRICS-006 / APZOBSERVE-006 / Identity / Administration / Configuration / Notification / Workflow SoR waves **frozen**; APZSEARCH-019 Search Publication **Architecture Frozen**; search-integration **0.2.0**; testing-* **0.11.0**; platform-services **0.27.0**

---

## Applications

| Package                | Path                 | Purpose                                      |
| ---------------------- | -------------------- | -------------------------------------------- |
| `@apzhub/web`          | `apps/web/`          | Primary Next.js application — platform shell |
| `@apzhub/law-platform` | `apps/law-platform/` | Law Platform product application             |

---

## Platform Core packages

| Package                            | Path                                 | Purpose                                               |
| ---------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| `@apzhub/platform-runtime`         | `packages/platform-runtime/`         | Manifest discovery, registry, bootstrap orchestration |
| `@apzhub/platform-bootstrap`       | `packages/platform-bootstrap/`       | Canonical capability initialisation                   |
| `@apzhub/platform-identity`        | `packages/platform-identity/`        | Tenants, membership, session resolution               |
| `@apzhub/platform-authorization`   | `packages/platform-authorization/`   | RBAC — roles, permissions, assignments                |
| `@apzhub/platform-operations`      | `packages/platform-operations/`      | Operations console, control plane, health aggregation |
| `@apzhub/platform-personalisation` | `packages/platform-personalisation/` | Preferences, favorites, recent, layout                |
| `@apzhub/platform-governance`      | `packages/platform-governance/`      | Feature flags, provisioning, capability model         |
| `@apzhub/platform-security`        | `packages/platform-security/`        | CSP, security headers, traffic governance             |
| `@apzhub/platform-lifecycle`       | `packages/platform-lifecycle/`       | Platform lifecycle state machine                      |

---

## Framework packages

| Package                                 | Path                                      | Purpose                                 |
| --------------------------------------- | ----------------------------------------- | --------------------------------------- |
| `@apzhub/workbench-framework`           | `packages/workbench-framework/`           | Workbench Manager, engines, API         |
| `@apzhub/command-framework`             | `packages/command-framework/`             | Action Engine, command registry         |
| `@apzhub/knowledge-discovery-framework` | `packages/knowledge-discovery-framework/` | Search providers, ranking, overlay      |
| `@apzhub/event-notification-framework`  | `packages/event-notification-framework/`  | Event bus, notification routing         |
| `@apzhub/activity-timeline-framework`   | `packages/activity-timeline-framework/`   | Activity registry, timeline experiences |

---

## Integration & SDK packages

| Package                              | Path                               | Version   | Purpose                                                         |
| ------------------------------------ | ---------------------------------- | --------- | --------------------------------------------------------------- |
| `@apzhub/integration-sdk`            | `packages/integration-sdk/`        | **1.0.0** | OSS adapter framework — **Architecture Frozen** (OSS-100-11)    |
| `@apzhub/integration-plane`          | `integrations/plane/`              | **0.6.0** | Projects Reference Adapter (Wave 1 certified)                   |
| `@apzhub/integration-zammad`         | `integrations/zammad/`             | **0.6.0** | Support adapter (Wave 2 CERTIFIED_WITH_LIMITATIONS)             |
| `@apzhub/integration-meilisearch`    | `integrations/meilisearch/`        | **0.1.0** | Search Reference Adapter                                        |
| `@apzhub/integration-n8n`            | `integrations/n8n/`                | **0.1.0** | Workflow Engine Reference Adapter (frozen)                      |
| `@apzhub/integration-kimai`          | `integrations/kimai/`              | **0.2.0** | Kimai CE domain adapter (APZHUB-INTEGRATION-KIMAI-002)          |
| `@apzhub/integration-metabase`       | `integrations/metabase/`           | **0.1.0** | Metabase Analytics foundation (APZHUB-INTEGRATION-METABASE-001) |
| `@apzhub/integration-github-actions` | `integrations/github-actions/`     | **0.1.0** | CI/CD Reference Adapter (frozen)                                |
| `@apzhub/integration-search-sdk`     | `packages/integration-search-sdk/` | **0.1.0** | Search Integration SDK                                          |
| `@apzhub/sdk`                        | `packages/sdk/`                    | —         | Platform SDK utilities                                          |

**Integration SDK exports:** `/auth`, `/connection`, `/client`, `/adapter`, `/diagnostics`, `/lifecycle`, `/errors`, `/transport`, `/mapping`, `/events`, `/harness`

---

## UI & shell packages

| Package             | Path                  | Purpose                              |
| ------------------- | --------------------- | ------------------------------------ |
| `@apzhub/ui`        | `packages/ui/`        | Design system — shadcn/ui + Tailwind |
| `@apzhub/workspace` | `packages/workspace/` | Desktop shell composition            |
| `@apzhub/theme`     | `packages/theme/`     | Theme tokens and registry            |

---

## Infrastructure packages

| Package          | Path               | Purpose                                     |
| ---------------- | ------------------ | ------------------------------------------- |
| `@apzhub/auth`   | `packages/auth/`   | BetterAuth configuration                    |
| `@apzhub/config` | `packages/config/` | Environment config, Drizzle ORM, migrations |
| `@apzhub/shared` | `packages/shared/` | Shared utilities                            |
| `@apzhub/types`  | `packages/types/`  | Core type definitions                       |

---

## Platform reporting packages

| Package                             | Path                                  | Version    | Purpose                                                                                                                                             |
| ----------------------------------- | ------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@apzhub/reporting-contracts`       | `packages/reporting-contracts/`       | 0.1.0      | Platform reporting models + service contract (APZREPORT-001)                                                                                        |
| `@apzhub/reporting-core`            | `packages/reporting-core/`            | 0.1.0      | Template engine + output providers (APZREPORT-001)                                                                                                  |
| `@apzhub/document-contracts`        | `packages/document-contracts/`        | 0.3.0      | Platform document + DocumentPlatformGateway contracts (APZDOCS-003)                                                                                 |
| `@apzhub/document-core`             | `packages/document-core/`             | 0.3.0      | Domain + coordinator + assignFolder/collection/retention (APZDOCS-003)                                                                              |
| `@apzhub/document-persistence`      | `packages/document-persistence/`      | 0.2.0      | PostgreSQL + in-memory document repos (APZDOCS-002)                                                                                                 |
| `@apzhub/document-storage`          | `packages/document-storage/`          | 0.1.0      | Filesystem + S3-compatible + memory providers (APZDOCS-002)                                                                                         |
| `@apzhub/workflow-contracts`        | `packages/workflow-contracts/`        | 0.4.2      | Workflow Platform Contracts — IM models + gateway runtime facets (APZHUB-PLATFORM-WORKFLOW-003/004/005)                                             |
| `@apzhub/workflow-core`             | `packages/workflow-core/`             | 0.1.1      | Domain service + lifecycle + validation (APZWORKFLOW-002)                                                                                           |
| `@apzhub/workflow-persistence`      | `packages/workflow-persistence/`      | 0.1.1      | In-memory + Postgres workflow repos; migrations 0044–0045                                                                                           |
| `@apzhub/analytics-contracts`       | `packages/analytics-contracts/`       | **0.1.0**  | Analytics Platform Contracts (APZHUB-PLATFORM-ANALYTICS-003)                                                                                        |
| `@apzhub/metrics-contracts`         | `packages/metrics-contracts/`         | 0.2.0      | Platform Metrics SoR + gateway facets (APZMETRICS-002)                                                                                              |
| `@apzhub/metrics-core`              | `packages/metrics-core/`              | 0.2.0      | Platform Metrics domain service + validation + lifecycle (APZMETRICS-002)                                                                           |
| `@apzhub/metrics-persistence`       | `packages/metrics-persistence/`       | 0.1.0      | Platform Metrics PostgreSQL + in-memory; migrations 0056–0057 (APZMETRICS-001)                                                                      |
| `@apzhub/observe-contracts`         | `packages/observe-contracts/`         | 0.2.0      | Platform Observability SoR + gateway facets — **frozen** (APZOBSERVE-006)                                                                           |
| `@apzhub/observe-core`              | `packages/observe-core/`              | 0.2.0      | Domain service + validation + lifecycle — **frozen** (APZOBSERVE-006)                                                                               |
| `@apzhub/observe-persistence`       | `packages/observe-persistence/`       | 0.1.0      | In-memory + Postgres observe repos; migrations 0054–0055 — **frozen** (APZOBSERVE-006)                                                              |
| `@apzhub/identity-contracts`        | `packages/identity-contracts/`        | 0.2.0      | Platform Identity Administration SoR + gateway facets (APZIDENTITY-002)                                                                             |
| `@apzhub/identity-core`             | `packages/identity-core/`             | 0.2.0      | Domain service + ports + validation + lifecycle (APZIDENTITY-002)                                                                                   |
| `@apzhub/identity-persistence`      | `packages/identity-persistence/`      | 0.1.0      | In-memory + Postgres IAM repos; migrations 0052–0053 (APZIDENTITY-001)                                                                              |
| `@apzhub/admin-contracts`           | `packages/admin-contracts/`           | 0.2.0      | Platform Administration SoR + gateway facets — **frozen** (APZADMIN-006)                                                                            |
| `@apzhub/admin-core`                | `packages/admin-core/`                | 0.2.0      | Domain service + lifecycle + validation — **frozen** (APZADMIN-006)                                                                                 |
| `@apzhub/admin-persistence`         | `packages/admin-persistence/`         | 0.1.0      | In-memory + Postgres administration repos; migrations 0050–0051 — **frozen** (APZADMIN-006)                                                         |
| `@apzhub/configuration-contracts`   | `packages/configuration-contracts/`   | 0.2.0      | Platform Configuration SoR + gateway facets — **frozen** (APZCONFIG-006)                                                                            |
| `@apzhub/configuration-core`        | `packages/configuration-core/`        | 0.2.0      | Domain service + lifecycle + validation metadata — **frozen** (APZCONFIG-006)                                                                       |
| `@apzhub/configuration-persistence` | `packages/configuration-persistence/` | 0.1.0      | In-memory + Postgres configuration repos; migrations 0048–0049 — **frozen** (APZCONFIG-006)                                                         |
| `@apzhub/notification-contracts`    | `packages/notification-contracts/`    | 0.2.0      | Platform Notification SoR contracts — **frozen** (APZNOTIFY-006)                                                                                    |
| `@apzhub/notification-core`         | `packages/notification-core/`         | 0.2.0      | Domain service + lifecycle + validation — **frozen** (APZNOTIFY-006)                                                                                |
| `@apzhub/notification-persistence`  | `packages/notification-persistence/`  | 0.1.0      | In-memory + Postgres notification repos; migrations 0046–0047 — **frozen** (APZNOTIFY-006)                                                          |
| `@apzhub/search-contracts`          | `packages/search-contracts/`          | 0.4.0      | Platform Search contracts + management + execution (APZSEARCH-006/008)                                                                              |
| `@apzhub/search-persistence`        | `packages/search-persistence/`        | 0.2.0      | Search metadata persistence + full management thin services (APZSEARCH-003)                                                                         |
| `@apzhub/search-integration`        | `packages/search-integration/`        | 0.2.0      | Cross-Product Search Integration Framework — **frozen** (APZSEARCH-019)                                                                             |
| `@apzhub/search-projects`           | `packages/search-projects/`           | 0.1.0      | Projects Search Publication Adapter — **frozen** (APZSEARCH-019)                                                                                    |
| `@apzhub/search-support`            | `packages/search-support/`            | 0.1.0      | Support Search Publication Adapter — **frozen** (APZSEARCH-019)                                                                                     |
| `@apzhub/search-documents`          | `packages/search-documents/`          | 0.1.0      | Documents Search Publication Adapter — **frozen** (APZSEARCH-019)                                                                                   |
| `@apzhub/search-testing`            | `packages/search-testing/`            | 0.1.1      | APZ TCMS Search Publication Adapter — **frozen** (APZSEARCH-019)                                                                                    |
| `@apzhub/search-reporting`          | `packages/search-reporting/`          | 0.1.0      | Reporting Search Publication Adapter — **frozen** (APZSEARCH-019)                                                                                   |
| `@apzhub/search-orchestrator`       | `packages/search-orchestrator/`       | 0.1.0      | Product Indexing Orchestration — **frozen** (APZSEARCH-019)                                                                                         |
| `@apzhub/search-publication-admin`  | `packages/search-publication-admin/`  | 0.1.0      | Publication Operations & Administration — **frozen** (APZSEARCH-019)                                                                                |
| `@apzhub/platform-services`         | `packages/platform-services/`         | **0.27.0** | Gateway + Metrics + Observability + Identity + Administration + Configuration + Notification + Workflow + Search + Documents + Time + **Analytics** |
| `@apzhub/platform-outbox`           | `packages/platform-outbox/`           | **0.2.0**  | Reliable delivery — drain / retry / DLQ hooks / transport port (PCv2-02 · APZQEP-120-S08 CERTIFIED)                                                 |
| `@apzhub/platform-processing`       | `packages/platform-processing/`       | **0.1.1**  | Reliable execution — registry / lease / fan-out / ack-retry-DLQ (APZQEP-120-S09/S11)                                                                |
| `@apzhub/qep-knowledge-index`       | `packages/qep-knowledge-index/`       | **0.1.0**  | Quality Knowledge Index — event-driven read model + search (APZQEP-120-S11)                                                                         |
| `@apzhub/qep-notification`          | `packages/qep-notification/`          | **0.1.0**  | Notification & Subscription Platform — event/projection subscribers (APZQEP-120-S12)                                                                |
| `@apzhub/platform-event-bus`        | `packages/platform-event-bus/`        | **0.1.0**  | Event Bus + webhook ingress + outbox relay (OSS-100-12)                                                                                             |

## Product packages

| Package                       | Path                            | Version | Purpose                                        |
| ----------------------------- | ------------------------------- | ------- | ---------------------------------------------- |
| `@apzhub/legal-business-core` | `packages/legal-business-core/` | —       | Law Platform domain logic                      |
| `@apzhub/testing-contracts`   | `packages/testing-contracts/`   | 0.11.0  | APZ TCMS domain contracts                      |
| `@apzhub/testing-foundation`  | `packages/testing-foundation/`  | 0.1.0   | APZ TCMS registries + validation (APZTCMS-002) |
| `@apzhub/testing-persistence` | `packages/testing-persistence/` | 0.11.0  | APZ TCMS repositories + authz                  |
| `@apzhub/testing-services`    | `packages/testing-services/`    | 0.11.0  | APZ TCMS domain services (reporting consumer)  |

---

## Manifest directories (not npm packages)

| Directory       | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `services/`     | Platform service manifests (`service.yaml`)        |
| `integrations/` | Integration adapter manifests (`integration.yaml`) |
| `modules/`      | Business module manifests (`module.yaml`)          |
| `events/`       | Platform event manifests (`event.yaml`)            |

---

## Dependency rules

- Products depend on Platform packages — not vice versa
- No circular dependencies (verified PRH-011)
- Modules never depend on other modules
- Connectors never imported outside adapter boundary

See [Platform Dependency Review](../reviews/APZHUB-Platform-Dependency-Review.md).

---

## Package version notes (disk — authoritative)

| Package                              | Version            | Notes                                                     |
| ------------------------------------ | ------------------ | --------------------------------------------------------- |
| Root `apzhub`                        | `0.1.0-foundation` | Monorepo root                                             |
| `@apzhub/integration-sdk`            | **`1.0.0`**        | Architecture Frozen (`PRODUCTION_READY_WITH_LIMITATIONS`) |
| `@apzhub/integration-plane`          | `0.6.0`            | Wave 1 Reference Adapter                                  |
| `@apzhub/integration-zammad`         | `0.6.0`            | Wave 2 certified                                          |
| `@apzhub/integration-meilisearch`    | `0.1.0`            | Search Reference Adapter                                  |
| `@apzhub/integration-n8n`            | `0.1.0`            | Workflow Engine Reference Adapter (frozen)                |
| `@apzhub/integration-kimai`          | `0.2.0`            | Kimai CE domain adapter (KIMAI-002)                       |
| `@apzhub/integration-metabase`       | `0.1.0`            | Metabase Analytics foundation (METABASE-001)              |
| `@apzhub/integration-github-actions` | `0.1.0`            | CI/CD Reference Adapter (frozen)                          |
| `@apzhub/integration-search-sdk`     | `0.1.0`            | APZSEARCH-004                                             |
| `@apzhub/platform-services`          | `0.27.0`           | Gateway facade + Time + Analytics Platform Services       |
| `@apzhub/platform-outbox`            | `0.2.0`            | Reliable delivery · APZQEP-120-S08 CERTIFIED              |
| `@apzhub/platform-processing`        | `0.1.1`            | Reliable execution · fan-out · APZQEP-120-S09/S11         |
| `@apzhub/qep-knowledge-index`        | `0.1.0`            | Quality Knowledge Index · APZQEP-120-S11                  |
| `@apzhub/qep-notification`           | `0.1.0`            | Notification & Subscription · APZQEP-120-S12              |
| `@apzhub/platform-event-bus`         | `0.1.0`            | OSS-100-12 Event Bus + webhook ingress                    |
| `@apzhub/platform-service-contracts` | `0.17.1`           | Platform service contracts (+ Time)                       |
| `@apzhub/search-integration`         | `0.2.0`            | Frozen (APZSEARCH-019)                                    |
| `@apzhub/testing-contracts`          | `0.11.0`           | APZ TCMS (through 024)                                    |
| `@apzhub/testing-foundation`         | `0.1.0`            | APZTCMS-002                                               |
| `@apzhub/testing-persistence`        | `0.11.0`           | APZ TCMS                                                  |
| `@apzhub/testing-services`           | `0.11.0`           | APZ TCMS                                                  |
| Other packages                       | See tables above   | Private monorepo; versions from each `package.json`       |
