# APZHUB Identity Gateway Guide

**Milestone:** APZIDENTITY-002

## Access pattern

```typescript
import {
  createPlatformServices,
  createIdentityPlatformServicesForTest,
} from "@apzhub/platform-services";

const identity = createIdentityPlatformServicesForTest({
  allowInMemoryPersistence: true,
});
const { gateway } = createPlatformServices({ identity });

await gateway.identity.users.list(ctx);
```

## Facets

Use `gateway.identity.{users|groups|roles|organisations|tenants|departments|positions|memberships|serviceAssignments|invitations|activation|deactivation|policies|audit|history|references|diagnostics}`.

Every call requires `ServiceRequestContext` with `tenantId`, `userId`, `correlationId`, and `permissions`.

## Errors

Failures surface as `PlatformServiceError` — never raw `IdentityDomainError` or Drizzle/Postgres messages.

## Diagnostics

`diagnostics.health` / `readiness` / `capabilities` return metadata readiness flags only (`httpEnabled: false`, `authenticationManaged: false`, `provisioningEnabled: false`, `directorySyncEnabled: false`) — no live directory or IdP probes.
