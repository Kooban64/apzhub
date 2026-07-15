# Platform Search Typed Client Guide

The Workbench and future presentation modules consume Search via `apps/web/lib/search/`.

## Usage

```ts
import {
  executeSearchQuery,
  getSearchClient,
  setSearchClient,
  createHttpSearchClient,
  createMockSearchClient,
} from "@/lib/search/search-api";

const page = await executeSearchQuery({
  query: { keywords: "policy", includeHighlights: true },
});
```

## Rules

- Client may call **only** `/api/v1/search/*`
- Do not import `@apzhub/platform-services` or Meilisearch packages from UI/client
- Use mock client in unit tests; HTTP client in production/runtime
- Highlight snippets are sanitised to plain/escaped text before UI render

## See also

- [Search HTTP API](../architecture/APZHUB-Platform-Search-HTTP-API.md)
- [ADR-0064](../adr/ADR-0064-search-http-api-and-workbench-surface.md)
