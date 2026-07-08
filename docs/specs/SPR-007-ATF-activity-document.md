# SPR-007 — ActivityItem Model

> **Story:** AT-007 (mapper output) · AT-001 (schema)  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented (AT-007)  
> **Authority:** [Activity architecture](./SPR-007-ATF-activity-architecture.md) · [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md) · [ADR-0035](../adr/ADR-0035-activity-execution-routing.md)

---

## 1. Purpose

Define the canonical **ActivityItem** — immutable activity instance produced by the Event-to-Activity Mapper. Not stored persistently, not delivered as notifications, and not written by modules in SPR-007.

> **Locked rule (AT-003):** **ActivityDocument / ActivityItem is immutable.** User state (read, pinned, hidden, archived, etc.) belongs to future session/user state models — not the activity document itself.

The ActivityItem is the Activity Service **read model** — analogous to `NotificationItem` but semantically distinct.

---

## 2. Shape

```typescript
interface ActivityItem {
  readonly activityId: string;
  readonly activityTypeId: string;
  readonly eventId: string;
  readonly title: string;
  readonly body?: string;
  readonly summary: string;
  readonly category: ActivityCategory;
  readonly severity: ActivitySeverity;
  readonly timestamp: string;
  readonly recordedAt: string;
  readonly metadata: ActivityItemMetadata;
  readonly diagnostics: ActivityItemDiagnostics;
}
```

All instances are frozen via `freezeActivityItem()`.

---

## 3. Field reference

| Field            | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `activityId`     | Deterministic id: `{envelopeId}:{activityTypeId}`         |
| `activityTypeId` | Matching activity type from Activity Registry             |
| `eventId`        | Source platform event id                                  |
| `title`          | Rendered title from template                              |
| `body`           | Rendered detail body (optional)                           |
| `summary`        | User-facing one-line description (primary timeline label) |
| `category`       | Activity taxonomy category                                |
| `severity`       | `info` · `success` · `warning` · `error`                  |
| `timestamp`      | Occurrence time from event envelope (ISO 8601)            |
| `recordedAt`     | Mapper insertion time (ISO 8601)                          |
| `metadata`       | Provenance, scope hints, presentation metadata            |
| `diagnostics`    | Mapper snapshot at creation time                          |

---

## 4. ActivityItemMetadata

```typescript
interface ActivityItemMetadata {
  readonly templateRef: string;
  readonly sourceEnvelopeId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly publisher: string;
  readonly category: ActivityCategory;
  readonly timelineScopes: readonly TimelineScope[];
  readonly actorId?: string;
  readonly actorLabel?: string;
  readonly workspaceId?: string;
  readonly tenantId?: string;
  readonly iconRef?: string;
  readonly viewed: boolean; // initial false
  readonly actionRef?: ActivityActionRef;
  readonly payloadSummary?: Readonly<Record<string, unknown>>;
}

interface ActivityActionRef {
  readonly actionId: string;
  readonly handlerContext?: Readonly<Record<string, unknown>>;
}
```

### 4.1 Metadata field rules

| Field              | Rule                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| `templateRef`      | Must match ActivityDescriptor templateRef                                                             |
| `sourceEnvelopeId` | Required — traceability to envelope                                                                   |
| `correlationId`    | Required — end-to-end trace (Document 010)                                                            |
| `timelineScopes`   | Copied from descriptor; may be narrowed by payload context                                            |
| `actorId`          | From envelope actor or payload                                                                        |
| `actorLabel`       | Presentation-safe label; never backend engine names                                                   |
| `workspaceId`      | Set when payload or context includes workspace                                                        |
| `viewed`           | Initial `false`; updated by `ActivityService.markViewed()`                                            |
| `actionRef`        | Optional — delegates via `execute()` only ([ADR-0035](../adr/ADR-0035-activity-execution-routing.md)) |
| `payloadSummary`   | Redacted subset of event payload for presentation                                                     |

Sensitive payload fields **must not** appear in metadata. Mapper applies redaction rules per activity type.

---

