# Adapter Framework (OSS-100-05)

**Package:** `@apzhub/integration-sdk` v0.5.0  
**Authority:** [Base Adapter Pattern](../../docs/architecture/APZHUB-Base-Adapter-Pattern.md)

---

## Overview

OSS-100-05 delivers the vendor-neutral adapter foundation every APZHUB integration extends:

| Component | Purpose |
|-----------|---------|
| `IntegrationAdapterBase` | Abstract class composing the full SDK |
| `AdapterContext` | Strongly typed dependency injection container |
| `CapabilityRegistration` | Manifest-driven capability discovery |
| `AdapterFactory` | Deterministic adapter construction and disposal |
| `MockAdapter` | Canonical reference implementation |

The legacy `AdapterBase` **interface** and `PlaceholderAdapterBase` remain unchanged for backward compatibility.

---

## IntegrationAdapterBase

Extend this class for all vendor adapters:

```typescript
import {
  IntegrationAdapterBase,
  buildAdapterContext,
  type AdapterBootstrapConfiguration,
} from "@apzhub/integration-sdk/adapter";

class ExampleAdapter extends IntegrationAdapterBase {
  constructor(context: AdapterContext, configuration: AdapterBootstrapConfiguration) {
    super(context, configuration);
  }

  protected override async onPerformHealthChecks(context) {
    return [
      ...(await super.onPerformHealthChecks(context)),
      { name: "custom_check", status: "pass", message: "Custom probe passed" },
    ];
  }
}
```

### Lifecycle methods

| Method | Purpose |
|--------|---------|
| `initialise()` | Validate configuration and run vendor hooks |
| `connect(context)` | Register and open logical connection |
| `disconnect(context)` | Close logical connection |
| `validateConfiguration()` | Manifest and connection validation |
| `performHealthCheck(context)` | Standard + vendor health checks |
| `collectDiagnostics(context)` | Unified runtime diagnostics |
| `dispose(reason)` | Idempotent resource cleanup |

### Protected SDK access

- `authenticationProvider`
- `connectionManager`
- `healthManager`
- `diagnosticsManager`
- `versionManager`
- `errorTranslator`
- `circuitBreaker`
- `metrics` / `metricsProvider`
- `logger`
- `errorSummary`

---

## AdapterContext

Built via `buildAdapterContext()` — wires auth, connection, health, diagnostics, observability, and lifecycle services.

```typescript
const context = buildAdapterContext({
  configuration: {
    manifest: { /* integrationId, adapterId, declaredCapabilities, ... */ },
    connection: { /* optional defaults */ },
  },
  secretProvider,
  clock,
});
```

---

## Capability registration

```typescript
import {
  createInMemoryCapabilityRegistration,
  INTEGRATION_CAPABILITIES,
} from "@apzhub/integration-sdk/adapter";

const registry = createInMemoryCapabilityRegistration();
registry.register(manifest);

registry.discover({ capabilityId: "projects" });
registry.hasCapability("mock-engine", "health");
```

Supported capability identifiers:

`authentication`, `health`, `diagnostics`, `projects`, `tickets`, `documents`, `analytics`, `time_tracking`, `workflow`, `notifications`, `search`

---

## AdapterFactory

```typescript
import { createAdapterFactory, MockAdapter } from "@apzhub/integration-sdk/adapter";

const factory = createAdapterFactory();

const { adapter, context, registration } = await factory.createMockAdapter({
  configuration: createMockAdapterManifest(),
  autoInitialise: true,
});

await factory.dispose(adapter);
```

---

## MockAdapter

Reference adapter exercising the complete SDK without external systems. See `createMockAdapterManifest()` and `adapter.test.ts` for patterns.

---

## Out of scope (OSS-100-05)

- Plane, Zammad, Kimai, or any vendor-specific adapter
- HTTP transport (OSS-100-06+)
- Production manifest file loading from disk (bootstrap wiring in platform runtime)

---

## Related

- [ERROR-TRANSLATION-OBSERVABILITY.md](./ERROR-TRANSLATION-OBSERVABILITY.md)
- [HEALTH-DIAGNOSTICS-LIFECYCLE.md](./HEALTH-DIAGNOSTICS-LIFECYCLE.md)
- [OSS-100-05 Completion Report](../../docs/sprint/OSS-100-05-completion-report.md)
