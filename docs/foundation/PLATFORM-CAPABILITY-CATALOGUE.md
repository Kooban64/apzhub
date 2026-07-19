# APZHUB Platform Capability Catalogue

> **Purpose:** Index of Platform Core and cross-cutting capabilities  
> **Audience:** Architects, engineers, AI agents  
> **Authoritative references:** [Platform Core Capability Reference](../architecture/APZHUB-Platform-Core-Capability-Reference.md) · [Platform Capability Matrix](../architecture/APZHUB-Platform-Capability-Matrix.md)  
> **Related documents:** [PACKAGE-CATALOGUE](./PACKAGE-CATALOGUE.md) · [ARCHITECTURE-HANDBOOK](./ARCHITECTURE-HANDBOOK.md)  
> **Reading order:** After Architecture Handbook  
> **Last updated:** 2026-07-18  
> **Current status:** Active — index only; Metrics programme **closed/frozen** (APZMETRICS-006); Observability programme **closed/frozen** (APZOBSERVE-006); Identity Administration programme **closed/frozen** (APZIDENTITY-006); Administration / Configuration / Notification SoR waves **frozen**; Search Platform + Publication **Architecture Frozen** (**APZSEARCH-019**; **PRODUCTION_READY_WITH_LIMITATIONS**); Reporting **PRODUCTION_READY_WITH_LIMITATIONS** (APZREPORT-003); Documents **PRODUCTION_READY_WITH_LIMITATIONS** (APZDOCS-006)

---

## Platform Core capabilities (delivered)

| #   | Capability                    | Package                            | Status                                                                          |
| --- | ----------------------------- | ---------------------------------- | ------------------------------------------------------------------------------- |
| 1   | **Platform Runtime**          | `@apzhub/platform-runtime`         | Delivered (M2)                                                                  |
| 2   | **Workbench Framework**       | `@apzhub/workbench-framework`      | Delivered (M3)                                                                  |
| 3   | **Identity & Tenants**        | `@apzhub/platform-identity`        | Delivered (M8-01)                                                               |
| 4   | **Authorization / RBAC**      | `@apzhub/platform-authorization`   | Delivered (M8-02); gateway enforcement OSS-110-06 (`@apzhub/platform-services`) |
| 5   | **Operations Console**        | `@apzhub/platform-operations`      | Delivered (M8-03, PRH-008)                                                      |
| 6   | **Personalisation**           | `@apzhub/platform-personalisation` | Delivered (M8-04)                                                               |
| 7   | **Governance & Provisioning** | `@apzhub/platform-governance`      | Delivered (M8-05)                                                               |
| 8   | **Security & Resilience**     | `@apzhub/platform-security`        | Delivered (M8-06)                                                               |
| 9   | **Bootstrap**                 | `@apzhub/platform-bootstrap`       | Delivered (PRH-001)                                                             |
| 10  | **Lifecycle Management**      | `@apzhub/platform-lifecycle`       | Delivered (PRH-009)                                                             |

**Certification:** Platform Core v2 — CERTIFIED WITH OBSERVATIONS (PRH-011)

Full per-capability fields (purpose, APIs, diagnostics, dependencies): [Platform Core Capability Reference](../architecture/APZHUB-Platform-Core-Capability-Reference.md).

---

## Cross-cutting frameworks (delivered)

| #   | Framework                 | Package                                 | Milestone    |
| --- | ------------------------- | --------------------------------------- | ------------ |
| 11  | **Action / Command**      | `@apzhub/command-framework`             | M4 (SPR-004) |
| 12  | **Knowledge & Discovery** | `@apzhub/knowledge-discovery-framework` | M5 (SPR-005) |
| 13  | **Event & Notification**  | `@apzhub/event-notification-framework`  | M6 (SPR-006) |
| 14  | **Activity & Timeline**   | `@apzhub/activity-timeline-framework`   | M7 (SPR-007) |

---

## Supporting platform packages

