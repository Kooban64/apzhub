# EN-011 — Completion Report

> **Story:** EN-011 — Notification Service API  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await review before EN-012**

---

## Objective

Implement the **Notification Service** as the stable public API between Notification Mappers and Notification Experiences. Session-scoped in-memory store, read/query APIs, diagnostics, DI, and `useNotificationService()` hook — no UI, shell integration, external delivery, or persistence.

---

## Acceptance criteria

| Criterion                                                         | Status     |
| ----------------------------------------------------------------- | ---------- |
| `DefaultNotificationService`                                      | ✅         |
| In-memory session store                                           | ✅         |
| `addNotifications()`                                              | ✅         |
| `listNotifications()`                                             | ✅         |
| `getNotification()`                                               | ✅         |
| `getUnreadCount()`                                                | ✅         |
| `markAsRead()` / `markAllAsRead()`                                | ✅         |
| `clearNotifications()`                                            | ✅         |
| Diagnostics (total, unread, read, last timestamp, status, health) | ✅         |
| Dependency injection (`createEventNotificationContext`)           | ✅         |
| `NotificationServiceProvider` + `useNotificationService()`        | ✅         |
| Accepts immutable `NotificationItem` from mapper                  | ✅         |
| No delivery / persistence / UI / Event Bus publish                | ✅         |
| Owner review before EN-012                                        | ⏳ Pending |

---

## Implementation summary

| Component               | Path                                                                        |
| ----------------------- | --------------------------------------------------------------------------- |
| Service interface       | `src/notification/notification-service.ts`                                  |
| Default service         | `src/notification/default-notification-service.ts`                          |
| Session store interface | `src/notification/notification-session-store.ts`                            |
| Default session store   | `src/notification/default-notification-session-store.ts`                    |
| React provider          | `src/react/notification-service-context.tsx`                                |
| React hook              | `src/react/use-notification-service.ts`                                     |
| Tests                   | `default-notification-service.test.ts`, `use-notification-service.test.tsx` |
| Service spec            | `docs/specs/SPR-006-ENF-notification-service.md`                            |
| Session store spec      | `docs/specs/SPR-006-ENF-notification-session-store.md`                      |

`NOTIFICATION_LAYER_STATUS` updated to `"service"`. `EVENT_NOTIFICATION_REACT_STATUS` updated to `"service"`.

---

## Lifecycle

```text
Mapped NotificationItem (DefaultNotificationMapper)
        ↓
NotificationService.addNotifications()
        ↓
DefaultNotificationSessionStore (in-memory, session-scoped)
        ↓
Read APIs (list, get, unread, mark read, clear)
        ↓
Future Notification Experiences (EN-012+)
```

Mapper → service integration verified in unit tests via `createEventNotificationContext()` + `bootstrapNotificationRegistry()`.

---

## Architecture compliance

| Rule                                  | Result |
| ------------------------------------- | ------ |
| Stores immutable `NotificationItem`   | ✅     |
| Exposes read/query APIs               | ✅     |
| Tracks read state in session store    | ✅     |
| No Event Bus publish                  | ✅     |
| No mapper execution in service        | ✅     |
| No delivery                           | ✅     |
| No UI rendering                       | ✅     |
| No persistence (DB / browser storage) | ✅     |
| No shell integration                  | ✅     |

---

## Test results

| Suite                                                              | Focus                                                                                    |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `default-notification-service.test.ts`                             | Add, ordering, lookup, read/unread, clear, diagnostics, DI, mapper integration, boundary |
| `use-notification-service.test.tsx`                                | Provider, hook subscription, mark read                                                   |
| Updated `status.test.ts`, `exports.test.ts`, `react/index.test.ts` | DI default, layer status                                                                 |

| Gate                 | Result                     |
| -------------------- | -------------------------- |
| `pnpm lint`          | ✅                         |
| `pnpm typecheck`     | ✅                         |
| `pnpm build`         | ✅                         |
| `pnpm test`          | ✅ 1052 tests (+19 EN-011) |
| `pnpm test:coverage` | ✅ 90.48% statements       |
| `pnpm test:e2e`      | ✅ 24 tests                |

---

## Coverage

| Scope              | Statements | Branches | Functions | Lines  |
| ------------------ | ---------- | -------- | --------- | ------ |
| Monorepo aggregate | 90.48%     | 86.86%   | 91.35%    | 90.48% |

Notification service subsystem meets package ≥80% thresholds.

---

## Technical debt

| ID         | Item                                                                                             | Target        |
| ---------- | ------------------------------------------------------------------------------------------------ | ------------- |
| TD-EN12-01 | No presentation/view-model mapping                                                               | EN-012        |
| TD-EN12-02 | Mapper → service not wired in app bootstrap                                                      | EN-015        |
| TD-EN12-03 | `createNotificationServiceFromHydration()` deferred — service is session-local, not DTO-hydrated | EN-015        |
| TD-EN12-04 | No shell Experiences (panel, badge, toast)                                                       | EN-013        |
| TD-EN12-05 | Event Bus → mapper → service pipeline not wired end-to-end in app                                | EN-014/EN-015 |

---

## Recommendation for EN-012

Implement **Notification Presentation Layer**:

1. `mapNotificationDtoToViewModel()` (or equivalent view-model mapper from `NotificationItem`)
2. Grouping by priority, relative timestamps, actionRef passthrough
3. Keep presentation separate from service store — service remains read-only boundary
4. No shell layout until EN-013

---

## Next step

**Stop.** Await review before EN-012 (Notification Presentation Layer).

---

_EN-011 Notification Service — Complete._
