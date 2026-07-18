# APZMETRICS-005 — Architecture Traceability

**Date:** 2026-07-18

## Layer map

| Layer             | Artefact                                 | Downstream only                         |
| ----------------- | ---------------------------------------- | --------------------------------------- |
| Workbench         | `apps/web/components/metrics`            | Typed client (`@/lib/metrics`)          |
| Typed client      | `apps/web/lib/metrics`                   | `/api/v1/metrics/*`                     |
| HTTP              | `apps/web/app/api/v1/metrics` + handlers | `getPlatformServiceGateway().metrics.*` |
| Gateway           | `platform-services` gateway.metrics      | RequestPipeline → services              |
| Authorization     | `metricsPlatformOps`                     | Deny-by-default production              |
| Platform Services | `services/metrics`                       | Metrics Core ports                      |
| Core              | `@apzhub/metrics-core`                   | Persistence ports                       |
| Persistence       | `@apzhub/metrics-persistence`            | PostgreSQL (0056/0057)                  |

## Reverse dependency check

Vertical audit forbids Workbench→Gateway/Core/Persistence, Client→Gateway/Core/Persistence, HTTP→Core/Persistence, Core→Persistence package, Persistence→Platform Services.

## Certified command

`pnpm audit:metrics-vertical` + prior layered audits.
