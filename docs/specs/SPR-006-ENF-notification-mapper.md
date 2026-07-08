# SPR-006 — Event-to-Notification Mapper

> **Story:** EN-009  
> **Status:** Implemented  
> **Authority:** [ADR-0032](../adr/ADR-0032-notification-routing-model.md) · [Notification Architecture](./SPR-006-ENF-notification-architecture.md)

---

## Purpose

Define the **Event-to-Notification Mapper** — consumes published platform events and produces immutable `NotificationItem` instances. Returns items only; no delivery, persistence, Event Bus publish, or UI.

---

## Pipeline

```text
Platform Event (EventEnvelope)
        ↓
Notification Route Resolution (resolveNotificationRoutes)
        ↓
DefaultNotificationMapper
        ↓
Template Rendering (renderNotificationTemplate)
        ↓
NotificationItem (immutable)
        ↓
(return only — no delivery)
```

---

## Components

| Component                    | Path                                                       | Role                        |
| ---------------------------- | ---------------------------------------------------------- | --------------------------- |
| `DefaultNotificationMapper`  | `src/notification/default-notification-mapper.ts`          | Composition root            |
| `NotificationMapperRegistry` | `src/notification/default-notification-mapper-registry.ts` | Route template registry     |
| `resolveNotificationRoutes`  | `src/notification/resolve-notification-routes.ts`          | Pattern-based route lookup  |
| `renderNotificationTemplate` | `src/notification/render-notification-template.ts`         | Placeholder substitution    |
| `createNotificationItem`     | `src/notification/create-notification-item.ts`             | Canonical item factory      |
| Pattern matching             | `src/event/match-event-pattern.ts`                         | Shared exact + prefix rules |

---

## Event pattern matching

Reuses `matchesEventPattern()` from the event layer:

| Pattern                      | Matches             |
| ---------------------------- | ------------------- |
| `capability.action.executed` | Exact event id only |
| `system.platform.*`          | Prefix wildcard     |
| `capability.action.*`        | Prefix + nested ids |

No regular expressions.

---

## Route resolution

`resolveNotificationRoutes(registry, eventId)`:

- Iterates registered routes
- Skips `planned` and `disabled` routes by default
- Returns sorted matches for fan-out mapping

---

## Template rendering

Simple `{{placeholder}}` substitution only — no scripting, expressions, conditionals, or templating engines.

| Placeholder           | Source                  |
| --------------------- | ----------------------- |
| `{{event.id}}`        | `envelope.eventId`      |
| `{{event.category}}`  | `envelope.category`     |
| `{{event.timestamp}}` | `envelope.timestamp`    |
| `{{payload.xxx}}`     | `envelope.payload[xxx]` |

Templates are registered on `NotificationMapperRegistry` (keyed by `routeId`) and synced from `NotificationDescriptor.titleTemplate` / `bodyTemplate` when present.

---

## Mapper result

```typescript
interface NotificationMapperResult {
  ok: boolean;
  createdCount: number;
  matchedRouteCount: number;
  items: readonly NotificationItem[];
  issues: readonly NotificationMappingIssue[];
}
```

| Issue code       | Meaning                                         |
| ---------------- | ----------------------------------------------- |
| `NO_MATCH`       | No active routes matched the event              |
| `TEMPLATE_ERROR` | Template render failed — route skipped          |
| `ROUTE_SKIPPED`  | Reserved for future attention/suppression rules |

---

## Architectural boundaries

| Rule                             | EN-009 |
| -------------------------------- | ------ |
| Consumes platform events         | ✅     |
| Returns NotificationItem objects | ✅     |
| No notification delivery         | ✅     |
| No Event Bus publish             | ✅     |
| No persistence                   | ✅     |
| No UI / external services        | ✅     |

Delivery begins in EN-011 (`NotificationService` session store). Presentation in EN-012+.

---

## Dependency injection

`createEventNotificationContext()` defaults to `createDefaultNotificationMapper({ notificationRegistry })`.

Bootstrap workflow:

```typescript
const { registry } = bootstrapNotificationRegistry();
const context = createEventNotificationContext({ notificationRegistry: registry });
const result = context.notificationMapper.map(envelope);
```

---

_SPR-006 Event-to-Notification Mapper — EN-009._
