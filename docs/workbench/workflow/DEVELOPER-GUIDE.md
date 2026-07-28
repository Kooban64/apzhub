# Workflow Workbench — Developer Guide

> **Programme:** APZHUB-PLATFORM-WORKFLOW-006

## Layout

| Layer            | Path                                                 |
| ---------------- | ---------------------------------------------------- |
| Module manifest  | `services/workflow/manifests/workflow/module.yaml`   |
| Sidebar children | `services/workflow/manifests/workflow-*/module.yaml` |
| Typed client     | `apps/web/lib/workflow/`                             |
| Views            | `apps/web/components/workflow/`                      |
| Shell mount      | `apps/web/components/workbench-page.tsx`             |

## Rules

1. UI talks **only** to `/api/v1/workflow/*`.
2. Never import `@apzhub/integration-n8n`, `@apzhub/platform-services`, or SoR `/lib/workflows` clients.
3. Permission helpers are presentation-only — server AuthZ remains authoritative.
4. Reuse shell / `@apzhub/ui` — no new visual framework.

## Enablement

- `APZHUB_WORKFLOW_ENABLED=true` for the HTTP API consumed by the Workbench.
- Module discovery via `services/workflow/manifests/*`.

## Tests

| Kind                         | Path                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| Routes / permissions         | `apps/web/lib/workflow/*.test.ts`                          |
| Navigation / boundary / home | `apps/web/components/workflow/*.test.ts*`                  |
| Playwright                   | `testing/playwright/e2e/apzhub-workflow-workbench.spec.ts` |
