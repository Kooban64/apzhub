# Observability HTTP Route Catalogue

**Milestone:** APZOBSERVE-003  
**Base:** `/api/v1/observe`

All routes use `withPlatformApiAuth` and call `gateway.observe.*` only.

## Facet CRUD (list / create / get / patch)

| Path                     | Gateway facet               | Permission family     |
| ------------------------ | --------------------------- | --------------------- |
| `/health-checks`         | `healthChecks`              | `observe.health`      |
| `/readiness-checks`      | `readinessChecks`           | `observe.health`      |
| `/liveness-checks`       | `livenessChecks`            | `observe.health`      |
| `/service-health`        | `serviceHealth`             | `observe.health`      |
| `/service-status`        | `serviceStatus`             | `observe.health`      |
| `/component-status`      | `componentStatus`           | `observe.health`      |
| `/metric-definitions`    | `metricDefinitions`         | `observe.metrics`     |
| `/metric-samples`        | `metricSamples`             | `observe.metrics`     |
| `/alert-definitions`     | `alertDefinitions`          | `observe.alerts`      |
| `/alert-states`          | `alertStates`               | `observe.alerts`      |
| `/dashboard-definitions` | `dashboardDefinitions`      | `observe.dashboards`  |
| `/log-sources`           | `logSources`                | `observe.logs`        |
| `/trace-definitions`     | `traceDefinitions`          | `observe.traces`      |
| `/trace-spans`           | `traceSpans`                | `observe.traces`      |
| `/incident-references`   | `incidentReferences`        | `observe.incidents`   |
| `/maintenance-windows`   | `maintenanceWindows`        | `observe.maintenance` |
| `/health-summaries`      | `healthSummaries`           | `observe.health`      |
| `/metadata`              | `metadata`                  | `observe.metadata`    |
| `/diagnostics`           | `diagnostics` (entity CRUD) | `observe.diagnostics` |

Each collection resource also has `/{id}` GET + PATCH.

## Diagnostics (metadata — no provider probes)

| Path                        | Operation                                             |
| --------------------------- | ----------------------------------------------------- |
| `/health`                   | `diagnostics.health`                                  |
| `/readiness`                | `diagnostics.readiness`                               |
| `/capabilities`             | `diagnostics.capabilities` + management-plane DTO     |
| `/diagnostics/health`       | same as `/health`                                     |
| `/diagnostics/readiness`    | same as `/readiness`                                  |
| `/diagnostics/capabilities` | same as `/capabilities`                               |
| `/management-diagnostics`   | Aggregate health + readiness + management-plane flags |

## Explicitly absent

`/grafana`, `/prometheus`, `/loki`, `/opentelemetry`, `/alertmanager`, `/scrape`, `/ingest`, `/collect`, `/stream`, `/execute`, `/probe`, `/secrets`, `/credentials`, `/api-keys`, `/tokens`, `/events`, `/runtime`
