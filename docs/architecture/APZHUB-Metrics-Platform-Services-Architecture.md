# APZHUB Metrics Platform Services Architecture

**Milestone:** APZMETRICS-002  
**Date:** 2026-07-17

## Path

```text
Platform Consumers
        ↓
PlatformServiceGateway.metrics.*
        ↓
RequestPipeline
        ↓
Production Authorization
        ↓
Platform Metrics Services (thin)
        ↓
Metrics Core
        ↓
Metrics Persistence
        ↓
PostgreSQL
```

## Packages

| Package                       | Version           |
| ----------------------------- | ----------------- |
| `@apzhub/metrics-contracts`   | **0.2.0**         |
| `@apzhub/metrics-core`        | **0.2.0**         |
| `@apzhub/metrics-persistence` | 0.1.0 (unchanged) |
| `@apzhub/platform-services`   | **0.25.0**        |

## Ownership

Business rules remain in Metrics Core. Platform Services validate context, map errors, wrap facets with RequestPipeline, and enforce deny-by-default authorization.

## Explicitly excluded

HTTP · OpenAPI · Typed Client · Workbench · formula/KPI execution · providers · Event Bus · AI
