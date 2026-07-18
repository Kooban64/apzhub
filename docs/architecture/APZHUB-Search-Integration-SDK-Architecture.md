# APZHUB Search Integration SDK Architecture

| Field         | Value                                      |
| ------------- | ------------------------------------------ |
| **Document**  | APZHUB-Search-Integration-SDK-Architecture |
| **Milestone** | APZSEARCH-004                              |
| **Package**   | `@apzhub/integration-search-sdk` **0.1.0** |
| **Status**    | Authoritative for APZSEARCH-004            |
| **Date**      | 2026-07-14                                 |

## 1. Purpose

Provide a vendor-neutral **Search Integration SDK** so future search-engine adapters (Meilisearch, OpenSearch, etc.) share one composition model with `@apzhub/integration-sdk`, without prematurely selecting or binding an engine.

## 2. Layer placement

```text
Platform Services (management plane)
        ↓ uses contracts / future adapter ports
Search Integration SDK  (@apzhub/integration-search-sdk)
        ↓ extends / composes
Integration SDK         (@apzhub/integration-sdk)
        ↓ aligns models with
Search Contracts        (@apzhub/search-contracts)
```

This package lives under `packages/` (shared SDK), **not** under `integrations/` (vendor adapters).

## 3. Core abstractions

| Symbol                                                | Role                                                   |
| ----------------------------------------------------- | ------------------------------------------------------ |
| `SearchIntegrationAdapterBase`                        | Abstract adapter extending `IntegrationAdapterBase`    |
| `SearchAdapterFactory` / `createSearchAdapterFactory` | Create/dispose adapters + register search capabilities |
| `SearchAdapterContext`                                | `AdapterContext` + search helpers                      |
| `SearchCapabilityRegistration`                        | Platform `"search"` + fine-grained declarations        |
| `SearchOperationRunner`                               | Operation ports returning `NOT_IMPLEMENTED`            |
| `SearchProviderHealth` / `Diagnostics` / `Lifecycle`  | Safe metadata helpers                                  |
| `SearchConfigurationValidator`                        | Secret-ref configuration validation                    |
| `SearchErrorTranslator`                               | Domain + vendor error mapping                          |
| `SearchMetrics` / `SearchLogger`                      | Observability wrappers                                 |
| `SearchCompatibilityReport`                           | Declarative compatibility evaluation                   |
| `MockSearchIntegrationAdapter`                        | Test-only adapter                                      |

## 4. Dependency rules

**Allowed:** `@apzhub/integration-sdk`, `@apzhub/search-contracts`  
**Forbidden:** engine client libraries, `@apzhub/platform-services`, HTTP route frameworks, Workbench, Event Bus workers

Reuse — never reimplement — circuit breaker, secret provider, connection manager, base health/diagnostics stacks from integration-sdk.

## 5. Execution boundary

| Concern                              | APZSEARCH-004     |
| ------------------------------------ | ----------------- |
| Capability declaration               | Yes               |
| Lifecycle / validation / diagnostics | Yes (safe only)   |
| Query / index / document execution   | `NOT_IMPLEMENTED` |
| Engine transport                     | No                |
| HTTP / Workbench                     | No                |

## 6. Bootstrap

`createSearchIntegrationBootstrapConfiguration({ adapterId, name, version, integrationId, ... })` produces `AdapterBootstrapConfiguration` with platform capability `"search"` declared.

## 7. Successor

**APZSEARCH-005 (recommended):** Meilisearch Reference Adapter Evaluation & Certification — evaluate CE OSS Meilisearch as the first reference engine adapter **using this SDK**. No engine work belongs in APZSEARCH-004.
