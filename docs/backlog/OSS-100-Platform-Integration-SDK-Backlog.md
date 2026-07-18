# OSS-100 Platform Integration SDK Backlog

**Milestone:** OSS-100 — planning backlog  
**Status:** Phased implementation plan — OSS-100-11 complete (`@apzhub/integration-sdk` **1.0.0** · **Architecture Frozen**; `PRODUCTION_READY_WITH_LIMITATIONS`)  
**Authority:** [Platform Integration SDK Architecture](../architecture/APZHUB-Platform-Integration-SDK-Architecture.md)

---

## Prerequisites

| Gate                       | Required before |
| -------------------------- | --------------- |
| OSS-100 planning complete  | OSS-100-01      |
| Platform Core v2 certified | OSS-100-01      |
| Owner approval             | Each phase      |

**OSS-101-04 (Plane adapter) requires OSS-100-05 minimum before start.**

---

## Numbering clarification (OSS-100-06)

Earlier drafts labelled **OSS-100-06** as “Webhook & polling contracts”. **Owner-approved OSS-100-06 is Shared HTTP Transport** (complete). Former webhook/polling scope is relocated to **OSS-100-08**.

---

## Numbering clarification (OSS-100-09) — owner approved

Older backlog labelled **OSS-100-09** as “Provisioning & upgrade compatibility” and **OSS-100-10** as “Test harness & adapter certification”.

**Owner-approved correction (same pattern as 100-06/08):**

| ID              | Older label                                   | Owner-approved meaning                                                | Status                                                            |
| --------------- | --------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **OSS-100-09**  | Provisioning                                  | **Adapter Development Harness & Certification Framework**             | ✅ Complete (v0.9.0)                                              |
| **OSS-100-10**  | Test harness (older) / Provisioning (interim) | **Integration SDK v1.0 Certification & Release Readiness**            | ✅ Complete (`PRODUCTION_READY_WITH_LIMITATIONS`; remained 0.9.0) |
| **OSS-100-11**  | Provisioning (older label)                    | **Integration SDK v1.0.0 Wave Certification & Architecture Freeze**   | ✅ Complete — **1.0.0** · **Architecture Frozen**                 |
| **OSS-100-12+** | —                                             | **Provisioning** (deferred) / Event Bus / ingress — owner may confirm | Planned                                                           |

Do not start provisioning, Event Bus, ingress, or next domain adapter without owner approval.

---

## Numbering clarification (OSS-100-10) — owner approved

**Owner-approved OSS-100-10 = Integration SDK v1.0 Certification & Release Readiness** (overrides older backlog “provisioning” for 100-10). Provisioning remains **deferred** (e.g. OSS-100-11+).

---

## Phase overview

| Phase | ID          | Theme                                                               | Status                                                            |
| ----- | ----------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 0     | OSS-100     | SDK architecture & specifications                                   | ✅ Complete                                                       |
| 1     | OSS-100-01  | Core package scaffold (types + placeholders)                        | ✅ Complete                                                       |
| 2     | OSS-100-02  | Authentication & connection foundation                              | ✅ Complete                                                       |
| 3     | OSS-100-03  | Health, diagnostics, version, lifecycle                             | ✅ Complete                                                       |
| 4     | OSS-100-04  | Error translation & observability                                   | ✅ Complete                                                       |
| 5     | OSS-100-05  | AdapterBase & capability registration                               | ✅ Complete                                                       |
| 6     | OSS-100-06  | **Shared HTTP Transport**                                           | ✅ Complete                                                       |
| 7     | OSS-100-07  | **Mapping Provider Framework**                                      | ✅ Complete                                                       |
| 8     | OSS-100-08  | Webhook & polling contracts                                         | ✅ Complete                                                       |
| 9     | OSS-100-09  | **Adapter Development Harness & Certification**                     | ✅ Complete (v0.9.0)                                              |
| 10    | OSS-100-10  | **Integration SDK v1.0 Certification & Release Readiness**          | ✅ Complete — `PRODUCTION_READY_WITH_LIMITATIONS`; remained 0.9.0 |
| 11    | OSS-100-11  | **Integration SDK v1.0.0 Wave Certification & Architecture Freeze** | ✅ Complete — **1.0.0** · **Architecture Frozen**                 |
| 12+   | OSS-100-12+ | Provisioning (deferred) / Event Bus / ingress                       | Planned — await owner                                             |

