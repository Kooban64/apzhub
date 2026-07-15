# APZHUB Platform Search — Persistence Architecture

> **Milestone:** APZSEARCH-002 · extended by **APZSEARCH-003**  
> **Packages:** `@apzhub/search-contracts` **0.3.0** · `@apzhub/search-persistence` **0.2.0**  
> **Migrations:** `0041_apz_platform_search` · `0042_apz_platform_search_rls` · `0043_apz_platform_search_management`

---

## Purpose

Production persistence for Search Platform **metadata only**: providers, configuration, profiles, collections, sources, scopes, diagnostics, health, statistics, audit, sessions, and entity metadata projections.

Products remain System of Record. No indexed business content, no result cache, no search engine binding.

## Layering

```text
Consumers
  → Platform Search Services (thin)
  → Provider Registry
  → Search Provider Interface (lifecycle)
  → Future provider implementations
  → Future engines

Persistence ← provider config / metadata / diagnostics / audit
```

## Tables

`platform_search_provider`, `platform_search_provider_registration`, `platform_search_provider_status`, `platform_search_configuration`, `platform_search_configuration_version`, `platform_search_profile`, `platform_search_collection`, `platform_search_source`, `platform_search_scope`, `platform_search_metadata`, `platform_search_session`, `platform_search_audit`, `platform_search_diagnostics`, `platform_search_health`, `platform_search_statistics`, `platform_search_capabilities`

## Isolation

- Tenant + organisation columns on all tables
- RLS policies via `app.tenant_id`
- Soft delete (`deleted_at`) where applicable
- Configuration versioning via `platform_search_configuration_version`

## Factories

| Factory | Behaviour |
|---------|-----------|
| `createSearchPersistenceForProduction` | Requires `postgresDb` — **no** silent memory fallback |
| `createSearchPersistenceForTest` | Requires `postgresDb` **or** `allowInMemoryPersistence: true` |
| `createSearchProviderRegistry` | Persistence-backed registry |
| `createSearchPlatformFoundation` | Persistence + registry + thin gateway services |

## Explicit exclusions

HTTP · Workbench · engines · indexing · OCR · AI · Event Bus · workers · ranking · search execution
