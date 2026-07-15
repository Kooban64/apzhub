# Search Integration Adapter Lifecycle Guide

| Field | Value |
| --- | --- |
| **Document** | search-integration-adapter-lifecycle |
| **Milestone** | APZSEARCH-004 |

## 1. States

`SearchProviderLifecycle` states:

`uninitialised` → `initialising` → `ready` → (`degraded`) → `disposing` → `disposed`

These are **SDK metadata states**. They do not open sockets to a search engine.

## 2. Integration-sdk composition

| Phase | Integration SDK | Search SDK |
| --- | --- | --- |
| Validate | `validateConfiguration` | + declared search capabilities |
| Initialise | `initialise` / `onInitialise` | `onSearchInitialise` + lifecycle `ready` |
| Health | `performHealthCheck` | Appends `search_sdk` / `search_execution` checks |
| Diagnostics | `collectDiagnostics` | Safe search diagnostics wrap |
| Dispose | `dispose` / `onDispose` | Lifecycle `disposed` |

## 3. Configuration validation

`SearchConfigurationValidator.validateProvider` delegates to `validateSearchProviderConfiguration` from search-contracts:

- Provider id / kind / version required
- Auth **refs** only — no inline secrets
- Semantic / vector / fuzzy forbidden until later milestones

## 4. Operational methods

`query` / `index` / `document` / etc. go through `SearchOperationRunner` and return:

```ts
{ status: "NOT_IMPLEMENTED", executionEnabled: false, ... }
```

## 5. Restore / re-init

After dispose, create a **new** adapter instance via the factory. Lifecycle `reset()` is for in-process helper reuse in tests only.
