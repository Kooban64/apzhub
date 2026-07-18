# Integration SDK — Public API Guide

> **Milestone:** OSS-100-10  
> **Package:** `@apzhub/integration-sdk` **1.0.0**  
> **Date:** 2026-07-12  
> **Companion:** [SDK-API-AUDIT.md](./SDK-API-AUDIT.md) · [SDK-V1-CERTIFICATION.md](./SDK-V1-CERTIFICATION.md)

---

## Purpose

Consumer-facing map of public API surfaces, subpath exports, and import guidance for adapter authors and platform integrators.

---

## Version

| Field                     | Value                              |
| ------------------------- | ---------------------------------- |
| npm package version       | **1.0.0**                          |
| `INTEGRATION_SDK_VERSION` | **1.0.0** (matches)                |
| Architecture              | **Frozen** (OSS-100-11 / ADR-0065) |

---

## Subpath map

| Import path                             | Contents                                                        |
| --------------------------------------- | --------------------------------------------------------------- |
| `@apzhub/integration-sdk`               | Root barrel — full public surface (~581 symbols)                |
| `@apzhub/integration-sdk/client`        | `IntegrationClient` + `createHttpIntegrationClient`             |
| `@apzhub/integration-sdk/adapter`       | `AdapterBase` / `IntegrationAdapterBase`, factory, placeholders |
| `@apzhub/integration-sdk/diagnostics`   | Diagnostics contracts and providers                             |
| `@apzhub/integration-sdk/lifecycle`     | Lifecycle participant, transitions, platform bridge             |
| `@apzhub/integration-sdk/errors`        | Error model, codes, `SdkResult`, `ErrorTranslator`              |
| `@apzhub/integration-sdk/auth`          | Authentication, credentials, secret providers, masking          |
| `@apzhub/integration-sdk/connection`    | Connection manager, registry, lifecycle                         |
| `@apzhub/integration-sdk/health`        | HealthProvider, check aggregation                               |
| `@apzhub/integration-sdk/version`       | VersionProvider, compatibility                                  |
| `@apzhub/integration-sdk/resilience`    | Circuit breaker + retry policy                                  |
| `@apzhub/integration-sdk/observability` | Metrics contracts, integration logger                           |
| `@apzhub/integration-sdk/transport`     | Shared HTTP transport, policies, mock transport                 |
| `@apzhub/integration-sdk/mapping`       | Mapping Provider Framework                                      |
| `@apzhub/integration-sdk/events`        | Webhook & polling contracts, source envelope, pipelines         |
| `@apzhub/integration-sdk/harness`       | Adapter harness, certification, compliance, mocks, scaffold, CI |

---

## Consumer guidance

### Prefer subpaths

New consumers should import from **specific subpaths** rather than the root barrel. The root export is large (~581 symbols) and is retained for backward compatibility; subpaths make dependency intent clearer and ease future API freeze.

```typescript
// Preferred
import { createTransportClient } from "@apzhub/integration-sdk/transport";
import { AdapterHarness } from "@apzhub/integration-sdk/harness";

// Allowed but discouraged for new code
import { createTransportClient, AdapterHarness } from "@apzhub/integration-sdk";
```

### Stable vs test-only vs experimental

| Kind             | Examples                                              | Use in production adapters?              |
| ---------------- | ----------------------------------------------------- | ---------------------------------------- |
| **Stable**       | Transport, mapping, auth, connection, harness engines | Yes                                      |
| **Stable-test**  | `Mock*`, `createMock*`                                | Tests only                               |
| **Test-only**    | `InMemory*` stores/registries                         | Tests / local harness only — **not** SoR |
| **Experimental** | `Placeholder*` (incl. PlaceholderVault)               | Do not use as production implementations |

### Vendor helpers in SDK

`PlaneIdentityMapper` and `ZammadIdentityMapper` are documented as **stable helpers** currently exported from `/mapping` (and root). Relocating them into vendor packages before a strict 1.0 freeze is **optional** and not a certification blocker.

---

## What this SDK does not export

These platform concerns are intentionally absent from the Integration SDK public API:

- Event Bus publish APIs
- HTTP webhook ingress / route handlers
- Provisioning / upgrade orchestration runtimes
- Durable production checkpoint / dedup / replay stores

Adapters consume contracts and pipelines; platform owns ingress, bus, workers, and durable SoR.

---

## Related package docs

| Area      | Doc                                            |
| --------- | ---------------------------------------------- |
| Transport | [HTTP-TRANSPORT.md](./HTTP-TRANSPORT.md)       |
| Mapping   | [MAPPING-FRAMEWORK.md](./MAPPING-FRAMEWORK.md) |
| Events    | [EVENT-ENVELOPE.md](./EVENT-ENVELOPE.md)       |
| Harness   | [ADAPTER-HARNESS.md](./ADAPTER-HARNESS.md)     |
| Auth      | [AUTHENTICATION.md](./AUTHENTICATION.md)       |
| API audit | [SDK-API-AUDIT.md](./SDK-API-AUDIT.md)         |
