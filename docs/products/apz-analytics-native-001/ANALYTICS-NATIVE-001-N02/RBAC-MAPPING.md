# RBAC Mapping — APZ-ANALYTICS-NATIVE-001-N02

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-02             |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T181500Z |

## Catalogue

Registered in:

- `packages/platform-authorization/src/authorization-seed.ts`
- `packages/platform-authorization/src/postgres-authorization-store.ts`
- `services/analytics/manifests/analytics/module.yaml`

## Role grants (seed)

| Role                   | Analytics grant                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| Platform Administrator | `*` (unchanged)                                                                                 |
| Tenant Member          | **Decision-entry keys only** — `analytics.view`, `analytics.kpi.view`, `analytics.saved.manage` |

**Not** granted to Tenant Member:

- `analytics.*` (wildcard would collapse presentation / operator layers)
- `analytics.admin`
- `analytics.dataset.view`
- `analytics.report.run`
- `analytics.manage` (elevated manage; saved uses `analytics.saved.manage`)

## UI helpers

| Helper                       | Meaning                                                     |
| ---------------------------- | ----------------------------------------------------------- |
| `canViewAnalytics`           | Default product identity — questions / decisions / insights |
| `canViewAnalyticsDashboards` | Compatibility — view insight answers (presentation)         |
| `canAdminAnalytics`          | Operator — presentation assets & health below boundary      |
| `canViewAnalyticsDatasets`   | Explicit grant **or** admin                                 |
| `canViewAnalyticsReports`    | Explicit grant **or** admin                                 |
| `canViewAnalyticsHealth`     | Admin only                                                  |

`analytics.view` no longer implies datasets, reports, or operator health.

## Manifests

| Surface                                   | Permission               |
| ----------------------------------------- | ------------------------ |
| APZ Analytics Activity Bar / primary nav  | `analytics.view`         |
| Datasets / Reports / Health / Diagnostics | `analytics.admin`        |
| Saved insights                            | `analytics.saved.manage` |

## Identity note

Admin-gating presentation assets and operator tools keeps dashboard/report/catalogue language out of the default product identity. Full question-first home and EQ catalogue remain **N-03**.
