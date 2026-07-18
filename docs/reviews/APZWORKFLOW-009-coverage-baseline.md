# APZWORKFLOW-009 Coverage Baseline

Scoped modules:

- `apps/web/components/workflow-engine/**`

## Measured (2026-07-15)

| Scope                                  | Stmts/Lines | Functions | Branches            |
| -------------------------------------- | ----------- | --------- | ------------------- |
| `components/workflow-engine/**`        | **98.9%**   | **100%**  | **~86%** meaningful |
| `engine-definition-viewer.tsx`         | **100%**    | **100%**  | **70%**             |
| `platform-workflow-engine-view.tsx`    | **98.8%**   | **100%**  | **~87%**            |
| `workflow-engine-workspace-router.tsx` | **100%**    | **100%**  | **100%**            |

```bash
pnpm exec vitest run \
  apps/web/components/workflow-engine \
  --coverage \
  --coverage.include='apps/web/components/workflow-engine/**/*.{ts,tsx}' \
  --coverage.exclude='**/*.test.*' \
  --coverage.thresholds.statements=0 \
  --coverage.thresholds.functions=0 \
  --coverage.thresholds.branches=0 \
  --coverage.thresholds.lines=0
```

Architecture gate: `pnpm audit:workflow-engine-workbench` — **PASS**.

Vitest: **28** tests in workflow-engine workbench suite (+ routes helpers in `routes.test.ts`).

Playwright: `apzworkflow-009-workflow-engine-workbench.spec.ts` shipped with HTTP mocks.
