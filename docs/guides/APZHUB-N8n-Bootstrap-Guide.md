# n8n Platform Services Bootstrap Guide

**APZWORKFLOW-007**

## Production

```ts
import { createN8nAdapter } from "@apzhub/integration-n8n";
import {
  createWorkflowEngineServicesForProduction,
  createWorkflowPlatformServicesForProduction,
  createPlatformServices,
} from "@apzhub/platform-services";

const { adapter } = await createN8nAdapter({
  tenantId,
  n8n: { baseUrl, apiBaseUrl, authMode: "api_key", apiKeyRef },
  apiKey, // resolved into SecretProvider — not logged
});

const engine = createWorkflowEngineServicesForProduction({ adapter });
const workflow = createWorkflowPlatformServicesForProduction({
  postgresDb,
  engine,
});
const bundle = createPlatformServices({
  workflow,
  authorizationMode: "production",
  accessResolver,
});
```

**Forbidden in production:** silent mock adapter, in-memory n8n client, allow-all authz as default.

## Test

```ts
const { adapter } = await createN8nAdapter({
  tenantId: "t",
  n8n: DEFAULT_TEST_N8N_CONFIG,
  apiKey: "test",
  adapterOptions: { fetchFn: createMockN8nFetch() },
});
const engine = createWorkflowEngineServicesForTest({ adapter });
const workflow = createWorkflowPlatformServicesForTest({
  allowInMemoryPersistence: true,
  engine,
});
```

Omit `engine` → unavailable stubs (`PROVIDER_CAPABILITY_UNSUPPORTED`).
