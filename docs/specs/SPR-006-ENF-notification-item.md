# SPR-006 — NotificationItem Model

> **Story:** EN-009  
> **Status:** Implemented  
> **Authority:** [Notification Mapper spec](./SPR-006-ENF-notification-mapper.md) · [ADR-0032](../adr/ADR-0032-notification-routing-model.md)

---

## Purpose

Define the canonical **NotificationItem** — immutable notification instance produced by the Event-to-Notification Mapper. Not delivered or persisted in EN-009.

---

## Shape

```typescript
interface NotificationItem {
  notificationId: string;
  routeId: string;
  eventId: string;
  title: string;
  body?: string;
  kind: NotificationKind;
  channel: DeliveryChannel;
  priority: NotificationPriority;
  timestamp: string;
  metadata: NotificationItemMetadata;
  diagnostics: NotificationItemDiagnostics;
}
```

All instances are frozen via `freezeNotificationItem()`.

---

## Field reference

| Field            | Description                                |
| ---------------- | ------------------------------------------ |
| `notificationId` | Deterministic id: `{envelopeId}:{routeId}` |
| `routeId`        | Matching notification route                |
| `eventId`        | Source platform event id                   |
| `title`          | Rendered title                             |
| `body`           | Rendered body (optional)                   |
| `kind`           | Presentation kind (toast, inbox, …)        |
| `channel`        | Delivery channel metadata                  |
| `priority`       | low · normal · high · urgent               |
| `timestamp`      | Event envelope timestamp                   |
| `metadata`       | Provenance and presentation metadata       |
| `diagnostics`    | Mapper snapshot at creation time           |

---

## Metadata

```typescript
interface NotificationItemMetadata {
  templateRef: string;
  sourceEnvelopeId: string;
  category: EventCategory;
  correlationId: string;
  publisher: string;
  read: boolean; // initial false
  actorId?: string;
  actionRef?: NotificationActionRef;
}
```

---

## Diagnostics

```typescript
interface NotificationItemDiagnostics {
  renderedAt: string;
  routeStatus: NotificationRouteStatus;
  eventPattern: string;
  message: string;
}
```

---

## Idempotency

`notificationId` derives from `(sourceEnvelopeId, routeId)` via envelope id — duplicate event delivery produces the same id (EN-011 store enforces deduplication).

---

## Code reference

```typescript
import {
  createNotificationItem,
  freezeNotificationItem,
  type NotificationItem,
} from "@apzhub/event-notification-framework";
```

---

_SPR-006 NotificationItem Model — EN-009._
