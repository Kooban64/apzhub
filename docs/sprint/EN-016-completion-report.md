# EN-016 — Completion Report

> **Story:** EN-016 — E2E verification (Event & Notification Framework)  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await review before EN-017**

---

## Objective

End-to-end verification of the production Event & Notification Framework wiring. Testing and verification only — no production feature changes, no architecture changes, no new framework capabilities.

---

## Acceptance criteria

| Criterion                                                                                    | Status     |
| -------------------------------------------------------------------------------------------- | ---------- |
| Health endpoint — `events` + `notifications` sections                                        | ✅         |
| Event Registry bootstrap verified                                                            | ✅         |
| Notification Registry bootstrap verified                                                     | ✅         |
| Shared `EventNotificationContext` + providers verified                                       | ✅         |
| Notification Badge — appear, unread count, mark-as-read updates                              | ✅         |
| Notification Panel — open/close, empty state, rendering, timestamps, grouping, mark read/all | ✅         |
| Action → Event Bus → Mapper → Service → Badge → Panel flow                                   | ✅         |
| Diagnostic hooks dev/test-only; no visible debug UI in shell                                 | ✅         |
| Owner review before EN-017                                                                   | ⏳ Pending |

---

## End-to-end verification report

### Pipeline verified (production wiring)

```text
ActionExecutor.execute("workbench.view.open")
  → createActionAuditEventBusHook publishes capability.action.executed
  → wireAppEventNotifications() subscriber
  → DefaultNotificationMapper (2 routes: inbox + toast)
  → DefaultNotificationService.addNotifications()
  → useNotificationPresentation() in shell experiences
  → NotificationBadge (unread count) + NotificationPanel (grouped list)
```

**Health (`GET /api/health`):** `events.layerStatus === "audit"`, `notifications.mapperStatus === "ready"`, registry counts > 0, subscriber count > 0.

**Bootstrap:** Hidden `event-notification-diagnostics` reports event/notification registry counts and service status after authenticated shell mount.

**Experiences:** Badge hidden when unread = 0; panel empty state; after action, badge shows 2 (inbox + toast routes); panel groups under **Normal** priority with relative **Just now** timestamps.

**Mark read:** Per-item mark read decrements badge; mark all read clears badge and diagnostics `data-unread-count`.

**Diagnostics guard:** `EventNotificationDiagnostics` does not render when `NODE_ENV=production` (unit test). E2E confirms hidden DOM hooks only — no visible `*-diagnostics` aside panels in the authenticated shell.

---

## Playwright coverage summary

**Spec:** `testing/playwright/e2e/spr-006-event-notification-framework.spec.ts`

| #   | Scenario           | Assertions                                                                                          |
| --- | ------------------ | --------------------------------------------------------------------------------------------------- |
| 1   | Health endpoint    | `events` + `notifications` summaries, mapper/service status, registry counts                        |
| 2   | Provider bootstrap | `workbench-notifications`, badge visible, hidden `event-notification-diagnostics` with counts       |
| 3   | Panel UX           | Open/close, empty state copy                                                                        |
| 4   | Action flow        | E2E hook executes `workbench.view.open` → badge increment → panel inbox item + grouping + timestamp |
| 5   | Mark read          | Per-item + mark all read; badge and diagnostics sync                                                |
| 6   | Diagnostics        | Hidden hooks; no visible debug UI                                                                   |

**Suite totals:** 30 E2E tests (24 existing + 6 SPR-006).

---

## Test matrix

| Area                            | Unit / integration                                                                      | Playwright E2E                               |
| ------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------- |
| Event Registry bootstrap        | `event-notification-hydration.test.ts`, `create-app-event-notification-context.test.ts` | Health + hidden diagnostics                  |
| Notification Registry bootstrap | Same + `register-app-notification-routes` via context tests                             | Health + hidden diagnostics                  |
| Shared context                  | `create-app-event-notification-context.test.ts`                                         | Provider mount scenario                      |
| Notification providers          | React provider tests (EN-010)                                                           | Shell mount scenario                         |
| Notification Badge              | `notification-badge*.test.tsx`                                                          | Badge count + mark-read updates              |
| Notification Panel              | `notification-panel.test.tsx`                                                           | Empty state, open/close, list, mark read/all |
| Relative timestamps             | `notification-presentation.test.ts`                                                     | Inbox item scoped **Just now**               |
| Priority grouping               | `group-notifications-by-priority.test.ts`                                               | **Normal** group label                       |
| Action → notification           | `create-app-event-notification-context.test.ts`                                         | Full action flow scenario                    |
| Health diagnostics              | `event-notification-health` via hydration tests                                         | Health API scenario                          |
| Dev-only diagnostics            | `event-notification-diagnostics.test.tsx` (incl. production guard)                      | Hidden hooks + no visible debug UI           |
| E2E test hooks                  | `e2e-event-notification-hooks.test.ts`                                                  | Gated by `NEXT_PUBLIC_E2E_TEST_HOOKS`        |

