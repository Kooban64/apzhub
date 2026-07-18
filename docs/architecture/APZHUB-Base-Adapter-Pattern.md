# APZHUB Base Adapter Pattern

**Milestone:** OSS-100  
**Status:** Mandatory pattern for all vendor adapters  
**Authority:** [Platform Integration SDK Architecture](./APZHUB-Platform-Integration-SDK-Architecture.md) · [Adapter Boundary Pattern](./APZHUB-Adapter-Boundary-Pattern.md) · [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)

---

## Purpose

Define how every vendor adapter **extends `AdapterBase`** to inherit shared SDK behaviour while implementing domain-specific translation. This pattern ensures Plane, Kimai, Paperless, Zammad, and all future OSS integrations share identical cross-cutting semantics.

---

## Pattern overview

```text
Capability Service
       │
       │  calls domain interface (e.g. PlaneAdapterPort)
       ▼
Vendor Adapter class extends AdapterBase
       │
       ├── SDK: ConnectionManager, AuthenticationProvider, IntegrationClient
       ├── SDK: RetryPolicy, CircuitBreaker, RateLimitPolicy
       ├── SDK: HealthProvider, DiagnosticsProvider, VersionProvider
       ├── SDK: ErrorTranslator, Telemetry, Metrics, Logging
       ├── SDK: UserMappingProvider, PermissionMappingProvider, EntityMappingProvider
       └── Vendor Client (internal): thin REST path wrappers using IntegrationClient
       │
       ▼
Vendor REST API
```

---

## Responsibilities split

| Concern                                              | Owner                                     |
| ---------------------------------------------------- | ----------------------------------------- |
| Business validation, permissions, audit, events      | Capability Service                        |
| Connection, auth, retry, circuit breaker, rate limit | Integration SDK (`AdapterBase`)           |
| Vendor DTO ↔ APZHUB DTO mapping                      | Vendor Adapter domain methods             |
| Raw HTTP paths and vendor payload shapes             | Internal vendor client only               |
| Health, diagnostics, lifecycle hooks                 | `AdapterBase` defaults + vendor overrides |

**Vendor adapters contain no business rules.** If a rule applies across tenants or products, it belongs in the Capability Service.

---

## Class structure (conceptual)

```typescript
// integrations/plane/src/plane-adapter.ts — illustrative

class PlaneAdapter extends AdapterBase implements PlaneAdapterPort {
  private readonly planeClient: PlaneClient;

  constructor(deps: PlaneAdapterDependencies) {
    super(deps.adapterBase);
    this.planeClient = new PlaneClient(deps.client); // uses SDK IntegrationClient
  }

  async listProjects(ctx: IntegrationRequestContext): Promise<ProjectListResult> {
    const connection = await this.connectionManager.acquire(ctx);
    try {
      const raw = await this.planeClient.listProjects(connection, ctx);
      return this.mapProjectList(raw);
    } catch (error) {
      throw this.errorTranslator.translate(error, { integrationId: "plane", ctx });
    } finally {
      await this.connectionManager.release(connection);
    }
  }

  // AdapterBase overrides — only when vendor-specific probe needed
  protected async performHealthChecks(
    ctx: IntegrationRequestContext,
  ): Promise<readonly HealthCheckItem[]> {
    return [
      ...(await super.performHealthChecks(ctx)),
      await this.checkWorkspaceScope(ctx),
    ];
  }
}
```

---

## Construction and dependency injection

Adapters are constructed via a **factory** registered at platform bootstrap:

| Dependency              | Source                                 |
| ----------------------- | -------------------------------------- |
| `ConfigurationProvider` | `@apzhub/config`                       |
| `FeatureFlagProvider`   | `@apzhub/platform-governance`          |
| `IntegrationClient`     | SDK factory (REST transport)           |
| Mapping providers       | SDK + platform PostgreSQL repositories |
| Logger / metrics        | SDK observability module               |

Capability Services receive the adapter through **interface injection** — never `new PlaneAdapter()` in service code outside integration package wiring.

---

## Internal vendor client rules

Each integration may include an internal `{Engine}Client` class:

| Rule      | Requirement                                     |
| --------- | ----------------------------------------------- |
| Location  | `integrations/{engine}/src/` only               |
| Transport | Must use SDK `IntegrationClient`                |
| Imports   | Never imported outside `integrations/{engine}/` |
| Naming    | `{Engine}Client` — internal, not user-facing    |
| Tests     | Contract tests with mocked SDK client           |

---

## Lifecycle hooks

`AdapterBase` provides default lifecycle behaviour:

| Event         | Default behaviour                      | Vendor override                      |
| ------------- | -------------------------------------- | ------------------------------------ |
| `onEnable`    | Validate config, warm connection pool  | Add engine-specific scope validation |
| `onDisable`   | Drain connections, open circuit        | Pause webhooks                       |
| `onProvision` | Call abstract `provisionVendorScope()` | Engine workspace/customer creation   |
| `onReconcile` | Compare mapping store vs engine        | Report drift                         |
| `onShutdown`  | Release all connections gracefully     | Cancel polling registrations         |

---

## Error handling

All vendor adapter methods:

1. Catch vendor-specific errors inside adapter boundary
2. Pass through `ErrorTranslator` before returning to Capability Service
3. Never throw raw HTTP errors or vendor JSON to service layer

Capability Services handle only `IntegrationError` typed categories.

---

## Testing pattern

| Layer               | Test type                                  |
| ------------------- | ------------------------------------------ |
| SDK (`AdapterBase`) | Unit tests with mocked providers           |
| Vendor adapter      | Contract tests vs mock `IntegrationClient` |
| Vendor adapter      | Integration tests vs engine test instance  |
| Capability Service  | Service tests vs mock adapter interface    |
| E2E                 | No direct vendor API calls (015)           |

---

## Anti-patterns (prohibited)

| Anti-pattern                              | Why                                |
| ----------------------------------------- | ---------------------------------- |
| Service imports `PlaneClient`             | Bypasses adapter boundary          |
| Module calls adapter                      | Layer violation (008)              |
| Adapter implements permission checks      | Belongs in service + Authorization |
| Adapter publishes platform events         | Service publishes (029)            |
| Duplicate retry/circuit logic per adapter | Use SDK policies                   |
| Hardcoded config in adapter               | Use `ConfigurationProvider`        |

---

## First implementation

**Plane** (`integrations/plane/`) is the reference adapter after OSS-100-01 delivers SDK core. OSS-101-04 implements `PlaneAdapter extends AdapterBase` — not before.

---

## Related

- [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)
- [Connection Lifecycle](./APZHUB-Integration-Connection-Lifecycle.md)
- [PlaneAdapter Specification](../specs/APZHUB-PlaneAdapter-Specification.md)
