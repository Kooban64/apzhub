# SPR-006 — Application Bootstrap Sequence

> **Story:** EN-015  
> **Scope:** `apps/web` platform layout startup

---

## Server startup (RSC layout)

Parallel hydration in `app/(platform)/layout.tsx`:

| Loader                             | Framework            |
| ---------------------------------- | -------------------- |
| `loadWorkbenchRegistryDto()`       | Workbench            |
| `loadActionRegistryDto()`          | Action               |
| `loadKnowledgeSourceRegistryDto()` | Knowledge            |
| `loadEventNotificationHydration()` | Event & Notification |

`loadEventNotificationHydration()` depends on `ensurePlatformRuntimeReady()` and shares bootstrap logic with `/api/health`.

---

## Event & Notification server path

1. `ensurePlatformRuntimeReady()` — platform runtime singleton
2. `mapPlatformCapabilitiesToEventRecords(Runtime.registry().findAll())`
3. `createAppEventNotificationContext({ capabilityRecords })`
4. Permission-filter DTOs with session-aware `WorkbenchPermissionAdapter`
5. Pass DTOs + diagnostics to `ActionWorkbenchShellProvider`

---

## Client startup (shell provider)

1. `useAppEventNotificationContext()` — session `EventNotificationContext` (platform catalogue + app routes)
2. `createActionAuditEventBusHook({ eventBus })` wired into executor
3. `NotificationRegistryProvider` + `NotificationServiceProvider`
4. Existing Workbench / Command / Knowledge provider stack unchanged

---

## Health startup

`/api/health` calls `loadEventFrameworkHealthSummary()` and `loadNotificationFrameworkHealthSummary()` in parallel with command and knowledge summaries. Uses allow-all permission adapter for observability counts.

---

## Architectural constraints

- Runtime bootstrap is not redesigned
- No duplicate Notification Service instances per session
- Events and notifications remain separate layers

---

_EN-015 bootstrap sequence documentation — complete._
