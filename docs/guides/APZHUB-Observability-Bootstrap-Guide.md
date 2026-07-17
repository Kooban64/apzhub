# Observability Bootstrap Guide

**Milestone:** APZOBSERVE-002

## Env

```bash
APZHUB_OBSERVE_ENABLED=true
DATABASE_URL=postgresql://...
```

## Behaviour

- `isObserveServiceEnabled` is deny-by-default (`true` / `1` / `on` only)
- Production factory: `createObservePlatformServicesForProduction({ postgresDb })`
- Missing `DATABASE_URL` when enabled → hard error (no silent memory)
- Tests: `createObservePlatformServicesForTest({ allowInMemoryPersistence: true })`

## Bootstrap wiring

`apps/web/lib/api/v1/gateway/bootstrap.ts` wires observe into `createPlatformServices({ observe })` when enabled.
