# APZHUB Adapter Boundary Pattern

**Milestone:** OSS-002  
**Status:** Mandatory for all OSS-backed capabilities  
**Authority:** [Integration SDK 026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [Capability Abstraction Standard](./APZHUB-Capability-Abstraction-Standard.md)

---

## Purpose

Define how integration adapters must work at the boundary between APZHUB Capability Services and external OSS engines. The adapter is the **only** component permitted to speak the engine's native API.

```text
Capability Service  →  Adapter Interface  →  Integration Adapter  →  OSS Engine API
                              ↑
                    Never imported by Module UI
```

---

## Adapter responsibilities

Each OSS integration adapter must provide the following capabilities. All are declared in `integration.yaml` before code.

### 1. Connection configuration

- Read engine base URL, timeouts, and feature flags from `@apzhub/config`
- Support per-tenant connection profiles (governance-gated)
- Mask secrets in diagnostics and logs
- Validate configuration at startup and on config change events

### 2. Authentication bridge

- Service account or token-based auth per tenant — stored in Vault (PCv2-04)
- Silent SSO handoff for embedded views where applicable (Document 007)
- Token refresh and expiry handling
- Never expose engine credentials to modules or client

### 3. Provisioning bridge

- Create/update/deactivate engine-side tenant scope (workspace, customer, classification, etc.)
- Idempotent provisioning operations
- Map platform tenant ID → engine scope ID (connector-internal)
- Report provisioning status to Platform Provisioning service

### 4. User mapping

- Map platform user ID ↔ engine user/principal
- JIT provisioning of engine users on first access (where engine supports)
- Deactivate engine access on platform user deactivation
- Never sync engine user lists as platform SoR

### 5. Permission mapping

- Translate platform permissions → engine role/capability assignments
- Apply least privilege per tenant
- Never expose engine role names to UI or API responses
- Re-sync on permission change events

### 6. Entity mapping

- Bidirectional ID mapping: platform global ID ↔ engine internal ID
- Mapping table owned by adapter layer — never leak engine IDs to client unless opaque handles required
- Version mapping schema for migrations
- Support soft-delete and tombstone semantics

### 7. Health check

- Lightweight probe: connectivity, auth, required scopes
- Return structured health result for operations control plane
- Distinguish: healthy · degraded · unavailable
- Circuit breaker integration (010) on repeated failures

### 8. Diagnostics

- Self-report to bootstrap diagnostics loader extension
- Include: last sync, error counts, engine version, latency p95
- No PII or secrets in diagnostic payloads
- Correlation ID on diagnostic events

### 9. Lifecycle participation

- Register connector with platform lifecycle manager
- Graceful degradation when engine in maintenance
- Pause/resume sync on lifecycle state transitions
- Participate in controlled shutdown (PRH-009)

### 10. Error translation

- Map engine errors → platform typed error categories (010)
- Never forward raw engine stack traces or HTTP bodies to client
- Retryable vs non-retryable classification
- Audit security-relevant failures

### 11. Version compatibility

- Declare supported engine version range in `integration.yaml`
- Version probe at health check
- Warn/block on unsupported versions via governance
- Document breaking API changes per adapter release

### 12. Upgrade strategy

- Independent adapter version pin from engine version
- Rolling upgrade: adapter first, then engine (or documented reverse order)
- Contract tests gate adapter upgrades
- Rollback procedure documented per integration

### 13. Fallback behaviour

- Define degraded-mode behaviour when engine unavailable:
  - **Read cache** — serve stale platform cache where acceptable
  - **Queue writes** — outbox for async retry (PCv2-02)
  - **Fail closed** — reject mutations when consistency cannot be guaranteed
- User-facing message via platform envelope — never engine error text
- Fallback mode reported in diagnostics and control plane

---

## Adapter interface contract

```typescript
// Illustrative — not production code
interface IntegrationAdapter {
  readonly integrationId: string;
  configure(context: AdapterContext): Promise<void>;
  health(): Promise<AdapterHealthResult>;
  provision(tenantId: string, spec: ProvisionSpec): Promise<ProvisionResult>;
  // Domain methods delegated by Capability Service only
}
```

- Adapters are **stateless** where practical; state in platform DB or engine
- Adapters contain **no business rules** — orchestration and validation in Capability Service
- Adapters are **internal** — not exposed via API Gateway

---

## Testing requirements

| Test type                | Scope                                |
| ------------------------ | ------------------------------------ |
| Contract tests           | Adapter interface vs mock engine     |
| Integration tests        | Adapter vs engine test instance      |
| Error translation tests  | Every mapped error category          |
| Health probe tests       | Healthy, degraded, unavailable paths |
| Provisioning idempotency | Duplicate provision calls            |

---

## Native capabilities — no OSS adapter

Native capabilities (e.g. Quality Engineering) use an **internal engine boundary** behind the Capability Service — same service interface, no `integration.yaml`. Internal modules must not be imported by Workbench UI directly.

---

## Related

- [Capability Abstraction Standard](./APZHUB-Capability-Abstraction-Standard.md)
- [Integration SDK 026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md)
- [OSS Integration Standards](../governance/APZHUB-OSS-Integration-Standards.md)
