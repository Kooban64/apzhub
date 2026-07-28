# APZ Analytics 1.0.0 — Release Notes

> **Product:** APZ Analytics  
> **Version:** **1.0.0**  
> **Status:** Certification filed — **Awaiting Acceptance** (APZ-ANALYTICS-002)  
> **Certification class:** PRODUCTION_READY_WITH_LIMITATIONS  
> **Date:** 2026-07-19

---

## Summary

First production APZ Analytics product release. Operators browse curated analytics suites, dashboards, datasets, reports, saved views, search, health, and diagnostics through APZHUB branding on the certified Metabase foundation + Analytics Platform vertical.

## Added (Release 1.0 vertical)

| Layer                | Delivery                                                      |
| -------------------- | ------------------------------------------------------------- |
| Platform Foundation  | APZHUB-PLATFORM-ANALYTICS-001 · ADR-0066/0067                 |
| Information Model    | APZHUB-PLATFORM-ANALYTICS-002                                 |
| Metabase Integration | `@apzhub/integration-metabase` **0.1.0** CERTIFIED_FOUNDATION |
| Contracts            | `@apzhub/analytics-contracts` **0.1.1**                       |
| Platform Services    | Analytics services in `@apzhub/platform-services` **0.28.0**  |
| HTTP APIs            | `/api/v1/analytics/*` · OpenAPI **1.11.0**                    |
| Workbench Module     | `/workspace/analytics/*` · manifest `analytics` **0.1.0**     |

## Consumed

| Package / surface                    | Version                         |
| ------------------------------------ | ------------------------------- |
| `@apzhub/integration-metabase`       | **0.1.0** CERTIFIED_FOUNDATION  |
| `@apzhub/analytics-contracts`        | **0.1.1**                       |
| `@apzhub/platform-services`          | **0.28.0**                      |
| `@apzhub/platform-service-contracts` | **0.17.1**                      |
| Analytics HTTP OpenAPI               | **1.11.0**                      |
| `@apzhub/integration-sdk`            | **1.0.0** (Architecture Frozen) |

## Not included (Release 1.0)

AI analytics · Predictive / ML · External BI engines as primary · Custom SQL builders · Customer-facing public report portal · Live visual embed HTTP / Metabase signed-URL issuance · Postgres analytics SoR · Alerting productisation

## Known limitations

See [KNOWN-LIMITATIONS.md](../../products/apz-analytics/KNOWN-LIMITATIONS.md).

## CHANGELOG

Root [CHANGELOG.md](../../../CHANGELOG.md) — section **[APZ-ANALYTICS-002]**.
