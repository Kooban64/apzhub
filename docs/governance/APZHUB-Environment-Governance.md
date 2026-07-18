# APZHUB Environment Governance (PRH-004)

## Policy

1. All platform configuration variables are registered in `PLATFORM_CONFIG_REGISTRY`.
2. Every variable has type, default (where applicable), validation, description, owner, scope, and secret classification.
3. Products consume `getEnv()` or governance diagnostics — they do not parse `process.env` for platform variables.
4. Production startup aborts when strict validation fails (`ensureEnvironmentValid({ abortProcess: true })`).
5. Development warns on validation issues without aborting startup.

## Variable registry

Source: `packages/config/src/governance/registry.ts`

Owners: `platform`, `identity`, `law-platform`, `infrastructure`, `presentation`, `integrations`

### Integrations — Plane (OSS-101-02)

| Key                         | Type    | Default | Secret     | When required           |
| --------------------------- | ------- | ------- | ---------- | ----------------------- |
| `PLANE_INTEGRATION_ENABLED` | boolean | `false` | none       | —                       |
| `PLANE_BASE_URL`            | url     | —       | none       | When enabled            |
| `PLANE_API_BASE_URL`        | url     | —       | none       | When enabled            |
| `PLANE_API_TOKEN`           | string  | —       | credential | When enabled            |
| `PLANE_WORKSPACE_ID`        | string  | —       | none       | Dev/staging convenience |
| `PLANE_WEBHOOK_SECRET`      | string  | —       | secret     | OSS-101-08+ webhooks    |

Detail: [Plane Configuration Notes](./APZHUB-Plane-Configuration-Notes.md)

## Deprecated variables

| Alias         | Replacement          | Since   |
| ------------- | -------------------- | ------- |
| `AUTH_SECRET` | `BETTER_AUTH_SECRET` | SPR-001 |
| `AUTH_URL`    | `BETTER_AUTH_URL`    | SPR-001 |

Deprecated aliases are resolved at load time and reported in diagnostics.

## Unknown variables

Diagnostics report unknown `process.env` keys excluding framework prefixes (`NEXT_`, `VITEST_`, `npm_`, etc.).

## Startup sequence

```
instrumentation.ts
  → ensurePlatformRuntimeReady()
    → ensureEnvironmentValid()   [PRH-004]
    → ensureCanonicalBootstrap() [PRH-001]
```

## Operations checks

```bash
curl -sS -b cookies.txt https://<host>/api/platform/v1/security/diagnostics | jq '.data.security.environment'
curl -sS -b cookies.txt https://<host>/api/platform/v1/operations/configuration | jq '.data.configuration'
```

## Change control

New environment variables require registry entry before use. No ad-hoc `process.env` reads for platform-owned keys in product code.

## References

- [Configuration Architecture](../architecture/APZHUB-Configuration-Architecture.md)
- [Configuration Developer Guide](./APZHUB-Configuration-Developer-Guide.md)
