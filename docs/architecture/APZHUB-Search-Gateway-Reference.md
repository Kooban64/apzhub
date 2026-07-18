# Search Gateway Reference

> **Milestone:** APZSEARCH-003 · `@apzhub/platform-services` **0.17.0**

## Access

```typescript
const { gateway } = createPlatformServices({
  searchPlatform,
  authorizationMode: "production",
});

await gateway.searchProviders.listProviders(ctx);
await gateway.searchConfigurations.validate(ctx, configurationId);
await gateway.searchHealth.getManagementPlaneReadiness(ctx);
// gateway.searchQuery.query — throws search_execution_unavailable
```

When `searchPlatform` is omitted / `SEARCH_SERVICE_ENABLED` is false, Search platform facets throw `PROVIDER_CAPABILITY_UNSUPPORTED`.

## Pipeline

Every facet method runs through `RequestPipeline` (`wrapSearchPlatformGatewayWithPipeline`) with correlation ID, policies, production authorisation, timing, logging, and metrics.

## Legacy vs platform search

| Accessor                                 | Meaning                                                        |
| ---------------------------------------- | -------------------------------------------------------------- |
| `gateway.search`                         | Legacy Plane/product search scaffold — not APZSEARCH execution |
| `gateway.searchPlatform` / facet getters | APZSEARCH-003 management plane                                 |

Do not collapse these surfaces.
