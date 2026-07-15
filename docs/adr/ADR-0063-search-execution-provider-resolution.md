# ADR-0063: Search Execution Provider Resolution Precedence

| Field | Value |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-07-14 |
| **Milestone** | APZSEARCH-006 |
| **Deciders** | Owner / Architecture |

---

## Context

Multiple `PlatformSearchExecutionProvider` instances may be registered (Meilisearch first; OpenSearch later). The execution plane needs a deterministic, auditable resolution order. Silent fallback to an arbitrary provider is unsafe.

## Naming note

Platform-services already registers a **legacy Plane** capability provider on capability `"search"` (`SearchService`). Search execution uses a **distinct** capability id:

- Capability: `platform_search_execution`
- Interface: `PlatformSearchExecutionProvider` / `SearchEngineExecutionProvider`
- Class: `MeilisearchSearchProvider` (consumes `@apzhub/integration-meilisearch` public API only)

## Decision

`SearchExecutionProviderResolver` evaluates **eligible** providers only (enabled + healthy + tenant-visible + keyword-capable), then applies this precedence (first match wins):

1. **Explicit authorised provider** (`options.providerId`) — requires `search.query.select-provider`
2. **Profile binding** (`profileIds`)
3. **Collection binding** (`collectionIds` / canonical collection)
4. **Source binding** (`sourceIds`)
5. **Tenant-active** provider
6. **Platform-active** provider
7. **Highest priority** among remaining eligible providers

If the chain yields no provider → throw `provider_resolution_failed` (**no silent fallback**).

Ineligible explicit requests fail with `execution_provider_not_found` or `provider_resolution_failed` rather than substituting another provider.

## Consequences

### Positive
- Predictable multi-provider behaviour
- Permission gate on explicit selection
- No accidental cross-tenant provider visibility

### Negative / accepted
- Operators must mark at least one provider tenant/platform active or set priority
- Future AI / semantic providers will need capability checks before entering eligibility

## Related

- [ADR-0061 — Tenant Isolation](./ADR-0061-search-tenant-isolation-strategy.md)
- [APZSEARCH-006 Completion Report](../sprint/APZSEARCH-006-completion-report.md)