| Package                              | Role                                                                                                                                                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@apzhub/auth`                       | BetterAuth integration                                                                                                                                                                                          |
| `@apzhub/config`                     | Configuration provider, DB migrations                                                                                                                                                                           |
| `@apzhub/sdk`                        | Platform SDK utilities                                                                                                                                                                                          |
| `@apzhub/shared`                     | Shared types and utilities                                                                                                                                                                                      |
| `@apzhub/types`                      | Core type definitions                                                                                                                                                                                           |
| `@apzhub/theme`                      | Theme tokens and registry                                                                                                                                                                                       |
| `@apzhub/ui`                         | Design system components                                                                                                                                                                                        |
| `@apzhub/workspace`                  | Desktop shell composition                                                                                                                                                                                       |
| `@apzhub/integration-sdk`            | OSS adapter framework (OSS-100) — **v1.0.0** · **Architecture Frozen** · `PRODUCTION_READY_WITH_LIMITATIONS` (`/harness`, `/events`, `/mapping`, `/transport`)                                                  |
| `@apzhub/integration-plane`          | Plane CE **certified Reference Adapter** — Projects provider (OSS-101-04…10, v0.6.0)                                                                                                                            |
| `@apzhub/integration-zammad`         | Zammad CE Support adapter — Wave 2 CERTIFIED_WITH_LIMITATIONS (v0.6.0)                                                                                                                                          |
| `@apzhub/platform-service-contracts` | Vendor-neutral service DTOs / interfaces                                                                                                                                                                        |
| `@apzhub/platform-services`          | Platform service implementations + gateway — **0.26.1** (Metrics + Observability + Identity + Administration + Configuration + Notification + Workflow + Search + Documents + Time); Metrics **APZMETRICS-002** |
| `@apzhub/metrics-contracts`          | Platform Metrics SoR + gateway facets — **APZMETRICS-002** (**0.2.0**)                                                                                                                                          |
| `@apzhub/metrics-core`               | Platform Metrics domain service — **APZMETRICS-002** (**0.2.0**)                                                                                                                                                |
| `@apzhub/metrics-persistence`        | Platform Metrics PostgreSQL + in-memory — **APZMETRICS-001** (**0.1.0**)                                                                                                                                        |
| `@apzhub/observe-contracts`          | Platform Observability SoR + gateway facets — **APZOBSERVE-006 frozen** (**0.2.0**)                                                                                                                             |
| `@apzhub/observe-core`               | Platform Observability domain — **APZOBSERVE-006 frozen** (**0.2.0**)                                                                                                                                           |
| `@apzhub/observe-persistence`        | Platform Observability PostgreSQL + in-memory — **APZOBSERVE-006 frozen** (**0.1.0**)                                                                                                                           |
| `@apzhub/configuration-contracts`    | Platform Configuration SoR contracts — **APZCONFIG-006 frozen** (**0.2.0**)                                                                                                                                     |
| `@apzhub/configuration-core`         | Platform Configuration domain — **APZCONFIG-006 frozen** (**0.2.0**)                                                                                                                                            |
| `@apzhub/configuration-persistence`  | Platform Configuration PostgreSQL + in-memory — **APZCONFIG-006 frozen** (**0.1.0**)                                                                                                                            |
| `@apzhub/identity-contracts`         | Platform Identity Administration SoR contracts — **APZIDENTITY-001** (**0.1.0**)                                                                                                                                |
| `@apzhub/identity-core`              | Platform Identity Administration domain — **APZIDENTITY-001** (**0.1.0**)                                                                                                                                       |
| `@apzhub/identity-persistence`       | Platform Identity Administration PostgreSQL + in-memory — **APZIDENTITY-001** (**0.1.0**)                                                                                                                       |
| `@apzhub/admin-contracts`            | Platform Administration SoR + gateway — **APZADMIN-006 frozen** (**0.2.0**)                                                                                                                                     |
| `@apzhub/admin-core`                 | Platform Administration domain service — **APZADMIN-006 frozen** (**0.2.0**)                                                                                                                                    |
| `@apzhub/admin-persistence`          | Platform Administration PostgreSQL + in-memory — **APZADMIN-006 frozen** (**0.1.0**)                                                                                                                            |
| `@apzhub/notification-contracts`     | Platform Notification SoR contracts — **APZNOTIFY-006 frozen** (**0.2.0**)                                                                                                                                      |
| `@apzhub/notification-core`          | Platform Notification domain — **APZNOTIFY-006 frozen** (**0.2.0**)                                                                                                                                             |
| `@apzhub/notification-persistence`   | Platform Notification PostgreSQL + in-memory — **APZNOTIFY-006 frozen** (**0.1.0**)                                                                                                                             |
| `@apzhub/reporting-contracts`        | Platform Reporting contracts — models, permissions, service interface (APZREPORT-001)                                                                                                                           |
| `@apzhub/reporting-core`             | Platform Reporting engine — templates, outputs, metadata (APZREPORT-001)                                                                                                                                        |
| `@apzhub/document-contracts`         | Platform Document contracts — **APZDOCS-006 certified** (**0.3.0**)                                                                                                                                             |
| `@apzhub/document-core`              | Platform Document domain + coordinator — **APZDOCS-006 certified** (**0.3.0**)                                                                                                                                  |
| `@apzhub/document-persistence`       | Platform Document PostgreSQL + in-memory — **APZDOCS-006 certified**                                                                                                                                            |
| `@apzhub/document-storage`           | Filesystem + S3-compatible + memory — **APZDOCS-006 certified** (no Azure/GCS)                                                                                                                                  |
| `@apzhub/search-contracts`           | Platform Search contracts — **APZSEARCH-008 frozen** (**0.4.0**)                                                                                                                                                |
| `@apzhub/search-persistence`         | Platform Search persistence — **APZSEARCH-008 frozen** (**0.2.0**)                                                                                                                                              |
| `@apzhub/search-integration`         | Cross-product publication framework — **APZSEARCH-019 frozen** (**0.2.0**)                                                                                                                                      |
| `@apzhub/search-orchestrator`        | Durable publication journal / retry / batch — **APZSEARCH-019 frozen** (**0.1.0**)                                                                                                                              |
| `@apzhub/search-publication-admin`   | Publication ops admin — **APZSEARCH-019 frozen** (**0.1.0**)                                                                                                                                                    |
| `@apzhub/testing-contracts`          | APZ TCMS domain contracts — enums, models, service interfaces, events, permissions (v0.2.0)                                                                                                                     |
| `@apzhub/testing-foundation`         | APZ TCMS registries + validation helpers (v0.1.0)                                                                                                                                                               |
| `@apzhub/testing-persistence`        | APZ TCMS repositories, authz asserts, persistence validation (v0.2.0)                                                                                                                                           |
| `@apzhub/testing-services`           | APZ TCMS manual domain services — `createManualTestingServices` (v0.1.0)                                                                                                                                        |

---

## Integration SDK

| Phase         | Scope                                                                     | Status                                                            |
| ------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| OSS-100       | Architecture planning                                                     | Complete                                                          |
| OSS-100-01    | Package scaffold (v0.1.0)                                                 | Complete                                                          |
| OSS-100-02    | Auth & connection foundation (v0.2.0)                                     | Complete                                                          |
| OSS-100-03    | Health, diagnostics, version & lifecycle                                  | Complete                                                          |
| OSS-100-04    | Error translation, circuit breaker, observability                         | Complete (v0.4.0)                                                 |
| OSS-100-05    | AdapterBase                                                               | Complete (v0.5.0)                                                 |
| OSS-100-06    | Shared HTTP Transport                                                     | Complete (v0.6.0)                                                 |
| OSS-100-07    | Mapping Provider Framework                                                | Complete (v0.7.0)                                                 |
| OSS-100-08    | Webhook & polling contracts (`/events`)                                   | Complete (v0.8.0) — no ingress/bus/workers                        |
| OSS-100-09    | Adapter Development Harness & Certification (`/harness`)                  | Complete (v0.9.0)                                                 |
| OSS-100-10    | Integration SDK v1.0 Certification & Release Readiness                    | Complete — `PRODUCTION_READY_WITH_LIMITATIONS`; remained 0.9.0    |
| OSS-100-11    | Integration SDK v1.0.0 Wave Certification & Architecture Freeze           | Complete — **1.0.0** · **Architecture Frozen**                    |
| OSS-100-12    | Platform Event Bus & Webhook Ingress (`@apzhub/platform-event-bus` 0.1.0) | **Accepted / closed**                                             |
| OSS-100-12+   | Product provisioning flows                                                | **ACCEPTED / CLOSED** (`@apzhub/platform-provisioning` **0.1.0**) |
| OSS-101-04…10 | Plane adapter (core → sync/events → operations → Wave 1 certification)    | Complete — Reference Adapter (`@apzhub/integration-plane` v0.6.0) |
| OSS-102-01    | Zammad discovery & architecture                                           | Complete (docs)                                                   |
| OSS-102-02    | Zammad integration foundation                                             | Complete (`@apzhub/integration-zammad` v0.1.0)                    |
| OSS-102-03    | Zammad core Support services                                              | Complete (`@apzhub/integration-zammad` v0.2.0)                    |
| OSS-102-04    | Zammad articles & attachment metadata                                     | Complete (`@apzhub/integration-zammad` v0.3.0)                    |
| OSS-102-05    | Zammad search, history & Support intelligence                             | Complete (`@apzhub/integration-zammad` v0.4.0)                    |
| OSS-102-06    | Zammad synchronisation, events & webhooks                                 | Complete (`@apzhub/integration-zammad` v0.5.0)                    |
| OSS-102-07    | Zammad operations, diagnostics & certification                            | Complete (`@apzhub/integration-zammad` v0.6.0)                    |
| OSS-102-08    | Zammad Wave 2 certification & closeout                                    | Complete — CERTIFIED_WITH_LIMITATIONS                             |

See [INTEGRATION-CATALOGUE](./INTEGRATION-CATALOGUE.md) · [OSS-100-11 Completion Report](../sprint/OSS-100-11-completion-report.md) · [Freeze Notice](../architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md) · [Reference Standard](../architecture/APZHUB-Integration-SDK-Reference-Standard.md).

---

## Planned native capabilities

| Capability          | Backlog         | Status                                                                                         |
| ------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| **APZ TCMS**        | APZTCMS-001–012 | **001–004 complete** (services **0.1.0**; contracts/persistence **0.2.0**); 005 awaiting owner |
| Quality Engineering | QE-001–QE-015   | **Superseded** by APZ TCMS                                                                     |
| Financial Engine    | FIN-001         | Deferred extraction                                                                            |

---

## Capability consumption rules

1. Products **register** with Platform Runtime via manifests
2. Products **consume** Identity, Authorization, Workbench — never reimplement
3. Modules **publish events** — never direct notifications
4. Modules **register search providers** — never standalone search UIs
5. All capabilities **self-report health** and diagnostics

See [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md).

---

## Capability registration pattern

```text
manifest.yaml → Discovery Engine → Capability Registry → Bootstrap → Health/Diagnostics
```

Manifest types: module, service, integration, event, workbench, command, knowledge, activity, theme.

See [024 — Platform SDK](../024-apzhub-platform-sdk-development-framework.md).
