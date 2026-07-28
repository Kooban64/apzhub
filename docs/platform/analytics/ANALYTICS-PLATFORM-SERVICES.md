# Analytics Platform Services

> **Programme:** APZHUB-PLATFORM-ANALYTICS-004  
> **Implementation:** `@apzhub/platform-services` **0.28.0** (services delivered at **0.27.0**; additive HTTP readiness in **0.28.0**)  
> **Contracts:** `@apzhub/analytics-contracts` **0.1.0**  
> **Integration:** `@apzhub/integration-metabase` **0.1.0**  
> **Manifest:** `services/analytics/service.yaml` **0.1.0**  
> **Status:** **ACCEPTED / CLOSED**

---

## Purpose

Business-logic Platform Services for Analytics — provider-neutral contracts + certified Metabase ops. No HTTP APIs or Workbench.

## Implementations

| Class                       | Contract                     |
| --------------------------- | ---------------------------- |
| `AnalyticsServiceImpl`      | `AnalyticsService`           |
| `DashboardServiceImpl`      | `DashboardService`           |
| `DatasetServiceImpl`        | `DatasetService`             |
| `ReportServiceImpl`         | `ReportService`              |
| `SavedDashboardServiceImpl` | `SavedDashboardService`      |
| `CapabilityServiceImpl`     | `CapabilityService`          |
| `PermissionServiceImpl`     | `AnalyticsPermissionService` |

## Factories

| Factory                                       | Use                                       |
| --------------------------------------------- | ----------------------------------------- |
| `createAnalyticsPlatformServicesForTest`      | Mock ops + seeded in-memory registry      |
| `createAnalyticsPlatformServicesWithMetabase` | Metabase adapter ops + in-memory registry |

Wire via `createPlatformServices({ analytics })` → `gateway.analytics.*`.

## Responsibilities

- Dashboard discovery / retrieval / categories
- Role filtering (registry bindings)
- Permission validation (contracts catalogue + pipeline AuthZ)
- Saved dashboard management
- Capability / health / readiness aggregation
- Dataset + report catalogues
- Provider selection (`metabase` | `mock`)

## Provider boundary

Metabase communication only through `@apzhub/integration-metabase`. No Metabase DTOs on service public surfaces.

## Documents

| Doc               | Path                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------ |
| Compatibility     | [ANALYTICS-SERVICES-COMPATIBILITY.md](./ANALYTICS-SERVICES-COMPATIBILITY.md)         |
| Known limitations | [ANALYTICS-SERVICES-KNOWN-LIMITATIONS.md](./ANALYTICS-SERVICES-KNOWN-LIMITATIONS.md) |
| Release notes     | [ANALYTICS-SERVICES-RELEASE-NOTES.md](./ANALYTICS-SERVICES-RELEASE-NOTES.md)         |

## STOP

Do not implement Analytics HTTP APIs, Workbench, or APZ Analytics without Owner Approval.