---

## OSS-100 — Platform Integration SDK (planning)

**Status:** ✅ **Complete** — [OSS-100 Completion Report](../sprint/OSS-100-completion-report.md)

**Deliverables:** SDK architecture, adapter specification, base adapter pattern, connection lifecycle, health/diagnostics model, error translation model, backlog.

**Stop condition:** ✅ Complete — await owner approval before OSS-100-01 or OSS-101-04.

---

## OSS-100-01 — Core package scaffold

**Status:** ✅ **Complete** — [OSS-100-01 Completion Report](../sprint/OSS-100-01-completion-report.md)

**Deliverables:** `@apzhub/integration-sdk` package, core types, interfaces, placeholder client/adapter/diagnostics, smoke tests, subpath exports.

**Stop condition:** ✅ Complete — await owner approval before OSS-100-02.

---

## OSS-100-02 — Authentication & connection foundation

**Status:** ✅ **Complete** — [OSS-100-02 Completion Report](../sprint/OSS-100-02-completion-report.md)

**Deliverables:** `AuthenticationProvider`, `CredentialResolver`, `SecretProvider` bridge, `ConnectionManager`, `ConnectionRegistry`, `ConnectionLifecycleService`, diagnostics, structured error codes, in-memory implementations, tests, documentation.

**Stop condition:** ✅ Complete — await owner approval before OSS-100-03.

---

## OSS-100-02 — Authentication & connection foundation (archive)

**Objective:** Implement authentication and logical connection management without HTTP transport.

**Scope (approved OSS-100-02):**

- Authentication modes at type level; static credential validation
- `CredentialResolver` + `InMemorySecretProvider` + Vault placeholder
- `ConnectionManager` + in-memory registry + lifecycle service
- Safe diagnostics and credential masking
- Subpath exports `/auth` and `/connection`

**Out of scope:** HTTP transport, retries, circuit breaker, Plane adapter, Vault, OAuth flows

**Stop condition:** Await approval before OSS-100-03.

---

## OSS-100-01 — Core package scaffold (archive)

**Objective:** Create `@apzhub/integration-sdk` package scaffold with core types and interfaces.

**Scope (approved OSS-100-01):**

- Package scaffold `packages/integration-sdk/`
- Core types: `ConnectionConfig`, `IntegrationCredentials`, `IntegrationCapabilityMetadata`, version compatibility
- `IntegrationClient` interface (placeholder — no HTTP)
- `AdapterBase` interface (placeholder health/diagnostics)
- `IntegrationHealth`, `IntegrationDiagnostics`, `IntegrationError`, `IntegrationLifecycleState`
- Subpath exports and smoke tests

**Out of scope:**

- HTTP transport (OSS-100-02)
- Vendor adapters
- Retry / circuit breaker
- Plane adapter

**Deliverables:**

- `@apzhub/integration-sdk` importable package
- OSS-100-01 completion report

**Stop condition:** Package scaffold reviewed; await approval before OSS-100-02.

---

## OSS-100-01 — Core package foundation (superseded scope note)

**Objective:** Create `@apzhub/integration-sdk` with connection management, configuration, and REST transport.

**Scope:**

- Package scaffold `packages/integration-sdk/`
- `IntegrationRequestContext`, `Connection`, `ConnectionManager`
- `ConfigurationProvider` bridge to `@apzhub/config`
- `IntegrationClient` REST implementation
- Connection lifecycle state machine
- Unit tests for connection pool and config bridge

**Out of scope:**

- Vendor adapters
- GraphQL transport
- Mapping stores
- Webhook receivers

**Platform capabilities consumed:**

- Configuration (`@apzhub/config`)
- Platform Runtime (types only)

**Tests:**

- Connection lifecycle unit tests
- Config provider tests
- REST client mock transport tests

**Deliverables:**

- `@apzhub/integration-sdk` core export
- OSS-100-01 completion report

**Stop condition:** Core SDK importable by integration packages; await approval before OSS-100-02.

---

## OSS-100-02 — Authentication & resilience (superseded — see archive above)

