# APZHUB Platform Search — Provider Abstraction

> **Milestone:** APZSEARCH-001  
> **Package:** `@apzhub/search-contracts`

---

## Intent

Vendor-neutral interfaces only. Future providers may include:

- OpenSearch
- Elasticsearch
- PostgreSQL FTS
- Meilisearch
- Typesense
- Azure AI Search
- Future vector providers (`vector_future`)

**No implementations in APZSEARCH-001.**

## Interfaces

| Port                          | Responsibility                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `SearchEngineProvider`        | Descriptor, capabilities, health; optional `executeQuery` reserved for later (must not run in 001) |
| `SearchProviderRegistry`      | List/get declared provider metadata                                                                |
| `SearchIndexMetadataProvider` | List declared index metadata (no content)                                                          |

## Descriptor

`SearchProvider` / `SearchProviderDescriptor` carry id, kind, label, enabled flag, and `SearchCapabilities`.

## Capabilities (foundation)

Keywords, phrases, filters, sorting, pagination, facets, highlighting, suggestions — **declared**.

`semantic`, `vector`, and `fuzzy` are **hard-false** in foundation diagnostics.

## Security rule

No search provider bypasses platform authorization. Callers pass authorized `SearchRequestContext` and permission-filtered queries. Engines never become SoR or authz authorities.
