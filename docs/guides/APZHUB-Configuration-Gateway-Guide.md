# APZHUB Configuration Gateway Guide

**Milestone:** APZCONFIG-002

## Access pattern

```typescript
import { createPlatformServices } from "@apzhub/platform-services";
import { createConfigurationPlatformServicesForTest } from "@apzhub/platform-services";

const configuration = createConfigurationPlatformServicesForTest({
  allowInMemoryPersistence: true,
});
const { gateway } = createPlatformServices({ configuration });

await gateway.configuration.configurations.list(ctx);
```

## Facets

Use `gateway.configuration.{configurations|namespaces|groups|versions|overrides|scopes|validation|references|audit|diagnostics}`.

Every call requires `ServiceRequestContext` with `tenantId`, `userId`, `correlationId`, and `permissions`.

## Errors

Failures surface as `PlatformServiceError` — never raw `ConfigurationDomainError` or Drizzle/Postgres messages.
