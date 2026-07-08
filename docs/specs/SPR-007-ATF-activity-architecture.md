# SPR-007 — Activity Architecture and Taxonomy

> **Story:** AT-001 — Activity & Timeline Architecture  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Specification — **no implementation**  
> **Authority:** [Document 021](../021-notification-activity-attention-management-framework.md) · [Activity & Timeline Framework](../architecture/activity-timeline-framework.md) · ADRs [0033](../adr/ADR-0033-activity-timeline-framework-package.md) · [0034](../adr/ADR-0034-activity-registry-and-timeline-model.md) · [0035](../adr/ADR-0035-activity-execution-routing.md) · [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md)

---

## 1. Purpose

Define the **Activity Architecture** — activity model, taxonomy, relationship to Platform Events, and separation from notifications, audit, and logging.

**Modules never write activity records.** Activity items are created by platform mappers reacting to events on the Event Bus.

**AT-001 scope:** Architecture and taxonomy only. No Activity Service implementation, no Timeline Experiences.

---

## 2. Vision

```text
Platform Capability
        ↓
Domain Event (standard envelope — Document 029)
        ↓
Event Bus (@apzhub/event-notification-framework)
        ↓
Activity Mapping (parallel subscriber — not notification path)
        ↓
Activity Service
        ↓
Activity Presentation Layer
        ↓
Timeline Experiences (shell feed, context panel tab)
```

The Activity layer presents **historical activity timelines** — what happened, who did it, and when — without coupling to notification delivery or audit persistence.

---

## 3. Parallel subscribers on Event Bus

Activity Mapping is a **sibling** of Notification Mapping. Both subscribe to the Event Bus independently.

```text
                    Event Bus
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
Event-to-Notification Mapper    Event-to-Activity Mapper
          │                           │
          ▼                           ▼
Notification Service            Activity Service
          │                           │
          ▼                           ▼
Notification Experiences        Timeline Experiences
```

| Rule                                  | Enforcement                                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| Same event may produce both           | Intentional fan-out at independent layers                                          |
| Neither mapper depends on the other   | No cross-service writes                                                            |
| Activity layer never publishes events | Subscribe-only posture ([ADR-0035](../adr/ADR-0035-activity-execution-routing.md)) |
| Modules never write activity          | No public `recordActivity()` on capability SDK                                     |

---

## 4. What this framework is not

| Concern                    | Relationship                                                         |
| -------------------------- | -------------------------------------------------------------------- |
| **Audit framework**        | Activity may reference source events; immutable audit store is M8+   |
| **Notification framework** | Parallel subscriber; separate service and Experiences                |
| **Event store**            | No event persistence or replay                                       |
| **Logging system**         | User-facing timeline semantics — not operational logs                |
| **Attention Engine**       | Interface stub only — full attention rules remain Document 021 / M8+ |

---

## 5. Activity model

### 5.1 ActivityTypeDescriptor (registry entry)

Metadata registered at bootstrap — describes **how** to react to an event pattern and present activity on timelines.

| Property             | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `activityTypeId`     | Stable id (`capability.action.executed`)             |
| `sourceEventPattern` | Event id or prefix pattern to match                  |
| `category`           | Activity taxonomy category (§6)                      |
| `timelineScopes`     | Which timeline scopes may display this type          |
| `templateRef`        | Presentation template key                            |
| `version`            | Schema version semver                                |
| `permissionKeys`     | RBAC filter (keys declared; population M8)           |
| `retentionHint`      | Presentation retention tier (not persistence policy) |
| `status`             | `active` · `planned` · `disabled`                    |
| `severity`           | Default presentation severity                        |
| `iconRef`            | Optional Lucide icon key                             |

### 5.2 ActivityItem (instance)

Live activity created by mapper — stored in **ActivitySessionStore** (SPR-007 in-memory).

See [SPR-007-ATF-activity-document.md](./SPR-007-ATF-activity-document.md) for full schema.

**Rules:**

1. ActivityItems **must not** trigger event publish
2. Action delegation uses existing `execute()` — [ADR-0035](../adr/ADR-0035-activity-execution-routing.md) applies
3. Permission filtering before client hydration
4. `eventId` + `sourceEnvelopeId` + `correlationId` for traceability

### 5.3 Separation from events, notifications, and audit

