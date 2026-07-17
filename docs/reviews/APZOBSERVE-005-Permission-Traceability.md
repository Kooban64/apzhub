# APZOBSERVE-005 — Permission Traceability Matrix

Catalogue: `PLATFORM_OBSERVE_PERMISSIONS` · Map: `observePlatformOps`

| Gateway operation family | Permission | HTTP (examples) | Typed client | Workbench |
| --- | --- | --- | --- | --- |
| observeHealthChecks.* | observe.health | /observe/health-checks | healthChecks.* | Health Checks |
| observeReadinessChecks.* | observe.health | /observe/readiness-checks | readinessChecks.* | Readiness Checks |
| observeLivenessChecks.* | observe.health | /observe/liveness-checks | livenessChecks.* | Liveness Checks |
| observeServiceHealth.* | observe.health | /observe/service-health | serviceHealth.* | Service Health |
| observeServiceStatus.* | observe.health | /observe/service-status | serviceStatus.* | Service Status |
| observeComponentStatus.* | observe.health | /observe/component-status | componentStatus.* | Component Status |
| observeHealthSummaries.* | observe.health | /observe/health-summaries | healthSummaries.* | Health Summaries |
| observeMetricDefinitions.* | observe.metrics | /observe/metric-definitions | metricDefinitions.* | Metric Definitions |
| observeMetricSamples.* | observe.metrics | /observe/metric-samples | metricSamples.* | Metric Samples |
| observeAlertDefinitions.* | observe.alerts | /observe/alert-definitions | alertDefinitions.* | Alert Definitions |
| observeAlertStates.* | observe.alerts | /observe/alert-states | alertStates.* | Alert States |
| observeLogSources.* | observe.logs | /observe/log-sources | logSources.* | Log Sources |
| observeTraceDefinitions.* | observe.traces | /observe/trace-definitions | traceDefinitions.* | Trace Definitions |
| observeTraceSpans.* | observe.traces | /observe/trace-spans | traceSpans.* | Trace Spans |
| observeDashboardDefinitions list/get | observe.read | /observe/dashboard-definitions | dashboardDefinitions.* | Dashboard Definitions |
| observeDashboardDefinitions create/update | observe.manage | same | same | Create/Save |
| observeIncidentReferences list/get | observe.read | /observe/incident-references | incidentReferences.* | Incident References |
| observeIncidentReferences create/update | observe.manage | same | same | Create/Save |
| observeMaintenanceWindows list/get | observe.read | /observe/maintenance-windows | maintenanceWindows.* | Maintenance Windows |
| observeMaintenanceWindows create/update | observe.manage | same | same | Create/Save |
| observeMetadata list/get | observe.read | /observe/metadata | metadata.* | Metadata |
| observeMetadata create/update | observe.manage | same | same | Create/Save |
| observeDiagnostics.* | observe.diagnostics | /observe/diagnostics*, health, readiness | diagnostics.*, getObserve* | Diagnostics |
| Navigation / Overview | observe.read | N/A (manifest) | capabilities lists | Overview |

Server authorization is authoritative. UI `canManage` is presentation-only.
