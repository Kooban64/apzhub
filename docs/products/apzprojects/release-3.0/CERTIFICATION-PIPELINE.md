# Release 3.0 Certification Pipeline (Gate P5)

Prepare early — do not wait for feature freeze.

## Suites

| Suite         | Target                                           | Status                           |
| ------------- | ------------------------------------------------ | -------------------------------- |
| Unit          | Vitest — platform-services, contracts, web libs  | Partial coverage growing         |
| Integration   | Service + store + Workflow bridge                | Bridge unit tests landed         |
| API           | Route handlers / envelope / authz                | Expand with approval routes      |
| UI            | Component + workspace/cockpit                    | Workspace refinement in progress |
| Accessibility | WCAG AA — Playwright a11y                        | Not yet scheduled                |
| Performance   | Workspace portfolio p95; cockpit load            | Not yet scheduled                |
| Migration     | Apply/verify `0109`–`0114` on supported envs     | Pending Gate P4                  |
| End-to-End    | Playwright journeys (initiate → deliver → close) | Not yet scheduled                |

## Commands (local)

```bash
pnpm exec vitest run packages/platform-services/src/services/projects-workflow-bridge
pnpm exec vitest run apps/web/lib/projects
# Full suite when ready:
# pnpm test
# pnpm exec playwright test
```

## Exit criteria

All suites green on main; migration verified; P1–P4 closed; Owner certification sign-off.
