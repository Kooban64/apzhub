# Event & Notification Framework — Developer Onboarding

> **Audience:** Engineers adding platform events, notification routes, or shell notification Experiences  
> **Prerequisite:** [Getting started](./getting-started.md) · [Engineering Handbook](../governance/APZHUB-Engineering-Handbook.md)  
> **Architecture:** [event-notification-framework.md](../architecture/event-notification-framework.md)

---

## What you need to understand

The Event & Notification Framework answers four questions:

1. **What events exist?** — `EventRegistry` populated at server bootstrap from catalogue + manifests
2. **What notification routes exist?** — `NotificationRegistry` populated from catalogue + manifests + app routes
3. **How do events become notifications?** — Event Bus subscriber → `DefaultNotificationMapper` → `NotificationService`
4. **How does the shell show notifications?** — `useNotificationPresentation()` → Badge + Panel Experiences

### Canonical pipeline

```text
Platform Capability
        ↓
Domain Event
        ↓
Event Bus
        ↓
Notification Mapping
        ↓
Notification Service
        ↓
Notification Presentation Layer
        ↓
Notification Experiences
```

**Rules:**

- Modules **publish events** (or use platform hooks that publish) — they never call `NotificationService.addNotifications()` directly
- Notification code **never publishes** events
- Experiences **never import** Event Bus or mapper internals
- Delivery **channels** (`in-app`, `email`, …) are orthogonal to event **categories** (`capability`, `user`, …)

---

## Task 1 — Understand the framework

Read in order:

1. [Document 021](../021-notification-activity-attention-management-framework.md) — product vision
2. [event-notification-framework.md](../architecture/event-notification-framework.md) — combined architecture
3. [packages/event-notification-framework/README.md](../../packages/event-notification-framework/README.md) — package API
4. [SPR-006 spec index](../specs/SPR-006-spec-index.md) — story specifications

Run locally and verify:

```bash
pnpm dev
# Sign in → /workspace/home
# Inspect badge (hidden when unread = 0)
curl -s localhost:3300/api/health | jq '{events, notifications}'
```

Dev diagnostics (hidden in DOM):

- `data-testid="event-notification-diagnostics"`
- `data-testid="notification-diagnostics"` on badge/panel surfaces

---

## Task 2 — Define a new platform event

**When to use:** A platform capability needs to announce a state change to subscribers (notifications, future Activity, audit).

**Steps:**

1. Add entry to `PLATFORM_EVENT_CATALOGUE` in `packages/event-notification-framework/src/catalogue/platform-event-catalogue.ts`
2. Declare `eventId`, `category`, `version`, `publisher`, payload schema summary
3. Ensure `bootstrapEventRegistry()` registers the entry (automatic for catalogue items)
4. Publish via `eventBus.publish()` with a valid `PlatformEventEnvelope`
5. Add unit tests for registry registration and envelope validation
6. ADR if changing public event contract or adding a new category

**Example event id:** `capability.action.executed` (published by Action audit hook)

**Do not:**

- Publish from React components in production
- Use notification routes as event definitions
- Skip envelope validation

**Spec:** [SPR-006-ENF-platform-event-catalogue.md](../specs/SPR-006-ENF-platform-event-catalogue.md)

---

## Task 3 — Register notification routes

**When to use:** An event should produce user-facing in-app (or future external) notifications.

**Steps:**

1. Register a route in Notification Registry with:
   - `routeId` — stable identifier
   - `eventPattern` — matches `envelope.eventId`
   - `notificationKind` — `inbox`, `toast`, `banner`, …
   - `channel` — `in-app` for SPR-006 shell delivery
   - `titleTemplate` / `bodyTemplate` — `{{payload.field}}` placeholders
2. For app-wide routes: `registerAppNotificationRoutes()` pattern in `apps/web/lib/register-app-notification-routes.ts`
3. For platform catalogue routes: `PLATFORM_NOTIFICATION_CATALOGUE` (preferred long term)
4. For capability routes: manifest `notifications.routes` block (extraction scaffold)
5. Verify mapper match in unit test with sample envelope
6. E2E if user-visible in shell

**Example** (inbox route for action audit):

```typescript
registry.register({
  routeId: "capability.action.executed.inbox",
  eventPattern: "capability.action.executed",
  notificationKind: "inbox",
  channel: "in-app",
  titleTemplate: "Action {{payload.actionId}} completed",
  bodyTemplate: "Executed by {{payload.actor}}",
  // ...
});
```

**Spec:** [SPR-006-ENF-platform-notification-catalogue.md](../specs/SPR-006-ENF-platform-notification-catalogue.md)

---

## Task 4 — Notification Mapping (when default mapper is insufficient)

**When to use:** Custom rendering logic beyond template substitution (rare in M6).

**Steps:**

1. Implement `NotificationMapper` interface
2. Subscribe via production wiring pattern (`wireAppEventNotifications` equivalent)
3. Return `NotificationMapperResult` with `NotificationItem[]`
4. **Never** call `eventBus.publish()` from mapper code
5. Unit test with fixture envelopes

Most teams should use `DefaultNotificationMapper` + route templates.

**Spec:** [SPR-006-ENF-notification-mapper.md](../specs/SPR-006-ENF-notification-mapper.md)

---

## Task 5 — Expose Notification Experiences

**When to use:** New shell surface for notifications (panel extensions, future toast region).

**Steps:**

