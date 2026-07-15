# APZHUB Platform Reporting HTTP API

**Milestone:** APZREPORT-002  
**Base path:** `/api/v1/reporting`

## Request path

```text
HTTP → withPlatformApiAuth → handlers/reporting.ts
  → PlatformServiceGateway.reporting
  → RequestPipeline (platformReporting)
  → Authorization (report.*)
  → PlatformReportingServiceImpl → reporting-core
```

Handlers contain no business logic.

## Endpoints

| Method | Path | Gateway op |
|--------|------|------------|
| GET | `/formats` | static formats |
| GET | `/types` | `listAvailableReports` |
| GET | `/templates` | `listTemplates` |
| GET | `/templates/{templateId}` | `getTemplate` |
| POST | `/validate` | `validateReport` |
| POST | `/generate` | `generateReport` |
| POST | `/preview` | `previewReport` |
| GET | `/generations` | `listReportMetadata` |
| GET | `/generations/{metadataId}` | `getReportMetadata` |

## Permissions

`report.view` · `report.templates` · `report.preview` · `report.generate` · `report.audit`

## OpenAPI

Tag **Platform Reporting** in `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` (validated).
