# APZHUB Integration Catalogue

> **Purpose:** Index of integration patterns, SDK phases, and adapter contracts  
> **Audience:** Integration engineers, architects, AI agents  
> **Authoritative references:** [Platform Integration SDK Architecture](../architecture/APZHUB-Platform-Integration-SDK-Architecture.md) · [026 — Integration SDK](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)  
> **Related documents:** [OSS-CATALOGUE](./OSS-CATALOGUE.md) · [PACKAGE-CATALOGUE](./PACKAGE-CATALOGUE.md)  
> **Reading order:** Before any adapter implementation  
> **Last updated:** 2026-07-12  
> **Current status:** Active — OSS-100-10 complete (`PRODUCTION_READY_WITH_LIMITATIONS`; `@apzhub/integration-sdk` **0.9.0**)

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

| Phase                | Milestone   | Scope                                               | Status                                |
| -------------------- | ----------- | --------------------------------------------------- | ------------------------------------- |
| Planning             | OSS-100     | Architecture, specs                                 | Complete                              |
| Scaffold             | OSS-100-01  | Types, interfaces, placeholders (v0.1.0)            | Complete                              |
| Auth & connection    | OSS-100-02  | AuthProvider, ConnectionManager, lifecycle (v0.2.0) | Complete                              |
| Health & diagnostics | OSS-100-03  | HealthProvider, unified diagnostics                 | **Complete** (v0.3.0)                 |
| Resilience           | OSS-100-04  | Circuit breaker diagnostics                         | **Complete** (v0.4.0)                 |
| Error translation    | OSS-100-04  | ErrorTranslator                                     | **Complete** (v0.4.0)                 |
| Observability        | OSS-100-04  | Metrics, IntegrationLogger                          | **Complete** (v0.4.0)                 |
| AdapterBase          | OSS-100-05  | Full adapter extension                              | **Complete** (v0.5.0) — gate unlocked |
| Transport            | OSS-100-06  | Shared HTTP REST transport                          | **Complete** (v0.6.0)                 |
| Mapping Provider Framework | OSS-100-07  | SDK `/mapping` (≠ EntityMappingStore)               | Complete — `@apzhub/integration-sdk` v0.7.0 |
| Webhooks / polling   | OSS-100-08  | SDK `/events` (no ingress/bus/workers)              | **Complete** — `@apzhub/integration-sdk` v0.8.0 |
| Harness & certification | OSS-100-09  | SDK `/harness` (certification engine; no provisioning) | **Complete** — `@apzhub/integration-sdk` v0.9.0 |
| v1.0 Certification & Release Readiness | OSS-100-10  | Formal cert pack; remain 0.9.0 until owner promotes | **Complete** — `PRODUCTION_READY_WITH_LIMITATIONS` |
| Provisioning         | OSS-100-11+ | Provision / upgrade compatibility (deferred)        | Planned — await owner |

Backlog: [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md)

---

## SDK subpath exports

| Export                                | Purpose                                             | Since      |
| ------------------------------------- | --------------------------------------------------- | ---------- |
| `@apzhub/integration-sdk`             | Root types and version                              | OSS-100-01 |
| `@apzhub/integration-sdk/auth`        | Authentication, credentials, masking                | OSS-100-02 |
| `@apzhub/integration-sdk/connection`  | Connection manager, registry, lifecycle             | OSS-100-02 |
| `@apzhub/integration-sdk/client`      | `IntegrationClient` + `createHttpIntegrationClient` | OSS-100-06 |
| `@apzhub/integration-sdk/transport`   | Shared HTTP transport, policies, mock transport     | OSS-100-06 |
| `@apzhub/integration-sdk/mapping`     | Mapping Provider Framework                          | OSS-100-07 |
| `@apzhub/integration-sdk/events`      | Webhook & polling contracts, source envelope        | OSS-100-08 |
| `@apzhub/integration-sdk/harness`     | Adapter harness, certification, compliance, mocks   | OSS-100-09 |
| `@apzhub/integration-sdk/adapter`     | IntegrationAdapterBase, AdapterFactory, MockAdapter | OSS-100-05 |
| `@apzhub/integration-sdk/diagnostics` | Diagnostics contracts                               | OSS-100-01 |
| `@apzhub/integration-sdk/lifecycle`   | Integration lifecycle states                        | OSS-100-01 |
| `@apzhub/integration-sdk/errors`      | Structured SDK errors                               | OSS-100-02 |
| `@apzhub/integration-sdk/resilience`  | Circuit breaker + retry policy re-exports           | OSS-100-04 |
| `@apzhub/integration-sdk/observability` | Metrics, IntegrationLogger                        | OSS-100-04 |

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
| `ProjectService`    | `services/projects/`                                                        | Implemented (`@apzhub/platform-services` v0.5.0)                                              |
| `projects` module   | `modules/projects/`                                                         | Manifest registered                                                                           |
| `plane` integration | `integrations/plane/`                                                       | **v0.6.0** — reference adapter (core → sync/events → operations/certification; OSS-101-04…09) |
| `PlaneAdapter`      | [PlaneAdapter Specification](../specs/APZHUB-PlaneAdapter-Specification.md) | **Certified Reference Adapter** (OSS-101-10)                                                  |

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

## Next dependency

**OSS-100-10** complete — Integration SDK v1.0 Certification (`PRODUCTION_READY_WITH_LIMITATIONS`; `@apzhub/integration-sdk` remains **0.9.0**). Recommended next: **owner-approved 1.0.0 promotion**, **provisioning** (deferred 100-11+), **platform webhook-ingress / Event Bus**, or **next domain adapter**. Limitations: no Event Bus / ingress / provisioning / durable checkpoint stores / production Vault. Do not auto-promote to 1.0.0.

See [OSS-100-10 Completion Report](../sprint/OSS-100-10-completion-report.md) · [SDK-V1-CERTIFICATION.md](../../packages/integration-sdk/docs/SDK-V1-CERTIFICATION.md).
