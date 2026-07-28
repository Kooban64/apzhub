# Analytics Platform — Contract Planning

> **Programme:** APZHUB-PLATFORM-ANALYTICS-002 (planning) → **delivered by APZHUB-PLATFORM-ANALYTICS-003**  
> **Classification:** DOCUMENTATION — planning record  
> **Date:** 2026-07-19  
> **Delivery:** `@apzhub/analytics-contracts` **0.1.0** — see [ANALYTICS-CONTRACTS.md](./ANALYTICS-CONTRACTS.md)

---

## 1. Purpose

Identify canonical **future** contracts for Analytics Platform Services so implementation programmes share one interface language aligned to the Information Model.

---

## 2. Planned contract surfaces

| Contract / service             | Primary types (illustrative)                                         | Operations (illustrative)                                                    |
| ------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **AnalyticsService**           | `AnalyticsHealth`, `OpenDashboardRequest`                            | `getHealth`, `openDashboard` (catalogue → embed orchestration)               |
| **DashboardService**           | `DashboardRegistryEntry`, `DashboardCatalogueQuery`, `CataloguePage` | `listCatalogue`, `getDashboard`, `publish`, `deprecate`, `setRoleVisibility` |
| **DatasetService**             | `DatasetDescriptor`                                                  | `listDatasets`, `getDataset`, `upsertDataset`                                |
| **ReportService**              | `ReportLink`                                                         | `resolveReportLink` (to Reporting SoR) — no Reporting ownership              |
| **SavedViewService**           | `SavedDashboard`                                                     | `listSaved`, `save`, `archive`                                               |
| **AnalyticsPermissionService** | `AnalyticsOperation`                                                 | `assertCanView`, `assertCanManage` (delegates to platform AuthZ)             |
| **QueryService**               | `GovernedQueryRequest` (post-MVP)                                    | `executeGovernedQuery` — no raw SQL from clients                             |
| **AnalyticsEmbedService**      | `EmbedSession`, `EmbedToken`                                         | `issueEmbed`, `revokeEmbed`                                                  |
| **AnalyticsHealthService**     | `AnalyticsComponentHealth`                                           | `getDiagnostics`                                                             |

Gateway facet (future): `gateway.analytics.*` mirroring the above.

---

## 3. Permission contract (keys — finalise at contracts phase)

| Key                | Used by                                     |
| ------------------ | ------------------------------------------- |
| `analytics.view`   | catalogue, embed, saved list                |
| `analytics.manage` | registry publish, datasets, role visibility |
| `analytics.admin`  | rare provider admin / diagnostics deep      |

---

## 4. Package placement (future — not created now)

| Future package                                     | Role                                                  |
| -------------------------------------------------- | ----------------------------------------------------- |
| `@apzhub/analytics-contracts` (name TBD)           | Types + service interfaces                            |
| Extensions in `@apzhub/platform-service-contracts` | Alternative if Owner prefers single contracts package |
| `service.yaml` under `/services/analytics/`        | Platform Service SDK (027)                            |

Exact package naming requires Owner-approved implementation programme.

---

## 5. Mapping to Information Model

| Entity                 | Appears in contracts                |
| ---------------------- | ----------------------------------- |
| DashboardRegistryEntry | DashboardService                    |
| DatasetDescriptor      | DatasetService                      |
| SavedDashboard         | SavedViewService                    |
| ShareGrant             | DashboardService (or Sharing facet) |
| RoleVisibilityBinding  | DashboardService                    |
| EmbedSession           | AnalyticsEmbedService               |
| Filter / Time Period   | Embed + SavedDashboard snapshots    |
| MetricRef / ReportLink | Optional DTOs on dashboard get      |

---

## 6. Explicit non-contracts

| Do not invent Analytics contracts for | Reason                      |
| ------------------------------------- | --------------------------- |
| Metrics formula execution             | Metrics SoR frozen boundary |
| Prometheus/Grafana APIs               | Not Analytics providers     |
| Metabase admin REST in modules        | Adapter-only                |

---

## 7. Next programme (suggested shape — ID not invented as authorised)

Owner-approved **Analytics Contracts** phase (roadmap P2) should:

1. Add `service.yaml` + TypeScript interfaces
2. Align OpenAPI later (P4)
3. Keep Metabase types out of public contracts

---

## Related

- [ANALYTICS-INFORMATION-MODEL.md](./ANALYTICS-INFORMATION-MODEL.md)
- [ANALYTICS-SERVICE-ARCHITECTURE.md](./ANALYTICS-SERVICE-ARCHITECTURE.md)
- [ANALYTICS-IMPLEMENTATION-ROADMAP.md](./ANALYTICS-IMPLEMENTATION-ROADMAP.md)
