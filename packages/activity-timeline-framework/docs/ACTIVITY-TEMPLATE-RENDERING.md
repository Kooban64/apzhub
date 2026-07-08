# Event-to-Activity Template Rendering

> **Package:** `@apzhub/activity-timeline-framework`  
> **Story:** AT-007  
> **Status:** Implemented

---

## Purpose

The Activity Mapper renders presentation strings from activity type templates using Platform Event envelope data. Templates are declarative — no business logic in mapper code.

---

## Renderer

```typescript
import { renderActivityTemplate } from "@apzhub/activity-timeline-framework";
```

Uses simple `{{placeholder}}` substitution (same pattern as Notification Framework).

---

## Supported placeholders

| Placeholder           | Source                                |
| --------------------- | ------------------------------------- |
| `{{event.id}}`        | `envelope.eventId`                    |
| `{{event.category}}`  | `envelope.category`                   |
| `{{event.timestamp}}` | `envelope.timestamp`                  |
| `{{actor.id}}`        | `envelope.actorId`                    |
| `{{payload.xxx}}`     | `envelope.payload[xxx]` — stringified |

Unknown placeholders resolve to empty strings.

---

## Template registry

`ActivityMapperRegistry` stores templates keyed by `activityTypeId`:

```typescript
interface ActivityTypeTemplate {
  readonly activityTypeId: string;
  readonly titleTemplate: string;
  readonly descriptionTemplate?: string;
}
```

On mapper construction, missing templates are seeded from activity type `label` and `description`. Explicit registry entries are not overwritten.

---

## Boundaries

| Does                                    | Does not                 |
| --------------------------------------- | ------------------------ |
| Render title and description strings    | Evaluate business rules  |
| Validate non-empty templates            | Store rendered documents |
| Report template errors in mapper issues | Publish to Event Bus     |

---

_Event-to-Activity Template Rendering — AT-007._
