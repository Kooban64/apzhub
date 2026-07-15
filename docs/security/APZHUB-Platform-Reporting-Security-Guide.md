# APZHUB Platform Reporting Security Guide

**Milestone:** APZREPORT-002

## Authorization

Every gateway op maps through `platformReportingOps` to `report.*` permissions. HTTP uses `withPlatformApiAuth`; pipeline enforces authz.

## Isolation

Tenant/org isolation remains in reporting persistence (TCMS first-consumer stores). Metadata is immutable after create.

## Presentation rules

- Handlers never import reporting-core or testing-services
- No binary document storage in this milestone — only metadata + rendered body in API responses (base64 for pdf/docx)
- No scheduling, email, notifications, or Event Bus side effects

## Least privilege

UI gates on `report.view`; generate/preview/templates/audit require their respective keys server-side.
