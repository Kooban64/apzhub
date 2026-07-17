# Observability Authorization-Aware UI Guide

**Milestone:** APZOBSERVE-004

## Model

Server authorization remains authoritative. The Workbench is permission-aware at three layers:

1. **Manifest-driven visibility** — Activity Bar `platform-observability` and sidebar children declare `permission: observe.read`. Shell `PermissionService` filters navigation.
2. **Route mount** — `isObserveRoute` decides whether `ObserveWorkspaceRouter` mounts; this is presentation routing, not authz.
3. **API enforcement** — every `observe-api` call hits `/api/v1/observe/*` → `gateway.observe.*` → RequestPipeline → production Authz (`PLATFORM_OBSERVE_PERMISSIONS` / `observePlatformOps`).

## `canManage`

`PlatformObservabilityView` accepts `canManage` (default `true`) to hide create/update controls. This is a **UI convenience**, not a security boundary. Wire to granular `observe.*` permissions when the shell supplies them; mutations still fail server-side without rights.

## Permission catalogue (presentation guidance)

| Area | Permissions (examples) |
| --- | --- |
| Read / navigate | `observe.read` |
| Health facets | health-scoped `observe.*` |
| Metrics | metrics-scoped `observe.*` |
| Logs metadata | logs-scoped `observe.*` |
| Traces metadata | traces-scoped `observe.*` |
| Alerts metadata | alerts-scoped `observe.*` |
| Diagnostics | diagnostics-scoped `observe.*` |

Do not introduce allow-all production behaviour. Do not authorize solely by hiding table rows.

## Error flavors

- Forbidden → `observability-forbidden`
- Not found → `observability-not-found`
- Unavailable (`OBSERVE_SERVICE_UNAVAILABLE` / 503) → `observability-unavailable`

See also: [Observability Authorization Guide](./APZHUB-Observability-Authorization-Guide.md) (platform services).
