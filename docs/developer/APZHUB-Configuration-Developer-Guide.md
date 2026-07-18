# Platform Configuration Developer Guide

**Milestones:** APZCONFIG-001 (Foundation) · APZCONFIG-002 (Platform Services)

## Packages

```bash
pnpm exec vitest run packages/configuration-contracts packages/configuration-core packages/configuration-persistence
pnpm exec vitest run packages/platform-services/src/services/configuration
pnpm audit:configuration-foundation
pnpm audit:configuration-platform-services
```

## Platform Services (APZCONFIG-002)

```ts
import {
  createConfigurationPlatformServicesForTest,
  createPlatformServices,
} from "@apzhub/platform-services";

const configuration = createConfigurationPlatformServicesForTest({
  allowInMemoryPersistence: true,
});
const { gateway } = createPlatformServices({ configuration });

await gateway.configuration.configurations.list(ctx);
```

Production: `createConfigurationPlatformServicesForProduction({ postgresDb })` — PostgreSQL required.

## Persistence factories (APZCONFIG-001)

```ts
import { createConfigurationPersistenceForTest } from "@apzhub/configuration-persistence";

const repos = createConfigurationPersistenceForTest({
  allowInMemoryPersistence: true,
});
```

## Boundaries

- Products use `gateway.configuration.*` — never persistence repos directly
- Do not store secrets or runtime-apply configuration
- Do not confuse with `@apzhub/config` or runtime configuration-manager

## Next

**APZCONFIG-003 — Configuration HTTP API & Production Typed Client** (await owner approval).
