# EN-010 — Completion Report

> **Story:** EN-010 — Client Hydration + Hooks (Notification Registry)  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await review before EN-011**

---

## Objective

Implement **server-to-client Notification Registry hydration** mirroring Action, Knowledge, and Event framework patterns. Read-only client registry, React provider and hooks — no delivery, UI, or shell integration.

---

## Acceptance criteria

| Criterion                                                        | Status     |
| ---------------------------------------------------------------- | ---------- |
| `NotificationRegistryDto`                                        | ✅         |
| DTO mapping, validation, versioning                              | ✅         |
| Permission filtering                                             | ✅         |
| `createNotificationRegistryFromDto()`                            | ✅         |
| `ReadOnlyNotificationRegistry` / `ClientNotificationRegistry`    | ✅         |
| `NotificationRegistryProvider`                                   | ✅         |
| `useNotificationRegistry()` / `useNotificationRegistryContext()` | ✅         |
| Hydration diagnostics (server + client)                          | ✅         |
| React API via `@apzhub/event-notification-framework/react`       | ✅         |
| No delivery / mappers / client registration                      | ✅         |
| Owner review before EN-011                                       | ⏳ Pending |

---

## Implementation summary

| Component                    | Path                                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| DTO mapping                  | `src/server/map-notification-registry-dto.ts`                                                                                                  |
| DTO validation               | `src/server/validate-notification-registry-dto.ts`                                                                                             |
| Permission filter            | `src/server/filter-notification-registry-dto.ts`                                                                                               |
| Schema version               | `src/server/notification-registry-dto-schema-version.ts`                                                                                       |
| Server hydration diagnostics | `src/server/notification-registry-hydration-diagnostics.ts` (extended)                                                                         |
| Client hydration             | `src/client/create-notification-registry-from-dto.ts`                                                                                          |
| Client registry              | `src/client/client-notification-registry.ts`                                                                                                   |
| React provider               | `src/react/notification-registry-context.tsx`                                                                                                  |
| React hook                   | `src/react/use-notification-registry.ts`                                                                                                       |
| Tests                        | `server/notification-registry-dto.test.ts`, `client/create-notification-registry-from-dto.test.ts`, `react/use-notification-registry.test.tsx` |

`NOTIFICATION_LAYER_STATUS` updated to `"hydration"`. `EVENT_NOTIFICATION_REACT_STATUS` updated to `"hydration"`.

---

## Hydration flow

```text
bootstrapNotificationRegistry()
        ↓ mapNotificationRegistryDto()
        ↓ filterNotificationRegistryDto(permissionAdapter)
        ↓ createNotificationRegistryFromDto()
        ↓ NotificationRegistryProvider → useNotificationRegistry()
```

---

## Architecture compliance

| Rule                            | Result |
| ------------------------------- | ------ |
| DTO read-only                   | ✅     |
| Client does not register routes | ✅     |
| No mapper execution on client   | ✅     |
| No notification delivery        | ✅     |
| No Event Bus publish            | ✅     |
| Server remains authoritative    | ✅     |
| No shell UI integration         | ✅     |

---

## Test results

| Suite                                           | Focus                                    |
| ----------------------------------------------- | ---------------------------------------- |
| `notification-registry-dto.test.ts`             | Mapping, validation, filter, diagnostics |
| `create-notification-registry-from-dto.test.ts` | Hydration, read-only, empty, invalid     |
| `use-notification-registry.test.tsx`            | Provider, hooks, diagnostics             |

| Gate                 | Result                     |
| -------------------- | -------------------------- |
| `pnpm lint`          | ✅                         |
| `pnpm typecheck`     | ✅                         |
| `pnpm build`         | ✅                         |
| `pnpm test`          | ✅ 1033 tests (+27 EN-010) |
| `pnpm test:coverage` | ✅ 90.35% statements       |
| `pnpm test:e2e`      | ✅ 24 tests                |

---

## Coverage

| Scope              | Statements | Branches | Functions | Lines  |
| ------------------ | ---------- | -------- | --------- | ------ |
| Monorepo aggregate | 90.35%     | 86.55%   | 91.44%    | 90.35% |

Hydration subsystem meets package ≥80% thresholds.

---

## Technical debt

| ID         | Item                                                        | Target  |
| ---------- | ----------------------------------------------------------- | ------- |
| TD-EN10-01 | Combined `EventNotificationHydrationBundle` not implemented | EN-015  |
| TD-EN10-02 | `useEventRegistry()` client hydration not implemented       | EN-015+ |
| TD-EN10-03 | App bootstrap not wiring filtered DTO to provider           | EN-015  |
| TD-EN11-01 | `NotificationService` not implemented                       | EN-011  |
| TD-EN11-02 | Mapper results not stored in session service                | EN-011  |

---

## Recommendation for EN-011

Implement **Notification Service API**:

1. In-memory session notification store
2. Accept mapped `NotificationItem` instances from mapper
3. `listNotifications()`, `getUnreadCount()`, read/mark-read APIs
4. Wire mapper → service (still no delivery UI until EN-012/EN-013)

---

## Next step

**Stop.** Await review before EN-011 (Notification Service API).

---

_EN-010 Client Hydration — Complete._
