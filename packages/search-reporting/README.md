# `@apzhub/search-reporting`

**Milestone:** APZSEARCH-014  
**Version:** 0.1.0  
**Product:** `reporting`

Reporting Search Publication Adapter — maps Reporting Platform metadata models into `@apzhub/search-integration` for discovery. **Metadata-only.**

## Boundaries

- Never publishes rendered report bodies (PDF/DOCX/HTML/MD/CSV/JSON content)
- Never publishes `parametersJson` values, checksum hex, or template section blueprints
- Never imports Meilisearch, Search Platform internals, `platform-services`, persistence, or HTTP/Workbench
- Production factories require an explicit sink / integration publisher

## Quick start

```ts
import {
  createReportingSearchAdapterForTest,
  createReportingSearchPublicationContext,
} from "@apzhub/search-reporting";

const adapter = createReportingSearchAdapterForTest();
const context = createReportingSearchPublicationContext({
  serviceContext: {
    tenantId: "tenant-a",
    userId: "user-1",
    correlationId: "corr-1",
    permissions: ["reporting.read"],
  },
});

adapter.publisher.publish(context, {
  entityType: "report_template",
  entity: template,
  extras: { tenantId: "tenant-a" },
});
```

## Audit

```bash
pnpm audit:search-reporting
pnpm --filter @apzhub/search-reporting test
```
