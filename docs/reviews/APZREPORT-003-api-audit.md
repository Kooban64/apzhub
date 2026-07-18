# APZREPORT-003 — API Audit

**Date:** 2026-07-13  
**Verdict:** **PASS**  
**Certification:** APZREPORT-003

---

## HTTP routes certified

| Method | Path                                         | Handler                         | Auth operation     |
| ------ | -------------------------------------------- | ------------------------------- | ------------------ |
| GET    | `/api/v1/reporting/formats`                  | `handleListReportOutputFormats` | reporting list     |
| GET    | `/api/v1/reporting/types`                    | `handleListAvailableReports`    | reporting list     |
| GET    | `/api/v1/reporting/templates`                | `handleListReportTemplates`     | reporting list     |
| GET    | `/api/v1/reporting/templates/{templateId}`   | `handleGetReportTemplate`       | reporting read     |
| POST   | `/api/v1/reporting/validate`                 | `handleValidateReport`          | reporting validate |
| POST   | `/api/v1/reporting/generate`                 | `handleGenerateReport`          | reporting generate |
| POST   | `/api/v1/reporting/preview`                  | `handlePreviewReport`           | reporting preview  |
| GET    | `/api/v1/reporting/generations`              | `handleListReportGenerations`   | reporting list     |
| GET    | `/api/v1/reporting/generations/{metadataId}` | `handleGetReportGeneration`     | reporting read     |

All routes use `withPlatformApiAuth` → gateway → RequestPipeline → authz → `gateway.reporting`.

## OpenAPI

- Tag: **Platform Reporting**
- Spec: `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`
- Validation: `pnpm openapi:validate:platform` — **PASS**
- Paths aligned with shipped App Router routes

## Schemas & envelopes

- Zod schemas in `apps/web/lib/api/v1/schemas/reporting.ts`
- Canonical reporting DTOs only (no engine leakage)
- Standard platform success/error envelopes with correlation IDs
- Method-not-allowed responses on unsupported verbs

## Authorization

- Gateway ops mapped under `platformReporting` / resource `platform_reporting`
- Permissions: `report.view`, `report.templates`, `report.preview`, `report.generate`, `report.audit`

## Pagination / filtering / sorting

| Concern    | HTTP                                | Workbench                         |
| ---------- | ----------------------------------- | --------------------------------- |
| Pagination | Collection envelopes (`page.total`) | Client-side page size 10          |
| Filtering  | Optional `reportType` on templates  | Search across name/type/id/format |
| Sorting    | Not exposed as query params         | Client-side sort + order controls |

**Verdict:** API presentation surface certified; list query sophistication is workbench-side (acceptable for read-only administration).

## Error handling

- Typed client maps 401/403/404/generic failures
- Handler tests cover validate / preview / generate / metadata flows
- No raw backend/engine errors exposed

## Known API debt

- `handleRenderReport` is gateway-reachable via tests but **not** published as `/api/v1/reporting/render` (excluded from OpenAPI; not a shipped product surface)
