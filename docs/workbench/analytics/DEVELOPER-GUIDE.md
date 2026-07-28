# Analytics Workbench — Developer Guide

> **Programme:** APZHUB-PLATFORM-ANALYTICS-006

## Layout

| Area              | Path                                                          |
| ----------------- | ------------------------------------------------------------- |
| Manifest          | `services/analytics/manifests/analytics/module.yaml`          |
| Typed HTTP client | `apps/web/lib/analytics/`                                     |
| Views / router    | `apps/web/components/analytics/`                              |
| Shell mount       | `apps/web/components/workbench-page.tsx` (`isAnalyticsRoute`) |

## Rules

1. Call **only** `/api/v1/analytics/*` from the typed client.
2. Never import `@apzhub/integration-metabase`, `@apzhub/platform-services`, or gateways from UI.
3. UI permission helpers are presentation-only — server AuthZ remains authoritative.
4. Reuse shell / `@apzhub/ui` patterns — no new design language.

## Enablement

Workbench routes render when the user navigates to `/workspace/analytics`. Backend data requires `APZHUB_ANALYTICS_ENABLED=true` (and Metabase or non-prod in-memory mode).
