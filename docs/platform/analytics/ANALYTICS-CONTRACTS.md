# Analytics Platform Contracts

> **Package:** `@apzhub/analytics-contracts` **0.1.0**  
> **Programme:** APZHUB-PLATFORM-ANALYTICS-003  
> **Status:** **ACCEPTED / CLOSED**  
> **SDK / boundary:** Provider-neutral · Integration SDK **1.0.0** unchanged · No Platform Services in this programme

---

## Purpose

Canonical TypeScript models and service **interfaces** for all Analytics providers and consumers. Ready for future Analytics Platform Services. No business logic.

## Package

| Item    | Value                           |
| ------- | ------------------------------- |
| Name    | `@apzhub/analytics-contracts`   |
| Path    | `packages/analytics-contracts/` |
| Version | **0.1.0**                       |

## Models

| Contract type                            | Information Model mapping                  |
| ---------------------------------------- | ------------------------------------------ |
| `AnalyticsDashboard`                     | DashboardRegistryEntry                     |
| `DashboardSummary`                       | Catalogue projection                       |
| `DashboardCategory`                      | CatalogueTag                               |
| `DashboardFilter` / `DashboardParameter` | Query / embed context                      |
| `DashboardPermission`                    | RoleVisibilityBinding / ShareGrant         |
| `AnalyticsDataset`                       | DatasetDescriptor                          |
| `AnalyticsMetric` / `AnalyticsKPI`       | Metrics SoR **references** (not ownership) |
| `AnalyticsReport`                        | Reporting SoR **link** (not ownership)     |
| `AnalyticsWidget`                        | WidgetRef                                  |
| `SavedDashboard`                         | SavedDashboard                             |
| `DashboardEmbedding`                     | EmbedSession                               |
| `AnalyticsHealth`                        | Platform health aggregate                  |
| `AnalyticsCapability`                    | Capability discovery                       |

IM aliases are also exported: `DashboardRegistryEntry`, `DatasetDescriptor`, `WidgetRef`, `EmbedSession`, `CatalogueTag`.

## Service interfaces (no implementations)

| Interface                                                | Role                                     |
| -------------------------------------------------------- | ---------------------------------------- |
| `AnalyticsService`                                       | Health + open dashboard orchestration    |
| `DashboardService`                                       | Catalogue / publish / visibility         |
| `DatasetService`                                         | Dataset descriptors                      |
| `ReportService`                                          | Reporting SoR link resolution            |
| `SavedDashboardService`                                  | Saved views                              |
| `AnalyticsPermissionService` (`PermissionService` alias) | AuthZ assertions (delegates to platform) |
| `CapabilityService`                                      | Capability discovery                     |
| `AnalyticsPlatformGateway`                               | Future `gateway.analytics.*` composition |

## Permissions

| Operation (Owner)       | Permission key              |
| ----------------------- | --------------------------- |
| View Dashboard          | `analytics.dashboard.view`  |
| View Dataset            | `analytics.dataset.view`    |
| Run Report              | `analytics.report.run`      |
| Manage Saved Dashboards | `analytics.saved.manage`    |
| Share Dashboard         | `analytics.dashboard.share` |
| Embed Dashboard         | `analytics.dashboard.embed` |
| Administer Analytics    | `analytics.admin`           |

Aggregates: `analytics.view` · `analytics.manage` · `analytics.admin` · wildcard `analytics.*`.

## Provider neutrality

- Provider binding uses opaque `{ providerId, providerRef }` only.
- **No** Metabase-specific DTOs, headers, or API paths in this package.
- Metabase remains behind `@apzhub/integration-metabase` (adapter layer).

## Examples

See `packages/analytics-contracts/src/examples/example-shapes.ts` and [COMPATIBILITY.md](./ANALYTICS-CONTRACTS-COMPATIBILITY.md).

## Explicit non-deliverables

Analytics Platform Services · HTTP APIs · Workbench · APZ Analytics product · `service.yaml` implementations
