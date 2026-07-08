# SPR-006 — Notification Architecture and Taxonomy

> **Story:** EN-001 — Event & Notification Architecture  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Status:** Specification — **no implementation**  
> **Authority:** [Document 021](../021-notification-activity-attention-management-framework.md) · [Notification Framework](../architecture/notification-framework.md) · ADRs [0030](../adr/ADR-0030-event-notification-framework-package.md) · [0032](../adr/ADR-0032-notification-routing-model.md)

---

## 1. Purpose

Define the **Notification Architecture** — notification model, routing, delivery channels, **canonical Notification taxonomy**, and separation from Event taxonomy.

**Modules never send notifications.** Notifications are created by platform mappers reacting to events.

**EN-001 scope:** Architecture and taxonomy only. No notification UI implementation.

---

## 2. Vision

```text
Event published on Event Bus
        ↓
EventToNotificationMapper matches NotificationRoute
        ↓
NotificationItem created in session store
        ↓
NotificationService notifies Experiences
        ↓
User sees notification (in-app · email · …)
```

Attention management determines whether to notify — not the originating module.

---

## 3. Notification model

### 3.1 NotificationRoute (registry entry)

Metadata registered at bootstrap — describes **how** to react to an event pattern.

| Property           | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `routeId`          | Stable id (`platform.action.executed.inbox`)              |
| `eventPattern`     | Event id or pattern to match                              |
| `notificationKind` | Taxonomy kind (§4)                                        |
| `channel`          | Delivery channel (§5) — **separate from events**          |
| `priority`         | `low` · `normal` · `high` · `urgent` (attention scaffold) |
| `templateRef`      | Presentation template key                                 |
| `permission`       | RBAC key for recipient filter (M8 population)             |
| `status`           | `active` · `planned` · `disabled`                         |

### 3.2 NotificationItem (instance)

Live notification created by mapper — stored in **NotificationSessionStore** (SPR-006 in-memory).

```typescript
interface NotificationItem {
  readonly notificationId: string;
  readonly routeId: string;
  readonly notificationKind: NotificationKind;
  readonly channel: DeliveryChannel;
  readonly priority: NotificationPriority;
  readonly title: string;
  readonly body?: string;
  readonly timestamp: string;
  readonly read: boolean;
  readonly sourceEventId: string;
  readonly sourceEnvelopeId: string;
  readonly actionRef?: NotificationActionRef;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

interface NotificationActionRef {
  readonly actionId: string;
  readonly handlerContext?: Readonly<Record<string, unknown>>;
}
```

**Rules:**

1. NotificationItems **must not** trigger event publish
2. Action delegation uses existing `execute()` — [ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md) applies
3. Permission filtering before client hydration
4. `sourceEventId` + `sourceEnvelopeId` for traceability

### 3.3 Separation from events

| Concept    | Event                                 | Notification                           |
| ---------- | ------------------------------------- | -------------------------------------- |
| Purpose    | State change signal                   | User information delivery              |
| Taxonomy   | System, User, Capability, Integration | Toast, Banner, Inbox, In-App, Email, … |
| Created by | Capability after work                 | Mapper after event                     |
| Registry   | EventRegistry                         | NotificationRegistry                   |
| Client API | None (SPR-006)                        | NotificationService                    |

---

## 4. Notification taxonomy

Eight **notification kinds** documented. Four are in-app presentation kinds; four are external delivery kinds.

### 4.1 Toast (`toast`)

| Attribute       | Value                   |
| --------------- | ----------------------- |
| Interruption    | Low — auto-dismiss      |
| Persistence     | Seconds                 |
| Typical channel | `in-app` (toast region) |
| SPR-006         | Scaffold                |

**Examples:**

| title         | body                  | source event               |
| ------------- | --------------------- | -------------------------- |
| Theme updated | Switched to Dark mode | `capability.theme.changed` |
| Saved         | Preferences saved     | `user.preference.changed`  |

### 4.2 Banner (`banner`)

| Attribute       | Value                     |
| --------------- | ------------------------- |
| Interruption    | Medium — requires dismiss |
| Persistence     | Until dismissed           |
| Typical channel | `in-app` (banner slot)    |
| SPR-006         | Scaffold                  |

**Examples:**

| title                 | body                                          | source event                        |
| --------------------- | --------------------------------------------- | ----------------------------------- |
| Maintenance scheduled | Platform update in 15 minutes                 | `system.platform.health.degraded`   |
| Sync failed           | Plane connector sync failed — retry available | `integration.connector.sync.failed` |

### 4.3 Inbox (`inbox`)

| Attribute       | Value                      |
| --------------- | -------------------------- |
| Interruption    | Low until user opens inbox |
| Persistence     | Until read/archived        |
| Typical channel | `in-app` (inbox list)      |
| SPR-006         | ✅ Foundation              |

**Examples:**

| title            | body                                          | source event                     |
| ---------------- | --------------------------------------------- | -------------------------------- |
| Action completed | `platform.theme.toggle` executed successfully | `capability.action.executed`     |
| Task assigned    | New task assigned to you (M9+)                | `capability.plane.task.assigned` |

### 4.4 In-App (`in-app`)

| Attribute       | Value                            |
| --------------- | -------------------------------- |
| Interruption    | Configurable                     |
| Persistence     | Session + inbox backing          |
| Typical channel | `in-app` (panel, popover, badge) |
| SPR-006         | ✅ Foundation                    |

