# Runtime Health Manager — Architecture

> **Status:** Active (SPR-002 Phase 8)  
> **Package:** `@apzhub/platform-runtime/health-manager`  
> **Authority:** [ADR-0018](../adr/ADR-0018-platform-runtime-package.md) · [platform-runtime.md](./platform-runtime.md)

---

## 1. Purpose

The **Runtime Health Manager** provides a unified view of platform health. It does **not** perform health checks directly — it coordinates **Health Providers**.

**Architecture rule:** Health Providers are the permanent extension mechanism for all runtime and platform health monitoring. Future providers (database, Redis, integrations) register through the same API.

The Health Manager must not access databases, Redis, external systems, configuration files, or `process.env` directly. Configuration is obtained exclusively through the Configuration Manager.

---

## 2. Structure

```text
health-manager/
├── api/                 Health singleton API
├── interfaces/          Provider model and result types
├── implementation/      Aggregation and built-in providers
│   └── providers/       Runtime, Configuration, Registry, Lifecycle
├── validation/          Structured health errors
├── diagnostics/         Snapshots and diagnostics builders
├── defaults/            Default provider registration
└── index.ts             Public exports
```

---

## 3. Health Provider model

Every provider returns:

| Field          | Description                                      |
| -------------- | ------------------------------------------------ |
| `providerId`   | Stable provider identifier                       |
| `providerName` | Human-readable name                              |
| `status`       | `healthy` · `degraded` · `unhealthy` · `unknown` |
| `severity`     | `info` · `warning` · `critical`                  |
| `timestamp`    | ISO execution timestamp                          |
| `summary`      | Short result description                         |
| `metadata`     | Structured provider-specific details             |

### Built-in providers (Phase 8)

| Provider                            | ID                    | Checks                                                |
| ----------------------------------- | --------------------- | ----------------------------------------------------- |
| Runtime Health Provider             | `runtime`             | Workspace, semver, capability/registry integrity      |
| Configuration Health Provider       | `configuration`       | Configuration load and validation status              |
| Capability Registry Health Provider | `capability-registry` | Registration count, version alignment, health summary |
| Lifecycle Manager Health Provider   | `lifecycle-manager`   | Capability lifecycle readiness                        |

### Extension points (not implemented)

- Database Health Provider
- Redis Health Provider
- Integration Health Providers

---

## 4. Public API

```typescript
import { Health } from "@apzhub/platform-runtime/health-manager";

Health.registerProvider(customProvider);
Health.unregisterProvider("custom");
Health.check(context);
Health.checkProvider("runtime", context);
Health.snapshot();
Health.getStatus();
Health.getDiagnostics();
```

---

## 5. Aggregation

Overall runtime health is the **worst** status across all registered providers:

```text
healthy < unknown < degraded < unhealthy
```

After a successful orchestrator health step, capabilities transition from `initialised` to `healthy` / `degraded` / `failed` (registry health updated accordingly).

---

## 6. Runtime integration

The Runtime Orchestrator invokes the Health Manager **after** the Lifecycle Manager initialises capabilities:

```text
… → lifecycle-manager → health-manager → platform-ready
```

The health step uses `Health.check()` with orchestrator context (configuration, registry, lifecycle, capabilities). Fail-fast policy applies when aggregated status is `unhealthy`.

---

## 7. Diagnostics

`Health.getDiagnostics()` exposes:

- Registered providers
- Last execution timestamp
- Current runtime status
- Failed providers
- Health summary
- Snapshot timestamp
- Extension point identifiers

Diagnostics are internal — no REST endpoints or UI in Phase 8.

---

_Health Manager architecture — SPR-002 Phase 8._
