# @apzhub/testing-persistence

APZ TCMS domain persistence and authorization (**APZTCMS-003 → APZTCMS-008**).

**Version:** **0.7.0**

## Scope

- Repository interfaces + in-memory (tests) and **full Postgres** implementations
- Operation → permission mapping (no allow-all), including `quality.*`, `coverage.*`, `defects.*`, `release.*`
- Persistence validation (tenant/org, revision, enums + defect/coverage kinds)
- Row ↔ domain mappers for SoR tables in `@apzhub/config`
- Automation ingestion aggregates + quality intelligence: defect links, quality snapshots, regression analyses

## Explicit exclusions

Workbench UI, HTTP APIs, execution engines, Playwright/Vitest/JUnit/Allure **runners**, AI, reports/dashboards UI, notifications, Event Bus, workflow engine, CI/CD, and evidence **binary** upload pipelines.

## Quick start

```ts
import {
  createInMemoryTestingPersistence,
  createPostgresTestingPersistence,
  seedTestingPermissions,
} from "@apzhub/testing-persistence";

const memory = createInMemoryTestingPersistence();
const persistence = createPostgresTestingPersistence(db);
```

## Migrations

`0016`–`0028` under `packages/config/drizzle/` (base TCMS through certification engine + RLS).

## Docs

- [Persistence Completion Guide](../../docs/architecture/APZHUB-APZ-TCMS-Persistence-Completion-Guide.md)
- [Repository Guide](../../docs/architecture/APZHUB-APZ-TCMS-Repository-Guide.md)
- [Migration Guide](../../docs/architecture/APZHUB-APZ-TCMS-Migration-Guide.md)
