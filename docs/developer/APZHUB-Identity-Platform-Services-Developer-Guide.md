# Identity Platform Services Developer Guide (APZIDENTITY-002)

## Packages

| Package                        | Version    | Role                                           |
| ------------------------------ | ---------- | ---------------------------------------------- |
| `@apzhub/identity-contracts`   | **0.2.0**  | Models, permissions, `IdentityPlatformGateway` |
| `@apzhub/identity-core`        | **0.2.0**  | Domain service + validation                    |
| `@apzhub/identity-persistence` | **0.1.0**  | Repositories                                   |
| `@apzhub/platform-services`    | **0.23.0** | Thin services + `gateway.identity`             |

## Consume via gateway

```typescript
import {
  createPlatformServices,
  createIdentityPlatformServicesForTest,
} from "@apzhub/platform-services";

const identity = createIdentityPlatformServicesForTest({
  allowInMemoryPersistence: true,
});
const { gateway } = createPlatformServices({
  identity,
  authorizationMode: "allow-all", // tests only
});

const users = await gateway.identity.users.list({
  tenantId: "t1",
  userId: "u1",
  correlationId: "c1",
  permissions: ["identity.*"],
});
```

## Domain service (internal)

Prefer gateway for consumers. Domain factory for persistence-level tests:

```typescript
import { createPlatformIdentityService } from "@apzhub/identity-core";
import { createIdentityPersistenceForTest } from "@apzhub/identity-persistence";

const repos = createIdentityPersistenceForTest({
  allowInMemoryPersistence: true,
});
const domain = createPlatformIdentityService({
  repos,
  now: () => new Date().toISOString(),
  id: () => crypto.randomUUID(),
});
```

## Audit

```bash
pnpm audit:identity-foundation
pnpm audit:identity-platform-services
```

## Next

Do not implement HTTP / OpenAPI / Typed Client until **APZIDENTITY-003** is approved.
