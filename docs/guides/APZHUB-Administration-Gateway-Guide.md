# APZHUB Administration Gateway Guide

**Milestone:** APZADMIN-002

## Access pattern

```typescript
import { createPlatformServices } from "@apzhub/platform-services";
import { createAdministrationPlatformServicesForTest } from "@apzhub/platform-services";

const administration = createAdministrationPlatformServicesForTest({
  allowInMemoryPersistence: true,
});
const { gateway } = createPlatformServices({ administration });

await gateway.administration.modules.list(ctx);
```

## Facets

Use `gateway.administration.{modules|categories|sections|actions|permissions|audit|history|diagnostics|registrations|metadata|policies|references|capabilities|navigations|shortcuts|dashboards|widgets}`.

Every call requires `ServiceRequestContext` with `tenantId`, `userId`, `correlationId`, and `permissions`.

## Errors

Failures surface as `PlatformServiceError` — never raw `AdministrationDomainError` or Drizzle/Postgres messages.

## Diagnostics

`diagnostics.health` / `readiness` / `capabilities` return metadata readiness flags only (`workbenchEnabled: false`, `httpEnabled: false`, `runtimeAdminEnabled: false`) — no live engine probes.
