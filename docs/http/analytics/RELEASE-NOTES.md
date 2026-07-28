# Analytics HTTP API — Release Notes

> **Programme:** APZHUB-PLATFORM-ANALYTICS-005  
> **Date:** 2026-07-19

## Added

- Versioned HTTP surface `/api/v1/analytics/*` (Owner endpoint set).
- OpenAPI **1.11.0** paths, schemas, permission annotations, and error status mappings.
- Gateway bootstrap: `APZHUB_ANALYTICS_ENABLED` with Metabase (prod) or in-memory (non-prod) analytics bundle.
- Pipeline enrichment of `context.permissions` from matched authorization grants (HTTP empty-permissions pattern).

## Contracts / services (supporting)

- `@apzhub/analytics-contracts` **0.1.1** — `AnalyticsService.getReadiness`, `DashboardService.listCategories`.
- `@apzhub/platform-services` **0.28.0** — matching implementations + operation authorization map entries.

## Not included

Workbench Analytics Module · APZ Analytics product.
