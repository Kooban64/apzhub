# Observability Domain Model

**Milestone:** APZOBSERVE-001

## Entities

| Entity | Purpose |
| --- | --- |
| HealthCheck | Named health probe metadata |
| ReadinessCheck | Readiness probe metadata |
| LivenessCheck | Liveness probe metadata |
| ServiceHealth | Aggregated service health view |
| ServiceStatus | Point-in-time service status |
| ComponentStatus | Component-level status under a service |
| MetricDefinition | Metric catalogue entry (not TSDB) |
| MetricSample | Sample *reference* metadata (not TSDB values) |
| AlertDefinition | Alert rule catalogue metadata |
| AlertState | Alert state metadata |
| DashboardDefinition | Dashboard registration (not Grafana JSON SoR) |
| LogSource | Log source registration (not Loki storage) |
| TraceDefinition | Trace catalogue metadata |
| TraceSpan | Span *reference* metadata |
| IncidentReference | External incident linkage |
| MaintenanceWindow | Planned maintenance metadata |
| HealthSummary | Aggregated health counts |
| PlatformDiagnostic | Diagnostic check metadata |
| ObservabilityMetadata | Generic observability metadata bag |

All entities are tenant-scoped metadata with standard audit fields (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `revision`).
