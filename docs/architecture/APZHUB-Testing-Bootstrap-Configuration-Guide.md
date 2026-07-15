# APZHUB — Testing Bootstrap Configuration Guide

**Milestone:** APZTCMS-011  
**Package:** `@apzhub/platform-services`  
**Status:** Production-safe factories — no silent in-memory or allow-all

---

## Environment flag

| Variable | Values | Default | Effect |
| -------- | ------ | ------- | ------ |
| `TESTING_SERVICE_ENABLED` | `"true"` / anything else | unset → disabled | App bootstrap decides whether to call testing factories and pass `testing` to `createPlatformServices` |

```typescript
import { isTestingServiceEnabled } from "@apzhub/platform-services";

if (isTestingServiceEnabled()) {
  // wire createTestingPlatformServicesForProduction
}
```

Only the exact string `"true"` enables testing. `"false"`, empty, or unset → disabled.

---

## Factory catalogue

### `createTestingPlatformServices`

General-purpose factory when caller supplies persistence or pre-built domain:

```typescript
import { createTestingPlatformServices } from "@apzhub/platform-services";

const bundle = createTestingPlatformServices({
  persistence, // required unless domain provided
});
```

**Throws** if neither `domain` nor `persistence` is provided — no silent defaults.

### `createTestingPlatformServicesForProduction`

Production path — **Postgres only**:

```typescript
import { createTestingPlatformServicesForProduction } from "@apzhub/platform-services";

const testing = createTestingPlatformServicesForProduction({
  postgresDb, // Drizzle db handle
});
```

Uses `createPostgresTestingPersistence`. Readiness reports `persistence: "postgres"`. No in-memory fallback.

### `createTestingPlatformServicesForTest`

Test-only factory:

```typescript
const testing = createTestingPlatformServicesForTest({
  allowInMemoryPersistence: true, // explicit opt-in
});
// or
const testing = createTestingPlatformServicesForTest({ persistence: customPersistence });
```

**Throws** without `persistence`, `domain`, or `allowInMemoryPersistence: true`.

---

## Bundle shape

`TestingPlatformServicesBundle`:

| Field | Purpose |
| ----- | ------- |
| `domain` | `TestingDomainServices` instance |
| `gatewaySurface` | Unwrapped platform impls (for direct unit tests) |
| `impls` | Raw `TestingPlatformServiceImpls` |
| `readiness` | Capability indicators |
| `wrapWithPipeline(pipeline)` | Returns pipeline-wrapped gateway for `createPlatformServices` |

---

## Platform services wiring

```typescript
import { createPlatformServices } from "@apzhub/platform-services";

const { gateway, testing } = createPlatformServices({
  testing: testingBundle,
  accessResolver,
  authorizationMode: "production",
});
```

`createPlatformServices` calls `input.testing?.wrapWithPipeline(pipeline)` and passes result as `testingApi` on the gateway.

When `testing` is omitted, `gateway.testing` is unavailable (throws controlled error).

---

## Authorisation bootstrap

Same rules as OSS-110-06:

| Mode | Behaviour |
| ---- | --------- |
| `production` | Requires `accessResolver`; never silent allow-all |
| `allow-all` | Explicit dev/test only |
| `deny-all` | Explicit negative tests |

Production never silently uses allow-all unless `AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION=true` (break-glass).

---

## Anti-patterns (forbidden)

| Anti-pattern | Why |
| ------------ | --- |
| `createTestingPlatformServices({})` in production | Throws — no persistence |
| `createTestingPlatformServicesForTest()` without opt-in | Throws — no silent in-memory |
| Calling domain services from HTTP without pipeline | Bypasses authz and audit |
| Enabling testing without Postgres in production | Violates SoR / persistence architecture |
| Using `authorizationMode: "allow-all"` in production bootstrap | Zero Trust violation |

---

## Related

- [Testing Platform Service Architecture](./APZHUB-Testing-Platform-Service-Architecture.md)
- [Testing Health Readiness Guide](./APZHUB-Testing-Health-Readiness-Guide.md)
- [Testing Security Tenancy Guide](./APZHUB-Testing-Security-Tenancy-Guide.md)
- [Platform Service Authorization](./APZHUB-Platform-Service-Authorization.md)