**Note:** Original backlog combined auth with resilience. **OSS-100-02 (approved)** delivered authentication and connection foundation only. Retry, circuit breaker, and rate limiting move to **OSS-100-04** (Resilience policies).

**Stop condition:** ✅ Complete — await owner approval before OSS-100-03.

---

**Stop condition:** ✅ Complete — await owner approval before OSS-100-04.

---

## OSS-100-03 — Health, diagnostics, version, lifecycle

**Status:** ✅ **Complete** — [OSS-100-03 Completion Report](../sprint/OSS-100-03-completion-report.md)

**Deliverables:** `HealthProvider`, `DiagnosticsProvider`, `VersionProvider`, `IntegrationLifecycleParticipant`, platform lifecycle bridge, `createIntegrationOperationsStack`, tests, documentation.

**Stop condition:** ✅ Complete — await owner approval before OSS-100-04.

---

## OSS-100-04 — Error translation & observability

**Status:** ✅ **Complete** — [OSS-100-04 Completion Report](../sprint/OSS-100-04-completion-report.md)

**Deliverables:** `ErrorTranslator`, `DefaultCircuitBreaker`, metrics contracts, `IntegrationLogger`, expanded runtime diagnostics, operations stack wiring, tests, documentation.

**Stop condition:** ✅ Complete — await owner approval before OSS-100-05.

---

## OSS-100-05 — AdapterBase & capability registration

**Status:** ✅ **Complete** — [OSS-100-05 Completion Report](../sprint/OSS-100-05-completion-report.md)

**Deliverables:** `IntegrationAdapterBase`, `AdapterContext`, `CapabilityRegistration`, `AdapterFactory`, `MockAdapter`, tests, documentation.

**Stop condition:** ✅ Complete — vendor adapters can extend AdapterBase; **OSS-101-04 may begin after owner approval**.

---

## OSS-100-05 — AdapterBase & capability registration (archive spec)

**Objective:** Ship `AdapterBase` abstract class and manifest registration helper.

**Scope:**

- `AdapterBase` composing all SDK providers
- `CapabilityRegistration` manifest bridge
- Factory pattern for adapter construction
- Reference implementation doc (not Plane — mock engine)

**Out of scope:**

- Plane adapter (OSS-101-04)
- Production mapping DB migrations

---

## OSS-100-06 — Shared HTTP Transport

**Status:** ✅ **Complete** — [OSS-100-06 Completion Report](../sprint/OSS-100-06-completion-report.md)

**Deliverables:** Shared HTTP `TransportClient`, policies (retry default disabled, timeout, TLS, compression, redirects, rate-limit stub), optional circuit-breaker interceptor, `createHttpIntegrationClient` bridge, `MockTransportClient`, Plane/Zammad migration with public API parity, package docs, architecture index.

**Package:** `@apzhub/integration-sdk` **v0.6.0** — export `@apzhub/integration-sdk/transport`.

**Stop condition:** ✅ Complete — await owner approval before **OSS-100-07**.

---

## OSS-100-06 — Shared HTTP Transport (archive spec)

**Objective:** Replace interim Plane/Zammad fetch clients with a reusable SDK transport without public adapter behaviour change.

**Scope (approved OSS-100-06):**

- `TransportClient` + request/response pipeline + policies + interceptors
- Auth-neutral header hooks; retries default `maxAttempts=1`
- Circuit breaker remains in operation runners; optional transport interceptor
- `createHttpIntegrationClient` with `errorLabel` Plane/Zammad
- `MockTransportClient` / `createMockTransport`
- Diagnostics, metrics, redacting logger

**Out of scope:** Webhooks, polling, binary transfer, OAuth, GraphQL, enabling retries by default

**Tests:** Transport suite + Plane/Zammad regression (211)

**Deliverables:**

- `@apzhub/integration-sdk` v0.6.0 transport module
- Package docs under `packages/integration-sdk/docs/TRANSPORT-*.md` / `HTTP-TRANSPORT.md`
- OSS-100-06 completion report

---

## OSS-100-07 — Mapping Provider Framework

**Status:** ✅ **Complete** — [OSS-100-07 Completion Report](../sprint/OSS-100-07-completion-report.md)

**Clarification — two mapping layers (do not conflate):**

