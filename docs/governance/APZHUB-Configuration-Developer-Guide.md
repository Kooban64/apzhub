# APZHUB Configuration Developer Guide (PRH-004)

## Reading configuration

```typescript
import { getEnv } from "@apzhub/config";

const env = getEnv();
console.log(env.DATABASE_URL); // typed, validated, cached
```

## Validation and diagnostics

```typescript
import {
  validatePlatformEnvironment,
  getConfigurationDiagnostics,
  ensureEnvironmentValid,
} from "@apzhub/config/governance";

const validation = validatePlatformEnvironment();
const diagnostics = getConfigurationDiagnostics();

// Production startup (apps/runtime-init.ts)
ensureEnvironmentValid({ abortProcess: process.env.NODE_ENV === "production" });
```

## Tests

```typescript
import { resetEnvCache } from "@apzhub/config";
import { vi, afterEach } from "vitest";

afterEach(() => {
  resetEnvCache();
  vi.unstubAllEnvs();
});

vi.stubEnv("DATABASE_URL", "postgresql://...");
```

Use `PlatformConfigurationProvider` with overrides for isolated unit tests:

```typescript
import { PlatformConfigurationProvider } from "@apzhub/config/governance";

const provider = new PlatformConfigurationProvider(process.env, {
  LAW_REPOSITORY_MODE: "memory",
});
provider.getDiagnostics();
```

## Adding a variable

1. Add entry to `PLATFORM_CONFIG_REGISTRY` with full metadata
2. Add field to `platformEnvSchema` in `governance/schema.ts`
3. Update `.env.example`
4. Add tests in `governance.test.ts`

## Do not

- Parse `process.env` directly for platform-owned keys in product code
- Log raw secrets
- Define parallel Zod schemas in apps or modules
- Implement Vault integration in PRH-004 scope

## Law platform variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LAW_REPOSITORY_MODE` | `memory` | Persistence backend |
| `LAW_TENANT_ID` | — | Dev/test tenant override |
| `LAW_OUTBOX_ENABLED` | — | Outbox toggle in postgres mode |

Access via `getEnv()`:

```typescript
const { LAW_REPOSITORY_MODE } = getEnv();
```

## References

- [Environment Governance](./APZHUB-Environment-Governance.md)
- [Secrets Architecture](../architecture/APZHUB-Secrets-Architecture.md)
