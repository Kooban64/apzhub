# APZWORKFLOW-004 Coverage Baseline

Scoped modules:

- `apps/web/components/workflows/**` — workbench presentation
- `apps/web/lib/workflows/routes.ts` — workspace helpers
- Boundary: `workflow-boundary.test.ts` (003 + 004)

## Measured (2026-07-15)

| Scope | Stmts/Lines | Notes |
| --- | --- | --- |
| Helper components (timeline, graph, viewer, compare, router) | **93–100%** | Practical ≥95% on focused helpers |
| `platform-workflows-view.tsx` | **~83%** | Large section switcher; remaining lines are alternate error/export branches |
| `workflow-export.ts` | **~89%** | Template export helper lightly used |
| Combined workbench + routes | **~87%** | Practical coverage; target ≥95% on helpers met |

```bash
pnpm exec vitest run \
  apps/web/components/workflows \
  apps/web/lib/workflows \
  --coverage \
  --coverage.include='apps/web/components/workflows/**/*.{ts,tsx}' \
  --coverage.include='apps/web/lib/workflows/routes.ts' \
  --coverage.thresholds.statements=0 \
  --coverage.thresholds.functions=0 \
  --coverage.thresholds.branches=0 \
  --coverage.thresholds.lines=0
```

Architecture gate: `pnpm audit:workflow-workbench` — **PASS**.

Vitest: **37** tests in workflows workbench + lib suite (includes client/boundary/routes).

Playwright: `apzworkflow-004-platform-workflows-workbench.spec.ts` shipped with HTTP mocks. If Playwright env blocked by known Testing slug, treat as **LIMITED** but keep the spec.
