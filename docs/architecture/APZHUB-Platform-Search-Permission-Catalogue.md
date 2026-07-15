# APZHUB Platform Search — Permission Catalogue

> **Milestone:** APZSEARCH-001 · extended by **APZSEARCH-003**  
> **Sources:** `@apzhub/search-contracts` **0.3.0** · platform `permission-catalogue`

---

## Coarse / legacy

| Key | Purpose |
|-----|---------|
| `search.*` | Wildcard namespace grant (not a security bypass) |
| `search.query` | Reserved for future execution; may authorise validate-only paths where mapped |
| `search.provider` | Coarse provider grant (implies granular provider ops) |
| `search.diagnostics` | Coarse diagnostics/health/statistics |
| `search.configuration` | Coarse configuration grant |
| `search.audit` | Audit retrieval |
| `search.execute` / `search.list` / `search.read` | Legacy compatibility |

## Granular (APZSEARCH-003)

Provider: `search.provider.list|read|register|update|enable|disable|activate|unregister|health|diagnostics`  
Configuration: `search.configuration.list|read|create|update|version|activate|validate|archive`  
Collection: `search.collection.list|read|create|update|enable|disable|archive`  
Source: `search.source.list|read|create|update|enable|disable|archive`  
Scope: `search.scope.list|read|create|update|archive`  
Profile: `search.profile.list|read|create|update|archive|validate`  
Metadata: `search.metadata.list|read|create|update|archive`  
Cross-cutting: `search.capabilities.read` · `search.health.read` · `search.diagnostics.read` · `search.statistics.read` · `search.validation.execute`

## Notes

- Coarse keys remain valid grants for their namespace.
- No query-execution operation is authorised in APZSEARCH-003.
- Authoritative list: `PLATFORM_SEARCH_PERMISSIONS` in search-contracts.
- Operation map: [Search Operation-to-Permission Map](./APZHUB-Search-Operation-to-Permission-Map.md)
