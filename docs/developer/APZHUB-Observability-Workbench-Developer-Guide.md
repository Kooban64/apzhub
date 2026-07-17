# Observability Workbench Developer Guide

**Milestone:** APZOBSERVE-004

## Consume

```ts
import {
  listHealthChecks,
  getObserveCapabilities,
  getObserveDiagnostics,
} from "@/lib/observe/observe-api";
import { observeQueryKeys } from "@/lib/observe/query-keys";
import {
  isObserveRoute,
  resolveObserveSection,
  OBSERVE_WORKSPACE_BASE,
} from "@/lib/observe/routes";
```

## Mount

- Manifests: `packages/workbench-framework/manifests/platform-observability*`
- Shell: `apps/web/components/workbench-page.tsx` → `ObserveWorkspaceRouter`
- View: `apps/web/components/observe/platform-observability-view.tsx`

## Do not

- Import `@apzhub/platform-services`, observe-core, observe-persistence, or databases
- Call ad hoc `fetch` / hardcode `/api/v1/observe` strings in components
- Add Grafana / Prometheus / Loki / OTel / AlertManager SDKs
- Create `apps/web/app/workspace/observability` (use catch-all workspace)
- Merge into Administration, Identity, or Platform Operations Workbenches
- Implement collection, ingestion, streaming, alert delivery, or Event Bus

## Tests & audit

- Component + coverage tests under `apps/web/components/observe`
- Audit: `pnpm audit:observe-workbench`
- Playwright (mocked HTTP): `testing/playwright/e2e/apzobserve-004-observe-workbench.spec.ts`

## Next

**APZOBSERVE-005 — Observability Vertical Certification & Production Readiness** — do not start without owner approval.
