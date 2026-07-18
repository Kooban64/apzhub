# Search Bootstrap and Configuration Guide

> **Milestone:** APZSEARCH-003

## Feature switch

```bash
SEARCH_SERVICE_ENABLED=true   # requires DATABASE_URL
```

When disabled: existing platform capabilities unchanged; Search platform facets return controlled unavailable-capability errors.

When enabled but misconfigured: readiness fails clearly — no silent in-memory / allow-all fallback.

## Factories

| Factory                                     | Use                                                         |
| ------------------------------------------- | ----------------------------------------------------------- |
| `createSearchPlatformServicesForProduction` | Requires `postgresDb`                                       |
| `createSearchPlatformServicesForTest`       | Explicit in-memory opt-in                                   |
| `createSearchPlatformFoundation*`           | Persistence + registry + thin gateway (persistence package) |

Compose into `createPlatformServices({ searchPlatform })`.
