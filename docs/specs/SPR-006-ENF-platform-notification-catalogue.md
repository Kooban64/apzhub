# SPR-006 — Platform Notification Catalogue

> **Story:** EN-008  
> **Status:** Implemented  
> **Package:** `@apzhub/event-notification-framework`  
> **Authority:** [Notification manifest schema](./SPR-006-ENF-notification-manifest.md) · [ADR-0032](../adr/ADR-0032-notification-routing-model.md)

---

## Purpose

Document the **built-in Platform Notification Catalogue** — foundational notification route definitions registered at bootstrap without manifest files. Definitions only; no delivery behaviour in EN-008.

---

## Registration

`registerPlatformNotificationCatalogue(registry)` atomically registers all catalogue entries with:

- `source: "builtin"`
- `schemaVersion` stamped with `EVENT_NOTIFICATION_PLATFORM_VERSION` (`3.0.0`)
- `recordPlatformCatalogue(version)` on success

---

## Foundational routes (SPR-006)

| routeId                   | eventPattern                          | kind   | channel | label                      |
| ------------------------- | ------------------------------------- | ------ | ------- | -------------------------- |
| `platform.toast.default`  | `system.platform.bootstrap.completed` | toast  | in-app  | Default Platform Toast     |
| `platform.banner.warning` | `system.platform.health.changed`      | banner | in-app  | Platform Warning Banner    |
| `platform.inbox.system`   | `system.platform.bootstrap.completed` | inbox  | in-app  | System Inbox               |
| `platform.inapp.system`   | `system.platform.health.changed`      | in-app | in-app  | System In-App Notification |

All entries use version `1.0.0` and status `active`.

---

## Event mapping reference (metadata only)

Routes declare `eventPattern` linking to platform or capability events. EN-008 registers the mapping metadata only — **no Event Bus subscription** and **no mapper execution**.

| routeId                   | Maps to event (reference)             |
| ------------------------- | ------------------------------------- |
| `platform.toast.default`  | `system.platform.bootstrap.completed` |
| `platform.banner.warning` | `system.platform.health.changed`      |
| `platform.inbox.system`   | `system.platform.bootstrap.completed` |
| `platform.inapp.system`   | `system.platform.health.changed`      |

Notification mappers (EN-009) will connect published events to these routes.

---

## Extension policy

Additional catalogue entries require:

1. ADR or sprint story approval
2. Catalogue array update in `platform-notification-catalogue.ts`
3. Bootstrap test coverage

Capability-specific notification routes should be declared in capability manifests rather than the platform catalogue.

---

## Code reference

```typescript
import {
  PLATFORM_NOTIFICATION_CATALOGUE,
  registerPlatformNotificationCatalogue,
} from "@apzhub/event-notification-framework";
```

---

_SPR-006 Platform Notification Catalogue — EN-008._
