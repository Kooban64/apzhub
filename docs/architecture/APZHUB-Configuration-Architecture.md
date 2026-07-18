# APZHUB Configuration Architecture (PRH-004)

## Purpose

Establish `@apzhub/config` as the canonical Platform configuration provider. Products consume configuration; they do not own schema, validation, or secret handling.

## Package

| Export                      | Role                                                     |
| --------------------------- | -------------------------------------------------------- |
| `@apzhub/config`            | `getEnv()`, helpers, governance re-exports               |
| `@apzhub/config/governance` | Registry, validation, diagnostics, secrets (lightweight) |
| `@apzhub/config/db`         | Persistence only — not configuration                     |

## Components

```
PlatformConfigurationProvider
├── registry        — variable metadata (type, default, owner, scope, secret class)
├── schema          — Zod validation (platformEnvSchema)
├── precedence      — defaults → environment → overrides
├── profiles        — development | test | production rules
├── validation      — tiered validation + ensureEnvironmentValid()
├── secrets         — masking + secret diagnostics
├── deprecation     — alias detection (AUTH_SECRET → BETTER_AUTH_SECRET)
├── vault           — SecretVaultProvider interface (no Vault impl)
└── diagnostics     — getConfigurationDiagnostics()
```

## Precedence

1. Schema defaults (Zod `.default()`)
2. Process environment (with deprecated alias resolution)
3. Programmatic overrides (tests, `PlatformConfigurationProvider`)

## Per-environment profiles

| Profile     | Validation tier | Startup abort on failure        |
| ----------- | --------------- | ------------------------------- |
| development | permissive      | No                              |
| test        | strict          | Yes (when `abortProcess: true`) |
| production  | strict          | Yes                             |

## Integration

- **Apps:** `runtime-init.ts` calls `ensureEnvironmentValid()` before platform bootstrap
- **Security:** `EnvironmentValidationService` delegates to `@apzhub/config/governance`
- **Operations:** `/api/platform/v1/operations/configuration` exposes masked diagnostics

## Product rule

Products must not define parallel env schemas. Extend `PLATFORM_CONFIG_REGISTRY` via platform change control.

## References

- [Secrets Architecture](./APZHUB-Secrets-Architecture.md)
- [Environment Governance](../governance/APZHUB-Environment-Governance.md)
- [Configuration Developer Guide](../governance/APZHUB-Configuration-Developer-Guide.md)
