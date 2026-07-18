# Connection Management — @apzhub/integration-sdk

**Milestone:** OSS-100-02  
**Import:** `@apzhub/integration-sdk/connection`

---

## Purpose

Shared logical connection management for all integrations. **Open** means configuration and credentials are validated — no HTTP transport in OSS-100-02.

```text
ConnectionManager → ConnectionRegistry + ConnectionLifecycleService + AuthenticationProvider
```

---

## Lifecycle states

```text
unconfigured → configured → authenticating → connected → disconnected
                  ↓              ↓
            misconfigured   authentication_failed
                  ↓
               disabled / degraded
```

Invalid transitions return `integration.connection.invalid_lifecycle_transition`.

---

## Components

| Component                      | Responsibility                              |
| ------------------------------ | ------------------------------------------- |
| `ConnectionManager`            | Register, open, close, disable, diagnostics |
| `ConnectionRegistry`           | In-memory tenant-scoped connection store    |
| `ConnectionLifecycleService`   | Deterministic state transitions             |
| `validateConnectionDefinition` | Structured configuration validation         |

---

## Connection record

Safe metadata only — no raw secrets:

- `connectionId`, `tenantId`, `integrationId`, `adapterId`
- `baseUrl`, `authenticationMode`, `lifecycleState`
- `credentialRef` (reference, not value)
- Timestamps: `configuredAt`, `connectedAt`, `disconnectedAt`, `lastValidatedAt`

---

## Example

```typescript
import {
  createConnectionManager,
  InMemoryConnectionRegistry,
} from "@apzhub/integration-sdk/connection";

const manager = createConnectionManager({
  registry: new InMemoryConnectionRegistry(),
  authenticationProvider,
});

await manager.register(
  {
    connectionId: "conn-example",
    tenantId: "tenant-001",
    integrationId: "example-engine",
    adapterId: "example-adapter",
    baseUrl: "https://engine.internal.example",
    authenticationMode: "bearer",
    credentialRef: "cred/service-token",
  },
  "corr-001",
);

await manager.open("conn-example", "corr-001");
```

---

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [Integration Connection Management Architecture](../../../docs/architecture/APZHUB-Integration-Connection-Management.md)