## 5. ActivityItemDiagnostics

```typescript
interface ActivityItemDiagnostics {
  readonly renderedAt: string;
  readonly typeStatus: ActivityTypeStatus;
  readonly eventPattern: string;
  readonly message: string;
  readonly mapperVersion: string;
}
```

| Field           | Description                        |
| --------------- | ---------------------------------- |
| `renderedAt`    | ISO timestamp of template render   |
| `typeStatus`    | Activity type `status` at map time |
| `eventPattern`  | Matched `sourceEventPattern`       |
| `message`       | Human-readable mapper note (dev)   |
| `mapperVersion` | Activity mapper package version    |

---

## 6. ActivityItem vs NotificationItem

| Aspect           | NotificationItem          | ActivityItem                    |
| ---------------- | ------------------------- | ------------------------------- |
| Purpose          | Attention / delivery      | Historical timeline             |
| Primary label    | `title`                   | `summary` (one-line history)    |
| User action      | Mark read, dismiss        | Mark viewed, navigate           |
| Store            | NotificationSessionStore  | ActivitySessionStore            |
| Mapper           | EventToNotificationMapper | EventToActivityMapper           |
| Registry ref     | `routeId`                 | `activityTypeId`                |
| Id formula       | `{envelopeId}:{routeId}`  | `{envelopeId}:{activityTypeId}` |
| Read state field | `metadata.read`           | `metadata.viewed`               |
| Channel/kind     | `kind`, `channel`         | N/A — timeline scope instead    |
| Priority         | `priority` (attention)    | `severity` (presentation)       |

**Neither model subsumes the other.** A single event may produce both.

### 6.1 Side-by-side example

Event: `capability.action.executed` with payload `{ actionId: "platform.theme.toggle" }`

|                 | NotificationItem                              | ActivityItem       |
| --------------- | --------------------------------------------- | ------------------ |
| title / summary | "Action completed"                            | "Theme toggled"    |
| body            | "platform.theme.toggle executed successfully" | (optional detail)  |
| kind / category | `inbox` / N/A                                 | N/A / `capability` |
| Experiences     | Notification Panel                            | Personal Timeline  |

---

## 7. ActivityItem vs audit log entry (M8+)

| Aspect     | ActivityItem               | Audit log (M8+)            |
| ---------- | -------------------------- | -------------------------- |
| Mutability | Session store; replaceable | Immutable persistence      |
| Scope      | User-facing timeline       | Compliance record          |
| Retention  | Session-scoped             | Long-term policy           |
| SPR-007    | In-memory session          | Not implemented            |
| Source     | Event envelope             | Authoritative audit writer |

Activity items **reference** source events for traceability; they are not audit records.

---

## 8. Idempotency (extension point — locked)

Activity deduplication is **optional**. Default behaviour: **no deduplication**.

Mappers may optionally declare an `idempotencyStrategy` (e.g. `"source-event-id"`). When unset or `"none"`, duplicate event delivery may produce multiple activity documents. Store-level deduplication is not required in SPR-007 foundation stories.

---

## 9. Factory and freeze

```typescript
import {
  createActivityItem,
  freezeActivityItem,
  type ActivityItem,
} from "@apzhub/activity-timeline-framework";
```

`createActivityItem()` validates required fields and applies defaults (`viewed: false`, `recordedAt: now`).

---

## 10. Boundaries

| Allowed                         | Forbidden                |
| ------------------------------- | ------------------------ |
| Created by Activity Mapper only | Module direct creation   |
| Stored in ActivitySessionStore  | NotificationSessionStore |
| Read via ActivityService        | Event Bus publish        |
| `actionRef` → `execute()`       | New execution pipeline   |

---

## 11. Related

- [Activity Service](./SPR-007-ATF-activity-service.md)
- [Activity Presentation Layer](./SPR-007-ATF-activity-presentation-layer.md)
- [SPR-006 NotificationItem](./SPR-006-ENF-notification-item.md) — parallel model reference

---

_SPR-007 ActivityItem Model — AT-001 / AT-007 specification._
