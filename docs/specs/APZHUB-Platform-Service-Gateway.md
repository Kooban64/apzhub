# APZHUB Platform Service Gateway

**Milestone:** OSS-110-03 / OSS-110-04 / OSS-110-06  
**Package:** `@apzhub/platform-services`  
**Status:** Canonical application entry point for platform services

---

## Purpose

`PlatformServiceGateway` is the single controlled entry point for application code to access platform services. Modules and future route handlers depend on gateway contracts — never on `ProviderRegistry`, Plane adapters, or mapping-store internals for business flows.

Every public accessor returns a contract surface executed through the shared `RequestPipeline`, including production authorisation and policy enforcement (OSS-110-06).

---

## Surface

| Accessor               | Contract                     | Notes                                                                                            |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `workspaces`           | `WorkspaceService`           | Mapping-aware; pipeline-wrapped; authz-mapped                                                    |
| `projects`             | `ProjectService`             | Mapping-aware; pipeline-wrapped; authz-mapped                                                    |
| `teams`                | `TeamService`                | Mapping-aware; pipeline-wrapped; authz-mapped                                                    |
| `users`                | `UserService`                | Context-enforced; pipeline-wrapped; authz-mapped                                                 |
| `search`               | `SearchService`              | Context-enforced; pipeline-wrapped; authz-mapped                                                 |
| `pipeline`             | `RequestPipeline`            | Shared execution pipeline (middleware/policy registration)                                       |
| `tasks`                | `TaskService`                | Pipeline-wrapped when a task provider is registered; otherwise `PROVIDER_CAPABILITY_UNSUPPORTED` |
| `support`              | `SupportService`             | OSS-110-10 — Support Requests; requires Support providers                                        |
| `supportOrganizations` | `SupportOrganizationService` | OSS-110-10                                                                                       |
| `supportGroups`        | `SupportGroupService`        | OSS-110-10                                                                                       |
| `supportUsers`         | `SupportUserService`         | OSS-110-10                                                                                       |
| `supportArticles`      | `SupportArticleService`      | OSS-110-10                                                                                       |
| `supportSearch`        | `SupportSearchService`       | OSS-110-10                                                                                       |
| `supportHistory`       | `SupportHistoryService`      | OSS-110-10                                                                                       |
| `supportAnalytics`     | `SupportAnalyticsService`    | OSS-110-10                                                                                       |
| `testing`              | `TestingPlatformGateway`     | APZTCMS-011 — nested `gateway.testing.*`; requires testing bundle + `TESTING_SERVICE_ENABLED`    |

When testing is not wired, `gateway.testing` throws `PlatformServiceError` (`PROVIDER_CAPABILITY_UNSUPPORTED`, "Testing service is not enabled"). See [Testing Gateway Reference](../architecture/APZHUB-Testing-Gateway-Reference.md).

---

## Construction

```typescript
import { createPlatformServicesWithPlane } from "@apzhub/platform-services";
import { createPlatformServicesWithZammad } from "@apzhub/platform-services";

const projectServices = createPlatformServicesWithPlane(planeCore);
const supportServices = createPlatformServicesWithZammad(zammadCore);

// Testing (APZTCMS-011) — when TESTING_SERVICE_ENABLED=true
import {
  createTestingPlatformServicesForProduction,
  isTestingServiceEnabled,
} from "@apzhub/platform-services";

const testing = isTestingServiceEnabled()
  ? createTestingPlatformServicesForProduction({ postgresDb })
  : undefined;

const services = createPlatformServices({
  testing,
  accessResolver,
  authorizationMode: "production",
});
await services.gateway.testing.plans.list(ctx);

supportServices.gateway.assertContext(ctx);
const tickets = await supportServices.gateway.support.listSupportRequests(ctx);
```

Dependencies are injected via `createPlatformServices` — no ambient service locator.

Production authorisation:

```typescript
createPlatformServices({
  accessResolver,
  authorizationMode: "production",
  // or AUTHORIZATION_PROVIDER_MODE=production
});
```

---

## Guarantees

- Request context required (`tenantId`, `userId`, `correlationId`)
- Correlation ID preserved; request ID generated when absent
- Canonical APZHUB IDs only on public results
- Provider registry not exposed to modules
- Execution via `RequestPipeline` (middleware, policies, production authz, logging, metrics, audit)
- Deny-by-default permission evaluation for catalogued operations
- Tenant/organisation isolation aligned with entity mapping
- Public accessor names/shapes unchanged from OSS-110-03

---

## Future API-layer requirements

HTTP/API routes (OSS-110-07) are implemented under `/api/v1` and must:

1. Authenticate and build `ServiceRequestContext`
2. Call gateway accessors only — never bypass pipeline
3. Map `PlatformServiceError` to the standard response envelope
4. Propagate correlation and request IDs

See [Platform HTTP API](../architecture/APZHUB-Platform-HTTP-API.md) and [ADR-0051](../adr/ADR-0051-platform-http-api-surface.md).

---

## Related

- [Platform Execution Layer Specification](./APZHUB-Platform-Execution-Layer.md)
- [Platform Service Authorization](../architecture/APZHUB-Platform-Service-Authorization.md)
- [Permission Catalogue](./APZHUB-Platform-Permission-Catalogue.md)
- [Entity Mapping Specification](./APZHUB-Entity-Mapping-Specification.md)
- [Testing Gateway Reference](../architecture/APZHUB-Testing-Gateway-Reference.md) (APZTCMS-011)
- [OSS-110-06 Completion Report](../sprint/OSS-110-06-completion-report.md)
