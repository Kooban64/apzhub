# APZHUB Platform Search — Canonical Query Model

> **Milestone:** APZSEARCH-001  
> **Package:** `@apzhub/search-contracts`

---

## Models

| Type               | Role                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `SearchQuery`      | Keywords, phrase, filters, sorts, scopes, collections, products, pagination, facet/highlight/suggestion flags        |
| `SearchRequest`    | Query + optional profile/session/correlation                                                                         |
| `SearchResponse`   | Request echo + `SearchResultPage` + optional provider/diagnostics refs                                               |
| `SearchHit`        | Hit id, optional score, `SearchMetadata`, highlights                                                                 |
| `SearchResultPage` | Hits, page, pageSize, totalEstimated, hasMore, facets, suggestions                                                   |
| `SearchFacet`      | Field + buckets                                                                                                      |
| `SearchFilter`     | Field + op (`eq`/`neq`/`in`/`nin`/`exists`/`range`)                                                                  |
| `SearchSort`       | Field + `asc`/`desc`                                                                                                 |
| `SearchHighlight`  | Field + snippets                                                                                                     |
| `SearchSuggestion` | Text + kind                                                                                                          |
| `SearchMetadata`   | Entity projection (not SoR) — tenant, org, classification, permissions, product, source, timestamps, version, status |

## Supported concepts

keywords · phrases · filters · sorting · pagination · facets · scopes · collections · permissions · highlighting metadata · result metadata

## Explicitly not implemented

Ranking algorithms · fuzzy search · semantic search · query execution against any engine

## Validation

`validateSearchQuery` / `validateSearchRequest` enforce:

- non-empty keywords/phrase when provided
- keyword length ≤ configuration max
- page ≥ 1; pageSize within `[1, maxPageSize]`
- known scopes, products, sort directions
- required filter/sort fields

`normalizePageSize` clamps to configuration defaults.

## Index metadata model

`SearchIndex`, `SearchCollection`, `SearchSource` declare metadata only:

index · collection · source · entity type · identifier · tenant · organisation · classification · permissions · timestamps · version · status

No crawler, no indexed content store, no cache in APZSEARCH-001.
