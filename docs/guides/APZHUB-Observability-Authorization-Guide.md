# Observability Authorization Guide

**Milestone:** APZOBSERVE-002

## Catalogue

`PLATFORM_OBSERVE_PERMISSIONS`:

- `observe.*`
- `observe.read`
- `observe.manage`
- `observe.health`
- `observe.metrics`
- `observe.logs`
- `observe.traces`
- `observe.alerts`
- `observe.diagnostics`

## Operation map

`observePlatformOps` maps each gateway service key (e.g. `observeHealthChecks.create`) to a required permission. Deny-by-default — no allow-all production behaviour.

| Area | Typical permission |
| --- | --- |
| Health / readiness / liveness / summaries | `observe.health` |
| Metrics | `observe.metrics` |
| Alerts | `observe.alerts` |
| Logs | `observe.logs` |
| Traces | `observe.traces` |
| Dashboards / incidents / maintenance / metadata writes | `observe.manage` (reads: `observe.read`) |
| Diagnostics | `observe.diagnostics` |
