# APZHUB Platform Integration SDK Architecture

**Milestone:** OSS-100  
**Status:** **Canonical** — mandatory for all OSS adapter implementation  
**Type:** Planning and architecture only — no SDK code in OSS-100  
**Authority:** [Integration SDK 026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [Adapter Boundary Pattern](./APZHUB-Adapter-Boundary-Pattern.md) · [Capability Abstraction Standard](./APZHUB-Capability-Abstraction-Standard.md) · [OSS Integration Standards](../governance/APZHUB-OSS-Integration-Standards.md)

---

## Purpose

Define the **Platform Integration SDK** — the canonical framework every OSS adapter must consume. The SDK sits between Capability Services and vendor-specific adapters, providing shared connection, authentication, resilience, observability, health, diagnostics, lifecycle, and error translation contracts.

**Rule:** Products must **never** call vendor APIs directly. All engine communication flows through the Integration SDK boundary.

Plane is the **first consumer** after OSS-100 implementation (OSS-100-01+). Kimai, Paperless, Zammad, Metabase, n8n, Grafana, Greenbone, MobSF, and Faraday **reuse the same SDK** — no per-engine reinvention of cross-cutting adapter concerns.

---

## Architectural position

```text
Workbench Module (presentation)
        │
        ▼
Capability Service (business logic — ProjectService, DocumentService, …)
        │
        ▼
Platform Integration SDK (@apzhub/integration-sdk)   ← OSS-100 defines this
        │
        ▼
Vendor Adapter (PlaneAdapter, KimaiAdapter, …)       ← extends AdapterBase
        │
        ▼
Vendor REST / Webhook / Polling API
```

| Layer              | Owns                                                       | Must not                                 |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------- |
| Module             | UI, navigation, commands                                   | Call adapter or vendor API               |
| Capability Service | Orchestration, validation, permissions, events             | Import vendor client                     |
| Integration SDK    | Connection, auth, resilience, telemetry, health, errors    | Business rules                           |
| Vendor Adapter     | Entity mapping, vendor DTO translation, domain API surface | UI, platform permissions                 |
| Vendor Engine      | Domain SoR                                                 | Platform identity, user-visible branding |

This extends Document 026 with **implementation-grade SDK contracts** without duplicating manifest schema (026 remains manifest authority).

---

## Planned package

| Item                | Value                                                       |
| ------------------- | ----------------------------------------------------------- |
| Package             | `@apzhub/integration-sdk`                                   |
| Location            | `packages/integration-sdk/` (implementation in OSS-100-01+) |
| Consumers           | All `integrations/{engine}/` vendor adapters                |
| Forbidden consumers | Modules, Workbench UI, Capability Service domain logic      |

Capability Services depend on **adapter interfaces** declared in their specs; vendor adapters implement those interfaces **using** the Integration SDK internally.

---

## SDK component model

The Integration SDK is composed of **providers**, **policies**, **cross-cutting services**, and **base types**. Vendor adapters compose these; they do not reimplement them.

### Core runtime

| Component                | Responsibility                                          |
| ------------------------ | ------------------------------------------------------- |
| `IntegrationClient`      | Abstract transport facade — REST today, GraphQL future  |
| `ConnectionManager`      | Connection lifecycle, pooling, tenant-scoped sessions   |
| `AuthenticationProvider` | Token, API key, OAuth service-account, SSO bridge hooks |
| `ConfigurationProvider`  | Typed config from `@apzhub/config` + tenant overrides   |
| `FeatureFlagProvider`    | Governance-gated capability and integration toggles     |

### Resilience

| Component         | Responsibility                           |
| ----------------- | ---------------------------------------- |
| `RetryPolicy`     | Idempotent retry with backoff (012, 010) |
| `CircuitBreaker`  | Fail-fast on sustained vendor failures   |
| `RateLimitPolicy` | Respect vendor and platform rate limits  |

### Observability

| Component   | Responsibility                                     |
| ----------- | -------------------------------------------------- |
| `Telemetry` | Correlation ID propagation end-to-end (010)        |
| `Metrics`   | Latency, error rate, saturation counters           |
| `Logging`   | Structured logs — no secrets, no raw vendor bodies |

### Platform participation

| Component                | Responsibility                                           |
| ------------------------ | -------------------------------------------------------- |
| `HealthProvider`         | Structured health for operations control plane (014)     |
| `DiagnosticsProvider`    | Bootstrap diagnostics extension payloads                 |
| `VersionProvider`        | Engine version probe and compatibility gate              |
| `LifecycleParticipant`   | Enable/disable, provision, reconcile, shutdown (PRH-009) |
| `CapabilityRegistration` | Manifest-driven registration with Platform Runtime       |
| `ErrorTranslator`        | Vendor errors → platform typed categories (010)          |

### Adapter foundation

| Component     | Responsibility                                                      |
| ------------- | ------------------------------------------------------------------- |
| `AdapterBase` | Abstract base class composing all SDK providers for vendor adapters |

Detailed interface contracts: [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md).

---

## Standard transport contracts

| Contract | Status                | Use                                                                  |
| -------- | --------------------- | -------------------------------------------------------------------- |
| REST     | Required (OSS-100-01) | Primary OSS engine transport                                         |
| Webhook  | Required              | Inbound vendor events (signed, idempotent)                           |
| Polling  | Required              | Engines without reliable webhooks                                    |
| GraphQL  | Future                | Optional transport — interface reserved, no implementation in Wave 1 |

Webhook and polling are **SDK-level contracts**; vendor adapters declare supported modes in `integration.yaml`.

---

## Mapping contracts (adapter-internal)

These are **SDK-defined interfaces** implemented per vendor in the adapter layer — never exposed to UI or gateway responses.

| Contract           | Purpose                                      |
| ------------------ | -------------------------------------------- |
| User mapping       | Platform user ID ↔ vendor principal          |
| Permission mapping | Platform permission ↔ vendor role/capability |
| Entity mapping     | Platform global ID ↔ vendor entity ID        |

Mapping stores are platform PostgreSQL metadata (011) — owned by adapter package, accessed only through SDK abstractions.

---

## Relationship to existing documents

| Document                                | Relationship                                                 |
| --------------------------------------- | ------------------------------------------------------------ |
| 026 Integration SDK                     | Manifest schema and integration types — **unchanged**        |
| Adapter Boundary Pattern (OSS-002)      | 13 adapter responsibilities — **implemented via SDK**        |
| PlaneAdapter Specification (OSS-101-01) | First domain adapter — **must consume SDK after OSS-100-01** |
| OSS Integration Standards               | Mandatory consumption of Integration SDK for all OSS waves   |

OSS-100 **does not** replace 026. It **implements** the runtime framework implied by 026 and OSS-002.

---

## Sequencing

```text
OSS-100     Platform Integration SDK architecture (this milestone) ✅ planning
OSS-100-01  SDK package implementation (core)
OSS-100-02… SDK completion phases (see backlog)
OSS-101-04  Plane adapter foundation — **requires OSS-100-01 minimum**
OSS-201+    Kimai, Paperless, Zammad, … — reuse SDK
```

**OSS-101-04 must not begin until OSS-100-01 is approved and delivers core SDK contracts.**

---

## Non-goals (OSS-100)

| Item                        | Phase                        |
| --------------------------- | ---------------------------- |
| SDK package code            | OSS-100-01+                  |
| Plane adapter               | OSS-101-04+                  |
| REST client implementation  | OSS-100-01+                  |
| GraphQL transport           | Future wave                  |
| Platform Core modifications | Not required for SDK package |

---

## Related

- [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)
- [Base Adapter Pattern](./APZHUB-Base-Adapter-Pattern.md)
- [Connection Lifecycle](./APZHUB-Integration-Connection-Lifecycle.md)
- [Health & Diagnostics Model](./APZHUB-Integration-Health-Diagnostics-Model.md)
- [Error Translation Model](./APZHUB-Integration-Error-Translation-Model.md)
- [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md)
- [OSS-100 Completion Report](../sprint/OSS-100-completion-report.md)
