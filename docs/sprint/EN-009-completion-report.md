# EN-009 — Completion Report

> **Story:** EN-009 — Event-to-Notification Mappers  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await review before EN-010**

---

## Objective

Implement the **Event-to-Notification Mapper layer** — consume published platform events and produce immutable `NotificationItem` instances. No delivery, UI, client hydration, or persistence.

---

## Acceptance criteria

| Criterion                                  | Status     |
| ------------------------------------------ | ---------- |
| `DefaultNotificationMapper` implemented    | ✅         |
| `NotificationMapperRegistry` implemented   | ✅         |
| Event pattern matching (exact + prefix)    | ✅         |
| Notification route resolution              | ✅         |
| Template rendering (simple placeholders)   | ✅         |
| Canonical `NotificationItem` model         | ✅         |
| Mapper diagnostics                         | ✅         |
| DI defaults to `DefaultNotificationMapper` | ✅         |
| No delivery / publish / persist / UI       | ✅         |
| Mapper specification                       | ✅         |
| NotificationItem specification             | ✅         |
| Template rendering specification           | ✅         |
| Owner review before EN-010                 | ⏳ Pending |

---

## Implementation summary

| Component                    | Path                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| `DefaultNotificationMapper`  | `src/notification/default-notification-mapper.ts`          |
| `NotificationMapperRegistry` | `src/notification/default-notification-mapper-registry.ts` |
| Route resolution             | `src/notification/resolve-notification-routes.ts`          |
| Template rendering           | `src/notification/render-notification-template.ts`         |
| Item factory                 | `src/notification/create-notification-item.ts`             |
| Extended `NotificationItem`  | `src/notification/notification-item.ts`                    |
| Tests                        | `src/notification/default-notification-mapper.test.ts`     |

`NOTIFICATION_LAYER_STATUS` updated to `"mapper"`.

---

## Event processing pipeline

```text
Platform Event → Route Resolution → Mapper → Template Rendering → NotificationItem → return only
```

---

## Architecture compliance

| Rule                                | Result |
| ----------------------------------- | ------ |
| Consumes platform events            | ✅     |
| Returns NotificationItem objects    | ✅     |
| No notification delivery            | ✅     |
| No Event Bus publish                | ✅     |
| No persistence                      | ✅     |
| No UI / external services           | ✅     |
| Mapper never calls EventBus.publish | ✅     |

---

## Test results

| Suite                                 | Focus                                                                               |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| `default-notification-mapper.test.ts` | Pattern matching, templates, items, routes, fan-out, empty matches, diagnostics, DI |
| Updated package tests                 | Exports, status, layer status, boundary separation                                  |

| Gate                 | Result                     |
| -------------------- | -------------------------- |
| `pnpm lint`          | ✅                         |
| `pnpm typecheck`     | ✅                         |
| `pnpm build`         | ✅                         |
| `pnpm test`          | ✅ 1006 tests (+10 EN-009) |
| `pnpm test:coverage` | ✅ 90.37% statements       |
| `pnpm test:e2e`      | ✅ 24 tests                |

---

## Coverage

| Scope              | Statements | Branches | Functions | Lines  |
| ------------------ | ---------- | -------- | --------- | ------ |
| Monorepo aggregate | 90.37%     | 86.43%   | 91.41%    | 90.37% |

Mapper subsystem (`default-notification-mapper.test.ts`: 10 tests) meets package ≥80% thresholds.

---

## Technical debt

| ID         | Item                                                                 | Target  |
| ---------- | -------------------------------------------------------------------- | ------- |
| TD-EN09-01 | Mapper not subscribed to Event Bus — callers invoke `map()` directly | EN-015  |
| TD-EN09-02 | No session store / NotificationService integration                   | EN-011  |
| TD-EN09-03 | Permission gate on routes not enforced at map time                   | EN-010+ |
| TD-EN09-04 | Attention/suppression rules not implemented                          | M8+     |
| TD-EN10-01 | Notification Registry DTO + client hydration not implemented         | EN-010  |

---

## Recommendation for EN-010

Implement **client hydration and hooks**:

1. Notification Registry DTO mapping and permission filtering
2. Client-side registry hydration from server DTO
3. React hooks (`useNotificationRegistry`, scaffold providers)
4. **Do not** implement delivery UI until EN-012 / EN-013

Wire mapper results to `NotificationService` store in EN-011 before presentation.

---

## Next step

**Stop.** Await review before EN-010 (Client hydration + hooks).

---

_EN-009 Event-to-Notification Mappers — Complete._
