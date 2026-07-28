# APZHUB Integration Catalogue

> **Purpose:** Index of integration patterns, SDK phases, and adapter contracts  
> **Audience:** Integration engineers, architects, AI agents  
> **Authoritative references:** [Platform Integration SDK Architecture](../architecture/APZHUB-Platform-Integration-SDK-Architecture.md) · [026 — Integration SDK](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)  
> **Related documents:** [OSS-CATALOGUE](./OSS-CATALOGUE.md) · [PACKAGE-CATALOGUE](./PACKAGE-CATALOGUE.md)  
> **Reading order:** Before any adapter implementation  
> **Last updated:** 2026-07-18  
> **Current status:** Active — reconciled under **APZHUB-KF-001**. OSS-100-11 complete (`@apzhub/integration-sdk` **1.0.0** · **Architecture Frozen**; `PRODUCTION_READY_WITH_LIMITATIONS`)

---

## Integration pattern

```text
Module (presentation)
    ↓
Platform Service (business logic, orchestration)
    ↓
Service Connector / Adapter (translation, health, errors)
    ↓
Integration SDK (auth, connection, lifecycle, transport)
    ↓
Backend Engine (OSS product API)
```

**Credential flow (mandatory):**

```text
Capability Service → Vendor Adapter → Integration SDK → Auth Provider → Connection Manager
```

Capability services **never** handle vendor credentials directly.

---

## Integration SDK (`@apzhub/integration-sdk`)

| Phase                                           | Milestone   | Scope                                                  | Status                                                            |
| ----------------------------------------------- | ----------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| Planning                                        | OSS-100     | Architecture, specs                                    | Complete                                                          |
| Scaffold                                        | OSS-100-01  | Types, interfaces, placeholders (v0.1.0)               | Complete                                                          |
| Auth & connection                               | OSS-100-02  | AuthProvider, ConnectionManager, lifecycle (v0.2.0)    | Complete                                                          |
| Health & diagnostics                            | OSS-100-03  | HealthProvider, unified diagnostics                    | **Complete** (v0.3.0)                                             |
| Resilience                                      | OSS-100-04  | Circuit breaker diagnostics                            | **Complete** (v0.4.0)                                             |
| Error translation                               | OSS-100-04  | ErrorTranslator                                        | **Complete** (v0.4.0)                                             |
| Observability                                   | OSS-100-04  | Metrics, IntegrationLogger                             | **Complete** (v0.4.0)                                             |
| AdapterBase                                     | OSS-100-05  | Full adapter extension                                 | **Complete** (v0.5.0) — gate unlocked                             |
| Transport                                       | OSS-100-06  | Shared HTTP REST transport                             | **Complete** (v0.6.0)                                             |
| Mapping Provider Framework                      | OSS-100-07  | SDK `/mapping` (≠ EntityMappingStore)                  | Complete — `@apzhub/integration-sdk` v0.7.0                       |
| Webhooks / polling                              | OSS-100-08  | SDK `/events` (no ingress/bus/workers)                 | **Complete** — `@apzhub/integration-sdk` v0.8.0                   |
| Harness & certification                         | OSS-100-09  | SDK `/harness` (certification engine; no provisioning) | **Complete** — `@apzhub/integration-sdk` v0.9.0                   |
| v1.0 Certification & Release Readiness          | OSS-100-10  | Formal cert pack; remained 0.9.0                       | **Complete** — `PRODUCTION_READY_WITH_LIMITATIONS`                |
| v1.0.0 Wave Certification & Architecture Freeze | OSS-100-11  | Promote **1.0.0** · freeze architecture                | **Complete** — **Architecture Frozen**                            |
| Event Bus / ingress                             | OSS-100-12  | `@apzhub/platform-event-bus` **0.1.0**                 | **Accepted / closed**                                             |
| Provisioning (remainder)                        | OSS-100-12+ | Product provisioning flows                             | **ACCEPTED / CLOSED** (`@apzhub/platform-provisioning` **0.1.0**) |

