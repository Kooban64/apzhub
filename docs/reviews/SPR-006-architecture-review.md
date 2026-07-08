# SPR-006 — Architecture Review

> **Sprint:** SPR-006 — Event & Notification Framework  
> **Review date:** 2026-07-04  
> **Scope:** EN-001 through EN-016 (Event & Notification Framework delivery)  
> **Recommendation:** **Approve Milestone 6 documentation and production readiness review** — proceed to EN-018 sprint closeout when instructed

---

## Executive summary

SPR-006 delivers `@apzhub/event-notification-framework` as the APZHUB unified event and notification platform layer. The Event Registry, in-process Event Bus, Notification Registry, Notification Mapper, Notification Service, Presentation Layer, and Notification Experiences integrate with the Action Framework audit hook and `apps/web` bootstrap without introducing a parallel execution pipeline or conflating events with notifications.

Application wiring completes the path from successful action execution to in-app badge and panel updates. E2E verification (EN-016) confirms health diagnostics, provider bootstrap, and the full action → notification pipeline.

**Overall architectural verdict:** **APPROVED WITH OBSERVATIONS**

Observations are documented limitations (in-process bus, session-scoped store, deferred external delivery, toast UI scaffold) scoped to future milestones — not architectural violations. **No redesign is recommended.**

---

## Layering compliance

| Layer                           | Verdict | Notes                                     |
| ------------------------------- | ------- | ----------------------------------------- |
| Event Registry                  | ✅      | Server-authoritative; DTO for diagnostics |
| Event Bus                       | ✅      | Validates envelope; synchronous dispatch  |
| Notification Registry           | ✅      | Route metadata; permission-filtered DTO   |
| Notification Mapping            | ✅      | Subscribes only; never publishes          |
| Notification Service            | ✅      | Public client boundary                    |
| Notification Presentation Layer | ✅      | Pure transforms; no execution             |
| Notification Experiences        | ✅      | Consume presentation hook only            |

Canonical stack enforced:

```text
Platform Capability → Domain Event → Event Bus → Notification Mapping
→ Notification Service → Notification Presentation Layer → Notification Experiences
```

Experiences do not import Event Bus, mapper, or registry internals in production paths.

---

## Registry reuse

**Verdict:** ✅ Approved

| Pattern                         | Assessment                                                        |
| ------------------------------- | ----------------------------------------------------------------- |
| Event Registry Pattern          | Manifest + catalogue → bootstrap → filter → DTO                   |
| Notification Registry Pattern   | Routes + templates → bootstrap → filter → DTO                     |
| No duplicate action definitions | Action audit publishes event; routes reference `payload.actionId` |
| Permission filtering            | Server-side DTO filter before client hydration                    |
| Health reporting                | `/api/health` `events` + `notifications` mirror hydration         |

**Observation:** App-level notification routes in `register-app-notification-routes.ts` should migrate to platform notification catalogue long term (TD-EN15-01) — acceptable for M6 integration story.

**Observation:** Health hydration loads event/notification summaries independently of layout parallel load — acceptable; optimise with shared cache in future.

---

## Event separation

**Verdict:** ✅ Approved

| Rule                                     | Compliance                                         |
| ---------------------------------------- | -------------------------------------------------- |
| Events describe state changes            | ✅ Envelope + category + payload                   |
| Notifications are delivery artefacts     | ✅ NotificationItem with kind/channel              |
| Notification code never publishes events | ✅ Mapper and Service are subscribers/writers only |
| Client does not publish business events  | ✅ Audit hook runs server-side in executor path    |
| Event category ≠ notification channel    | ✅ Orthogonal taxonomies documented                |

Action audit publishes **only on successful execution** (`ok: true`). Failed actions do not fan out to notifications — verified in integration and E2E tests.

---

## Notification separation

**Verdict:** ✅ Approved

| Concern              | Owner                           | Assessment |
| -------------------- | ------------------------------- | ---------- |
| Route declaration    | Notification Registry           | ✅         |
| Event → item mapping | DefaultNotificationMapper       | ✅         |
| Session storage      | Notification Service store      | ✅         |
| Read/update API      | NotificationService             | ✅         |
| View models          | Presentation Layer              | ✅         |
| Shell UI             | `@apzhub/workspace` Experiences | ✅         |

