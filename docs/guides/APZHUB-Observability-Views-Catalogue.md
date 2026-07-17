# Observability Views Catalogue

**Milestone:** APZOBSERVE-004  
**Component:** `apps/web/components/observe/platform-observability-view.tsx`

Every section renders inside shared `PageShell` (`data-testid="observability-page"`) with an `<h1>` title. Facet sections use `FacetPanel` (`data-testid="facet-{section}"`) with list table, detail inspector, and optional create form.

| Section | Purpose | Key test ids | Notes |
| --- | --- | --- | --- |
| Overview | Metadata summary counts + service/persistence cards | `card-health-checks-count`, `capability-banners`, `banner-grafana` | Typed-client data only; no live metrics |
| Health Checks | Health-check definition metadata | `facet-health-checks`, `observability-detail` | Probes not executed |
| Readiness Checks | Readiness definition metadata | `facet-readiness-checks` | Distinct from liveness |
| Liveness Checks | Liveness definition metadata | `facet-liveness-checks` | No process/container probes |
| Service Health | Recorded service-health metadata | `facet-service-health`, `status-badge` | Not claimed live unless record says so |
| Service Status | Canonical status/severity values | `facet-service-status` | Domain vocabulary only |
| Component Status | Component identity + recorded status | `facet-component-status` | No infrastructure probing |
| Metric Definitions | Metric definition metadata | `facet-metric-definitions` | No PromQL / live query |
| Metric Samples | Stored sample metadata | `facet-metric-samples` | No time-series engine |
| Alert Definitions | Alert definition metadata | `facet-alert-definitions` | No evaluation |
| Alert States | Recorded alert state metadata | `facet-alert-states` | No notification delivery |
| Dashboard Definitions | Dashboard metadata | `facet-dashboard-definitions` | No Grafana embed |
| Log Sources | Log source metadata | `facet-log-sources` | No raw logs / Loki |
| Trace Definitions | Trace definition metadata | `facet-trace-definitions` | No OTel exporters |
| Trace Spans | Stored span metadata | `facet-trace-spans` | No trace visualiser |
| Incident References | External incident links | `facet-incident-references` | Observability is not incident SoR |
| Maintenance Windows | Window metadata | `facet-maintenance-windows` | No auto alert suppression |
| Health Summaries | Canonical stored summaries | `facet-health-summaries` | No UI aggregation |
| Diagnostics | Safe readiness / registration metadata | `diag-readiness`, `diag-provider-execution` | Providers not probed |
| Metadata | Registration / classification metadata | `facet-metadata` | Typed fields only |

## Shared primitives

- `PageShell`, `StatusCard`, `NoticeBanner`, `MetaTable`, `StatusBadge`, `EmptyState`, `ErrorState`, `FacetPanel`

## Empty / loading / error

- Loading: `data-testid="observability-loading"`
- Empty: `data-testid="observability-empty"`
- Error / forbidden / not-found / unavailable: `observability-error` / `observability-forbidden` / `observability-not-found` / `observability-unavailable`

See also: [Health and Status Presentation Guide](./APZHUB-Observability-Health-and-Status-Presentation-Guide.md).
