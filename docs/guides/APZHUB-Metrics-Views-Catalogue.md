# APZHUB Metrics Views Catalogue

**Milestone:** APZMETRICS-004  
**Component:** `apps/web/components/metrics/platform-metrics-view.tsx`

| Section                 | Purpose                                                |
| ----------------------- | ------------------------------------------------------ |
| Overview                | Metadata summary cards + capability banners            |
| Metrics … Metadata      | Facet list + detail inspector + create/edit metadata   |
| Formulas                | Formula metadata only — never evaluates expressions    |
| KPIs / Groups / Targets | KPI definition metadata only — never calculates values |
| Diagnostics             | Readiness / persistence / registration metadata        |

All list sections support filter, table, inspector, loading/empty/error, and optional create/save when `canManage`.
