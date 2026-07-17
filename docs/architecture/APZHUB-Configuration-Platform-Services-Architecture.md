# APZHUB Configuration Platform Services Architecture

**Milestone:** APZCONFIG-002  
**Scope:** Platform Services integration only — no HTTP, no runtime apply

---

## Request path

```text
Product code
  → PlatformServiceGateway.configuration.{facet}
  → RequestPipeline (authz, audit hooks, correlation)
  → Production Authorization (configuration.* permissions)
  → Thin Platform Service facet (error translation)
  → createPlatformConfigurationService (Configuration Core)
  → Configuration Persistence (PostgreSQL | in-memory tests)
```

## Gateway facets

| Facet | Operations |
| --- | --- |
| `configurations` | list, get, create, updateMetadata, archive, restore, transition |
| `namespaces` | list, get, create, update |
| `groups` | list, get, create, update |
| `versions` | list, get, create, publish, deprecate |
| `overrides` | list, get, create, update |
| `scopes` | list, get |
| `validation` | validateMetadata, listRules |
| `references` | list, get |
| `audit` | list, get |
| `diagnostics` | health, readiness, capabilities |

## Bootstrap

- Production: `createConfigurationPlatformServicesForProduction({ postgresDb })`
- Tests: `createConfigurationPlatformServicesForTest({ allowInMemoryPersistence: true })`
- Enablement: `APZHUB_CONFIGURATION_ENABLED=true` + `DATABASE_URL`

## Boundaries

- No bypass of RequestPipeline or Authorization
- No direct persistence access from products
- No runtime configuration evaluation or secret storage
