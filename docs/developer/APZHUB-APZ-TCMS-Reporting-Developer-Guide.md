# APZHUB APZ TCMS Reporting Developer Guide

**Milestone:** APZTCMS-024

## Quick start

Reporting is exposed through the platform gateway only (no REST in 024):

```ts
import { createTestingPlatformServicesForTest } from "@apzhub/platform-services/testing";

const { gateway } = createTestingPlatformServicesForTest({
  allowInMemoryPersistence: true,
});

const result = await gateway.testing.reporting.generateReport(ctx, {
  reportType: "executive",
  outputFormat: "html",
  parameters: {
    text: { productName: "APZHUB", periodLabel: "Q2", executiveSummary: "Stable." },
    metrics: { passRate: 97, coveragePercent: 88, openRisks: 2, releaseReadiness: 91 },
    tables: { keyIndicators: { columns: ["K", "V"], rows: [["Pass", "97"]] } },
    lists: { highlights: ["No regressions"] },
    summaries: { executiveSummary: "Stable." },
  },
});
```

## Service surface

`TestingReportingService` methods: `listAvailableReports`, `listTemplates`, `getTemplate`, `registerTemplate`, `validateReport`, `previewReport`, `generateReport`, `renderReport`, `archiveReportMetadata`, `listReportMetadata`, `getReportMetadata`, `listReportPlaceholders`.

Domain interface: `ReportingService` in `@apzhub/testing-contracts`.

## Parameters contract

Supply all display values in `ReportParameters`:

- `metrics` — required keys per template
- `tables`, `lists`, `summaries`, `text`, `metadata` — optional with warnings for missing structural keys

Do not expect the framework to compute scores from SoR data.

## Permissions

Grant `report.generate` for production generation, `report.preview` for validation/preview, `report.templates` for template CRUD, `report.audit` for metadata listing/archival.

## Testing

Vitest suites:

- `packages/testing-services/src/reporting/reporting-framework.test.ts`
- `packages/testing-persistence/src/repositories/reporting/reporting-persistence.test.ts`
- `packages/platform-services/src/services/testing/testing-reporting-gateway.test.ts`

## Next milestone

**APZTCMS-025 — Reporting HTTP API & Workbench** (recommended; not implemented in 024).
