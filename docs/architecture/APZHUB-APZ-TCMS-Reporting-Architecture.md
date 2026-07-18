# APZHUB Reporting & Document Generation Architecture

**Milestone:** APZTCMS-024  
**Status:** Complete  
**Scope:** Generic reporting framework — domain + gateway only. No REST, Workbench, scheduling, email, or document storage.

## Purpose

Introduce a reusable reporting and document-generation framework inside APZ TCMS. The framework binds pre-computed parameters to templates and renders canonical documents to multiple output formats. Business logic remains in existing domain services; reporting consumes canonical models only.

## Request path

```text
Document Request (ReportParameters)
  → ReportingService (domain)
  → Template Engine (placeholder binding)
  → Renderer / Output Provider
  → RenderedReportOutput
  → ReportGenerationMetadata (persisted; no binary storage)
```

## Gateway path

```text
PlatformServiceGateway.testing.reporting
  → RequestPipeline + Authorization
  → TestingReportingServiceImpl
  → @apzhub/testing-services reporting/*
  → TestingPersistence (reportTemplates, reportGenerationMetadata)
```

## Packages

| Package                              | Version | Role                                            |
| ------------------------------------ | ------- | ----------------------------------------------- |
| `@apzhub/testing-contracts`          | 0.11.0  | Canonical models + `ReportingService` interface |
| `@apzhub/testing-persistence`        | 0.11.0  | Migrations 0035/0036 + repos                    |
| `@apzhub/testing-services`           | 0.11.0  | Template engine, renderers, domain service      |
| `@apzhub/platform-service-contracts` | 0.14.0  | `TestingReportingService` gateway facet         |
| `@apzhub/platform-services`          | 0.14.0  | Impl + `testingReportingOps` authz map          |

## Report types (14)

Executive, Engineering, QA, Release, Certification, Coverage, Automation, Manual Testing, Risk, Evidence, Historical, Benchmark, Quality, Release Readiness.

## Output formats (6)

HTML, Markdown, PDF, DOCX, JSON, CSV — all consume the same `CanonicalReportDocument`.

## Permissions

`report.view`, `report.generate`, `report.preview`, `report.templates`, `report.audit`, `report.admin` (plus legacy `reporting.*`).

## Explicit exclusions

REST API, Workbench UI, template designer, scheduling, email, notifications, Event Bus, AI, charts, new analytics, business calculations in renderers, binary document storage.

## Related documents

- [Template Engine](./APZHUB-APZ-TCMS-Reporting-Template-Engine.md)
- [Renderer Architecture](./APZHUB-APZ-TCMS-Reporting-Renderer-Architecture.md)
- [Output Providers](./APZHUB-APZ-TCMS-Reporting-Output-Providers.md)
- [Report Metadata](./APZHUB-APZ-TCMS-Reporting-Metadata.md)
- [Developer Guide](../developer/APZHUB-APZ-TCMS-Reporting-Developer-Guide.md)
- [Completion Report](../sprint/APZTCMS-024-completion-report.md)
