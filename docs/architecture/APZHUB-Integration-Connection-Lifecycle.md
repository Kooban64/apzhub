# APZHUB Integration Connection Lifecycle

**Milestone:** OSS-100  
**Status:** Canonical connection model  
**Authority:** [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md) · [API Gateway Standards 010](../010-api-gateway-integration-communication-standards.md)

---

## Purpose

Define the **connection lifecycle** managed by `ConnectionManager` in the Platform Integration SDK. Every vendor adapter acquires and releases connections through this model — no ad-hoc HTTP clients per request.

---

## Connection states

```text
                    ┌─────────────┐
                    │    idle     │◄────────────────┐
                    └──────┬──────┘                 │
                           │ acquire()              │ release()
                           ▼                        │
                    ┌─────────────┐                 │
              ┌────►│ connecting  │                 │
              │     └──────┬──────┘                 │
              │            │ auth OK               │
              │            ▼                        │
              │     ┌─────────────┐    invalidate   │
              │     │    ready    │─────────────────┤
              │     └──────┬──────┘                 │
              │            │ auth fail / probe fail  │
              │            ▼                        │
              │     ┌─────────────┐                 │
              └─────│  degraded   │─────────────────┘
                    └──────┬──────┘
                           │ unrecoverable
                           ▼
                    ┌─────────────┐
                    │   failed    │
                    └──────┬──────┘
                           │ shutdown / disable
                           ▼
                    ┌─────────────┐
                    │   closed    │
                    └─────────────┘
```

| State        | Meaning                                           | Requests allowed                |
| ------------ | ------------------------------------------------- | ------------------------------- |
| `idle`       | Pooled connection available                       | Yes — after transition to ready |
| `connecting` | Auth or handshake in progress                     | No — wait or timeout            |
| `ready`      | Authenticated, probe passed                       | Yes                             |
| `degraded`   | Partial failure — cached auth or elevated latency | Read-only if policy allows      |
| `failed`     | Unrecoverable for tenant                          | No — fail fast                  |
| `closed`     | Drained on disable/shutdown                       | No                              |

---

## Lifecycle operations

### Acquire

1. Resolve tenant integration profile via `ConfigurationProvider`
2. Check integration enabled via `FeatureFlagProvider`
3. Check circuit breaker — reject if `open`
4. Reuse pooled connection if valid (auth not expired, state `ready`)
5. Otherwise transition to `connecting` → authenticate via `AuthenticationProvider`
6. Optional version probe via `VersionProvider`
7. Return `ManagedConnection` with correlation ID

### Release

- Return connection to pool if still valid
- Close if expired, invalidated, or pool at capacity (LRU eviction)

### Invalidate

Triggered by:

- Authentication failure (401/403 from vendor)
- Configuration change event
- Lifecycle `onDisable`
- Manual operator action via control plane
- Version incompatibility detected

All in-flight requests on invalidated connection fail with `authentication` or `vendor_unavailable` — never stale credentials.

---

## Tenant scoping

Each connection is scoped to:

| Dimension       | Required                                |
| --------------- | --------------------------------------- |
| `tenantId`      | Yes                                     |
| `integrationId` | Yes                                     |
| `vendorScopeId` | When provisioned (workspace, org, etc.) |

Cross-tenant connection reuse is **prohibited**.

---

## Pooling strategy

| Setting                    | Default            | Notes                        |
| -------------------------- | ------------------ | ---------------------------- |
| Max connections per tenant | 4                  | Configurable per integration |
| Idle timeout               | 5 min              | Vendor-dependent tuning      |
| Auth refresh buffer        | 60 s before expiry | Proactive refresh            |
| Connect timeout            | 10 s               | Per 010                      |
| Request timeout            | 30 s               | Override per call            |

Long-running operations use async jobs (012) — not held connections.

---

## Transport-specific behaviour

| Transport        | Connection semantics                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| REST             | Pooled HTTP keep-alive via SDK client                                     |
| Webhook          | No outbound connection — inbound only; signature verification per request |
| Polling          | Scheduled worker acquires connection per poll cycle                       |
| GraphQL (future) | Same pool as REST; single endpoint                                        |

---

## Observability

Every state transition emits:

- Structured log (no secrets)
- Metric: `integration.connection.transition` with `from`, `to`, `integrationId`
- Trace span on acquire/release path

Correlation ID from `IntegrationRequestContext` attached to all connection events.

---

## Degraded and fallback modes

When vendor unavailable but read cache acceptable (Capability Service policy):

1. `ConnectionManager` reports `degraded`
2. `HealthProvider` returns `degraded` with reason
3. Capability Service decides: serve cache, queue write, or fail closed
4. SDK does **not** implement business fallback — only reports state

See [Adapter Boundary Pattern](./APZHUB-Adapter-Boundary-Pattern.md) fallback section.

---

## Related

- [Health & Diagnostics Model](./APZHUB-Integration-Health-Diagnostics-Model.md)
- [Platform Integration SDK Architecture](./APZHUB-Platform-Integration-SDK-Architecture.md)
