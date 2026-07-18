# APZHUB Search Platform Service Architecture

> **Milestone:** APZSEARCH-003  
> **Status:** Complete  
> **Packages:** `@apzhub/search-contracts` **0.3.0** · `@apzhub/search-persistence` **0.2.0** · `@apzhub/platform-services` **0.17.0**

---

## Purpose

Expose Search **management-plane** capabilities through the APZHUB Platform Services architecture:

```text
PlatformServiceGateway
  → RequestPipeline
    → production policies + authorisation
      → Search platform-service implementations
        → Search persistence services + provider registry
          → PostgreSQL metadata repositories
```

This milestone does **not** execute searches, index content, or bind a search engine.

## Management plane vs execution plane

| Plane                                                                 | Status                      |
| --------------------------------------------------------------------- | --------------------------- |
| Provider registration / lifecycle                                     | Implemented                 |
| Configuration (secret refs only)                                      | Implemented                 |
| Collections / sources / scopes / profiles / metadata                  | Implemented (metadata only) |
| Capabilities / health / diagnostics / statistics / audit / validation | Implemented                 |
| Search query execution                                                | **Unavailable** — reserved  |
| Indexing / engines / adapters                                         | **Not implemented**         |

## Gateway facets

| Facet                  | Role                                                                 |
| ---------------------- | -------------------------------------------------------------------- |
| `searchQuery`          | `validateQuery` only (`query` throws `search_execution_unavailable`) |
| `searchProviders`      | Provider management + lifecycle                                      |
| `searchConfigurations` | Configuration CRUD / version / activate / validate / archive         |
| `searchCapabilities`   | Capability inspection                                                |
| `searchHealth`         | Management vs execution readiness                                    |
| `searchDiagnostics`    | Safe diagnostics (no secrets)                                        |
| `searchCollections`    | Collection metadata                                                  |
| `searchSources`        | Source metadata (+ provider/collection assignment)                   |
| `searchScopes`         | Scope metadata                                                       |
| `searchProfiles`       | Profile metadata                                                     |
| `searchMetadata`       | Declared entity metadata projections                                 |
| `searchAudit`          | Immutable audit retrieval                                            |
| `searchStatistics`     | Metadata counts only                                                 |
| `searchValidation`     | Deterministic validation                                             |

Legacy Plane `gateway.search` (unified product search scaffold) remains separate and is **not** wired to APZSEARCH execution.

## Bootstrap

`SEARCH_SERVICE_ENABLED=true` requires `DATABASE_URL`. Production factories refuse silent in-memory / allow-all authorisation fallbacks.

## Migrations

`0041` / `0042` (schema + RLS) · `0043` (management fields: collection/source enablement, source assignments, provider ownership)

## Explicit exclusions

HTTP · OpenAPI · Workbench · engines · indexing · OCR · AI · workers · Event Bus · product adapters · ranking · query execution

## Related

- [Search Persistence Architecture](./APZHUB-Platform-Search-Persistence-Architecture.md)
- [Search Permission Catalogue](./APZHUB-Platform-Search-Permission-Catalogue.md)
- [APZSEARCH-003 Completion Report](../sprint/APZSEARCH-003-completion-report.md)
