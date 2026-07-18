# APZMETRICS-005 — Route-to-OpenAPI Traceability

**Date:** 2026-07-18  
**OpenAPI:** Platform **1.9.0** — tag **Platform Metrics Administration**

## Coverage

| Surface                                           | HTTP | OpenAPI |
| ------------------------------------------------- | ---- | ------- |
| Metrics / Definitions / Versions                  | ✅   | ✅      |
| Categories / Groups / Dimensions / Labels / Units | ✅   | ✅      |
| Formulas / Aggregations / Thresholds              | ✅   | ✅      |
| Owners / Consumers / Retention / Classifications  | ✅   | ✅      |
| Dependencies / KPIs / KPI Groups / Targets        | ✅   | ✅      |
| Relationships / Metadata                          | ✅   | ✅      |
| Diagnostics health/readiness/capabilities         | ✅   | ✅      |

## Forbidden surfaces (absent)

`/metrics/prometheus`, `/grafana`, `/execute`, `/calculate`, `/scrape`, `/ingest`, `/analytics`, `/workbench`.

Validation: `pnpm openapi:validate:platform`.
