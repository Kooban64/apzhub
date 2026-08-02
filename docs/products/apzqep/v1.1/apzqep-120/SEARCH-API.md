# Search API — APZQEP-120-S11

`KnowledgeSearchService` (`@apzhub/qep-knowledge-index`)

## `search(request)`

| Field                                                            | Purpose                               |
| ---------------------------------------------------------------- | ------------------------------------- |
| query                                                            | Keyword ranking                       |
| tenantId                                                         | Required tenant scope                 |
| entityKinds                                                      | Filter (evidence today)               |
| tags / classification / lifecycleState / integrityState / status | Filters                               |
| sortBy                                                           | `relevance` \| `title` \| `updatedAt` |
| sortDirection                                                    | `asc` \| `desc`                       |
| page / pageSize                                                  | Paging                                |

## Response

Hits with `score`, `highlights`, `document`, plus `total`, `page`, `projectionOnly: true`.

## `getProjection(...)`

Direct projection lookup by tenant + entity kind + entity id.
