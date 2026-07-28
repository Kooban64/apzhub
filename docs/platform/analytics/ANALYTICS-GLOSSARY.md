# Analytics Platform — Glossary

> **Programme:** APZHUB-PLATFORM-ANALYTICS-002  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [ANALYTICS-INFORMATION-MODEL.md](./ANALYTICS-INFORMATION-MODEL.md) · [ADR-0066](../../adr/ADR-0066-analytics-platform-boundaries.md)  
> **Date:** 2026-07-19  
> **Rule:** These definitions govern all future Analytics implementations. Conflicting UI copy must align.

---

## Canonical terms

| Term                    | Definition                                                                                                                                              | SoR / owner                                                           | Must not confuse with                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Analytics**           | Governed decision-support capability: catalogue, dashboards, embeds, and related metadata under the Analytics Platform                                  | Analytics Platform                                                    | Observability · Metrics SoR · Reporting SoR · domain “analytics” ops |
| **Metric**              | Named measurable quantity with governed definition metadata (lifecycle, ownership) in the **Metrics SoR**                                               | Metrics SoR (frozen)                                                  | Dashboard measure · PromQL series · ad-hoc BI field                  |
| **KPI**                 | Business-oriented key performance indicator, usually composed from one or more Metrics or Measures for decision making                                  | Metrics SoR (definition) · may be _presented_ on Analytics dashboards | Widget · Scorecard (presentation)                                    |
| **Dataset**             | Logical analytics data binding: platform metadata describing a provider collection/table/view available for dashboards                                  | Analytics Platform (metadata) · provider holds physical data          | Metrics definition · Report artefact                                 |
| **Dashboard**           | Curated visual composition of widgets over one or more datasets, registered in the platform **Dashboard Registry** and rendered via provider embed      | Platform registry + provider visuals                                  | Metrics Workbench page · Observability console                       |
| **Widget**              | Single visual unit on a dashboard (chart, table, number, text)                                                                                          | Provider (visual) · registry may store layout refs                    | Metric entity                                                        |
| **Report**              | Durable reporting artefact owned by **Platform Reporting** (placeholders, TCMS reports, exports). Analytics may _link_ to reports; it does not own them | Reporting SoR                                                         | Dashboard                                                            |
| **Scorecard**           | Presentation pattern: compact set of KPIs/measures with targets/status for a role or period                                                             | Analytics presentation (often a dashboard or widget group)            | Metrics SoR KPI definition alone                                     |
| **Filter**              | Constraint applied to dashboard/dataset context (e.g. project, org, status)                                                                             | Platform saved context + provider filter params                       | AuthZ permission                                                     |
| **Dimension**           | Categorical axis used to slice measures (e.g. project, assignee, queue)                                                                                 | Dataset / provider semantic                                           | Measure                                                              |
| **Measure**             | Numeric (or aggregatable) field evaluated over dimensions and time                                                                                      | Dataset / provider semantic                                           | Metric SoR entity (may map 1:1 when curated)                         |
| **Time Period**         | Temporal window for aggregation (day, week, sprint, month, custom range)                                                                                | Query/embed context                                                   | Audit timestamp                                                      |
| **Aggregation**         | Function reducing measures over dimensions/time (sum, count, avg, …)                                                                                    | Provider query engine                                                 | Platform Metrics formula execution (forbidden reuse)                 |
| **Saved Dashboard**     | User- or org-persisted selection of a dashboard plus optional filters/layout prefs                                                                      | Analytics SavedView / prefs                                           | Provider “personal collection” alone                                 |
| **Dashboard Catalogue** | Permission-filtered list of registered dashboards available to a principal                                                                              | DashboardService                                                      | Metabase root collection browser (masked)                            |
| **Role Visibility**     | Mapping of platform roles/permissions to which catalogue entries and embeds are visible                                                                 | AuthZ + registry                                                      | Metabase group names in UI                                           |
| **Sharing**             | Granting dashboard access within tenant under AuthZ (no anonymous public MVP)                                                                           | DashboardService + AuthZ                                              | External public embed links                                          |
| **Embedding**           | Rendering a provider dashboard/widget inside APZHUB Workbench via short-lived signed URL/token                                                          | AnalyticsEmbedService + adapter                                       | IFrame to Metabase login                                             |

---

## Related

- [ANALYTICS-INFORMATION-MODEL.md](./ANALYTICS-INFORMATION-MODEL.md)
- [ANALYTICS-DOMAIN-MODEL.md](./ANALYTICS-DOMAIN-MODEL.md)
