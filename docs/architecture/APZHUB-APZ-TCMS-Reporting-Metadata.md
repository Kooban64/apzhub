# APZHUB Report Generation Metadata

**Milestone:** APZTCMS-024

## Scope

Persist **metadata only** — no document binary storage in this milestone.

## Tables

| Table                                | Aggregate kind               | Purpose                      |
| ------------------------------------ | ---------------------------- | ---------------------------- |
| `testing_report_template`            | `report_template`            | Registered custom templates  |
| `testing_report_generation_metadata` | `report_generation_metadata` | Immutable generation records |

Migrations: `0035_apz_tcms_reporting.sql`, `0036_apz_tcms_reporting_rls.sql`.

## Metadata fields

- Request: `requestId`, `templateId`, `reportType`, `outputFormat`, `parametersJson`
- Provenance: `generatedAt`, `generatedBy`, `version`, `revision`
- Output fingerprint: `checksumSha256`, `byteLength`, `preview`
- Tenancy: `tenantId`, `organisationId`
- Audit: standard revision + `archivedAt` via `archiveReportMetadata`

## Immutability

`report_generation_metadata` records are immutable after create. Updates throw; archival uses the standard `archive()` repository operation.

## Security

- Tenant RLS on both tables
- Repository permission map: `report.templates`, `report.generate`, `report.preview`, `report.audit`
- Gateway authz via `testingReportingOps` in `operation-authorization-map.ts`
