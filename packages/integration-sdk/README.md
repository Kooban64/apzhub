# @apzhub/integration-sdk

Platform Integration SDK — shared foundation for all APZHUB OSS and vendor adapters.

**Version:** 1.0.0 · **Architecture Frozen** (OSS-100-11)  
**Authority:** [Integration SDK Reference Standard](../../docs/architecture/APZHUB-Integration-SDK-Reference-Standard.md) · [Freeze Notice](../../docs/architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md)

---

## Purpose

This package provides core types, authentication, connection management, shared HTTP transport, mapping infrastructure, webhook/polling contracts, adapter development harness/certification, and placeholder implementations used by every integration under `integrations/`. Capability Services depend on vendor adapter interfaces; vendor adapters consume this SDK internally.

```text
Capability Service → Vendor Adapter → Integration SDK → SecretProvider
                                              ↓
                                    HTTP Transport (OSS-100-06)
                                              ↓
                                    Mapping Framework (OSS-100-07)
                                              ↓
                                    Webhook & Polling (OSS-100-08)
                                              ↓
                                    Harness & Certification (OSS-100-09)
                                              ↓
                                    v1.0 Certification (OSS-100-10)
                                              ↓
                                    v1.0.0 Architecture Freeze (OSS-100-11)
```

---

## Exports

| Import path                             | Contents                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| `@apzhub/integration-sdk`               | Root barrel — all public SDK surface                                                |
| `@apzhub/integration-sdk/auth`          | Authentication provider, credential resolver, secret providers                      |
| `@apzhub/integration-sdk/connection`    | Connection manager, registry, lifecycle                                             |
| `@apzhub/integration-sdk/health`        | HealthProvider, check aggregation                                                   |
| `@apzhub/integration-sdk/version`       | VersionProvider, compatibility                                                      |
| `@apzhub/integration-sdk/diagnostics`   | Unified DiagnosticsProvider                                                         |
| `@apzhub/integration-sdk/lifecycle`     | LifecycleParticipant, platform bridge                                               |
| `@apzhub/integration-sdk/client`        | `IntegrationClient` + `createHttpIntegrationClient`                                 |
| `@apzhub/integration-sdk/transport`     | Shared HTTP transport, policies, mock transport                                     |
| `@apzhub/integration-sdk/mapping`       | Mapping Provider Framework (registry, pipeline, transformers)                       |
| `@apzhub/integration-sdk/events`        | Webhook & polling contracts, source envelope, pipelines                             |
| `@apzhub/integration-sdk/harness`       | Adapter development harness, certification, compliance, mocks, scaffold, CI helpers |
| `@apzhub/integration-sdk/adapter`       | `AdapterBase` interface + placeholder                                               |
| `@apzhub/integration-sdk/errors`        | Error model, codes, `SdkResult`, `ErrorTranslator`                                  |
| `@apzhub/integration-sdk/resilience`    | Circuit breaker + `DefaultRetryPolicy`                                              |
| `@apzhub/integration-sdk/observability` | Metrics contracts, integration logger                                               |

---

## OSS-100-11

- **`@apzhub/integration-sdk` v1.0.0** promoted · **Architecture Frozen**
- Outcome: **`PRODUCTION_READY_WITH_LIMITATIONS`** retained
- Command: `pnpm certify:integration-sdk` · ADR-0065
- No breaking changes vs 0.9.0 · no new providers · no Event Bus / ingress / provisioning
- Limitations unchanged: no Event Bus, no webhook ingress, no provisioning, no durable checkpoint/dedup stores, PlaceholderVault only, prefer subpath imports

## OSS-100-10

- Formal **v1.0 Certification & Release Readiness** pack (governance; package remained **0.9.0** until OSS-100-11)
- Hard blockers: **none** · recommended promotion executed under OSS-100-11
- Plane/Zammad re-cert via `testing/sdk-v1` (15 / 11 caps; 0 architecture fails)

