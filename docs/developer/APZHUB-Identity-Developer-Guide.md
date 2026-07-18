# Identity Administration Developer Guide

## Packages

| Package                        | Version    | Milestone                            |
| ------------------------------ | ---------- | ------------------------------------ |
| `@apzhub/identity-contracts`   | **0.2.0**  | APZIDENTITY-002                      |
| `@apzhub/identity-core`        | **0.2.0**  | APZIDENTITY-002                      |
| `@apzhub/identity-persistence` | **0.1.0**  | APZIDENTITY-001                      |
| `@apzhub/platform-services`    | **0.23.0** | APZIDENTITY-002 (`gateway.identity`) |

## Preferred consumption (APZIDENTITY-002)

```ts
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

See [Identity Platform Services Developer Guide](./APZHUB-Identity-Platform-Services-Developer-Guide.md).

## Foundation (APZIDENTITY-001)

```ts
import { createIdentityFoundation } from "@apzhub/identity-core";
import {
  createIdentityPersistenceForTest,
  createProductionIdentityPersistence,
} from "@apzhub/identity-persistence";

const repos = createProductionIdentityPersistence({ db });
const foundation = createIdentityFoundation({ repos });
```

Never omit `db` in production — silent in-memory fallback is forbidden.

## Audit

```bash
pnpm audit:identity-foundation
pnpm audit:identity-platform-services
```

## Next

Do not implement HTTP / OpenAPI / Typed Client until **APZIDENTITY-003** is approved.
