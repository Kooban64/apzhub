# APZHUB Platform Reporting Architecture

**Milestone:** APZREPORT-001  
**Status:** Complete  
**Scope:** Promote reporting from APZ TCMS into reusable platform packages. No REST, Workbench, scheduling, email, or storage.

## Purpose

Reporting is a shared APZHUB Platform capability. Products supply templates and pre-computed parameters; the platform binds, renders, and fingerprints outputs.

## Packages

| Package                       | Version | Role                                                                |
| ----------------------------- | ------- | ------------------------------------------------------------------- |
| `@apzhub/reporting-contracts` | 0.1.0   | Canonical models, `PlatformReportingService`, permissions           |
| `@apzhub/reporting-core`      | 0.1.0   | Template engine, output providers, `createPlatformReportingService` |
| `@apzhub/testing-services`    | 0.11.0  | TCMS consumer — product templates + persistence ports               |
| `@apzhub/testing-contracts`   | 0.11.0  | TCMS `ReportType` + re-exports                                      |

## Request path

```text
Product Domain Service
  → createPlatformReportingService({ catalogue, templates, metadata })
  → Template Engine (placeholder binding)
  → Output Providers (html|markdown|pdf|docx|json|csv)
  → ReportGenerationMetadata (product-owned store)
```

TCMS gateway path unchanged:

```text
PlatformServiceGateway.testing.reporting → TestingReportingServiceImpl → TCMS ReportingService → reporting-core
```

## Separation of concerns

| Layer                       | Owner    | Notes                                       |
| --------------------------- | -------- | ------------------------------------------- |
| Canonical contracts         | Platform | `reportType` is a string id                 |
| Template engine / renderers | Platform | No business calculations                    |
| Product templates           | Product  | e.g. TCMS builtin catalogue                 |
| Persistence                 | Product  | Ports; TCMS keeps `testing_report_*` tables |
| Gateway facet               | Product  | e.g. `testing.reporting`                    |

## Future (documented only — not implemented)

- Scheduling of report runs
- Notifications / email delivery
- Binary document storage & document management
- HTTP API & Platform Workbench (APZREPORT-002)
- Shared platform metadata store (beyond product ports)

## Related documents

- [Migration Guide](./APZHUB-Platform-Reporting-Migration-Guide.md)
- [Developer Guide](../developer/APZHUB-Platform-Reporting-Developer-Guide.md)
- [Consumer Integration Guide](../developer/APZHUB-Platform-Reporting-Consumer-Integration-Guide.md)
- [Package Guide](../developer/APZHUB-Platform-Reporting-Package-Guide.md)
- [Completion Report](../sprint/APZREPORT-001-completion-report.md)
