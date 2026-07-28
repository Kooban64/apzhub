# Package Versions — Platform 1.2.0 Freeze Inventory

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-22  
> **Source:** repository `package.json` files (excluding `node_modules` / `.next`)  
> **Toolchain:** Node **v22.22.1** (engines `>=20`) · pnpm **10.22.0** (`packageManager` pnpm@10.22.0)

## Root

| Package  | Version              | Path           |
| -------- | -------------------- | -------------- |
| `apzhub` | **0.1.0-foundation** | `package.json` |

## Applications

| Package                | Version   | Path                             |
| ---------------------- | --------- | -------------------------------- |
| `@apzhub/law-platform` | **1.0.0** | `apps/law-platform/package.json` |
| `@apzhub/web`          | **0.0.0** | `apps/web/package.json`          |

## Integrations

| Package                              | Version   | Path                                       |
| ------------------------------------ | --------- | ------------------------------------------ |
| `@apzhub/integration-github-actions` | **0.1.0** | `integrations/github-actions/package.json` |
| `@apzhub/integration-gitlab-ci`      | **0.1.0** | `integrations/gitlab-ci/package.json`      |
| `@apzhub/integration-kimai`          | **0.2.0** | `integrations/kimai/package.json`          |
| `@apzhub/integration-meilisearch`    | **0.1.0** | `integrations/meilisearch/package.json`    |
| `@apzhub/integration-metabase`       | **0.1.0** | `integrations/metabase/package.json`       |
| `@apzhub/integration-n8n`            | **0.1.0** | `integrations/n8n/package.json`            |
| `@apzhub/integration-plane`          | **0.6.0** | `integrations/plane/package.json`          |
| `@apzhub/integration-zammad`         | **0.8.0** | `integrations/zammad/package.json`         |

## Shared libraries & platform packages

