# @apzhub/event-notification-framework

Event & Notification Framework for APZHUB — Milestone 6 (SPR-006).

## Status

`EVENT_NOTIFICATION_FRAMEWORK_STATUS = "scaffold"` (EN-002)

Event and notification are **separate platform concepts** in one package with explicit module boundaries:

```text
Platform Capability → Domain Event → Event Bus → Notification Mapping → Notification Experience
```

## Exports

| Subpath                                                    | Purpose                                  |
| ---------------------------------------------------------- | ---------------------------------------- |
| `@apzhub/event-notification-framework`                     | Types, placeholders, DI composition root |
| `@apzhub/event-notification-framework/server`              | Server aggregate export                  |
| `@apzhub/event-notification-framework/server/event`        | Event layer only                         |
| `@apzhub/event-notification-framework/server/notification` | Notification layer only                  |
| `@apzhub/event-notification-framework/react`               | React placeholders (EN-010+)             |

## EN-002 scope

Scaffold only — no functional Event Bus, Notification Service, UI, or app integration.

| Component            | Status                           | Story         |
| -------------------- | -------------------------------- | ------------- |
| EventRegistry        | ✅ DefaultEventRegistry (EN-003) | EN-003        |
| EventBus             | Placeholder                      | EN-004        |
| NotificationRegistry | Placeholder                      | EN-007        |
| NotificationMapper   | Placeholder                      | EN-009        |
| NotificationService  | Placeholder                      | EN-011        |
| React hooks          | Throw placeholders               | EN-010/EN-011 |

## Composition root

```typescript
import { createDefaultEventRegistry } from "@apzhub/event-notification-framework";

const registry = createDefaultEventRegistry();
registry.register({
  eventId: "capability.action.executed",
  version: "1.0.0",
  category: "capability",
  publisher: "command-framework",
});
registry.getMetadata("capability.action.executed");
```

## Architecture

- [Event Framework](../../docs/architecture/event-framework.md)
- [Notification Framework](../../docs/architecture/notification-framework.md)
- ADRs 0030–0032

## Retired packages

`@apzhub/events` and `@apzhub/notifications` stubs were retired in EN-002 per ADR-0030.
