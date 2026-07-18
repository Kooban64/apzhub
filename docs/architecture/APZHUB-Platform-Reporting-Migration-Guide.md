# APZHUB Platform Reporting Migration Guide

**Milestone:** APZREPORT-001

## What moved

| From (APZTCMS-024)                                     | To (APZREPORT-001)                            |
| ------------------------------------------------------ | --------------------------------------------- |
| `testing-contracts` reporting models (generic)         | `@apzhub/reporting-contracts`                 |
| `testing-services` template-engine, checksum, output/* | `@apzhub/reporting-core`                      |
| Inline `ReportingService` impl                         | `createPlatformReportingService` + TCMS ports |

## What stayed in TCMS

- 14 built-in product templates (`templates/builtin-templates.ts`)
- `ReportType` union / `REPORT_TYPES`
- `testing_report_template` / `testing_report_generation_metadata` persistence
- `gateway.testing.reporting` / `TestingReportingService`
- Authz map `testingReportingOps`

## Backward compatibility

- `@apzhub/testing-contracts` re-exports platform types and keeps TCMS `ReportType`
- `@apzhub/testing-services/src/reporting` re-exports engine symbols from `@apzhub/reporting-core`
- Existing TCMS tests and gateway facet continue to work without functional changes
- Permissions: `PLATFORM_REPORT_PERMISSIONS` in reporting-contracts; TCMS `REPORTING_PERMISSIONS` unchanged

## Consumer migration (future products)

1. Depend on `@apzhub/reporting-contracts` + `@apzhub/reporting-core`
2. Provide a `BuiltinTemplateCatalogue` for product templates
3. Implement `ReportTemplateRepositoryPort` + `ReportMetadataRepositoryPort`
4. Call `createPlatformReportingService(deps)`
5. Optionally expose a product gateway facet (not required by APZREPORT-001)

Do **not** import TCMS templates or `testing_*` persistence from other products.
