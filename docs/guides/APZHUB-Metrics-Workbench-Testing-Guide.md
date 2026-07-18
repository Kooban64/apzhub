# APZHUB Metrics Workbench Testing Guide

**Milestone:** APZMETRICS-004

```bash
pnpm audit:metrics-workbench
pnpm exec vitest run apps/web/components/metrics apps/web/lib/metrics/routes.test.ts testing/metrics-workbench
pnpm exec playwright test testing/playwright/e2e/apzmetrics-004-metrics-workbench.spec.ts --list
```

Coverage scope: `apps/web/components/metrics/**` — target ≥95% lines/functions.