| Layer                                                 | Location                                           | Role                                                                                                |
| ----------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **SDK Mapping Provider Framework** (this phase)       | `@apzhub/integration-sdk/mapping`                  | Adapter-level provider ↔ canonical translation (fields, enums, provisional IDs, registry, pipeline) |
| **Platform EntityMappingStore / MappingOrchestrator** | `@apzhub/platform-services` (ADR-0049; OSS-110-05) | Durable global ID bindings (SoR) — **UNTOUCHED** by OSS-100-07                                      |

Earlier backlog drafts described “User/Permission/Entity MappingProvider + PostgreSQL repositories”. Durable ID persistence already ships in platform-services. OSS-100-07 delivered the **SDK mapping framework** only; it does **not** duplicate or relocate EntityMappingStore.

**Deliverables:** MappingProvider, MappingRegistry, MappingPipeline, MappingDefinition/Profile/Context/Result/Error/Diagnostics/Capabilities, FieldMapper, ValueTransformer, RelationshipMapper, CollectionMapper, EnumMapper, IdentityMapper; export `@apzhub/integration-sdk/mapping`; Plane/Zammad wrappers (`createPlaneMappingRegistry` / `createZammadMappingRegistry`); package docs; architecture index.

**Package:** `@apzhub/integration-sdk` **v0.7.0**. Adapters remain **0.6.0**. Provisional ID format `{prefix}_{plane|zammad}_{native}` unchanged.

**Out of scope (confirmed):** Webhook/polling; EntityMappingStore changes; mapping admin UI; Platform Services / Gateway / Event Bus.

**Tests:** Mapping 25 (~98.7% lines); full SDK 123; Plane+Zammad 211; combined wave1/2/support + platform mapping regressions 358; lint + typecheck SDK PASS.

**Stop condition:** ✅ Complete — await owner approval before **OSS-100-08**.

---

## OSS-100-07 — Mapping Provider Framework (archive spec)

**Objective:** Reusable vendor-neutral mapping subsystem in the Integration SDK; adapters supply provider-specific rules.

**Scope (approved OSS-100-07):**

- `MappingProvider` / `MappingRegistry` / `MappingPipeline`
- Profiles, directions, definitions, context, result, error, capabilities, diagnostics
- FieldMapper, ValueTransformer, EnumMapper, IdentityMapper, RelationshipMapper, CollectionMapper
- Plane/Zammad thin wrappers; register on adapter init
- Mock mapping provider for tests

**Out of scope:** EntityMappingStore / MappingOrchestrator changes; webhooks; PostgreSQL migrations in SDK; UI

**Deliverables:**

- `@apzhub/integration-sdk` v0.7.0 mapping module
- Package docs under `packages/integration-sdk/docs/MAPPING-*.md`
- OSS-100-07 completion report

---

## OSS-100-08 — Webhook & polling contracts

**Status:** ✅ **Complete** — [OSS-100-08 Completion Report](../sprint/OSS-100-08-completion-report.md)

**Objective:** Inbound webhook and outbound polling contracts in the Integration SDK.

> **Relocation note:** This scope was previously labelled OSS-100-06 in early backlog drafts. Owner-approved OSS-100-06 delivered Shared HTTP Transport instead.

**Delivered (as implemented):**

- `IntegrationSourceEvent` envelope + identity/dedup + schema versioning
- `WebhookManager` / verification / replay / `WebhookProcessingPipeline` (not a full HTTP `WebhookReceiver`)
- `PollingSource` / cursors / checkpoints / `PollingExecutionPipeline` (not a `PollingScheduler`)
- Plane/Zammad thin wrappers; export `@apzhub/integration-sdk/events`
- ADRs 0052–0056

**Out of scope (confirmed absent):**

- HTTP webhook ingress / Platform Event Bus / workers / schedulers
- Production durable stores
- Plane/Zammad public API changes (versions stay 0.6.0)

**Stop condition:** ✅ Complete — await owner approval before **OSS-100-09** (Harness & Certification) or platform webhook-ingress / Event Bus.

---

## OSS-100-08 — Webhook & polling contracts (archive spec)

> Historical scope wording retained for traceability. Prefer the completion report for delivered shapes.

**Scope (approved OSS-100-08):**

