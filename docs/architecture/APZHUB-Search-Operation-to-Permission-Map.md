# Search Operation-to-Permission Map

> **Milestone:** APZSEARCH-003

Every public Search platform gateway method has an **explicit** entry in `packages/platform-services/src/authorization/operation-authorization-map.ts` (`searchPlatformOps`).

## Rules

- Permissions are not derived from method names at runtime.
- No working query-execution operation is mapped.
- `search.query` remains reserved; validation uses `search.validation.execute` / provider validate permissions as mapped.
- Tests assert every public facet method has a mapping and that `query` is not operationally mapped as executable search.

## Examples

| Service key            | Operation               | Permission                                            |
| ---------------------- | ----------------------- | ----------------------------------------------------- |
| `searchProviders`      | `listProviders`         | `search.provider.list`                                |
| `searchProviders`      | `registerProvider`      | `search.provider.register`                            |
| `searchProviders`      | `setActiveProvider`     | `search.provider.activate`                            |
| `searchConfigurations` | `activate`              | `search.configuration.activate`                       |
| `searchCollections`    | `create`                | `search.collection.create`                            |
| `searchDiagnostics`    | `getDiagnostics`        | `search.diagnostics.read`                             |
| `searchValidation`     | `validateConfiguration` | `search.validation.execute`                           |
| `searchQuery`          | `validateQuery`         | `search.validation.execute` (or catalogue equivalent) |

Authoritative source: the TypeScript operation map + `apzsearch-003-platform-services.test.ts`.
