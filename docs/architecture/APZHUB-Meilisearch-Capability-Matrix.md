# APZHUB Meilisearch Capability Matrix

| Capability               | Meilisearch CE (APZSEARCH-005) | Notes                        |
| ------------------------ | ------------------------------ | ---------------------------- |
| Keyword search           | Supported                      | `q`                          |
| Phrase search            | Supported                      | Quoted `q`                   |
| Filtering                | Supported                      | Mapped filter DSL            |
| Sorting                  | Supported                      | `field:asc\|desc`            |
| Facets                   | Supported                      | `facets`                     |
| Highlighting             | Supported                      | `attributesToHighlight`      |
| Pagination               | Supported                      | `offset` / `limit`           |
| Suggestions              | Declared                       | Soft — engine-dependent      |
| Index lifecycle          | Supported                      | CRUD + metadata              |
| Document CRUD            | Supported                      | Upsert / get / delete        |
| Health                   | Supported                      | `/health`                    |
| Diagnostics              | Supported                      | Stats + version (no secrets) |
| Configuration validation | Supported                      | Secret refs only             |
| Semantic search          | **NOT_SUPPORTED**              |                              |
| Vector search            | **NOT_SUPPORTED**              |                              |
| Fuzzy search             | **NOT_SUPPORTED**              |                              |
| AI ranking               | **NOT_SUPPORTED**              |                              |
| OCR                      | **NOT_SUPPORTED**              |                              |

Platform Search capabilities (`SearchCapabilities.semantic|vector|fuzzy`) remain hard-false.
