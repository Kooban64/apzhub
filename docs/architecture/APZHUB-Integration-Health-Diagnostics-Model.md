# APZHUB Integration Health & Diagnostics Model

**Milestone:** OSS-100  
**Status:** Canonical health and diagnostics contract  
**Authority:** [Observability Framework 014](../014-observability-monitoring-telemetry-health-framework.md) · [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)

---

## Purpose

Define the **health and diagnostics model** for OSS integrations via `HealthProvider` and `DiagnosticsProvider`. All vendor adapters report through this unified structure to the operations control plane and bootstrap diagnostics.

---

## Health hierarchy placement

```text
Platform
  └── Capability (e.g. projects)
        └── Integration (e.g. plane)
              └── Connection (per tenant)
```

Integration health rolls up to capability health in `@apzhub/platform-operations`. Standard users never see engine health dashboards — operator tier only (014).

---

## Health statuses

| Status | Meaning | User impact |
|--------|---------|-------------|
| `healthy` | All checks pass | Normal operation |
| `degraded` | Partial failure — reads may work | Capability may show degraded banner |
| `unavailable` | Engine unreachable or auth failed | Mutations fail; reads per fallback policy |
| `disabled` | Integration flag off or lifecycle disabled | Capability hidden or stub |

---

## Standard health checks

Every `HealthProvider.check()` runs these checks unless integration manifest declares exemption:

| Check | Pass criteria |
|-------|---------------|
| `configuration` | Required config keys present (`ConfigurationProvider`) |
| `connectivity` | TCP/HTTP reachability to vendor base URL |
| `authentication` | Service token or credential valid |
| `authorization` | Required scopes/workspace accessible |
| `version` | Engine version within declared range |
| `circuit_breaker` | State not `open` |

Vendor adapters add checks via `performHealthChecks()` override (see [Base Adapter Pattern](./APZHUB-Base-Adapter-Pattern.md)).

---

## Health result schema

```typescript
interface IntegrationHealthResult {
  readonly status: "healthy" | "degraded" | "unavailable" | "disabled";
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly tenantId?: string;
  readonly checks: readonly HealthCheckItem[];
  readonly observedAt: string;
  readonly correlationId: string;
}
```

**Aggregation rule:**

- Any `fail` on critical check → `unavailable`
- Any `warn` or non-critical `fail` → `degraded`
- All `pass` → `healthy`
- Integration disabled → `disabled` (short-circuit)

---

## Diagnostics model

Diagnostics extend health with **operational telemetry** for the Administration Workspace and bootstrap loader.

### Diagnostics payload

| Field | Source | Sensitive |
|-------|--------|-----------|
| `connectionConfigured` | Config validation | No |
| `authenticationPresent` | Credential ref exists | No (never value) |
| `engineVersion` | `VersionProvider.probe()` | No |
| `versionCompatibility` | Range check vs manifest | No |
| `healthStatus` | Latest health aggregate | No |
| `circuitBreakerState` | SDK circuit breaker | No |
| `lastSuccessfulRequestAt` | Metrics | No |
| `errorRate5m` | Metrics | No |
| `latencyP95Ms` | Metrics | No |
| `syncLagSeconds` | Polling/outbox cursor | No |

### Diagnostics vs health probe

| Concern | OSS-101-02 pattern | OSS-100 SDK pattern |
|---------|-------------------|---------------------|
| Config-only diagnostics | `getPlaneConfigurationDiagnostics()` | `DiagnosticsProvider` when engine not probed |
| Live engine probe | Deferred to adapter | `HealthProvider` HTTP probe via SDK |
| When disabled | Status `disabled` | Same — no probe |

Plane config diagnostics (OSS-101-02) **migrate into** SDK `DiagnosticsProvider` when adapter lands (OSS-101-04).

---

## Registration

| Surface | Registration path |
|---------|-------------------|
| Bootstrap diagnostics | Extension ID in `service.yaml` / `integration.yaml` documentation |
| Control plane | `@apzhub/platform-operations` capability registry |
| Health endpoint | Aggregated in `GET /api/platform/v1/system/health` |
| Administration UI | Operator permission-gated |

---

## Probe scheduling

| Probe type | Trigger | Blocking |
|------------|---------|----------|
| Startup | Platform bootstrap | Non-blocking — report status |
| Periodic | Control plane interval (default 60 s) | Background |
| On-demand | Operator refresh | API request |
| Pre-mutation | Optional — Capability Service | Only for critical paths |

Startup must not block platform ready on single integration failure — report `degraded`/`unavailable` and continue (PRH-009).

---

## Alerting hooks (future Wave 8)

Metrics from `IntegrationMetrics` feed Grafana via platform observability connectors. OSS-100 defines metric names; Wave 8 wires dashboards.

Standard metrics:

- `integration.requests.total`
- `integration.requests.duration_ms`
- `integration.errors.total`
- `integration.circuit_breaker.state`
- `integration.health.status`

---

## Related

- [Connection Lifecycle](./APZHUB-Integration-Connection-Lifecycle.md)
- [Error Translation Model](./APZHUB-Integration-Error-Translation-Model.md)
- [Plane Diagnostics Design](./APZHUB-Plane-Diagnostics-Design.md)
