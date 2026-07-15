# APZHUB Integration Health, Diagnostics & Lifecycle — Implementation Architecture

> **Milestone:** OSS-100-03  
> **Status:** Implemented in `@apzhub/integration-sdk` v0.3.0  
> **Authority:** [Integration Health & Diagnostics Model](./APZHUB-Integration-Health-Diagnostics-Model.md)

---

## Purpose

Document the **implemented** OSS-100-03 foundation — logical health, unified diagnostics, version compatibility, and adapter lifecycle participation.

No HTTP transport. No vendor-specific code. No `@apzhub/platform-lifecycle` import in the SDK (bridge types only).

---

## Components

| Component | Package path |
|-----------|--------------|
| `DefaultHealthProvider` | `src/health/default-health-provider.ts` |
| `DefaultDiagnosticsProvider` | `src/diagnostics/unified-diagnostics.ts` |
| `DefaultVersionProvider` | `src/version/types.ts` |
| `DefaultLifecycleParticipant` | `src/lifecycle/default-lifecycle-participant.ts` |
| `IntegrationAdapterLifecycleService` | `src/lifecycle/integration-lifecycle-service.ts` |
| `createIntegrationOperationsStack` | `src/operations-stack.ts` |
| Platform bridge | `src/lifecycle/platform-bridge.ts` |

---

## Data flow

```text
ConnectionRegistry + CredentialResolver
        ↓
HealthProvider.check() → IntegrationHealth
        ↓
DiagnosticsProvider.collect() → IntegrationDiagnostics
        ↓
Bootstrap / Operations Control Plane extension
```

Lifecycle:

```text
LifecycleParticipant.onEnable() → initialising → ready|degraded
LifecycleParticipant.onDisable() → disabled
LifecycleParticipant.onShutdown() → shutting_down → shutdown
```

---

## Connection + health correlation

Connection lifecycle state influences authentication and authorization checks. Degraded connection state contributes to degraded integration health.

---

## Platform lifecycle integration

`toPlatformCapabilityParticipation()` produces records compatible with `@apzhub/platform-lifecycle` without creating a package dependency. Adapters register at bootstrap when OSS-100-05 lands.

---

## Out of scope (OSS-100-03)

- HTTP connectivity probes
- Circuit breaker (OSS-100-04)
- OpenTelemetry / metrics (OSS-100-04)
- Control plane UI wiring
- Plane adapter (OSS-101-04)

---

## Related

- [Integration Authentication Architecture](./APZHUB-Integration-Authentication-Architecture.md)
- [Integration Connection Management](./APZHUB-Integration-Connection-Management.md)
- [Package HEALTH-DIAGNOSTICS-LIFECYCLE.md](../../packages/integration-sdk/docs/HEALTH-DIAGNOSTICS-LIFECYCLE.md)
