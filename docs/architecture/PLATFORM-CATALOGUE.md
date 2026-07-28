# APZHUB Platform Catalogue (Enterprise Architecture)

> **Programme:** APZHUB-ARCHITECTURE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Detail SoT:** [PLATFORM-CAPABILITY-CATALOGUE](../foundation/PLATFORM-CAPABILITY-CATALOGUE.md) · [PACKAGE-CATALOGUE](../foundation/PACKAGE-CATALOGUE.md)  
> **Date:** 2026-07-19

---

## Purpose

EA inventory of **platform** architectural components. Package-level rows stay in foundation catalogues.

---

## Inventory

| Component                       | Package / surface                        | Version (disk)     | Maturity                     | Notes / docs                                                                      |
| ------------------------------- | ---------------------------------------- | ------------------ | ---------------------------- | --------------------------------------------------------------------------------- |
| **APZHUB Runtime**              | `@apzhub/platform-runtime`               | 0.0.0              | Production (foundation)      | Discovery, manifests, dependency graph, lifecycle                                 |
| **Workbench**                   | `@apzhub/workbench-framework`            | 0.0.0              | Production (foundation)      | Shell regions, module registration                                                |
| **Integration SDK**             | `@apzhub/integration-sdk`                | **1.0.0**          | **Architecture Frozen**      | OSS-100-11                                                                        |
| **Platform Services**           | `@apzhub/platform-services`              | **0.26.1**         | Production                   | Gateway + domain services                                                         |
| **Service Contracts**           | `@apzhub/platform-service-contracts`     | **0.17.1**         | Production                   | Interface SoT                                                                     |
| **HTTP APIs**                   | `apps/web` `/api/v1/*` · OpenAPI         | **1.10.0**         | Production                   | [specs/APZHUB-Platform-OpenAPI-v1.yaml](../specs/APZHUB-Platform-OpenAPI-v1.yaml) |
| **Identity**                    | `@apzhub/platform-identity` · identity-* | 0.1.0 / 0.2.0      | Frozen SoR (APZIDENTITY-006) | Administration plane — not BetterAuth                                             |
| **Authentication**              | BetterAuth via `@apzhub/auth`            | platform           | Production                   | AuthN only                                                                        |
| **Authorisation**               | `@apzhub/platform-authorization`         | 0.1.0              | Production                   | PermissionService / AuthZ                                                         |
| **Request Pipeline**            | platform-services execution              | —                  | Production                   | Auth→Authz→Validation→Service                                                     |
| **Configuration**               | configuration-* packages                 | wave frozen        | PRWL / Frozen                | APZCONFIG-006                                                                     |
| **Provisioning**                | `@apzhub/platform-provisioning`          | **0.1.0**          | MVP / Production             | OSS-100-12+                                                                       |
| **Search**                      | search-* · Meilisearch adapter           | Publication frozen | PRWL / Frozen                | APZSEARCH-008/019                                                                 |
| **Audit**                       | platform audit (centralised)             | —                  | Production                   | Via services; immutable                                                           |
| **Diagnostics**                 | per-service / adapter ops                | —                  | Production                   | Health + diagnostics extensions                                                   |
| **Health**                      | `/api/v1/health` · capability health     | —                  | Production                   | Platform hierarchy                                                                |
| **Notifications**               | notification-* · ENF                     | wave frozen        | PRWL / Frozen                | APZNOTIFY-006 — metadata plane                                                    |
| **Observability**               | observe-* SoR                            | wave frozen        | Metadata SoR                 | APZOBSERVE-006 — **not** Grafana adapters                                         |
| **Metrics**                     | metrics-* SoR                            | wave frozen        | Metadata SoR                 | APZMETRICS-006                                                                    |
| **Event Bus**                   | `@apzhub/platform-event-bus`             | **0.1.0**          | MVP                          | OSS-100-12                                                                        |
| **Outbox**                      | `@apzhub/platform-outbox`                | **0.1.0**          | MVP                          | PCv2-02                                                                           |
| **Governance**                  | `@apzhub/platform-governance`            | 0.1.0              | Production                   | Capability enablement                                                             |
| **Release Management**          | docs + ops standards                     | —                  | ACTIVE                       | [releases/](../releases/README.md) · ops RELEASE-*                                |
| **Administration**              | admin-* SoR                              | wave frozen        | PRWL / Frozen                | APZADMIN-006                                                                      |
| **Documents (platform SoR)**    | document-*                               | APZDOCS-006        | PRWL / Frozen                | Native — not Paperless                                                            |
| **Workflow SoR + Engine facet** | workflow-* · n8n adapter                 | frozen             | PRWL / Frozen                | Read-only engine                                                                  |
| **Reporting**                   | reporting-*                              | APZREPORT-003      | PRWL                         | Platform reporting                                                                |
| **Personalisation**             | `@apzhub/platform-personalisation`       | —                  | Production                   | Prefs                                                                             |
| **Security (platform)**         | `@apzhub/platform-security`              | —                  | Production                   | CSP / headers central                                                             |

---

## Frozen subsystems (must not change without ADR + Owner)

Listed in [AI-MANIFEST §Frozen Architecture](../foundation/AI-MANIFEST.md): Integration SDK, Search/Publication, Documents, Workflow+n8n, Notifications, Config/Admin/Identity/Observe/Metrics, CI/CD Reference Adapter, Architecture Baseline v1.0.

---

## Related

- [ENTERPRISE-ARCHITECTURE-CATALOGUE.md](./ENTERPRISE-ARCHITECTURE-CATALOGUE.md)
- [ARCHITECTURE-MATURITY-MATRIX.md](./ARCHITECTURE-MATURITY-MATRIX.md)
