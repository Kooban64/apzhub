# APZHUB Identity Bootstrap Guide

**Milestone:** APZIDENTITY-002

## Environment

| Variable | Behaviour |
| --- | --- |
| `APZHUB_IDENTITY_ENABLED` | Deny-by-default. Enable with `1` / `true` / `on`. Disable with `0` / `false` / `off`. |
| `DATABASE_URL` | Required when Identity is enabled in production bootstrap |

## Factories

```typescript
import {
  createIdentityPlatformServicesForProduction,
  createIdentityPlatformServicesForTest,
  isIdentityServiceEnabled,
} from "@apzhub/platform-services";

// Production — PostgreSQL required
createIdentityPlatformServicesForProduction({ postgresDb });

// Tests — explicit opt-in to memory
createIdentityPlatformServicesForTest({ allowInMemoryPersistence: true });
```

## Web gateway bootstrap

`apps/web/lib/api/v1/gateway/bootstrap.ts` wires Identity when `isIdentityServiceEnabled(process.env)` is true, then passes the bundle into `createPlatformServices({ identity })`.

## Forbidden

- Silent in-memory fallback in production
- Enabling Identity without PostgreSQL in production bootstrap
