# APZHUB Platform Reporting Typed Client Guide

**Milestone:** APZREPORT-002

## Usage

```ts
import {
  createHttpReportingClient,
  getReportingClient,
  setReportingClient,
} from "@/lib/reporting/reporting-api";

const client = createHttpReportingClient();
const templates = await client.listTemplates("executive");
const result = await client.generateReport({
  reportType: "executive",
  outputFormat: "html",
  parameters: { /* pre-computed */ },
});
```

## Methods

`listOutputFormats` · `listReportTypes` · `listTemplates` · `getTemplate` · `validateTemplate` · `previewReport` · `generateReport` · `listGeneratedReports` · `getGenerationMetadata`

## Constraints

- Calls only `/api/v1/reporting/*`
- Mock client used when `NODE_ENV=test`
- No direct engine/package access from UI
