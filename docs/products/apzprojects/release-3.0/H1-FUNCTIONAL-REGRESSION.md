# H1 — Functional Regression

| Field    | Value                                                                 |
| -------- | --------------------------------------------------------------------- |
| Phase    | Hardening H1                                                          |
| Status   | **IN PROGRESS**                                                       |
| Scope    | W002–W011 · Product Experience · Operational Engine · PR integrations |
| Severity | Critical · High · Medium · Low · Info                                 |

## Coverage matrix

| Area                   | Workshop / Track  | Automated suite                                                           | Result      |
| ---------------------- | ----------------- | ------------------------------------------------------------------------- | ----------- |
| Lifecycle / Ops engine | W003–W004         | `projects-delivery`                                                       | **PASS**    |
| Portfolio              | W005 / PX-02      | `projects-portfolio`                                                      | **PASS**    |
| Teams / Resource       | W006 / PX-03      | `projects-team-directory` · resource                                      | **PASS**    |
| Collaboration          | W007 / PX-04      | `projects-collaboration`                                                  | **PASS**    |
| Reporting              | W008 / PX-05      | `projects-reporting`                                                      | **PASS**    |
| Productivity           | W009 / PX-06      | `projects-productivity`                                                   | **PASS**    |
| Governance / Admin     | W010 / PX-07 · P3 | `projects-governance` · `projects-administration`                         | **PASS**    |
| Workflow bridge        | P1                | `projects-workflow-bridge`                                                | **PASS**    |
| Migration              | P4                | `projects-migration-verification`                                         | **PASS**    |
| Search provider        | W009              | `search-projects`                                                         | **PASS**    |
| UI boundaries / nav    | W011              | `projects-architecture-boundary` · `projects-navigation` · `projects-api` | **PASS**    |
| Production build       | PE / PR           | `NODE_ENV=production pnpm --filter @apzhub/web build`                     | **PASS**    |
| Playwright UI cert     | PE                | `apzhub-projects-*.spec.ts` (standalone :3315)                            | **PARTIAL** |

### Vitest aggregate

Projects platform-service + web unit suites: **19 files / 86 tests PASS** (prior H1 execution).

### Playwright (standalone coexistence host)

Host constraint: long-lived `next dev` on `:3300` blocks a second `next dev`. E2E uses `PLAYWRIGHT_USE_PROD_SERVER=true` against standalone `node apps/web/server.js` on `:3315` with:

- `APZHUB_WORKSPACE_ROOT` → monorepo root
- `APZHUB_RUNTIME_FAIL_FAST=false` (discovery diagnostics non-fatal, aligned with next-dev profile)
- Static assets copied into standalone `.next/static`
- Shared auth `storageState` (`testing/playwright/.auth/projects-user.json`) to avoid Better Auth 429

| Spec                                                       | Latest       | Notes                                        |
| ---------------------------------------------------------- | ------------ | -------------------------------------------- |
| `apzhub-projects-001-workbench` (initiate + search/health) | **PASS**     | Stable                                       |
| `apzhub-projects-001-workbench` (list + cockpit)           | Intermittent | Cockpit chrome race under mocks              |
| `apzhub-projects-001-ui-certification`                     | Intermittent | Long journey; cockpit/list races             |
| `apzhub-projects-1.1-ui-certification`                     | Intermittent | Task picker / surface navigation under mocks |

## Defects found

Recorded in [HARDENING-DEFECT-LOG.md](./HARDENING-DEFECT-LOG.md).

## Sign-off

| Criterion                     | Status                                   |
| ----------------------------- | ---------------------------------------- |
| All automated suites executed | **PARTIAL** (Playwright not fully green) |
| Critical = 0                  | **YES**                                  |
| High = 0                      | **YES** (open items classified Medium)   |
| Medium/Low triaged            | **YES**                                  |
