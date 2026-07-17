# APZHUB n8n Developer Guide

## Package

`integrations/n8n` → `@apzhub/integration-n8n@0.1.0`

## Create adapter

```ts
import {
  createN8nAdapter,
  createMockN8nFetch,
  disposeN8nAdapter,
} from "@apzhub/integration-n8n";

const { adapter, factory } = await createN8nAdapter({
  tenantId: "tenant_1",
  n8n: {
    baseUrl: "https://n8n.example",
    authMode: "api_key",
    apiKeyRef: "secret://n8n/api-key",
  },
  apiKey: process.env.N8N_API_KEY, // tests / local only
  adapterOptions: { fetchFn: createMockN8nFetch() }, // tests
});

await adapter.connect({ tenantId: "tenant_1", correlationId: "c1" });
const workflows = await adapter.core.listWorkflows({
  tenantId: "tenant_1",
  correlationId: "c1",
});
await disposeN8nAdapter(adapter, factory);
```

## Scripts

- `pnpm --filter @apzhub/integration-n8n typecheck`
- `pnpm --filter @apzhub/integration-n8n test`
- `pnpm audit:n8n-adapter`

## Do not

Wire into Platform Services, Gateway, HTTP, or Workbench in this milestone.
