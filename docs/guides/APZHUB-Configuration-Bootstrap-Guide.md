# APZHUB Configuration Bootstrap Guide

**Milestone:** APZCONFIG-002

## Production

```typescript
import { createConfigurationPlatformServicesForProduction } from "@apzhub/platform-services";

const bundle = createConfigurationPlatformServicesForProduction({
  postgresDb: db,
});
```

Requires explicit PostgreSQL — no silent in-memory fallback.

## Tests

```typescript
const bundle = createConfigurationPlatformServicesForTest({
  allowInMemoryPersistence: true,
});
```

## Application bootstrap

`apps/web/lib/api/v1/gateway/bootstrap.ts` wires configuration when `APZHUB_CONFIGURATION_ENABLED=true` and `DATABASE_URL` is set.

## Wiring into Platform Services

```typescript
createPlatformServices({
  configuration: bundle,
  authorizationMode: "production",
  accessResolver,
});
```