| Concept     | Event                                 | Notification              | Activity                         | Audit (M8+)       |
| ----------- | ------------------------------------- | ------------------------- | -------------------------------- | ----------------- |
| Purpose     | State change signal                   | User information delivery | Historical timeline              | Compliance record |
| Taxonomy    | System, User, Capability, Integration | Toast, Banner, Inbox, …   | User, Team, Workspace, System, … | Immutable log     |
| Created by  | Capability after work                 | Mapper after event        | Activity mapper after event      | Audit writer      |
| Registry    | EventRegistry                         | NotificationRegistry      | ActivityRegistry                 | Audit store       |
| Client API  | None (SPR-006)                        | NotificationService       | ActivityService                  | Admin only        |
| User action | N/A                                   | Mark read, dismiss        | Mark viewed, navigate            | Query (admin)     |
| Mutability  | N/A                                   | Session store             | Session store                    | Immutable         |

---

## 6. Activity taxonomy

Activity types are classified by **category** (what kind of thing happened) and **timeline scope** (where it appears). Categories align with Document 021 §6–§8.

### 6.1 Category taxonomy

| Category    | Value         | Description                             | Document 021 alignment |
| ----------- | ------------- | --------------------------------------- | ---------------------- |
| User        | `user`        | User-initiated actions and preferences  | Personal Activity      |
| Team        | `team`        | Collaboration signals (stub scope M8+)  | Team Activity          |
| Workspace   | `workspace`   | Workspace-scoped changes                | Workspace context      |
| System      | `system`      | Platform health, bootstrap, maintenance | System Health          |
| Security    | `security`    | Auth, session, permission changes       | Security Alert         |
| Integration | `integration` | Connector sync, provisioning            | Connector Alert        |
| Capability  | `capability`  | Platform capability execution           | Platform events        |

### 6.2 Timeline scope taxonomy

| Scope     | `scopeId`   | Visibility rule (SPR-007)                              | Document 021 alignment |
| --------- | ----------- | ------------------------------------------------------ | ---------------------- |
| Personal  | `personal`  | Activity where `actorId` matches session user          | Personal Activity §7   |
| Workspace | `workspace` | Activity tagged with workspace id from payload/context | Workspace context      |
| System    | `system`    | Platform/system category events; admin visibility      | System events          |
| Team      | `team`      | Deferred — interface stub; requires identity model M8+ | Team Activity §8       |

One activity item may appear in **multiple timelines** when scope rules match.

### 6.3 Platform activity type examples (catalogue)

| activityTypeId                        | sourceEventPattern                    | category      | timelineScopes      | SPR-007       |
| ------------------------------------- | ------------------------------------- | ------------- | ------------------- | ------------- |
| `capability.action.executed`          | `capability.action.executed`          | `capability`  | personal, workspace | ✅ Foundation |
| `capability.theme.changed`            | `capability.theme.changed`            | `user`        | personal            | ✅ Foundation |
| `system.platform.bootstrap.completed` | `system.platform.bootstrap.completed` | `system`      | system              | Scaffold      |
| `integration.connector.sync.failed`   | `integration.connector.sync.failed`   | `integration` | workspace, system   | Scaffold      |
| `user.session.started`                | `user.session.started`                | `security`    | personal            | `planned`     |

---

## 7. Relationship to events

### 7.1 Event → Activity pipeline

1. **Publisher** — Platform Capability or audit hook publishes validated `PlatformEventEnvelope`
2. **Dispatch** — `InProcessEventBus` synchronously calls subscribers
3. **Activity Mapping** — `DefaultActivityMapper.map(envelope)`:
   - Resolve matching activity types from Activity Registry by `sourceEventPattern`
   - Render title/body/summary templates from envelope payload
   - Produce immutable `ActivityItem`(s)
4. **Activity Service** — `addActivities(items)` appends to session store; notifies subscribers
5. **Presentation** — view model mapping + timeline grouping
6. **Experience** — Timeline feed / Context Panel renders view models

### 7.2 Correlation and traceability

Every ActivityItem retains envelope provenance:

| Field              | Source                          |
| ------------------ | ------------------------------- |
| `eventId`          | Envelope event id               |
| `sourceEnvelopeId` | Envelope instance id            |
| `correlationId`    | End-to-end trace (Document 010) |
| `causationId`      | Causation chain (Document 029)  |
| `timestamp`        | Occurrence time from envelope   |
| `recordedAt`       | Mapper insertion time           |

