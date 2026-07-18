# APZHUB Meilisearch Adapter Architecture

| Field         | Value                                                               |
| ------------- | ------------------------------------------------------------------- |
| **Milestone** | APZSEARCH-005                                                       |
| **Package**   | `@apzhub/integration-meilisearch` **0.1.0**                         |
| **ADR**       | [ADR-0060](../adr/ADR-0060-meilisearch-reference-search-adapter.md) |

## Layering

```text
Search Platform (APZSEARCH-001–003)     ← unchanged
        ↓
Search Integration SDK (APZSEARCH-004) ← unchanged contracts
        ↓
Meilisearch Reference Adapter          ← this package
        ↓
MeilisearchRestClient (raw HTTP)
        ↓
Meilisearch CE (engine — not bundled)
```

## Components

| Component                                                   | Role                                   |
| ----------------------------------------------------------- | -------------------------------------- |
| `MeilisearchAdapter`                                        | Extends `SearchIntegrationAdapterBase` |
| `createMeilisearchAdapter` / `MeilisearchAdapterFactory`    | Bootstrap + SecretProvider wiring      |
| `MeilisearchAdapterContext`                                 | Search context + Meilisearch providers |
| `MeilisearchOperationRunner`                                | Query / index / document / health ops  |
| `MeilisearchRestClient`                                     | Injectable `fetchFn` HTTP client       |
| `MeilisearchErrorMapper`                                    | Vendor → Integration error translation |
| Capability / Compatibility / Health / Diagnostics providers | Certification surfaces                 |
| `MeilisearchConfigurationValidator`                         | Secret-ref-only validation             |
| `MeilisearchMetrics` / `MeilisearchLogger`                  | Observability wrappers                 |

## Boundaries

- Never called directly by modules (008/009).
- No Platform Service Gateway, HTTP routes, Workbench, persistence, Event Bus, or workers in this milestone.
- Config stores `apiKeyRef` only — secrets resolve via Integration SDK `SecretProvider`.