**Examples:**

| title              | body                         | source event             |
| ------------------ | ---------------------------- | ------------------------ |
| (badge count)      | 3 unread notifications       | aggregate of inbox items |
| Notification panel | List of active notifications | multiple events          |

`in-app` is both a **notification kind** (general) and a **delivery channel** — kind describes presentation; channel describes transport. Panel/badge Experiences consume `in-app` channel items.

### 4.5 Email (`email`)

| Attribute    | Value                 |
| ------------ | --------------------- |
| Interruption | External — user inbox |
| Persistence  | External mail store   |
| Channel      | `email` only          |
| SPR-006      | ⏳ Interface stub     |

**Examples:**

| subject                     | source event                               |
| --------------------------- | ------------------------------------------ |
| APZHUB Daily Digest         | scheduled digest (Digest Service — future) |
| Security alert: new sign-in | `security.session.new_device` (M8)         |

Email is a **delivery channel**, not an event category.

### 4.6 SMS (`sms`)

| Attribute | Value             |
| --------- | ----------------- |
| Channel   | `sms`             |
| SPR-006   | ⏳ Interface stub |

**Examples:**

| message                               | source event                       |
| ------------------------------------- | ---------------------------------- |
| Your APZHUB verification code: 123456 | `security.mfa.code.requested` (M8) |

### 4.7 Push (`push`)

| Attribute | Value             |
| --------- | ----------------- |
| Channel   | `push`            |
| SPR-006   | ⏳ Interface stub |

**Examples:**

| title             | source event                         |
| ----------------- | ------------------------------------ |
| Approval required | `capability.approval.required` (M9+) |

### 4.8 Webhook (`webhook`)

| Attribute | Value             |
| --------- | ----------------- |
| Channel   | `webhook`         |
| SPR-006   | ⏳ Interface stub |

**Examples:**

| target                                     | source event                       |
| ------------------------------------------ | ---------------------------------- |
| POST https://itsm.example.com/hooks/apzhub | `integration.ticket.created` (M9+) |

---

## 5. Delivery channels

Delivery channels are **orthogonal** to event categories and notification kinds.

| Channel id | Transport        | Owner (future)         | SPR-006 |
| ---------- | ---------------- | ---------------------- | ------- |
| `in-app`   | Desktop Shell UI | Notification Framework | ✅      |
| `email`    | Email provider   | Delivery Service       | Stub    |
| `sms`      | SMS gateway      | Delivery Service       | Stub    |
| `push`     | FCM/APNs/desktop | Delivery Service       | Stub    |
| `webhook`  | HTTP client      | Delivery Service       | Stub    |

### 5.1 Channel vs kind matrix

|              | `in-app` channel | `email` channel | `push` channel |
| ------------ | ---------------- | --------------- | -------------- |
| `inbox` kind | ✅ Primary       | ⏳ Digest item  | ⏳ Future      |
| `toast` kind | ✅ Primary       | ❌ N/A          | ⏳ Rare        |
| `email` kind | ❌ N/A           | ✅ Primary      | ❌ N/A         |

One event may produce **multiple NotificationItems** via separate routes:

```text
capability.action.executed
    ├── route: inbox + in-app   → shell panel item
    └── route: email + email    → (deferred) daily digest batch
```

---

## 6. Notification Registry integration

### 6.1 Bootstrap

```text
Runtime manifest discovery
        ↓
Extract notifications.routes
        ↓
Merge PlatformNotificationCatalogue
        ↓
NotificationRegistry.register()
        ↓
Wire EventToNotificationMapper subscriptions
```

See [SPR-006-ENF-notification-manifest.md](./SPR-006-ENF-notification-manifest.md).

### 6.2 Mapping layer

See [SPR-006-ENF-event-to-notification-mapping.md](./SPR-006-ENF-event-to-notification-mapping.md).

---

## 7. NotificationService (specification outline)

Full spec in EN-011 story document.

| Method                                              | Behaviour                              |
| --------------------------------------------------- | -------------------------------------- |
| `listNotifications({ unreadOnly?, kind?, limit? })` | Read from hydrated session store       |
| `markRead(notificationId)`                          | Set read flag; emit subscribe callback |
| `markAllRead()`                                     | Bulk read                              |
| `subscribe(listener)`                               | Sync callback on store change          |
| `getUnreadCount()`                                  | Badge helper                           |
| `getDiagnostics()`                                  | Dev metadata                           |

Public hook: **`useNotificationService()`** — only supported client entry point.

---

## 8. Attention scaffold (SPR-006)

Full Attention Engine deferred. SPR-006 registers:

| Priority | Badge behaviour         | Route filter            |
| -------- | ----------------------- | ----------------------- |
| `low`    | No badge increment      | Optional suppress toast |
| `normal` | Badge increment         | Default                 |
| `high`   | Badge + highlight       | —                       |
| `urgent` | Badge + banner scaffold | —                       |

Document 021 Attention Engine services (Digest, Quiet Hours, Preference) — interface stubs only.

---

## 9. Acceptance criteria (EN-001)

- [x] Notification taxonomy — 8 kinds documented with examples
- [x] Delivery channels documented separately from events
- [x] NotificationRoute and NotificationItem models defined
- [x] Event/notification separation rules documented
- [x] ADR-0032 accepted
- [ ] Owner review before EN-002 — pending

---

_SPR-006 Notification Architecture and Taxonomy — EN-001._