| Package                                 | Version    | Path                                                  |
| --------------------------------------- | ---------- | ----------------------------------------------------- |
| `@apzhub/activity-timeline-framework`   | **0.0.0**  | `packages/activity-timeline-framework/package.json`   |
| `@apzhub/admin-contracts`               | **0.2.0**  | `packages/admin-contracts/package.json`               |
| `@apzhub/admin-core`                    | **0.2.0**  | `packages/admin-core/package.json`                    |
| `@apzhub/admin-persistence`             | **0.1.0**  | `packages/admin-persistence/package.json`             |
| `@apzhub/analytics-contracts`           | **0.1.1**  | `packages/analytics-contracts/package.json`           |
| `@apzhub/auth`                          | **0.0.0**  | `packages/auth/package.json`                          |
| `@apzhub/command-framework`             | **0.0.0**  | `packages/command-framework/package.json`             |
| `@apzhub/config`                        | **0.0.0**  | `packages/config/package.json`                        |
| `@apzhub/configuration-contracts`       | **0.2.0**  | `packages/configuration-contracts/package.json`       |
| `@apzhub/configuration-core`            | **0.2.0**  | `packages/configuration-core/package.json`            |
| `@apzhub/configuration-persistence`     | **0.1.0**  | `packages/configuration-persistence/package.json`     |
| `@apzhub/document-contracts`            | **0.3.0**  | `packages/document-contracts/package.json`            |
| `@apzhub/document-core`                 | **0.3.0**  | `packages/document-core/package.json`                 |
| `@apzhub/document-persistence`          | **0.2.0**  | `packages/document-persistence/package.json`          |
| `@apzhub/document-storage`              | **0.1.0**  | `packages/document-storage/package.json`              |
| `@apzhub/event-notification-framework`  | **0.0.0**  | `packages/event-notification-framework/package.json`  |
| `@apzhub/identity-contracts`            | **0.2.0**  | `packages/identity-contracts/package.json`            |
| `@apzhub/identity-core`                 | **0.2.0**  | `packages/identity-core/package.json`                 |
| `@apzhub/identity-persistence`          | **0.1.0**  | `packages/identity-persistence/package.json`          |
| `@apzhub/integration-sdk`               | **1.0.0**  | `packages/integration-sdk/package.json`               |
| `@apzhub/integration-search-sdk`        | **0.1.0**  | `packages/integration-search-sdk/package.json`        |
| `@apzhub/knowledge-discovery-framework` | **0.0.0**  | `packages/knowledge-discovery-framework/package.json` |
| `@apzhub/legal-business-core`           | **1.0.0**  | `packages/legal-business-core/package.json`           |
| `@apzhub/metrics-contracts`             | **0.2.0**  | `packages/metrics-contracts/package.json`             |
| `@apzhub/metrics-core`                  | **0.2.0**  | `packages/metrics-core/package.json`                  |
| `@apzhub/metrics-persistence`           | **0.1.0**  | `packages/metrics-persistence/package.json`           |
| `@apzhub/notification-contracts`        | **0.2.0**  | `packages/notification-contracts/package.json`        |
| `@apzhub/notification-core`             | **0.2.0**  | `packages/notification-core/package.json`             |
| `@apzhub/notification-persistence`      | **0.1.0**  | `packages/notification-persistence/package.json`      |
| `@apzhub/observe-contracts`             | **0.2.0**  | `packages/observe-contracts/package.json`             |
| `@apzhub/observe-core`                  | **0.2.0**  | `packages/observe-core/package.json`                  |
| `@apzhub/observe-persistence`           | **0.1.0**  | `packages/observe-persistence/package.json`           |
| `@apzhub/platform-authorization`        | **0.1.0**  | `packages/platform-authorization/package.json`        |
| `@apzhub/platform-bootstrap`            | **0.1.0**  | `packages/platform-bootstrap/package.json`            |
| `@apzhub/platform-event-bus`            | **0.1.0**  | `packages/platform-event-bus/package.json`            |
| `@apzhub/platform-governance`           | **0.1.0**  | `packages/platform-governance/package.json`           |
| `@apzhub/platform-identity`             | **0.1.0**  | `packages/platform-identity/package.json`             |
| `@apzhub/platform-lifecycle`            | **0.1.0**  | `packages/platform-lifecycle/package.json`            |
| `@apzhub/platform-operations`           | **0.1.4**  | `packages/platform-operations/package.json`           |
| `@apzhub/platform-outbox`               | **0.1.0**  | `packages/platform-outbox/package.json`               |
| `@apzhub/platform-personalisation`      | **0.1.0**  | `packages/platform-personalisation/package.json`      |
| `@apzhub/platform-provisioning`         | **0.1.0**  | `packages/platform-provisioning/package.json`         |
| `@apzhub/platform-runtime`              | **0.0.0**  | `packages/platform-runtime/package.json`              |
| `@apzhub/platform-security`             | **0.1.0**  | `packages/platform-security/package.json`             |
| `@apzhub/platform-service-contracts`    | **0.18.0** | `packages/platform-service-contracts/package.json`    |
| `@apzhub/platform-services`             | **0.30.0** | `packages/platform-services/package.json`             |
| `@apzhub/reporting-contracts`           | **0.1.0**  | `packages/reporting-contracts/package.json`           |
| `@apzhub/reporting-core`                | **0.1.0**  | `packages/reporting-core/package.json`                |
| `@apzhub/sdk`                           | **0.0.0**  | `packages/sdk/package.json`                           |
| `@apzhub/search-contracts`              | **0.4.0**  | `packages/search-contracts/package.json`              |
| `@apzhub/search-documents`              | **0.1.0**  | `packages/search-documents/package.json`              |
| `@apzhub/search-integration`            | **0.2.0**  | `packages/search-integration/package.json`            |
| `@apzhub/search-law`                    | **0.1.0**  | `packages/search-law/package.json`                    |
| `@apzhub/search-orchestrator`           | **0.1.0**  | `packages/search-orchestrator/package.json`           |
| `@apzhub/search-persistence`            | **0.2.0**  | `packages/search-persistence/package.json`            |
| `@apzhub/search-projects`               | **0.1.0**  | `packages/search-projects/package.json`               |
| `@apzhub/search-publication-admin`      | **0.1.0**  | `packages/search-publication-admin/package.json`      |
| `@apzhub/search-reporting`              | **0.1.0**  | `packages/search-reporting/package.json`              |
| `@apzhub/search-support`                | **0.1.0**  | `packages/search-support/package.json`                |
| `@apzhub/search-testing`                | **0.1.1**  | `packages/search-testing/package.json`                |
| `@apzhub/search-time`                   | **0.1.0**  | `packages/search-time/package.json`                   |
| `@apzhub/shared`                        | **0.0.0**  | `packages/shared/package.json`                        |
| `@apzhub/testing-contracts`             | **0.11.0** | `packages/testing-contracts/package.json`             |
| `@apzhub/testing-foundation`            | **0.1.0**  | `packages/testing-foundation/package.json`            |
| `@apzhub/testing-persistence`           | **0.11.0** | `packages/testing-persistence/package.json`           |
| `@apzhub/testing-services`              | **0.11.0** | `packages/testing-services/package.json`              |
| `@apzhub/theme`                         | **0.0.0**  | `packages/theme/package.json`                         |
| `@apzhub/types`                         | **0.0.0**  | `packages/types/package.json`                         |
| `@apzhub/ui`                            | **0.0.0**  | `packages/ui/package.json`                            |
| `@apzhub/workbench-framework`           | **0.0.0**  | `packages/workbench-framework/package.json`           |
| `@apzhub/workflow-contracts`            | **0.4.2**  | `packages/workflow-contracts/package.json`            |
| `@apzhub/workflow-core`                 | **0.1.1**  | `packages/workflow-core/package.json`                 |
| `@apzhub/workflow-persistence`          | **0.1.1**  | `packages/workflow-persistence/package.json`          |
| `@apzhub/workspace`                     | **0.0.0**  | `packages/workspace/package.json`                     |

## Highlight frozen pins

| Concern                    | Package                                | Version               |
| -------------------------- | -------------------------------------- | --------------------- |
| Platform Services          | `@apzhub/platform-services`            | **0.30.0**            |
| Platform Service Contracts | `@apzhub/platform-service-contracts`   | **0.18.0**            |
| Integration SDK            | `@apzhub/integration-sdk`              | **1.0.0**             |
| Workflow contracts         | `@apzhub/workflow-contracts`           | **0.4.2**             |
| Analytics contracts        | `@apzhub/analytics-contracts`          | **0.1.1**             |
| Platform operations        | `@apzhub/platform-operations`          | **0.1.4**             |
| Zammad integration         | `@apzhub/integration-zammad`           | **0.8.0**             |
| Kimai integration          | `@apzhub/integration-kimai`            | **0.2.0**             |
| Plane integration          | `@apzhub/integration-plane`            | **0.6.0**             |
| Metabase / n8n             | `@apzhub/integration-metabase` / `n8n` | **0.1.0** / **0.1.0** |
| OpenAPI (Platform)         | Platform HTTP OpenAPI `info.version`   | **1.12.0**            |

## Counts

| Category                     | Count |
| ---------------------------- | ----: |
| Applications                 |     2 |
| Integrations                 |     8 |
| Packages                     |    74 |
| Total workspace package.json |    85 |
