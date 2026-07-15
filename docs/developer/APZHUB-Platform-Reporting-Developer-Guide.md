# APZHUB Platform Reporting Developer Guide

**Milestone:** APZREPORT-001

## Create a platform reporting service

```ts
import { createPlatformReportingService } from "@apzhub/reporting-core";
import type { BuiltinTemplateCatalogue } from "@apzhub/reporting-core";

const catalogue: BuiltinTemplateCatalogue = {
  list: (type) => /* product templates */,
  get: (id) => /* ... */,
  defaultIdFor: (type) => /* ... */,
  listReportTypes: () => ["my-report"],
};

const reporting = createPlatformReportingService({
  catalogue,
  templates: myTemplateRepo,
  metadata: myMetadataRepo,
  now: () => new Date().toISOString(),
  id: () => crypto.randomUUID(),
});

const result = await reporting.generateReport(ctx, {
  reportType: "my-report",
  outputFormat: "html",
  parameters: {
    metrics: { score: 100 },
    text: { productName: "APZHUB" },
  },
});
```

## Rules

- Supply pre-computed `ReportParameters` — never calculate business values in the engine
- Keep product templates in the product package
- Use ports for persistence — do not couple the engine to a specific database schema
- Prefer importing from `@apzhub/reporting-core` / `@apzhub/reporting-contracts` (TCMS re-exports are compatibility only)

## TCMS reference consumer

See `packages/testing-services/src/reporting/reporting-service.ts` for port adapters over `testing-persistence`.

## Next

**APZREPORT-002 — Reporting HTTP API & Platform Workbench** (not implemented here).
