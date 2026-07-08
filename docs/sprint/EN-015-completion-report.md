# EN-015 — Completion Report

> **Story:** EN-015 — Application integration (`apps/web`)  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await review before EN-016**

---

## Objective

Integrate the Event & Notification Framework into the production application bootstrap — shared context, registries, audit hook, React providers, shell notification experiences, and health diagnostics. No new framework capabilities or external delivery.

---

## Acceptance criteria

| Criterion                                                      | Status     |
| -------------------------------------------------------------- | ---------- |
| Shared `EventNotificationContext`                              | ✅         |
| Event + Notification Registry bootstrap                        | ✅         |
| Event Bus + Mapper + Service wiring                            | ✅         |
| Production audit hook on Action Executor                       | ✅         |
| `NotificationRegistryProvider` + `NotificationServiceProvider` | ✅         |
| DesktopShell badge + panel enabled                             | ✅         |
| `/api/health` event + notification fields                      | ✅         |
| Test-only EN-014 wiring not used in production                 | ✅         |
| Owner review before EN-016                                     | ⏳ Pending |

---

## Implementation summary

| Component               | Path                                                          |
| ----------------------- | ------------------------------------------------------------- |
| Context factory         | `apps/web/lib/create-app-event-notification-context.ts`       |
| Runtime loader          | `apps/web/lib/load-shared-event-notification-context.ts`      |
| Layout hydration        | `apps/web/lib/event-notification-hydration.ts`                |
| Health summaries        | `apps/web/lib/event-notification-health.ts`                   |
| App notification routes | `apps/web/lib/register-app-notification-routes.ts`            |
| Production subscriber   | `apps/web/lib/wire-app-event-notifications.ts`                |
| Client hook             | `apps/web/lib/use-app-event-notification-context.ts`          |
| Shell provider          | `apps/web/app/(platform)/action-workbench-shell-provider.tsx` |
| Platform layout         | `apps/web/app/(platform)/layout.tsx`                          |
| Health route            | `apps/web/app/api/health/route.ts`                            |
| Workbench shell flags   | `apps/web/components/workbench-page.tsx`                      |
| Dev diagnostics         | `apps/web/components/event-notification-diagnostics.tsx`      |
| Cross-platform UUID     | `create-random-uuid.ts` (command-framework + ENF)             |

`EVENT_NOTIFICATION_SERVER_STATUS` → `"integration"`. `EVENT_NOTIFICATION_REACT_STATUS` → `"integration"`.

---

## Bootstrap sequence

```text
Runtime.bootstrap()
  → loadSharedEventNotificationContext()
  → createAppEventNotificationContext()
  → loadEventNotificationHydration() (layout DTOs)
  → ActionWorkbenchShellProvider
       NotificationRegistryProvider
       NotificationServiceProvider (shared instance)
       WorkbenchProvider + audit hook
       CommandRegistryProvider / Knowledge / DesktopShell notifications
```

---

## Health endpoint

`PlatformHealthResponse` extended with:

- `events` — `EventFrameworkHealthSummary`
- `notifications` — `NotificationFrameworkHealthSummary`

See `docs/specs/SPR-006-ENF-health-endpoint-events-notifications.md`.

---

## Architecture compliance

| Rule                                                          | Result |
| ------------------------------------------------------------- | ------ |
| Existing framework implementations only                       | ✅     |
| No duplicate Notification Service                             | ✅     |
| Production uses `wireAppEventNotifications()` not test helper | ✅     |
| No external delivery / persistence                            | ✅     |
| Events ≠ notifications                                        | ✅     |

---

## Test results

| Suite                                           | Focus                                         |
| ----------------------------------------------- | --------------------------------------------- |
| `create-app-event-notification-context.test.ts` | Context bootstrap, audit → notification store |
| `event-notification-hydration.test.ts`          | Shared context + health summaries             |
| `create-app-action-executor.test.ts`            | Audit hook on production executor             |
| `event-notification-diagnostics.test.tsx`       | Dev diagnostics mount                         |

| Gate                 | Result                    |
| -------------------- | ------------------------- |
| `pnpm lint`          | ✅                        |
| `pnpm typecheck`     | ✅                        |
| `pnpm build`         | ✅                        |
| `pnpm test`          | ✅ 1095 tests (+6 EN-015) |
| `pnpm test:coverage` | ✅ 90.80% statements      |
| `pnpm test:e2e`      | ✅ 24 tests               |

---

## Coverage

| Scope              | Statements | Branches | Functions | Lines  |
| ------------------ | ---------- | -------- | --------- | ------ |
| Monorepo aggregate | 90.80%     | 87.11%   | 91.53%    | 90.80% |

---

## Technical debt

| ID         | Item                                                                        | Target                     |
| ---------- | --------------------------------------------------------------------------- | -------------------------- |
| TD-EN16-01 | Playwright E2E for notification badge/panel + action-audit flow             | EN-016                     |
| TD-EN16-02 | Health E2E assertions for `events` / `notifications` fields                 | EN-016                     |
| TD-EN15-01 | App action routes should migrate to platform notification catalogue         | Future                     |
| TD-EN15-02 | Server/client context instances are separate — session store is client-only | By design                  |
| TD-EN15-03 | `createRandomUuid` duplicated in command-framework and ENF                  | Consolidate to shared util |

---

## Recommendation for EN-016

Implement **Playwright E2E verification**:

1. Health endpoint asserts `events` and `notifications` summaries
2. Authenticated shell exposes `event-notification-diagnostics` test hook
3. Action execution creates in-app notification (badge count > 0)
4. Notification panel opens, lists item, mark read updates badge
5. Deterministic seed hook if needed for action-audit notification flow

---

## Next step

**Stop.** Await review before EN-016 (E2E tests).

---

_EN-015 Application integration — Complete._
