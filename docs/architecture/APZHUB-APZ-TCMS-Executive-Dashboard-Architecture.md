# APZHUB APZ TCMS — Executive Dashboard Architecture (APZTCMS-023)

## Boundary

```
Workbench (Executive Dashboards)
  ↓
Typed Client (createHttpEngineeringIntelligenceClient / facade)
  ↓
HTTP /api/v1/testing/engineering-intelligence/*
  ↓
PlatformServiceGateway.testing.engineeringIntelligence
  ↓
Engineering Intelligence domain services
```

No shortcuts. No new analytics, calculations, persistence, reporting engine, PDF, or AI.

## Categories

| Category | Route suffix |
|---|---|
| Executive | `/executive-dashboards` |
| Engineering Management | `/executive-dashboards/engineering` |
| QA Management | `/executive-dashboards/qa` |
| Release Management | `/executive-dashboards/release` |
| Certification | `/executive-dashboards/certification` |
| Quality | `/executive-dashboards/quality` |
| Coverage | `/executive-dashboards/coverage` |
| Automation | `/executive-dashboards/automation` |
| Manual Testing | `/executive-dashboards/manual-testing` |
| Risk | `/executive-dashboards/risk` |
| Historical Trends | `/executive-dashboards/historical-trends` |
| Release Readiness | `/executive-dashboards/release-readiness` |

## Presentation modules

- `testing-executive-dashboards-view.tsx` — shell, filters, commands, data load via EI query keys
- `executive-dashboard-panels.tsx` — pure category panels from view models
- `executive-dashboard-categories.ts` — category ids, saved filters, presentation filter/sort helpers

## Query reuse

Dashboards use existing `testingQueryKeys.engineeringIntelligence.*` so React Query shares cache with the Engineering Intelligence workspace — no duplicate network semantics beyond cache policy.