See [SDK-V1-CERTIFICATION.md](./docs/SDK-V1-CERTIFICATION.md) · [SDK-API-AUDIT.md](./docs/SDK-API-AUDIT.md) · [SDK-SECURITY-AUDIT.md](./docs/SDK-SECURITY-AUDIT.md) · [SDK-RELEASE-READINESS.md](./docs/SDK-RELEASE-READINESS.md) · [SDK-PUBLIC-API.md](./docs/SDK-PUBLIC-API.md) · [SDK-COMPATIBILITY.md](./docs/SDK-COMPATIBILITY.md) · [OSS-100-10 Completion Report](../../docs/sprint/OSS-100-10-completion-report.md).

---

## OSS-100-09

- `AdapterHarness` — boot/configure/cleanup `MockAdapter` + fixtures
- `AdapterCertification` — Architecture → QualityGates category reports
- `AdapterCompliance` — Reference Adapter Standard layout/dependency assessment
- `AdapterContractSuite`, `AdapterBoundaryValidator`, `AdapterValidator`
- `AdapterMockHarness` — scripted HTTP + webhook/polling mocks
- `scaffoldAdapter` / `REFERENCE_ADAPTER_TEMPLATE` — in-memory package scaffold
- Quality reports, documentation generator, compatibility/performance helpers, CI bundles
- Plane/Zammad thin wrappers (`create*AdapterHarness`, `certify*WithSdkHarness`) — versions stay **0.6.0**
- **No** provisioning, Event Bus, HTTP ingress, workers/schedulers, or new domain adapters

See [ADAPTER-HARNESS.md](./docs/ADAPTER-HARNESS.md) · [CERTIFICATION-FRAMEWORK.md](./docs/CERTIFICATION-FRAMEWORK.md) · [COMPLIANCE-FRAMEWORK.md](./docs/COMPLIANCE-FRAMEWORK.md) · [MOCK-HARNESS.md](./docs/MOCK-HARNESS.md) · [CONTRACT-TESTS.md](./docs/CONTRACT-TESTS.md) · [SCAFFOLD-GENERATOR.md](./docs/SCAFFOLD-GENERATOR.md) · [QUALITY-REPORTS.md](./docs/QUALITY-REPORTS.md) · [CI-INTEGRATION.md](./docs/CI-INTEGRATION.md).

---

## OSS-100-08

- `IntegrationSourceEvent` canonical envelope + schema versioning (`1.0.0`)
- Identity precedence, deduplication store (in-memory for tests), replay protection
- `WebhookManager` / `asWebhookManager`, verification, `WebhookProcessingPipeline`
- `PollingSource` / `createPollingSourceFromSync`, cursors, checkpoints (propose/ack), `PollingExecutionPipeline`
- Diagnostics, metrics, capability helpers, mocks, `IntegrationEventEnvelope` bridge
- Plane/Zammad thin wrappers (adapter versions stay **0.6.0**)
- **No** HTTP ingress, Event Bus publish, workers, or schedulers

See [EVENT-ENVELOPE.md](./docs/EVENT-ENVELOPE.md) · [EVENT-DEDUPLICATION.md](./docs/EVENT-DEDUPLICATION.md) · [WEBHOOK-CONTRACTS.md](./docs/WEBHOOK-CONTRACTS.md) · [WEBHOOK-VERIFICATION.md](./docs/WEBHOOK-VERIFICATION.md) · [WEBHOOK-PIPELINE.md](./docs/WEBHOOK-PIPELINE.md) · [POLLING-CONTRACTS.md](./docs/POLLING-CONTRACTS.md) · [POLLING-CURSORS.md](./docs/POLLING-CURSORS.md) · [POLLING-CHECKPOINTS.md](./docs/POLLING-CHECKPOINTS.md) · [WEBHOOK-POLLING-MIGRATION.md](./docs/WEBHOOK-POLLING-MIGRATION.md).

---

## OSS-100-07

- `MappingProvider` / `MappingRegistry` / `MappingPipeline`
- Profiles, directions, definitions, context, result, error, capabilities, diagnostics
- `FieldMapper`, `ValueTransformer`, `EnumMapper`, `IdentityMapper`, `RelationshipMapper`, `CollectionMapper`
- Provisional IDs `{prefix}_{integrationSlug}_{native}` — does **not** replace platform EntityMappingStore (ADR-0049)
- `createMockMappingProvider` for adapter tests
- Plane/Zammad register via `createPlaneMappingRegistry` / `createZammadMappingRegistry` (adapter versions stay 0.6.0)

