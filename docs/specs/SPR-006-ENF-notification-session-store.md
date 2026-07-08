# SPR-006 — Notification Session Store

> **Story:** EN-011  
> **Status:** Implemented  
> **Authority:** [Notification Service](./SPR-006-ENF-notification-service.md)

---

## Purpose

Define the **in-memory session-scoped notification store** backing `DefaultNotificationService`. Holds immutable `NotificationItem` references with mutable read state tracked per entry.

No database. No browser storage. No cross-session persistence.

---

## Interface

`NotificationSessionStore` (`src/notification/notification-session-store.ts`):

| Method                           | Description                                |
| -------------------------------- | ------------------------------------------ |
| `append(items)`                  | Add items; skip duplicate `notificationId` |
| `get(id)`                        | Lookup with merged read state              |
| `list(options?)`                 | Ordered, filterable list                   |
| `getUnreadCount()`               | Unread count                               |
| `getReadCount()`                 | Read count                                 |
| `getTotalCount()`                | Total entries                              |
| `getLastNotificationTimestamp()` | Max item timestamp                         |
| `markAsRead(id)`                 | Mark entry read                            |
| `markAllAsRead()`                | Mark all unread entries read               |
| `clear()`                        | Remove all entries                         |

---

## Stored entry shape

```typescript
interface NotificationSessionEntry {
  readonly item: NotificationItem; // immutable mapper output
  readonly read: boolean; // session read state
  readonly storedAt: string; // ISO timestamp when appended
}
```

Read state is merged into returned items via `withNotificationReadState()` without mutating the original mapper item.

---

## Capabilities

| Capability   | Implementation                      |
| ------------ | ----------------------------------- |
| Append       | `Map<notificationId, entry>` insert |
| Lookup       | `Map.get` + read merge              |
| Ordering     | Sort by timestamp desc, id asc      |
| Unread state | Per-entry `read` flag               |
| Read state   | `markAsRead` / `markAllAsRead`      |
| Clear        | `Map.clear()`                       |

---

## Deduplication

Append skips items whose `notificationId` already exists. Returns `{ addedCount, skippedCount }`.

Initial read state inherits `item.metadata.read` (mapper default: `false`).

---

## Filtering

`list(options)` supports:

- `unreadOnly: true` — unread entries only
- `kind: NotificationKind` — filter by notification kind
- `limit: number` — cap result count after sort/filter

---

## Default implementation

`DefaultNotificationSessionStore` (`src/notification/default-notification-session-store.ts`).

Factory: `createDefaultNotificationSessionStore()`.

Injected into `DefaultNotificationService` via `DefaultNotificationServiceOptions.store`.

---

## Lifecycle position

```text
NotificationMapper → NotificationItem[]
        ↓
DefaultNotificationService.addNotifications()
        ↓
DefaultNotificationSessionStore.append()
        ↓
Session-scoped Map (process lifetime)
```

Store lifetime matches the service instance. New service instance = new session.

---

## Related specs

- [Notification Service](./SPR-006-ENF-notification-service.md)
- [Notification Item](./SPR-006-ENF-notification-item.md)
