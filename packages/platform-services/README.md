# @apzhub/platform-services

Vendor-neutral platform service implementations with production authorisation, entity mapping persistence, orchestration, gateway, and execution pipeline.

**Milestone:** OSS-110-08 · APZTCMS-011 (Testing) · APZTCMS-014 (Platform Quality) · APZSEARCH-003 (Search)  
**Version:** 0.17.0

## Purpose

Implements `@apzhub/platform-service-contracts` with:

- Mapping-aware service implementations (APZHUB global IDs only) — including **TaskServiceImpl**
- Plane task capability provider (`plane-task`) over `adapter.core.tasks`
- **Testing platform services** (APZTCMS-011) — `gateway.testing.*` nested surface
- **Platform Quality / Release / Governance** (APZTCMS-014) — `gateway.platformQuality.*`, `gateway.platformRelease.*`, `gateway.platformGovernance.*`
- `EntityMappingStore` — in-memory and PostgreSQL implementations
- `MappingOrchestrator` for create/read ID translation and compensation errors
- `ProviderRegistry` / `ProviderResolver` with mapping-driven selection (incl. `task`)
- `PlatformServiceGateway` as the application entry point
- `RequestPipeline` — validation, middleware, policies, production authz, logging, metrics, audit
- **Search platform services** (APZSEARCH-003) — `gateway.searchPlatform.*` management facets (no query execution)
- Permission catalogue + explicit operation → permission map (Projects, Tasks, Support, Testing, Platform Quality, Search)
- Bootstrap via `ENTITY_MAPPING_STORE_MODE`, `AUTHORIZATION_PROVIDER_MODE`, **`TESTING_SERVICE_ENABLED`**, **`DOCUMENT_SERVICE_ENABLED`**, **`SEARCH_SERVICE_ENABLED`**, optional **`PLATFORM_QUALITY_ENABLED`**

## Architecture

```text
PlatformServiceGateway
  → RequestPipeline (policies → AuthorizationProvider → audit)
    → *ServiceImpl  (incl. Testing*ServiceImpl → @apzhub/testing-services)
      → MappingOrchestrator + EntityMappingStore  (integration-backed services)
      → ProviderResolver → Capability Provider → Adapter
```

## Testing bootstrap (APZTCMS-011)

```typescript
import {
  createPlatformServices,
  createTestingPlatformServicesForProduction,
  createTestingPlatformServicesForTest,
  isTestingServiceEnabled,
} from "@apzhub/platform-services";

// Production — Postgres only; no silent in-memory fallback
const testing = createTestingPlatformServicesForProduction({ postgresDb });

// Tests — explicit opt-in
const testingTest = createTestingPlatformServicesForTest({
  allowInMemoryPersistence: true,
});

const { gateway } = createPlatformServices({
  testing: isTestingServiceEnabled() ? testing : undefined,
  accessResolver,
  authorizationMode: "production",
});

await gateway.testing.plans.list(ctx);
```

| Env                            | Effect                                                       |
| ------------------------------ | ------------------------------------------------------------ |
| `TESTING_SERVICE_ENABLED=true` | App should wire testing bundle into `createPlatformServices` |
| unset / other                  | `gateway.testing` throws controlled configuration error      |

Factories: `createTestingPlatformServices`, `createTestingPlatformServicesForProduction`, `createTestingPlatformServicesForTest`.

## Authorisation bootstrap

```typescript
import {
  createPlatformServices,
  InMemoryAuthorizationAccessResolver,
} from "@apzhub/platform-services";

const { gateway } = createPlatformServices({
  accessResolver: new InMemoryAuthorizationAccessResolver(/* fixtures */),
  authorizationMode: "production",
});
```

| Mode       | Env                                                                         |
| ---------- | --------------------------------------------------------------------------- |
| allow-all  | default outside production; explicit tests/dev                              |
| production | default when `NODE_ENV=production` and mode unset; requires access resolver |
| deny-all   | explicit tests                                                              |

Production never silently uses allow-all (`AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION=true` required for break-glass).

## Mapping store bootstrap

```typescript
import { createPlatformServicesFromEnv } from "@apzhub/platform-services";

const { gateway, mappingStore } = await createPlatformServicesFromEnv();
```

| Mode     | Env                                                    |
| -------- | ------------------------------------------------------ |
| memory   | default outside production; tests                      |
| postgres | default in production; requires healthy `DATABASE_URL` |

## Testing

```bash
pnpm --filter @apzhub/platform-services test
```

Fixtures: `@apzhub/platform-services/testing`

APZTCMS-011 targeted tests: `packages/platform-services/src/services/testing/`

## Related documentation

- [Testing Platform Service Architecture](../../docs/architecture/APZHUB-Testing-Platform-Service-Architecture.md)
- [Testing Gateway Reference](../../docs/architecture/APZHUB-Testing-Gateway-Reference.md)
- [Testing Bootstrap Configuration Guide](../../docs/architecture/APZHUB-Testing-Bootstrap-Configuration-Guide.md)
- [Platform Service Authorization](../../docs/architecture/APZHUB-Platform-Service-Authorization.md)
- [Permission Catalogue](../../docs/specs/APZHUB-Platform-Permission-Catalogue.md)
- [Platform Service Gateway](../../docs/specs/APZHUB-Platform-Service-Gateway.md)
- [APZTCMS-011 Completion Report](../../docs/sprint/APZTCMS-011-completion-report.md)