See [MAPPING-FRAMEWORK.md](./docs/MAPPING-FRAMEWORK.md) · [MAPPING-PROFILES.md](./docs/MAPPING-PROFILES.md) · [MAPPING-REGISTRY.md](./docs/MAPPING-REGISTRY.md) · [MAPPING-TRANSFORMERS.md](./docs/MAPPING-TRANSFORMERS.md) · [MAPPING-MIGRATION.md](./docs/MAPPING-MIGRATION.md).

---

## OSS-100-06

- Shared HTTP `TransportClient` with request/response pipeline
- Policies: retry (default disabled), timeout, TLS config, compression, redirects, rate-limit stub
- Optional circuit-breaker interceptor (off by default — adapters keep CB in runners)
- Auth-neutral header hooks (`authHeadersProvider`, `defaultHeaders`)
- `createHttpIntegrationClient` bridge for Plane/Zammad migration parity
- `createMockTransport` for adapter tests

See [HTTP-TRANSPORT.md](./docs/HTTP-TRANSPORT.md) · [TRANSPORT-POLICIES.md](./docs/TRANSPORT-POLICIES.md) · [TRANSPORT-PIPELINE.md](./docs/TRANSPORT-PIPELINE.md) · [TRANSPORT-DIAGNOSTICS.md](./docs/TRANSPORT-DIAGNOSTICS.md) · [TRANSPORT-MIGRATION.md](./docs/TRANSPORT-MIGRATION.md).

---

## OSS-100-05

- `IntegrationAdapterBase` — abstract adapter composing full SDK
- `AdapterContext` — strongly typed dependency injection
- `CapabilityRegistration` — manifest-driven capability discovery
- `AdapterFactory` — deterministic construction and disposal
- `MockAdapter` — canonical reference implementation

See [ADAPTER-FRAMEWORK.md](./docs/ADAPTER-FRAMEWORK.md).

---

## OSS-100-04

- `ErrorTranslator` + vendor mapper registration
- `DefaultCircuitBreaker` with diagnostics (closed / open / half-open)
- Metrics contracts (`Counter`, `Gauge`, `Histogram`, `Timer`) + pluggable provider
- `IntegrationLogger` structured logging with correlation IDs
- Expanded runtime diagnostics (health, breaker, metrics, errors, registration, version)
- Operations stack wires all OSS-100-04 providers

See [ERROR-TRANSLATION-OBSERVABILITY.md](./docs/ERROR-TRANSLATION-OBSERVABILITY.md).

---

## OSS-100-03

- `HealthProvider` + `DefaultHealthProvider` — logical health check suite
- `DiagnosticsProvider` + `DefaultDiagnosticsProvider` — unified auth + connection + health
- `VersionProvider` + `DefaultVersionProvider` — metadata-based version compatibility
- `IntegrationLifecycleParticipant` + `DefaultLifecycleParticipant`
- `IntegrationAdapterLifecycleService` — adapter lifecycle state machine
- `createIntegrationOperationsStack` — wires all OSS-100-03 providers
- Platform lifecycle bridge (`toPlatformCapabilityParticipation`)

See [HEALTH-DIAGNOSTICS-LIFECYCLE.md](./docs/HEALTH-DIAGNOSTICS-LIFECYCLE.md).

---

## OSS-100-02

- `AuthenticationProvider` + `DefaultAuthenticationProvider`
- `CredentialResolver` + `DefaultCredentialResolver`
- `SecretProvider` — `InMemorySecretProvider`, `PlaceholderVaultSecretProvider`
- `ConnectionManager` + `InMemoryConnectionRegistry`
- `ConnectionLifecycleService` — deterministic connection lifecycle
- Credential masking and safe diagnostics
- Structured SDK error codes for auth/connection failures

**No OAuth flows, Vault implementation, webhooks, or vendor-specific code in auth/connection.**

See [AUTHENTICATION.md](./docs/AUTHENTICATION.md) and [CONNECTION-MANAGEMENT.md](./docs/CONNECTION-MANAGEMENT.md).

---

