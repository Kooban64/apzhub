# `@apzhub/search-persistence`

APZHUB Platform Search persistence and provider registry (APZSEARCH-002).

## Scope

- PostgreSQL + in-memory repositories for search metadata
- Provider registry (register / unregister / active / lookup)
- Managed provider lifecycle contracts (no engine execution)
- Thin platform search services over persistence
- Factories: production (Postgres required) and test (explicit in-memory opt-in)

## Out of scope

HTTP · Workbench · OpenSearch/Elasticsearch/Meilisearch/Typesense/Postgres FTS · indexing · search execution · OCR · AI · Event Bus · workers · ranking
