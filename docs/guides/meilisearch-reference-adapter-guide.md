# Meilisearch reference adapter guide

APZSEARCH-005 delivers the first certified Search engine adapter for APZHUB.

## What it is

- Package: `@apzhub/integration-meilisearch` under `integrations/meilisearch/`
- Extends Search Integration SDK
- Raw REST client (injectable `fetchFn`)
- Mock API for unit/contract/certification tests

## What it is not

- Not a platform default exclusive engine
- Wired through Platform Services execution gateway (APZSEARCH-006) and Platform Search HTTP/Workbench (APZSEARCH-007); vertical **APZSEARCH-008** certified **PRODUCTION_READY_WITH_LIMITATIONS**; next: **APZSEARCH-009** (await approval)
- Not a semantic/vector/AI engine
- Not bundled Meilisearch in Docker for this milestone's CI

## Evaluation checklist

1. Capability matrix reviewed
2. Compatibility matrix reviewed
3. `NOT_SUPPORTED` paths exercised
4. Secret refs only in config
5. `pnpm audit:meilisearch-adapter` green
6. Coverage ≥95% on `integrations/meilisearch/src` (exclude tests)

## See also

- [Configuration](./meilisearch-adapter-configuration.md)
- [Architecture](../architecture/APZHUB-Meilisearch-Adapter-Architecture.md)
- [ADR-0060](../adr/ADR-0060-meilisearch-reference-search-adapter.md)