Backlog: [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md)

---

## SDK subpath exports

| Export                                  | Purpose                                             | Since      |
| --------------------------------------- | --------------------------------------------------- | ---------- |
| `@apzhub/integration-sdk`               | Root types and version                              | OSS-100-01 |
| `@apzhub/integration-sdk/auth`          | Authentication, credentials, masking                | OSS-100-02 |
| `@apzhub/integration-sdk/connection`    | Connection manager, registry, lifecycle             | OSS-100-02 |
| `@apzhub/integration-sdk/client`        | `IntegrationClient` + `createHttpIntegrationClient` | OSS-100-06 |
| `@apzhub/integration-sdk/transport`     | Shared HTTP transport, policies, mock transport     | OSS-100-06 |
| `@apzhub/integration-sdk/mapping`       | Mapping Provider Framework                          | OSS-100-07 |
| `@apzhub/integration-sdk/events`        | Webhook & polling contracts, source envelope        | OSS-100-08 |
| `@apzhub/integration-sdk/harness`       | Adapter harness, certification, compliance, mocks   | OSS-100-09 |
| `@apzhub/integration-sdk/adapter`       | IntegrationAdapterBase, AdapterFactory, MockAdapter | OSS-100-05 |
| `@apzhub/integration-sdk/diagnostics`   | Diagnostics contracts                               | OSS-100-01 |
| `@apzhub/integration-sdk/lifecycle`     | Integration lifecycle states                        | OSS-100-01 |
| `@apzhub/integration-sdk/errors`        | Structured SDK errors                               | OSS-100-02 |
| `@apzhub/integration-sdk/resilience`    | Circuit breaker + retry policy re-exports           | OSS-100-04 |
| `@apzhub/integration-sdk/observability` | Metrics, IntegrationLogger                          | OSS-100-04 |

Package docs: [AUTHENTICATION.md](../../packages/integration-sdk/docs/AUTHENTICATION.md) · [CONNECTION-MANAGEMENT.md](../../packages/integration-sdk/docs/CONNECTION-MANAGEMENT.md) · [HTTP-TRANSPORT.md](../../packages/integration-sdk/docs/HTTP-TRANSPORT.md) · [MAPPING-FRAMEWORK.md](../../packages/integration-sdk/docs/MAPPING-FRAMEWORK.md) · [EVENT-ENVELOPE.md](../../packages/integration-sdk/docs/EVENT-ENVELOPE.md) · [ADAPTER-HARNESS.md](../../packages/integration-sdk/docs/ADAPTER-HARNESS.md) · [Architecture index (harness)](../architecture/APZHUB-Integration-SDK-Adapter-Harness.md)

---

## Standard adapter contracts

| Contract                 | Reference                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `IntegrationClient`      | [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)                                    |
| `AdapterBase`            | [Base Adapter Pattern](../architecture/APZHUB-Base-Adapter-Pattern.md)                                       |
| `AuthenticationProvider` | [Integration Authentication Architecture](../architecture/APZHUB-Integration-Authentication-Architecture.md) |
| `ConnectionManager`      | [Integration Connection Management](../architecture/APZHUB-Integration-Connection-Management.md)             |
| `HealthProvider`         | [Integration Health & Diagnostics Model](../architecture/APZHUB-Integration-Health-Diagnostics-Model.md)     |
| `ErrorTranslator`        | [Integration Error Translation Model](../architecture/APZHUB-Integration-Error-Translation-Model.md)         |

---

## Manifest-first development

Every integration starts with `integration.yaml`:

```text
integrations/{id}/
  integration.yaml    # Contract before code
  src/                # Adapter implementation
  tests/
```

See [026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md).

---

## Projects integration

