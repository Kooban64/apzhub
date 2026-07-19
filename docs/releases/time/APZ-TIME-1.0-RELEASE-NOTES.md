# APZ Time 1.0.0 — Release Notes

> **Product:** APZ Time  
> **Version:** **1.0.0**  
> **Phase:** 1  
> **Status:** **ACCEPTED / CLOSED** — current Production Release  
> **Owner Acceptance:** 2026-07-19  
> **Date:** 2026-07-19

---

## Summary

First production Workbench for APZ Time. Users manage timesheets, activities, customers, and tags through APZHUB branding on the certified Kimai domain path.

## Added

- Time module manifest (`services/time/manifests/time/module.yaml`) — Activity Bar + sidebar
- Typed client `apps/web/lib/time` → `/api/v1/time/*` only
- Workbench views: overview, timesheets (list/create/detail), activities, customers, tags, search, health, diagnostics
- Session defaults (last timesheet / customer)
- Vitest unit + architecture boundary tests
- Playwright workbench + UI certification suites

## Consumed (unchanged)

| Package / surface                    | Version                    |
| ------------------------------------ | -------------------------- |
| `@apzhub/integration-kimai`          | **0.2.0** CERTIFIED_DOMAIN |
| `@apzhub/platform-services`          | **0.26.1**                 |
| `@apzhub/platform-service-contracts` | **0.17.1**                 |
| Time HTTP OpenAPI                    | **1.10.0**                 |
| `@apzhub/integration-sdk`            | **1.0.0**                  |

## Not included (Phase 1)

Approvals · Reporting UI · Analytics · Notifications · Exports · Billing · Leave · Scheduling · AI · Workflow automation

## Known limitations

See [KNOWN-LIMITATIONS.md](../../products/time/KNOWN-LIMITATIONS.md).
