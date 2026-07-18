# Observability Workbench Navigation Guide

**Milestone:** APZOBSERVE-004  
**Primary route:** `/workspace/observability`  
**Permission (Activity Bar / sections):** `observe.read`

Navigation is manifest-driven. The shell never hard-codes Observability entries outside Workbench discovery.

## Groups (sidebar presentation)

### Health

| Section          | Path                                        |
| ---------------- | ------------------------------------------- |
| Overview         | `/workspace/observability/overview`         |
| Health Checks    | `/workspace/observability/health-checks`    |
| Readiness Checks | `/workspace/observability/readiness-checks` |
| Liveness Checks  | `/workspace/observability/liveness-checks`  |
| Service Health   | `/workspace/observability/service-health`   |
| Service Status   | `/workspace/observability/service-status`   |
| Component Status | `/workspace/observability/component-status` |
| Health Summaries | `/workspace/observability/health-summaries` |

### Telemetry Metadata

| Section            | Path                                          |
| ------------------ | --------------------------------------------- |
| Metric Definitions | `/workspace/observability/metric-definitions` |
| Metric Samples     | `/workspace/observability/metric-samples`     |
| Log Sources        | `/workspace/observability/log-sources`        |
| Trace Definitions  | `/workspace/observability/trace-definitions`  |
| Trace Spans        | `/workspace/observability/trace-spans`        |

### Operations Metadata

| Section               | Path                                             |
| --------------------- | ------------------------------------------------ |
| Alert Definitions     | `/workspace/observability/alert-definitions`     |
| Alert States          | `/workspace/observability/alert-states`          |
| Dashboard Definitions | `/workspace/observability/dashboard-definitions` |
| Incident References   | `/workspace/observability/incident-references`   |
| Maintenance Windows   | `/workspace/observability/maintenance-windows`   |

### Platform

| Section     | Path                                   |
| ----------- | -------------------------------------- |
| Diagnostics | `/workspace/observability/diagnostics` |
| Metadata    | `/workspace/observability/metadata`    |

## Routing helpers

- `OBSERVE_WORKSPACE_BASE`, `OBSERVE_SECTIONS`, `isObserveRoute`, `resolveObserveSection`, `observeSectionPath` in `apps/web/lib/observe/routes.ts`
- Workspace mount: `ObserveWorkspaceRouter` → `PlatformObservabilityView`

See also: [Views Catalogue](./APZHUB-Observability-Views-Catalogue.md), [Authorization-Aware UI Guide](./APZHUB-Observability-Authorization-Aware-UI-Guide.md).
