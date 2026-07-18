# APZMETRICS-005 — Permission Traceability

**Date:** 2026-07-18

## Catalogue

`PLATFORM_METRICS_PERMISSIONS` (`@apzhub/metrics-contracts`):

- `metrics.*`
- `metrics.read`
- `metrics.manage`
- `metrics.kpi`
- `metrics.definition`
- `metrics.metadata`
- `metrics.classification`
- `metrics.retention`

## Operation mapping

`metricsPlatformOps` in `operation-authorization-map.ts` maps gateway service keys (e.g. `metricsMetrics`, `metricsDefinitions`, `metricsKpis`, `metricsDiagnostics`) to granular permissions. Production mode is deny-by-default — no allow-all.

## Enforcement

| Surface         | Role                                                     |
| --------------- | -------------------------------------------------------- |
| RequestPipeline | Authoritative server-side authz                          |
| Workbench UI    | Presentation gating only (`metrics.read` / manage flags) |
| Manifests       | Activity Bar / Sidebar require `metrics.read`            |

UI checks never replace server authorization. Auditability follows platform RequestPipeline audit path.
