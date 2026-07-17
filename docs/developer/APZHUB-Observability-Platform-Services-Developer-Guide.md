# Observability Platform Services Developer Guide

**Milestone:** APZOBSERVE-002

## Compose for tests

```ts
import {
  createObservePlatformServicesForTest,
  createPlatformServices,
} from "@apzhub/platform-services";

const observe = createObservePlatformServicesForTest({
  allowInMemoryPersistence: true,
});
const bundle = createPlatformServices({
  observe,
  authorizationMode: "allow-all", // tests only
});

await bundle.gateway.observe.healthChecks.create(ctx, {
  serviceKey: "web",
  name: "Web",
  status: "healthy",
  providerKind: "internal",
});
```

## Production

```ts
import { createObservePlatformServicesForProduction } from "@apzhub/platform-services";

const observe = createObservePlatformServicesForProduction({
  postgresDb: db,
});
```

## Audit

```bash
pnpm audit:observe-platform-services
```

## Do not

- Add HTTP / OpenAPI / typed client (APZOBSERVE-003)
- Import Grafana / Prometheus / Loki / OTel SDKs
- Duplicate business rules outside `@apzhub/observe-core`
