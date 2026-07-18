# Search Integration Adapter Development Guide

| Field         | Value           |
| ------------- | --------------- |
| **Audience**  | Adapter authors |
| **Milestone** | APZSEARCH-004   |

## 1. Start with bootstrap

```ts
import { createSearchIntegrationBootstrapConfiguration } from "@apzhub/integration-search-sdk";

const configuration = createSearchIntegrationBootstrapConfiguration({
  integrationId: "search.vendor.example",
  adapterId: "example-search-adapter",
  name: "Example Search Adapter",
  version: "0.1.0",
});
```

## 2. Extend the base

```ts
import { SearchIntegrationAdapterBase } from "@apzhub/integration-search-sdk";

export class ExampleSearchAdapter extends SearchIntegrationAdapterBase {
  protected override async onSearchInitialise(): Promise<void> {
    // Capability checks / metadata only — no engine client
  }
}
```

## 3. Factory create

```ts
const factory = createSearchAdapterFactory();
const { adapter } = await factory.create(ExampleSearchAdapter, {
  configuration,
  declaredSearchCapabilities: [
    "keyword_search",
    "health",
    "diagnostics",
    "configuration_validation",
  ],
});
```

## 4. Mandatory rules

- Do **not** import engine SDKs in this milestone.
- Override `executeQuery` / index / document only to keep returning `NOT_IMPLEMENTED` until an approved engine milestone.
- Secrets = credential **refs** only (`SearchConfigurationValidator`).
- Diagnostics must pass `SearchProviderDiagnostics.assertSafe`.
- Compose integration-sdk resilience/auth — do not fork circuit breaker or secret providers.

## 5. Testing

Use `MockSearchIntegrationAdapter` / `createMockSearchAdapterBootstrap` for SDK contract tests. Vendor adapters add their own certification suite in a later milestone.

## 6. Checklist before merge

- [ ] `module`/`integration` manifests declare `"search"`
- [ ] Capability declarations align with contracts
- [ ] No engine clients in package dependencies
- [ ] Audit `pnpm audit:search-integration-sdk` passes
- [ ] Unit tests cover factory, lifecycle, NOT_IMPLEMENTED ports
