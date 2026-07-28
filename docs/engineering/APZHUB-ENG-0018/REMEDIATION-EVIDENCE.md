# APZHUB-ENG-0018 — Remediation Evidence

> **Programme:** APZHUB-ENG-0018  
> **Date:** 2026-07-21

## Groups

| Identifier        | Status         | Evidence                                                                                       |
| ----------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| RG-LAW-API-AUTHZ  | **REMEDIATED** | Law API Vitest authz suites **PASS**; helpers grant/deny Platform Authorization mock           |
| RG-LAW-SEARCH-INT | **REMEDIATED** | Search/lifecycle/palette/calendar/tenant-isolation Vitest **PASS** with session tenant binding |

## Inventory IDs cleared

| IDs           | Count | Group             |
| ------------- | ----: | ----------------- |
| QA2-V-051…074 |    24 | RG-LAW-API-AUTHZ  |
| QA2-V-075…081 |     7 | RG-LAW-SEARCH-INT |

## Repository impact (paths)

- `apps/web/lib/api/testing/law-api-test-helpers.ts`
- `apps/web/lib/api/{clients,trust,calendar-events,invoices,time-entries}/*.test.ts`
- `apps/law-platform/lib/{legal-search-*.integration,matter-lifecycle.integration,calendar-event-workflow.integration,knowledge/legal-search-tenant-isolation}.test.ts`

## Durable evidence

[docs/operations/evidence/portfolio-recert/20260721T143546Z-APZHUB-ENG-0018-RG-LAW-API-AUTHZ-SEARCH-INT.json](../../operations/evidence/portfolio-recert/20260721T143546Z-APZHUB-ENG-0018-RG-LAW-API-AUTHZ-SEARCH-INT.json)
