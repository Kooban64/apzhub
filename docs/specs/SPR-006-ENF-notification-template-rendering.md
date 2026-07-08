# SPR-006 — Notification Template Rendering

> **Story:** EN-009  
> **Status:** Implemented  
> **Authority:** [Notification manifest schema](./SPR-006-ENF-notification-manifest.md) · [Notification Mapper spec](./SPR-006-ENF-notification-mapper.md)

---

## Purpose

Define **simple placeholder template rendering** for notification title and body strings. No templating engines in SPR-006.

---

## Supported placeholders

| Placeholder             | Resolves to                                    |
| ----------------------- | ---------------------------------------------- |
| `{{event.id}}`          | `envelope.eventId`                             |
| `{{event.category}}`    | `envelope.category`                            |
| `{{event.timestamp}}`   | `envelope.timestamp`                           |
| `{{payload.fieldName}}` | String value from `envelope.payload.fieldName` |

Unknown placeholders resolve to empty string.

---

## Rules

| Rule                       | EN-009 |
| -------------------------- | ------ |
| Simple string replace only | ✅     |
| No scripting               | ✅     |
| No expressions             | ✅     |
| No conditionals            | ✅     |
| No templating engines      | ✅     |

---

## Template sources

| Source              | Registration                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------- |
| Platform catalogue  | `titleTemplate` / `bodyTemplate` on catalogue entries → descriptor → mapper registry sync |
| Capability manifest | `notifications.routes[].titleTemplate` / `bodyTemplate`                                   |
| Explicit registry   | `NotificationMapperRegistry.register()`                                                   |

Fallback when no template: `title = route.label ?? route.routeId`, no body.

---

## Error handling

Empty title template → `TEMPLATE_ERROR` issue; route skipped; other matching routes continue.

---

## Example

Template:

```text
Action {{payload.actionId}} completed at {{event.timestamp}}
```

Event payload `{ actionId: "platform.theme.toggle" }` →

```text
Action platform.theme.toggle completed at 2026-07-04T10:00:00.000Z
```

---

## Code reference

```typescript
import { renderNotificationTemplate } from "@apzhub/event-notification-framework";

const title = renderNotificationTemplate("{{event.id}} completed", envelope);
```

---

_SPR-006 Notification Template Rendering — EN-009._
