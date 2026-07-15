# APZHUB Platform Search Architecture

> **Milestone:** APZSEARCH-001 — Platform Search Foundation  
> **Package:** `@apzhub/search-contracts` **0.1.0**  
> **Status:** Complete (contracts only)  
> **Related:** [020 — Unified Search](../020-unified-search-knowledge-discovery-framework.md)

---

## Purpose

Establish the canonical APZHUB Search Platform as a reusable platform capability. Products own business data; the Search Platform owns contracts, provider abstractions, indexing metadata models, query models, and aggregation architecture.

## Layering

```text
Consumers
    ↓
Platform Search Services (contracts)
    ↓
Search Provider (vendor-neutral interfaces)
    ↓
Product Search Adapters (contracts)
    ↓
Products (System of Record)
```

## Principles

| Rule | Detail |
|------|--------|
| Products are SoR | Search never owns business entities |
| Contracts first | APZSEARCH-001 ships interfaces and models only |
| No engine binding | OpenSearch/ES/Postgres FTS/Meilisearch/Typesense/Azure AI Search reserved |
| Authorization mandatory | Tenant, organisation, permissions, classification, product ownership |
| Derived index only | Future indexes are derived; never authoritative |

## Package surface

| Area | Location |
|------|----------|
| Domain models | `packages/search-contracts/src/domain/` |
| Query validation | `domain/query-validation.ts` |
| Provider ports | `providers/search-provider.ts` |
| Product adapters | `adapters/product-search-adapter.ts` |
| Platform services | `services/platform-search-services.ts` |
| Permissions | `permissions/catalogue.ts` |
| Security helpers | `security/boundary.ts` |
| Diagnostics | `diagnostics/types.ts` |
| Configuration | `config/types.ts` |

## Explicit exclusions (APZSEARCH-001)

HTTP API · Workbench · search engines · indexing · OCR · AI · semantic/vector search · Event Bus · workers · caching · ranking

## Next milestone

**APZSEARCH-002 — Search Persistence & Provider Framework** (not authorised until owner approval).