Multiple routes may match one event (e.g. inbox + toast for `capability.action.executed`). This is **intentional fan-out** at the mapping layer, not event duplication.

**Observation:** Toast kind is registered and appears in panel list; dedicated toast UI region is deferred (TD-EN16-02).

---

## Execution pipeline

**Verdict:** ✅ Approved — reuses Action Framework pipeline

```text
Shell / E2E hook
  → DefaultActionExecutor.execute()
  → WorkbenchCommandBridge (when applicable)
  → createActionAuditEventBusHook → Event Bus.publish()
  → wireAppEventNotifications subscriber
  → DefaultNotificationMapper.map()
  → NotificationService.addNotifications()
  → useNotificationPresentation() → Badge + Panel
```

| ADR / Rule                           | Compliance                             |
| ------------------------------------ | -------------------------------------- |
| ADR-0030 unified package             | ✅ Clear server/react exports          |
| ADR-0031 Event Registry & Bus        | ✅ In-process bus; registry validation |
| ADR-0032 notification routing        | ✅ Routes separate from events         |
| Document 000 §6.1 API layering       | ✅ Runtime → frameworks → app wiring   |
| No Experience → Event Bus dependency | ✅ Enforced via Service + Presentation |
| Baseline v1.0 frozen                 | ✅ No baseline document edits          |

Production uses `wireAppEventNotifications()` — not the EN-014 test-only `wireNotificationMapperToService()` helper.

---

## Dependency direction

```text
@apzhub/platform-runtime          (manifest discovery)
        ↓
@apzhub/command-framework         (audit hook publishes events)
        ↓
@apzhub/event-notification-framework
        ↓
@apzhub/workspace                 (Notification Experiences)
        ↓
apps/web                          (bootstrap + providers)
```

| Constraint                                                        | Status |
| ----------------------------------------------------------------- | ------ |
| ENF must not import Workbench engines                             | ✅     |
| ENF must not import CommandExecutor internals                     | ✅     |
| Workspace Experiences consume ENF/react hooks only                | ✅     |
| Capabilities publish via services/audit — not NotificationService | ✅     |

**Observation:** `createRandomUuid` is duplicated in command-framework and ENF (TD-EN15-03) — consolidate to shared util without changing behaviour.

---

## Future extensibility

| Extension point         | Mechanism                                             | Notes                                     |
| ----------------------- | ----------------------------------------------------- | ----------------------------------------- |
| New platform events     | Catalogue + manifest `events`                         | Registry bootstrap                        |
| New notification routes | Manifest `notifications.routes` + app registration    | Pattern match on `eventId`                |
| Custom mapper           | Implement `NotificationMapper`                        | Default mapper sufficient for M6          |
| Additional subscribers  | `eventBus.subscribe()`                                | Activity, search, audit persistence (M7+) |
| External transport      | Replace/adapt Event Bus backend                       | ADR required; envelope contract stable    |
| Delivery channels       | Route `channel` + Delivery Service                    | Stubs registered; no M6 delivery          |
| New Experiences         | `@apzhub/workspace` + `useNotificationPresentation()` | Panel/badge pattern established           |

The in-process bus and session store are **deliberate M6 scaffolds** — envelope and route models are compatible with future broker and PostgreSQL persistence without redesign.

---

## Testing and verification

| Area                             | Assessment                                                    |
| -------------------------------- | ------------------------------------------------------------- |
| Unit coverage across ENF package | Strong                                                        |
| App integration tests            | Strong — context, hydration, audit → notification             |
| E2E (EN-016)                     | Strong — health, badge, panel, action flow, diagnostics guard |
| Production diagnostics guard     | Verified — `NODE_ENV=production`                              |

---

## Observations summary (non-blocking)

1. Session-scoped notification store — no cross-device persistence (by design for M6).
2. In-process Event Bus only — no horizontal fan-out across processes.
3. Toast route creates panel items — dedicated toast region deferred.
4. E2E uses env-gated `__APZHUB_E2E__` hook — document as test infrastructure only.
5. App notification routes pending catalogue migration.

---

## Recommendation

**Approve** Milestone 6 architecture for production readiness review and EN-018 sprint closeout preparation.

No architectural redesign required.

---

_SPR-006 Architecture Review — EN-017._
