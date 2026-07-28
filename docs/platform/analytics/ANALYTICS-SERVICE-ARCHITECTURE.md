# Analytics Platform — Service Architecture

> **Programme:** APZHUB-PLATFORM-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## 1. Request path (mandatory)

```text
Client / Workbench Module
  → APZHUB API Gateway (/api/v1/analytics/**)
  → Auth (BetterAuth) → Authz (PermissionService) → Validation
  → Analytics Platform Services
  → Metabase Adapter (Integration SDK)
  → Metabase CE
```

Errors translated at adapter; standard envelope only (010).

---

## 2. Canonical services

| Service                        | Responsibility                                                                                    | Notes                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **AnalyticsService**           | Facade / orchestration entry for analytics operations                                             | Gateway facet `gateway.analytics.*` (future)           |
| **DashboardService**           | Dashboard registry CRUD (platform metadata), catalogue queries, role defaults                     | SoR = platform PostgreSQL refs                         |
| **DatasetService**             | Logical dataset descriptors / bindings to provider collections                                    | Metadata only in foundation MVP                        |
| **ReportService**              | **Boundary adapter** — may _link_ to Platform Reporting artefacts; does **not** own Reporting SoR | Avoid name collision in UI (“Reports” vs “Dashboards”) |
| **SavedViewService**           | Saved dashboards / filters / personal views                                                       | Prefer prefs hierarchy (023)                           |
| **AnalyticsPermissionService** | Thin policy helper over platform AuthZ — **not** a second IAM                                     | Uses `@apzhub/platform-authorization`                  |
| **QueryService**               | Optional: governed query request forwarding to provider                                           | MVP may defer; no raw SQL from clients                 |
| **AnalyticsEmbedService**      | Issue short-lived embed tokens / signed URLs via adapter                                          | Secrets never in module                                |
| **AnalyticsHealthService**     | Aggregate platform + adapter health                                                               | Diagnostics extension                                  |

Naming is architectural; package IDs follow Platform Service SDK (`service.yaml`) when implemented.

---

## 3. What is not an Analytics Platform service

| Existing                    | Remains separate                |
| --------------------------- | ------------------------------- |
| `gateway.metrics.*`         | Metrics SoR                     |
| Observability services      | Observe SoR                     |
| Reporting services          | Reporting SoR                   |
| `SupportAnalyticsService`   | Support **domain** intelligence |
| Plane adapter analytics ops | Connector-internal              |

---

## 4. Data ownership

| Data                                         | SoR                                                 |
| -------------------------------------------- | --------------------------------------------------- |
| Dashboard registry, permissions, saved views | **Platform PostgreSQL** (future analytics_* tables) |
| Dashboard visualisations, questions, results | **Metabase** (engine)                               |
| Metric definitions                           | Metrics SoR                                         |
| Audit events                                 | Platform audit (via services)                       |

Never duplicate Metabase result sets as authoritative platform business data (011).

---

## 5. Security pipeline

Every Analytics API: Auth → Authz → Validation → Rules → Audit → Execution (013).  
Superadmin is explicit tier, not bypass. Embed tokens scoped, short TTL, cached carefully.

---

## Related

- [ANALYTICS-INTEGRATION-MODEL.md](./ANALYTICS-INTEGRATION-MODEL.md)
- [ADR-0066](../../adr/ADR-0066-analytics-platform-boundaries.md)
