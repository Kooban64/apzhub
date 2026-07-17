# Observability Developer Guide

**Milestones:** APZOBSERVE-001–003

## Packages

```bash
pnpm --filter @apzhub/observe-contracts typecheck
pnpm --filter @apzhub/observe-core typecheck
pnpm --filter @apzhub/observe-persistence typecheck
```

## Compose foundation (tests)

```ts
import { createObserveFoundation } from "@apzhub/observe-core";
import { createObservePersistenceForTest } from "@apzhub/observe-persistence";

const repos = createObservePersistenceForTest({
  allowInMemoryPersistence: true,
});
const foundation = createObserveFoundation({ repos });
```

## Production persistence

```ts
import { createProductionObservePersistence } from "@apzhub/observe-persistence";

const repos = createProductionObservePersistence({ db });
```

Requires an explicit PostgreSQL `DatabaseExecutor`. Silent in-memory fallback is forbidden.

## Platform Services / Gateway (APZOBSERVE-002)

Use `gateway.observe.*` via Platform Services factories. Enable with `APZHUB_OBSERVE_ENABLED`.

## HTTP & typed client (APZOBSERVE-003)

```ts
import { createHttpObserveClient, observeQueryKeys } from "@/lib/observe";

const client = createHttpObserveClient();
await client.healthChecks.list({ limit: 20 });
```

- Base path: `/api/v1/observe`
- OpenAPI tag: **Platform Observability Administration**
- Audit: `pnpm audit:observe-http-client`

## Permissions

`observe.*`, `observe.read`, `observe.manage`, `observe.health`, `observe.metrics`, `observe.logs`, `observe.traces`, `observe.alerts`, `observe.diagnostics`, plus facet-specific families used by `observePlatformOps`.

## Audits

```bash
pnpm audit:observe-foundation
pnpm audit:observe-platform-services
pnpm audit:observe-http-client
```

## Do not

- Import Grafana / Prometheus / Loki / OTel SDKs into observe packages
- Call observe-core/persistence from HTTP handlers or the typed client
- Build Observability Workbench until APZOBSERVE-004 is approved
- Probe external providers from diagnostics endpoints