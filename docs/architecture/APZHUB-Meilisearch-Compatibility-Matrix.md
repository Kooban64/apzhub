# APZHUB Meilisearch Compatibility Matrix

| Dimension | Classification | Detail |
| --- | --- | --- |
| Search Integration SDK | Compatible | Extends `SearchIntegrationAdapterBase` |
| Integration SDK | Compatible | Auth, secrets, circuit breaker, HTTP transport |
| Search contracts | Compatible | Keyword capability plane |
| Provider kind | `meilisearch` | Enumerated in `@apzhub/search-contracts` |
| Engine binding | Reference only | Does not exclusivise the platform |
| OpenSearch | Future option | Not implemented; remains in roadmap |
| Typesense / PG FTS / Azure AI Search | Out of scope | Future adapters |
| Live Meilisearch in CI | Forbidden (this milestone) | Mock REST only |
| Semantic / vector / fuzzy / AI / OCR | Unsupported | `NOT_SUPPORTED` |

Classification labels: `supported` · `degraded` · `unsupported` · `unknown` (from Search Integration SDK evaluator).