- `WebhookReceiver` — signature verification, normalization → delivered as verifier + pipeline
- `PollingScheduler` — worker integration stub → **not** delivered; ADR-0056 keeps scheduling on platform
- `NormalizedVendorEvent` envelope → `IntegrationSourceEvent`
- Idempotency key handling → identity precedence + dedup store

**Out of scope:**

- Plane webhooks (OSS-101-08 — already delivered at adapter level)
- Production worker deployment

**Tests:**

- Webhook signature tests
- Polling cursor idempotency tests

**Deliverables:**

- Webhook/polling SDK modules
- OSS-100-08 completion report

**Stop condition:** ✅ Complete — await approval before OSS-100-09 (Harness).

---

## OSS-100-09 — Adapter Development Harness & Certification Framework

**Status:** ✅ **Complete** — [OSS-100-09 Completion Report](../sprint/OSS-100-09-completion-report.md)

> **Owner renumber note:** Older drafts labelled this ID as “Provisioning”. Owner-approved OSS-100-09 is **Harness & Certification**. Provisioning is deferred (see OSS-100-11+). Certification gate delivered as **OSS-100-10**.

**Delivered:**

- `@apzhub/integration-sdk` **v0.9.0** — export `/harness`
- `AdapterHarness`, `AdapterCertification`, `AdapterCompliance`, contract suite, boundary validator
- `AdapterMockHarness`, scaffold generator, quality reports, documentation generator, CI helpers
- Plane/Zammad thin wrappers; operations APIs unchanged (ADR-0057)
- Maturity at ship: **Release Candidate** (superseded maturity assessment by OSS-100-10)

**Out of scope (confirmed absent):**

- Provisioning / upgrade orchestration
- Platform Event Bus / HTTP ingress / workers / schedulers
- New business-domain adapters
- SDK v1.0 / Production Ready declaration (moved to OSS-100-10 certification)

**Stop condition:** ✅ Complete — proceeded to owner-approved **OSS-100-10** certification.

---

## OSS-100-09 — Provisioning & upgrade compatibility (SUPERSEDED LABEL)

> **Superseded.** Older backlog text for “OSS-100-09 = Provisioning” is retained below for traceability only. **Do not execute under ID 09.** See **OSS-100-11+** for deferred provisioning scope.

**Historical objective (relocated):** Provisioning bridge and upgrade policy evaluation.

**Historical scope:**

- `onProvision` / `onReconcile` full lifecycle
- `UpgradeCompatibilityPolicy`
- Integration with platform provisioning API
- Idempotent provision contract tests

---

## OSS-100-10 — Integration SDK v1.0 Certification & Release Readiness

**Status:** ✅ **Complete** — [OSS-100-10 Completion Report](../sprint/OSS-100-10-completion-report.md)

> **Owner numbering:** Owner-approved **OSS-100-10 = Integration SDK v1.0 Certification & Release Readiness** (overrides older backlog “provisioning” for 100-10).

**Delivered:**

- Formal certification pack: `SDK-V1-CERTIFICATION.md`, `SDK-API-AUDIT.md`, `SDK-SECURITY-AUDIT.md`, `SDK-RELEASE-READINESS.md`, `SDK-PUBLIC-API.md`, `SDK-COMPATIBILITY.md`
- Architecture index + ADR-0058 + foundation closeout
- Plane/Zammad re-cert via `testing/sdk-v1/integration-sdk-v1-recertification.test.ts`
- Outcome: **`PRODUCTION_READY_WITH_LIMITATIONS`**; package remains **0.9.0**

**Out of scope (confirmed):**

- Auto-bump to **1.0.0**
- Event Bus / HTTP ingress / provisioning implementation
- TypeScript production code changes

**Stop condition:** ✅ Complete — await owner for **1.0.0** promotion, provisioning (100-11+), Event Bus, ingress, or next domain adapter.

---

## OSS-100-10 — Provisioning & upgrade compatibility (SUPERSEDED LABEL)

> **Superseded for ID 100-10.** Interim drafts briefly relocated provisioning here after OSS-100-09 renumber. **Owner-approved OSS-100-10 is v1.0 Certification.** Provisioning remains deferred under **OSS-100-11+**.

**Historical objective (deferred):** Provisioning bridge and upgrade policy evaluation.