1. Consume `useNotificationPresentation()` from `@apzhub/event-notification-framework/react`
2. Use view models — not raw `NotificationItem` from service in UI code
3. Delegate mark-read to `useNotificationService()` methods
4. Mount inside `NotificationServiceProvider` ancestor (wired in `ActionWorkbenchShellProvider`)
5. Add presentation tests in `@apzhub/workspace`
6. E2E with `spr-006-event-notification-framework.spec.ts` patterns

**Existing Experiences:**

| Component                     | Package             |
| ----------------------------- | ------------------- |
| `NotificationBadgeExperience` | `@apzhub/workspace` |
| `NotificationPanelExperience` | `@apzhub/workspace` |
| `WorkbenchNotifications`      | Shell composer      |

Enable in `DesktopShell` via `enableNotificationBadge` / `enableNotificationPanel`.

**Spec:** [SPR-006-ENF-notification-experiences.md](../specs/SPR-006-ENF-notification-experiences.md)

---

## Task 6 — Wire Action audit → notifications (reference)

Production path already implemented in `apps/web`:

```text
createActionAuditEventBusHook({ eventBus })
  → capability.action.executed on successful execute
wireAppEventNotifications({ eventBus, mapper, notificationService })
  → mapper.map() → service.addNotifications()
```

When adding new action publishers, reuse the audit hook pattern or publish explicitly after successful capability operations.

**Spec:** [SPR-006-ENF-action-audit-event.md](../specs/SPR-006-ENF-action-audit-event.md)

---

## Health and diagnostics

### Health endpoint

```bash
curl -s localhost:3300/api/health | jq '.events, .notifications'
```

| Field                         | Meaning                                        |
| ----------------------------- | ---------------------------------------------- |
| `events.registeredCount`      | Events in filtered registry                    |
| `events.subscriberCount`      | Event Bus subscribers (includes mapper wiring) |
| `notifications.mapperStatus`  | `"ready"` when mapper initialised              |
| `notifications.serviceStatus` | `"empty"` \| `"ready"`                         |
| `notifications.unreadCount`   | Server-side snapshot (client store may differ) |

### Dev diagnostics

| testid                           | Purpose                             |
| -------------------------------- | ----------------------------------- |
| `event-notification-diagnostics` | Registry counts, service status     |
| `notification-diagnostics`       | Per-surface unread (`data-surface`) |

Hidden in production (`NODE_ENV=production`). Never expose visible debug panels in product UI.

---

## Testing expectations

| Layer             | Required tests                                                   |
| ----------------- | ---------------------------------------------------------------- |
| New event         | Registry registration; envelope validation; publish + subscriber |
| New route         | Mapper match; template render; optional service integration      |
| App wiring        | Context factory test; hydration test                             |
| Experience        | Component test with presentation fixtures                        |
| User-visible flow | E2E — health, badge, panel, mark read                            |

### E2E test hooks (test infrastructure only)

Playwright enables `NEXT_PUBLIC_E2E_TEST_HOOKS=true` to mount:

```javascript
window.__APZHUB_E2E__.executeWorkbenchAction(actionId, args);
window.__APZHUB_E2E__.getUnreadCount();
```

**Not available in production builds.** Used because palette actions like `platform.theme.toggle` fail without args and do not publish audit events.

See `testing/playwright/e2e/spr-006-event-notification-framework.spec.ts`.

### Quality gates (all changes)

```bash
pnpm lint && pnpm typecheck && pnpm build
pnpm test && pnpm test:coverage
pnpm test:e2e   # when UI/integration affected
```

---

## Documentation standards

When your change introduces a new pattern:

| Artifact          | Location                                                  |
| ----------------- | --------------------------------------------------------- |
| Technical spec    | `docs/specs/SPR-006-ENF-*.md` or story appendix           |
| Architecture note | Update `event-notification-framework.md` or subsystem doc |
| ADR               | `docs/adr/` — boundary changes, new transport, API breaks |
| Completion report | `docs/sprint/EN-NNN-completion-report.md`                 |
| Governance        | Update handbook or development guide if workflow changes  |

Use canonical terminology:

- **Domain Event** — not "notification event"
- **Notification Mapping** — not "event handler"
- **Notification Service** — public read/update API
- **Notification Presentation Layer** — view model transforms
- **Notification Experiences** — shell UI surfaces

---

## Common mistakes

| Mistake                                          | Correct approach                                  |
| ------------------------------------------------ | ------------------------------------------------- |
| Calling NotificationService from capability code | Publish domain event; register route              |
| Importing Event Bus in Experience                | Use `useNotificationPresentation()`               |
| Using event category as delivery channel         | Set `channel` on notification route               |
| Publishing events from mapper                    | Mapper only writes NotificationItems              |
| Skipping permission filter on DTO                | Always filter server-side before client hydration |
| Visible diagnostics in production                | Hidden testids only; guard with `NODE_ENV`        |

---

## Related guides

| Guide                                                                                | When                                  |
| ------------------------------------------------------------------------------------ | ------------------------------------- |
| [Action Framework onboarding](./action-framework-onboarding.md)                      | Action audit event source             |
| [Workbench Development Guide](../governance/APZHUB-Workbench-Development-Guide.md)   | Shell Experience mounting             |
| [Runtime Development Guide](../governance/APZHUB-Runtime-Development-Guide.md)       | Manifest event extraction             |
| [Capability Development Guide](../governance/APZHUB-Capability-Development-Guide.md) | Manifest events + notification routes |

---

_Event & Notification Framework Developer Onboarding — EN-017._
