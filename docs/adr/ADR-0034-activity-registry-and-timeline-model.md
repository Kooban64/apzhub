# ADR-0034 — Activity Registry and Timeline Model

> **Status:** Accepted  
> **Date:** 2026-07-04  
> **Sprint:** SPR-007 — AT-001  
> **Decided by:** Project owner (Sprint 007 authorisation)  
> **Related:** [Document 021](../021-notification-activity-attention-management-framework.md) · [ADR-0033](./ADR-0033-activity-timeline-framework-package.md) · [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md)

## Problem

Milestone 7 requires formal models for:

1. **Activity Registry** — how activity types are declared and indexed
2. **Timeline model** — how activity is scoped and presented (personal, workspace, system)
3. **Activity document** — the read model produced by Activity Mapping (distinct from NotificationItem and audit log entries)

Without locked models, Activity Mapping may duplicate notification routes, conflate timelines with notification inboxes, or allow modules to write activity directly.

## Decision

### Activity Registry

The **Activity Registry** is the server-authoritative index of **activity type descriptors** — metadata describing how events map to activity presentation. It does **not** store activity instances.

| Responsibility | Detail                                                       |
| -------------- | ------------------------------------------------------------ |
| Register       | Activity type descriptors from catalogue + manifest          |
| Validate       | Unique `activityTypeId`, valid `eventPattern`, template refs |
| Index          | Query by event pattern, scope, status                        |
| Diagnostics    | Counts, conflicts, filtered totals                           |
| Does not       | Execute, publish events, or render UI                        |

**Registration sources:**

1. Platform activity catalogue (built-in types for `capability.action.executed`, etc.)
2. Manifest **`activities.types`** block (capability extensions — AT-005)
3. Application bootstrap registrations (mirrors EN-015 app routes pattern — catalogue preferred long term)

**Bootstrap rules:**

- `bootstrapActivityRegistry({ capabilityRecords })` after Runtime discovery
- Fail-fast on duplicate `activityTypeId` within batch
- Inactive types excluded from mapper matching
- Permission filter applied before DTO serialisation (`filterActivityRegistryDto`)

### Timeline model

**Timelines** are logical views over activity items — not separate event streams.

| Timeline scope | `scopeId`   | Visibility rule (SPR-007)                                         |
| -------------- | ----------- | ----------------------------------------------------------------- |
| Personal       | `personal`  | Activity where `actorId` matches session user                     |
| Workspace      | `workspace` | Activity tagged with workspace id from payload/context            |
| System         | `system`    | Platform/system category events; admin visibility (M8 RBAC depth) |
| Team           | `team`      | Deferred — interface stub; requires identity model M8+            |

Each **TimelineDescriptor** in Timeline Registry declares:

- `timelineId` — stable identifier
- `scope` — personal | workspace | system | team (stub)
- `label` — presentation header
- `permission` — optional visibility key (M8 population)
- `grouping` — default grouping strategy (`by-day`, `by-actor`)
- `status` — `active` | `inactive`

**Rules:**

- One activity item may appear in **multiple timelines** when scope rules match
- Timelines do not publish or subscribe to Event Bus
- Timeline Registry is read at Presentation Layer grouping time — not at map time (mapper produces neutral ActivityItem; scope resolved at read/group)

### Activity document (ActivityItem)

The **ActivityItem** is the Activity Service read model — analogous to `NotificationItem` but semantically distinct.

| Field category | Purpose                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------- |
| Identity       | `activityId`, `activityTypeId`, `sourceEnvelopeId`, `eventId`                             |
| Content        | `title`, `body`, `summary` (rendered from templates)                                      |
| Actor          | `actorId`, `actorLabel`                                                                   |
| Scope hints    | `workspaceId`, `tenantId`, `correlationId`                                                |
| Time           | `timestamp` (ISO from envelope), `recordedAt` (mapper time)                               |
| Presentation   | `severity`, `category`, `iconRef`, `actionRef` (optional delegation)                      |
| Metadata       | Frozen diagnostics; template ref; read state optional (M7: viewed, not notification read) |

**ActivityItem ≠ NotificationItem:**

| Aspect      | NotificationItem     | ActivityItem                     |
| ----------- | -------------------- | -------------------------------- |
| Purpose     | Attention / delivery | Historical timeline              |
| User action | Mark read, dismiss   | Mark viewed (optional), navigate |
| Store       | Notification Service | Activity Service                 |
| Mapper      | Notification Mapping | Activity Mapping                 |

**ActivityItem ≠ Audit log entry:**

| Aspect     | ActivityItem               | Audit log (M8+)       |
| ---------- | -------------------------- | --------------------- |
| Mutability | Session store; replaceable | Immutable persistence |
| Scope      | User-facing timeline       | Compliance record     |
| SPR-007    | In-memory session          | Not implemented       |

### Registry Pattern compliance

1. **Declaration** — platform catalogue + manifest **`activities.types`** (business types in capability manifests only)
2. **Server bootstrap** — `bootstrapActivityRegistry()`, `bootstrapTimelineRegistry()`
3. **Permission filter** — server-side before client DTO
4. **Hydration** — read-only client registry + service instance
5. **Execution** — optional `actionRef` delegates via existing `execute()` only ([ADR-0035](./ADR-0035-activity-execution-routing.md))

## Alternatives

| Alternative                                      | Why rejected                              |
| ------------------------------------------------ | ----------------------------------------- |
| Single combined Activity+Timeline registry       | Blurs scope resolution from type metadata |
| Activity types inferred only from eventId string | No manifest extension; weak diagnostics   |
| ActivityItem stored in Notification Service      | Violates Document 021 separation          |

## Consequences

- Specs authored in AT-001: activity registry, timeline model, activity document, bootstrap, manifest, DTO
- AT-003 implements ActivityRegistry; AT-004 TimelineRegistry
- Platform catalogue entries for first-party activity types (action executed, etc.)
- Health field `activities` summarises registry + service (AT-013 spec)

---

_ADR-0034 — Activity Registry and Timeline Model — Accepted at AT-001._
