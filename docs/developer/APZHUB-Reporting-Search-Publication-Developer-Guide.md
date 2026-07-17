# APZHUB Reporting Search Publication Developer Guide

**Package:** `@apzhub/search-reporting` **0.1.0**  
**Milestone:** APZSEARCH-014

## Install / import

```ts
import {
  SEARCH_REPORTING_VERSION,
  createReportingSearchAdapterForTest,
  createReportingSearchPublicationContext,
  createReportingSearchPublisher,
} from "@apzhub/search-reporting";
```

## Context

Accepts `ReportingRequestContext` and/or `ServiceRequestContext`:

```ts
const context = createReportingSearchPublicationContext({
  serviceContext: {
    tenantId: "tenant-a",
    userId: "user-1",
    correlationId: "corr-1",
    permissions: ["reporting.read"],
  },
  // classification defaults to confidential
});
```

## Publish a template (metadata-only)

```ts
const adapter = createReportingSearchAdapterForTest();
adapter.publisher.publish(context, {
  entityType: "report_template",
  entity: template,
  extras: { tenantId: context.tenantId },
});
```

## Production factory

```ts
import { createSearchIntegration } from "@apzhub/search-integration";

const integration = createSearchIntegration({ sink: explicitSink });
const publisher = createReportingSearchPublisher({
  integrationPublisher: integration.publisher,
  integration,
});
```

## Gates

```bash
pnpm audit:search-reporting
pnpm --filter @apzhub/search-reporting test
pnpm --filter @apzhub/search-reporting typecheck
pnpm --filter @apzhub/search-reporting lint
```

## See also

- [Architecture](../architecture/APZHUB-Reporting-Search-Publication-Adapter.md)
- [Mapping Guide](../guides/APZHUB-Reporting-Search-Mapping-Guide.md)
- [Lifecycle Guide](../guides/APZHUB-Reporting-Search-Publication-Lifecycle-Guide.md)
- [Security Guide](../guides/APZHUB-Reporting-Search-Security-and-Classification-Guide.md)
