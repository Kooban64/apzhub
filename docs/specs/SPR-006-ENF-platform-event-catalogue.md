# SPR-006 — Platform Event Catalogue

> **Story:** EN-005  
> **Status:** Implemented  
> **Package:** `@apzhub/event-notification-framework`  
> **Authority:** [Event manifest schema](./SPR-006-ENF-event-manifest.md) · [ADR-0031](../adr/ADR-0031-event-registry-and-bus.md)

---

## Purpose

Document the **built-in Platform Event Catalogue** — foundational event definitions registered at bootstrap without manifest files. Definitions only; no publish behaviour in EN-005.

---

## Registration

`registerPlatformEventCatalogue(registry)` atomically registers all catalogue entries with:

- `source: "builtin"`
- `schemaVersion` stamped with `EVENT_NOTIFICATION_PLATFORM_VERSION` (`3.0.0`)
- `recordPlatformCatalogue(version)` on success

---

## Foundational events (SPR-006)

| eventId                                | category   | publisher                     | label                        |
| -------------------------------------- | ---------- | ----------------------------- | ---------------------------- |
| `system.platform.bootstrap.completed`  | system     | platform-runtime              | Platform Bootstrap Completed |
| `system.platform.health.changed`       | system     | platform-runtime              | Platform Health Changed      |
| `capability.action.executed`           | capability | command-framework             | Action Executed              |
| `capability.knowledge.query.completed` | capability | knowledge-discovery-framework | Knowledge Query Completed    |

All entries use version `1.0.0` and status `active`.

---

## Declared subscribers (metadata only)

| eventId                                | subscribers          |
| -------------------------------------- | -------------------- |
| `system.platform.bootstrap.completed`  | notifications, audit |
| `system.platform.health.changed`       | notifications        |
| `capability.action.executed`           | notifications, audit |
| `capability.knowledge.query.completed` | notifications        |

Subscriber ids are declarative metadata — no subscription wiring in EN-005.

---

## Extension policy

Additional catalogue entries require:

1. ADR or sprint story approval
2. Catalogue array update in `platform-event-catalogue.ts`
3. Bootstrap test coverage

Capability-specific events should be declared in capability manifests rather than the platform catalogue.

---

## Code reference

```typescript
import {
  PLATFORM_EVENT_CATALOGUE,
  registerPlatformEventCatalogue,
} from "@apzhub/event-notification-framework";
```

---

_SPR-006 Platform Event Catalogue — EN-005._
