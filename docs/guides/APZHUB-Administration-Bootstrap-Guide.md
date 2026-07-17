# APZHUB Administration Bootstrap Guide

**Milestone:** APZADMIN-002

## Env gate

| Variable | Effect |
| --- | --- |
| `APZHUB_ADMINISTRATION_ENABLED` | Must be `1` / `true` / `on` to enable (deny-by-default) |
| `DATABASE_URL` | Required when enabled — production uses PostgreSQL only |

## Bootstrap wiring

`apps/web/lib/api/v1/gateway/bootstrap.ts`:

- When enabled + `DATABASE_URL` → `createAdministrationPlatformServicesForProduction({ postgresDb })`
- Throws if enabled without `DATABASE_URL`
- Passes `administration` into `createPlatformServices`
- Exposes `administrationEnabled` and `administrationReadiness` on the bootstrap result

## Factories

| Factory | Use |
| --- | --- |
| `createAdministrationPlatformServicesForProduction` | Real PostgreSQL — no silent memory |
| `createAdministrationPlatformServicesForTest` | Requires `postgresDb` or `allowInMemoryPersistence: true` |
| `createAdministrationPlatformServices` | Explicit persistence bundle |
