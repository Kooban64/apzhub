# Search — Requirements

> **Programme:** APZQEP-ENG-020B  
> **Rule:** Reuse Platform search — no new search engine

## Catalogue

Product id `qep` added to `SEARCH_PRODUCTS` in `@apzhub/search-contracts`.

## Publication adapter

`@apzhub/search-qep` publishes requirement entities through `@apzhub/search-integration` on create/update and removes (or unpublishes) on archive.

## Module search

`searchRequirements` performs tenant-scoped text search (key/title/description) via the repository and is exposed at `/api/v1/qep/requirements/search`.

Unified Platform Search query remains `/api/v1/search/query` with product filter `qep` when the search platform is enabled.