---

## Test infrastructure (EN-016 only)

Deterministic action execution for E2E — **not a production feature**:

| Component      | Path                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| Window hooks   | `apps/web/lib/e2e-event-notification-hooks.ts`                                 |
| Shell bridge   | `E2eTestHookBridge` in `action-workbench-shell-provider.tsx`                   |
| Playwright env | `NEXT_PUBLIC_E2E_TEST_HOOKS=true` in `testing/playwright/playwright.config.ts` |

Hooks expose `window.__APZHUB_E2E__.executeWorkbenchAction()` because palette actions such as `platform.theme.toggle` fail without args and do not publish audit events. Production builds without the env var do not mount hooks.

---

## Implementation summary

| Change                            | Path                                                                  |
| --------------------------------- | --------------------------------------------------------------------- |
| SPR-006 E2E spec                  | `testing/playwright/e2e/spr-006-event-notification-framework.spec.ts` |
| E2E action hooks                  | `apps/web/lib/e2e-event-notification-hooks.ts`                        |
| Hook unit tests                   | `apps/web/lib/e2e-event-notification-hooks.test.ts`                   |
| Production diagnostics guard test | `apps/web/components/event-notification-diagnostics.test.tsx`         |
| Playwright webServer env          | `testing/playwright/playwright.config.ts`                             |

No changes to framework packages, notification routes, or shell UX components beyond test-only hook wiring.

---

## Quality gates

| Gate                 | Result                    |
| -------------------- | ------------------------- |
| `pnpm lint`          | ✅                        |
| `pnpm typecheck`     | ✅                        |
| `pnpm build`         | ✅                        |
| `pnpm test`          | ✅ 1098 tests (+3 EN-016) |
| `pnpm test:coverage` | ✅ 90.75% statements      |
| `pnpm test:e2e`      | ✅ 30 tests               |

---

## Coverage

| Scope              | Statements | Branches | Functions | Lines  |
| ------------------ | ---------- | -------- | --------- | ------ |
| Monorepo aggregate | 90.75%     | 87.08%   | 91.54%    | 90.75% |

---

## Technical debt

| ID         | Item                                                                                                 | Target                     |
| ---------- | ---------------------------------------------------------------------------------------------------- | -------------------------- |
| TD-EN17-01 | Author consolidated `event-notification-framework.md` architecture doc                               | EN-017                     |
| TD-EN17-02 | Finalise spec index and onboarding for ENF                                                           | EN-017                     |
| TD-EN16-01 | E2E relies on env-gated `__APZHUB_E2E__` hook — document in CI/onboarding                            | EN-017                     |
| TD-EN16-02 | Action flow creates 2 notifications (inbox + toast); panel lists both — toast experience UI deferred | Future                     |
| TD-EN15-03 | `createRandomUuid` duplicated in command-framework and ENF                                           | Consolidate to shared util |
| TD-EN15-01 | App notification routes should migrate to platform notification catalogue                            | Future                     |

---

## Recommendation for EN-017

Proceed with **documentation and governance** (no production code):

1. Expand `docs/architecture/event-notification-framework.md` with bootstrap sequence, health fields, and action-audit pipeline diagram.
2. Add developer onboarding for adding events, notification routes, and verifying via health + diagnostics hooks.
3. Produce `SPR-006-architecture-review.md` and `MILESTONE-006-production-readiness.md`.
4. Finalise spec index — mark EN-016 complete; link E2E spec and test-hook documentation.
5. Document E2E test hooks and `NEXT_PUBLIC_E2E_TEST_HOOKS` in Playwright/onboarding docs.

---

## Next step

**Stop.** Await review before EN-017 (Documentation).

---

_EN-016 E2E verification — Complete._
