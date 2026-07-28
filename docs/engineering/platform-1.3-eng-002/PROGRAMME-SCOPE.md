# Programme Scope — Platform-1.3-ENG-002

## In scope (Phase A)

- Alert domain / severity / category / lifecycle
- Metadata-driven rule evaluation (Observe signals only)
- Deny-by-default `APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED`
- Deduplication, suppression, acknowledge, resolve
- Persistence via existing AlertDefinition / AlertState SoR
- Events: `observe.alert.fired|acknowledged|resolved|suppressed`
- Delivery hook seam (no providers)
- Additive API under `/api/v1/observe/`
- Health, diagnostics, metrics, authorisation
- Workbench honesty banners

## Out of scope

Notification providers · Email SoR · ADR-0071/0072 · Realtime · PromQL · Grafana productisation · FIN-001 · Workflow Execute · ENG-003+