**Historical scope:**

- `onProvision` / `onReconcile` full lifecycle
- `UpgradeCompatibilityPolicy`
- Integration with platform provisioning API
- Idempotent provision contract tests

---

## OSS-100-10 — Test harness & certification (SUPERSEDED LABEL)

> **Superseded.** Older backlog labelled harness as OSS-100-10. **Delivered as OSS-100-09** (`@apzhub/integration-sdk/harness`, v0.9.0). See [OSS-100-09 Completion Report](../sprint/OSS-100-09-completion-report.md).

**Historical scope (now delivered under 09):** Mock transport harness, contract tests, compliance/boundary checks, certification checklist, CI helpers.

---

## OSS-100-11 — Provisioning (deferred) / further closeout

**Status:** Planned — **awaiting owner approval**

**Objective:** Provisioning bridge and upgrade policy evaluation, and/or any remaining documentation polish after owner-governed **1.0.0** promotion (when authorised).

**Scope (indicative):**

- `onProvision` / `onReconcile` full lifecycle
- `UpgradeCompatibilityPolicy`
- Integration with platform provisioning API
- Idempotent provision contract tests
- Optional post-1.0 docs polish

**Out of scope:**

- Per-engine provision scripts
- Automated engine upgrades
- Replacing SDK harness (already delivered as OSS-100-09)
- Declaring 1.0.0 without owner gate (certification already complete under OSS-100-10)

**Tests:**

- Provisioning idempotency tests
- Upgrade policy matrix tests

**Deliverables:**

- Provisioning SDK module (if still required)
- Completion report under owner-assigned ID

**Stop condition:** Lifecycle provisioning callable from control plane (when delivered); await approval before next domain / Event Bus / ingress as applicable.
---

## Consumer matrix

| Integration               | Wave              | SDK required from                                        |
| ------------------------- | ----------------- | -------------------------------------------------------- |
| Plane                     | OSS-101           | OSS-100-05 (+ transport/mapping/events/harness wrappers) |
| Kimai                     | OSS-201           | OSS-100-11 (or owner-approved SDK gate)                  |
| Paperless-ngx             | OSS-301           | OSS-100-11 (or owner-approved SDK gate)                  |
| Zammad                    | OSS-401 / OSS-102 | OSS-100-05 (+ transport/mapping/events/harness wrappers) |
| Metabase                  | OSS-601           | OSS-100-11 (or owner-approved SDK gate)                  |
| n8n                       | OSS-701           | OSS-100-11 (or owner-approved SDK gate)                  |
| Grafana stack             | OSS-801           | OSS-100-11 (or owner-approved SDK gate)                  |
| Greenbone, MobSF, Faraday | OSS-901           | OSS-100-11 (or owner-approved SDK gate)                  |

---

## Related

- [Platform Integration SDK Architecture](../architecture/APZHUB-Platform-Integration-SDK-Architecture.md)
- [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)
- [Adapter Harness architecture index](../architecture/APZHUB-Integration-SDK-Adapter-Harness.md)
- [SDK v1.0 Certification architecture index](../architecture/APZHUB-Integration-SDK-V1-Certification.md)
- [Webhook & Polling architecture index](../architecture/APZHUB-Integration-SDK-Webhook-Polling.md)
- [Mapping Framework architecture index](../architecture/APZHUB-Integration-SDK-Mapping-Framework.md)
- [HTTP Transport architecture index](../architecture/APZHUB-Integration-SDK-HTTP-Transport.md)
- [OSS-100-10 Completion Report](../sprint/OSS-100-10-completion-report.md)
- [OSS-100-09 Completion Report](../sprint/OSS-100-09-completion-report.md)
- [OSS-100-08 Completion Report](../sprint/OSS-100-08-completion-report.md)
- [OSS-100-07 Completion Report](../sprint/OSS-100-07-completion-report.md)
- [OSS-100-06 Completion Report](../sprint/OSS-100-06-completion-report.md)
- [ADR-0058](../adr/ADR-0058-integration-sdk-v1-readiness-limitations.md)
- [ADR-0057](../adr/ADR-0057-sdk-harness-vs-adapter-operations-certification.md)
- [OSS-101 Backlog](./OSS-101-Plane-Integration-Backlog.md)
