# APZQEP-ENG-040C — Verification Workbench

> **Programme:** APZQEP-ENG-040C  
> **Title:** Verification Workbench Engineering  
> **Status:** **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**  
> **Package:** `@apzhub/qep-verification` **0.3.0**  
> **Architecture:** [APZQEP-ARCH-010](../../architecture/verification-workbench/README.md) **ACCEPTED**  
> **Rule:** Workbench UI only — no Coverage / Impact / Evidence / Certification / AI / MCP / new REST APIs / new persistence

## Purpose

Deliver the user-facing Verification Workbench defined by ARCH-010, consuming ENG-040B REST APIs. The Workbench never duplicates business logic; lifecycle authority remains server-side via `availableActions`.

## Documentation

| Document           | Path                                           |
| ------------------ | ---------------------------------------------- |
| Workbench overview | [WORKBENCH.md](./WORKBENCH.md)                 |
| Explorer           | [EXPLORER.md](./EXPLORER.md)                   |
| Queues             | [QUEUES.md](./QUEUES.md)                       |
| Inspector          | [INSPECTOR.md](./INSPECTOR.md)                 |
| Dashboard          | [DASHBOARD.md](./DASHBOARD.md)                 |
| Search             | [SEARCH.md](./SEARCH.md)                       |
| Navigation         | [NAVIGATION.md](./NAVIGATION.md)               |
| Responsive         | [RESPONSIVE.md](./RESPONSIVE.md)               |
| Accessibility      | [ACCESSIBILITY.md](./ACCESSIBILITY.md)         |
| Completion report  | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md) |

## Implementation map

| Layer                  | Location                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| Presentation contracts | `packages/qep-verification/src/presentation/`                           |
| HTTP client            | `apps/web/lib/qep/qep-verification-api.ts`                              |
| Views / router         | `apps/web/components/qep/qep-verification-views.tsx`                    |
| Workspace branch       | `apps/web/components/qep/qep-workspace-router.tsx`                      |
| Module nav             | `modules/qep-verification/module.yaml`                                  |
| Vitest                 | `apps/web/components/qep/qep-verification-*.test.tsx`                   |
| Playwright             | `testing/playwright/e2e/apzqep-eng-040c-verification-workbench.spec.ts` |

## Routes

| Route                                   | View               |
| --------------------------------------- | ------------------ |
| `/workspace/qep/verification`           | Explorer           |
| `/workspace/qep/verification/queue`     | My Queue           |
| `/workspace/qep/verification/team`      | Team Queue         |
| `/workspace/qep/verification/search`    | Search             |
| `/workspace/qep/verification/history`   | History            |
| `/workspace/qep/verification/dashboard` | Dashboard          |
| `/workspace/qep/verification/:id`       | Detail / Inspector |

## STOP

```text
APZQEP-ENG-040C
IMPLEMENTED
AWAITING OWNER ACCEPTANCE
```

Do **not** certify. Do **not** promote to 1.0.0. Await Owner review.