| Component           | Manifest / spec                                                             | Status                                                                                        |
| ------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `ProjectService`    | `services/projects/`                                                        | Implemented (`@apzhub/platform-services` **0.26.1**)                                          |
| `projects` module   | `modules/projects/`                                                         | Manifest registered                                                                           |
| `plane` integration | `integrations/plane/`                                                       | **v0.6.0** — reference adapter (core → sync/events → operations/certification; OSS-101-04…09) |
| `PlaneAdapter`      | [PlaneAdapter Specification](../specs/APZHUB-PlaneAdapter-Specification.md) | **Certified Reference Adapter** (OSS-101-10)                                                  |

---

## Workflow Engine integration

| Component               | Manifest / spec                                                                                                    | Status                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Workflow Engine Gateway | `gateway.workflow.engine.*`                                                                                        | Certified (APZWORKFLOW-007…011)                                                              |
| `n8n` integration       | `integrations/n8n/`                                                                                                | **v0.1.0** — official Workflow Engine Reference Adapter (APZWORKFLOW-011; read-only; frozen) |
| Standard                | [Workflow Engine Reference Adapter Standard](../architecture/APZHUB-Workflow-Engine-Reference-Adapter-Standard.md) | Mandatory for future engines                                                                 |

---

## Integration standards (mandatory)

- [OSS Integration Standards](../governance/APZHUB-OSS-Integration-Standards.md)
- [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md)
- [Adapter Boundary Pattern](../architecture/APZHUB-Adapter-Boundary-Pattern.md)

---

## Error and diagnostics rules

| Rule                          | Detail                        |
| ----------------------------- | ----------------------------- |
| No raw engine errors to users | ErrorTranslator required      |
| No credentials in diagnostics | Masking enforced (OSS-100-02) |
| Tenant-scoped connections     | All connection records scoped |
| Structured error codes        | `SdkResult` pattern           |

---

## Status

**OSS-100-11** complete — `@apzhub/integration-sdk` **1.0.0** · **Architecture Frozen** (`pnpm certify:integration-sdk`). Classification **PRODUCTION_READY_WITH_LIMITATIONS** retained. SDK limitations: no durable checkpoint stores / production Vault inside the SDK package. **OSS-100-12** **ACCEPTED / CLOSED** — `@apzhub/platform-event-bus` **0.1.0**. **OSS-100-12+** **ACCEPTED / CLOSED** — `@apzhub/platform-provisioning` **0.1.0** (SDK public contracts unchanged).

### Certified / frozen adapters on disk

| Package                              | Version   | Role                                                                                                  |
| ------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------- |
| `@apzhub/integration-plane`          | **0.6.0** | Projects Reference Adapter (Wave 1)                                                                   |
| `@apzhub/integration-zammad`         | **0.6.0** | Support adapter (Wave 2 CERTIFIED_WITH_LIMITATIONS)                                                   |
| `@apzhub/integration-meilisearch`    | **0.1.0** | Search Reference Adapter                                                                              |
| `@apzhub/integration-n8n`            | **0.1.0** | Workflow Engine Reference Adapter (frozen)                                                            |
| `@apzhub/integration-kimai`          | **0.2.0** | Kimai CE domain adapter (APZHUB-INTEGRATION-KIMAI-002 **ACCEPTED** · CERTIFIED_DOMAIN)                |
| `@apzhub/integration-metabase`       | **0.1.0** | Metabase Analytics foundation (APZHUB-INTEGRATION-METABASE-001 · CERTIFIED_FOUNDATION · **ACCEPTED**) |
| `@apzhub/integration-github-actions` | **0.1.0** | CI/CD Reference Adapter (frozen)                                                                      |
| `@apzhub/integration-search-sdk`     | **0.1.0** | Search Integration SDK                                                                                |

See [OSS-100-11 Completion Report](../sprint/OSS-100-11-completion-report.md) · [Freeze Notice](../architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md) · [Reference Standard](../architecture/APZHUB-Integration-SDK-Reference-Standard.md) · [Inventory](./INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md).
