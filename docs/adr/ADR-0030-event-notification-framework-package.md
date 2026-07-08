# ADR-0030 — Event & Notification Framework Package

> **Status:** Accepted  
> **Date:** 2026-07-03  
> **Sprint:** SPR-006 — EN-001  
> **Decided by:** Project owner (Sprint 006 authorisation)  
> **Related:** [Document 021](../021-notification-activity-attention-management-framework.md) · [Document 029](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · [ADR-0027](./ADR-0027-knowledge-discovery-framework-package.md) · [ADR-0007](./ADR-0007-event-driven-communication.md) · [Platform Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md)

## Problem

Sprint 006 delivers the **Event & Notification Framework** — two **separate platform concepts** that must coexist without conflating event publishing with notification delivery.

Document 029 defines the Event SDK and Event Bus. Document 021 defines Notification, Activity, and Attention — with the rule that modules publish events and never send notifications directly.

Two empty package shells exist:

- `@apzhub/events` — placeholder from SPR-001
- `@apzhub/notifications` — placeholder from SPR-001

Packaging options:

1. **Option A** — Unified `@apzhub/event-notification-framework` repurpose both stubs (mirrors ADR-0027).
2. **Option B** — Expand `@apzhub/events` and `@apzhub/notifications` as separate packages.
3. **Option C** — Implement within `@apzhub/platform-runtime` (Event Bus as runtime subsystem).

Option C couples notification presentation concerns to Runtime. Option B splits concepts physically but duplicates bootstrap/hydration patterns. Option A provides one sprint package with **strict internal module boundaries** between Event and Notification subsystems.

## Decision

**Option A — Unified `@apzhub/event-notification-framework` package with separate Event and Notification subsystems.**

| Item           | Value                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| Package path   | `packages/event-notification-framework/` created in **EN-002**                    |
| npm name       | `@apzhub/event-notification-framework`                                            |
| Primary export | `@apzhub/event-notification-framework`                                            |
| Server export  | `@apzhub/event-notification-framework/server`                                     |
| React export   | `@apzhub/event-notification-framework/react` (EN-010)                             |
| Retired names  | `@apzhub/events`, `@apzhub/notifications` — no consumers; stubs removed in EN-002 |

**Conceptual separation is mandatory** even within one package:

```text
server/event/          Event Registry · Event Bus · envelope validation
server/notification/   Notification Registry · mappers · session store
```

Notification modules **must not** publish events. Event modules **must not** render UI or deliver notifications.

### Package responsibilities — Event subsystem

- **EventRegistry** — event descriptor index; register, list, get, diagnostics
- **InProcessEventBus** — publish/subscribe with standard envelope (SPR-006 in-process only)
- **Manifest extraction** — `events` block / `event.yaml` per Document 029
- **Platform event catalogue** — built-in platform events (action executed, theme changed)
- **Server filter** — `filterEventRegistryDto()` mirroring established pattern
- **Audit bridge adapter** — receives Action Framework audit hook payloads (EN-014)

### Package responsibilities — Notification subsystem

- **NotificationRegistry** — route, channel, template metadata
- **EventToNotificationMapper** — subscribes to Event Bus; creates notification DTOs
- **Notification session store** — in-memory active notifications per session (SPR-006)
- **Server filter** — `filterNotificationRegistryDto()`
- **NotificationService** — public client API boundary (EN-011)
- **Presentation helpers** — DTO → view model (EN-012)

### Package does **not** own

- Action Registry or CommandExecutor (`@apzhub/command-framework`) — audit hook only
- Knowledge Registry or Knowledge Service (`@apzhub/knowledge-discovery-framework`)
- Workbench Manager or engines (`@apzhub/workbench-framework`)
- Platform Runtime orchestration (`@apzhub/platform-runtime`)
- Shell notification **Experiences** (`@apzhub/workspace`) — consume NotificationService
- Email, SMS, push, webhook **delivery workers** (deferred M8+)
- Activity timeline UI (M7 Activity Framework)
- Persistent event store or external broker (deferred M10)

### Dependency direction

```text
apps/web
    ↓
@apzhub/workspace · @apzhub/ui              (Notification Experiences)
    ↓
@apzhub/event-notification-framework/react  (NotificationService hooks)
    ↓
@apzhub/event-notification-framework/server (Event Bus · mappers · registries)
    ↓
@apzhub/command-framework                   (audit hook adapter — EN-014)
@apzhub/platform-runtime/server             (manifest extraction input)
@apzhub/types                               (shared DTO types)

react (react export only)
```

**Rules:**

1. `@apzhub/event-notification-framework` **must not** import Workbench Manager, CommandExecutor internals, or Knowledge orchestrator.
2. Event Bus publish is **server-side only** in SPR-006 — client receives notification DTOs, not publish API.
3. UI packages **must not** import server subpath in client bundles.
4. Notifications are **consumers of events** — never event producers.

### Status constant

Export `EVENT_NOTIFICATION_FRAMEWORK_STATUS = "scaffold"` from EN-002.

## Alternatives

| Alternative                              | Why rejected                                                         |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Separate events + notifications packages | Duplicated bootstrap/hydration; two sprint integration points        |
| Extend platform-runtime                  | Mixes orchestration with notification domain; violates layer clarity |
| Extend command-framework                 | Conflates execution with event/notification domain                   |
| Client-side Event Bus                    | Security and consistency risk; ADR-0031 rejects                      |

## Consequences

- EN-002 creates `packages/event-notification-framework/` and retires stub packages
- `apps/web/next.config.ts` `transpilePackages` updated in EN-015
- Document 029 `PlatformEventEnvelope` canonical home is `@apzhub/event-notification-framework`
- ADR-0007 consequence fulfilled incrementally — bus runtime begins SPR-006
- Future external broker is adapter behind `EventBusTransport` interface — not package split

---

_ADR-0030 — Event & Notification Framework Package — Accepted at EN-001._