## Usage

```typescript
import {
  DefaultAuthenticationProvider,
  DefaultCredentialResolver,
  InMemorySecretProvider,
  createConnectionManager,
  InMemoryConnectionRegistry,
} from "@apzhub/integration-sdk";

const secretProvider = new InMemorySecretProvider({
  secrets: { "cred/token": "example-token" },
});
const auth = new DefaultAuthenticationProvider({
  credentialResolver: new DefaultCredentialResolver({ secretProvider }),
});
const manager = createConnectionManager({
  registry: new InMemoryConnectionRegistry(),
  authenticationProvider: auth,
});

await manager.register(
  {
    connectionId: "conn-example",
    tenantId: "tenant-001",
    integrationId: "example-engine",
    adapterId: "example-adapter",
    baseUrl: "https://engine.internal.example",
    authenticationMode: "bearer",
    credentialRef: "cred/token",
  },
  "corr-001",
);

await manager.open("conn-example", "corr-001");
```

---

## Roadmap

| Phase       | Feature                                                         | Status                                                              |
| ----------- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| OSS-100-03  | Health probe, version provider, platform lifecycle hooks        | Complete                                                            |
| OSS-100-05  | AdapterBase, factory, capability registration                   | Complete                                                            |
| OSS-100-06  | Shared HTTP transport                                           | Complete (v0.6.0)                                                   |
| OSS-100-07  | Mapping Provider Framework                                      | Complete (v0.7.0)                                                   |
| OSS-100-08  | Webhook & polling contracts                                     | Complete (v0.8.0)                                                   |
| OSS-100-09  | Adapter Development Harness & Certification                     | **Complete** (v0.9.0)                                               |
| OSS-100-10  | Integration SDK v1.0 Certification & Release Readiness          | **Complete** — `PRODUCTION_READY_WITH_LIMITATIONS` (remained 0.9.0) |
| OSS-100-11  | Integration SDK v1.0.0 Wave Certification & Architecture Freeze | **Complete** — **1.0.0** · **Architecture Frozen**                  |
| OSS-100-12+ | Provisioning (deferred) / Event Bus / ingress                   | Planned — await owner approval                                      |
| OSS-101-04  | Plane adapter                                                   | Complete (uses SDK transport + mapping + events + harness wrappers) |

See [Freeze Notice](../../docs/architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md) · [OSS-100-11 Completion Report](../../docs/sprint/OSS-100-11-completion-report.md) · [v1.0.0 Release Notes](../../docs/releases/APZHUB-Integration-SDK-v1.0.0-Release-Notes.md).

**Readiness:** certified `PRODUCTION_READY_WITH_LIMITATIONS`. Package version **1.0.0** · **Architecture Frozen**.

---

## Related

- [Event Envelope](./docs/EVENT-ENVELOPE.md)
- [Webhook / Polling Migration](./docs/WEBHOOK-POLLING-MIGRATION.md)
- [Mapping Framework](./docs/MAPPING-FRAMEWORK.md)
- [Mapping Migration](./docs/MAPPING-MIGRATION.md)
- [HTTP Transport](./docs/HTTP-TRANSPORT.md)
- [Transport Migration](./docs/TRANSPORT-MIGRATION.md)
- [Integration Authentication Architecture](../../docs/architecture/APZHUB-Integration-Authentication-Architecture.md)
- [Integration Connection Management Architecture](../../docs/architecture/APZHUB-Integration-Connection-Management.md)
- [Architecture index (v1 certification)](../../docs/architecture/APZHUB-Integration-SDK-V1-Certification.md)
- [Architecture index (harness)](../../docs/architecture/APZHUB-Integration-SDK-Adapter-Harness.md)
- [Architecture index (webhook/polling)](../../docs/architecture/APZHUB-Integration-SDK-Webhook-Polling.md)
- [Architecture index (mapping)](../../docs/architecture/APZHUB-Integration-SDK-Mapping-Framework.md)
- [Architecture index (transport)](../../docs/architecture/APZHUB-Integration-SDK-HTTP-Transport.md)
- [OSS-100 Backlog](../../docs/backlog/OSS-100-Platform-Integration-SDK-Backlog.md)
