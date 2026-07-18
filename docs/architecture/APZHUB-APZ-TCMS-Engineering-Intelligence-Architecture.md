# APZHUB Engineering Intelligence Architecture

**Milestone:** APZTCMS-021  
**Status:** Complete  
**Scope:** Domain services only — no REST, Workbench, dashboards, charts, AI, Event Bus, or new adapters.

## Purpose

Transform APZ TCMS into the engineering quality intelligence platform by aggregating **existing** testing, certification, release, CI/CD, evidence, and approval data into deterministic analytical models.

## Layering

```text
PlatformServiceGateway.testing.engineeringIntelligence
  → RequestPipeline + Authorization
  → TestingEngineeringIntelligenceServiceImpl
  → @apzhub/testing-services engineering-intelligence/*
  → TestingPersistence (snapshots / trends / benchmarks / baselines)
  → Existing SoR (quality snapshots, coverage, certs, releases, pipelines, …)
```

## Packages

| Package                              | Version | Role                                     |
| ------------------------------------ | ------- | ---------------------------------------- |
| `@apzhub/testing-contracts`          | 0.10.0  | Canonical EI models + service interfaces |
| `@apzhub/testing-persistence`        | 0.10.0  | Migrations 0033/0034 + repos             |
| `@apzhub/testing-services`           | 0.10.0  | Domain implementations                   |
| `@apzhub/platform-service-contracts` | 0.13.0  | Gateway facet                            |
| `@apzhub/platform-services`          | 0.13.0  | Impl + authz map                         |

## Aggregation rule

**No duplicate business logic.** Quality Intelligence formulas are not re-run when a QI snapshot exists — metrics are consumed. Fallback uses coverage/defect/execution counts only when no snapshot is available.

## Explicit exclusions

GitLab/Jenkins/Azure DevOps adapters, REST API, Workbench UI, dashboards, charts, reporting, AI/ML, predictions, notifications, realtime, Event Bus, CI/CD execution.

## Related documents

- [Trend Engine](./APZHUB-APZ-TCMS-Engineering-Intelligence-Trend-Engine.md)
- [Quality Scoring](./APZHUB-APZ-TCMS-Engineering-Intelligence-Quality-Scoring.md)
- [Engineering Health](./APZHUB-APZ-TCMS-Engineering-Intelligence-Health.md)
- [Benchmarks](./APZHUB-APZ-TCMS-Engineering-Intelligence-Benchmarks.md)
- [Historical Model](./APZHUB-APZ-TCMS-Engineering-Intelligence-Historical-Model.md)
- [Developer Guide](./APZHUB-APZ-TCMS-Engineering-Intelligence-Developer-Guide.md)
- [Completion Report](../sprint/APZTCMS-021-completion-report.md)