Activity Mapping **never** calls `notificationService.addNotifications()`.

---

## 8. Parallel to notifications (Document 021)

Document 021 defines Activity Service and Notification Service as distinct framework components. SPR-007 implements this separation at the architectural level.

| Aspect         | Notification path               | Activity path                    |
| -------------- | ------------------------------- | -------------------------------- |
| Trigger        | Event Bus subscriber            | Event Bus subscriber (parallel)  |
| Registry       | NotificationRegistry (routes)   | ActivityRegistry (types)         |
| Instance model | NotificationItem                | ActivityItem                     |
| Store          | NotificationSessionStore        | ActivitySessionStore             |
| Presentation   | Notification Presentation Layer | Activity Presentation Layer      |
| Experiences    | Badge, Panel                    | Timeline feed, Context Panel tab |
| User semantics | Read/unread, dismiss            | Viewed, navigate                 |
| Attention      | Priority, badge, channels       | Timeline grouping, scope filter  |

**Example fan-out:**

```text
Event: capability.action.executed
        │
        ├──► NotificationMapper → inbox item → Notification Panel
        │
        └──► ActivityMapper → activity item → Personal Timeline
```

Same event. Different artefacts. No cross-service writes.

---

## 9. Activity Registry integration

### 9.1 Bootstrap

```text
Runtime manifest discovery
        ↓
Extract activities.types + timelines blocks
        ↓
Merge PlatformActivityCatalogue
        ↓
ActivityRegistry.register() + TimelineRegistry.register()
        ↓
Wire EventToActivityMapper subscriptions
```

See [SPR-007-ATF-activity-bootstrap.md](./SPR-007-ATF-activity-bootstrap.md) and [SPR-007-ATF-activity-manifest.md](./SPR-007-ATF-activity-manifest.md).

### 9.2 Mapping layer

Activity mapper spec deferred to AT-007. Architecture reference: [ADR-0035](../adr/ADR-0035-activity-execution-routing.md).

---

## 10. ActivityService (specification outline)

Full spec in [SPR-007-ATF-activity-service.md](./SPR-007-ATF-activity-service.md).

| Method                                       | Behaviour                                |
| -------------------------------------------- | ---------------------------------------- |
| `listActivities({ scope?, limit?, since? })` | Read from hydrated session store         |
| `getActivity(activityId)`                    | Single item lookup                       |
| `markViewed(activityId)`                     | Set viewed flag; emit subscribe callback |
| `subscribe(scope, listener)`                 | Sync callback on store change            |
| `getTimelineScopes()`                        | Available timelines for current actor    |
| `getDiagnostics()`                           | Dev metadata                             |

Public hook: **`useActivityService()`** — only supported client entry point for service mutations.

Public hook: **`useActivityPresentation()`** — view models and grouping for Experiences.

---

## 11. Package boundary ([ADR-0033](../adr/ADR-0033-activity-timeline-framework-package.md))

| Layer                       | Owner                                        | Publishes events? |
| --------------------------- | -------------------------------------------- | ----------------- |
| Event Bus                   | `@apzhub/event-notification-framework`       | N/A (transport)   |
| Activity Mapping            | `@apzhub/activity-timeline-framework/server` | ❌ Subscribe only |
| Activity Service            | ATF `/server` + `/react`                     | ❌                |
| Activity Presentation Layer | ATF `/presentation` + `/react`               | ❌                |
| Timeline Experiences        | `@apzhub/workspace`                          | ❌                |

Timeline Experiences **must not** import Event Bus or mapper internals.

---

## 12. Acceptance criteria (AT-001)

- [x] Activity taxonomy — categories and timeline scopes documented with examples
- [x] Event/activity separation rules documented
- [x] ActivityTypeDescriptor and ActivityItem models defined
- [x] Parallel subscriber architecture documented
- [x] Notification/activity/audit separation table documented
- [x] Canonical pipeline documented
- [x] ADR-0033, ADR-0034, ADR-0035 accepted
- [ ] Owner review before AT-002 — pending

---

_SPR-007 Activity Architecture and Taxonomy — AT-001._
