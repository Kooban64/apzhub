# APZHUB APZ TCMS — Executive Dashboards Developer Guide (APZTCMS-023)

## Do

- Load data only through `@/lib/testing` EI facade / typed client
- Reuse `testingQueryKeys.engineeringIntelligence.*`
- Keep panels pure (props in → UI out)
- Gate with `canViewExecutiveDashboards`

## Do not

- Add analytics formulas, aggregations beyond presentation filter/sort
- Call Platform Services, persistence, or adapters from the workbench
- Implement PDF/Excel/email/reporting

## Tests

- `executive-dashboard-categories.test.ts`
- `executive-dashboard-panels.test.tsx`
- `testing-executive-dashboards-view.test.tsx`
- Boundary assertions in `testing-architecture-boundary.test.ts`
- Playwright: `apztcms-023-executive-dashboards.spec.ts`
