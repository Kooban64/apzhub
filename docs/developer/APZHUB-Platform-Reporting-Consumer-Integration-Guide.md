# APZHUB Platform Reporting — Consumer Integration Guide

**Milestone:** APZREPORT-001  
**Status:** Guidance only — no product implementations beyond APZ TCMS.

## Who should consume

| Product | Suggested first reports | Notes |
|---------|-------------------------|-------|
| **Projects** | Portfolio / delivery summary | Templates owned by Projects |
| **Support** | SLA / ticket quality summary | No Support UI in this milestone |
| **Documents** | Document control / revision pack | Parameters from Document services |
| **Analytics** | Metric export packs | Do not duplicate analytics engines |
| **Workflow** | Run / approval summary | Event-driven generation later |
| **Compliance** | Evidence / control packs | Align with audit metadata |
| Future products | Domain-specific kinds | Register own `ReportTypeId` strings |

## Integration steps

1. Add workspace deps: `@apzhub/reporting-contracts`, `@apzhub/reporting-core`
2. Author product templates (manifest-first when product SDK requires it)
3. Implement repository ports or in-memory stores for templates/metadata
4. Wire `createPlatformReportingService`
5. Expose via product Platform Service gateway facet when ready
6. Defer HTTP/Workbench to **APZREPORT-002**

## Permissions

Use platform keys from `PLATFORM_REPORT_PERMISSIONS`:

- `report.view` · `report.generate` · `report.preview` · `report.templates` · `report.audit` · `report.admin`

Map gateway operations to these keys (see TCMS `testingReportingOps`).

## Do not

- Import `@apzhub/testing-services` reporting templates from other products
- Add scheduling, email, notifications, or binary storage here
- Calculate business metrics inside renderers
