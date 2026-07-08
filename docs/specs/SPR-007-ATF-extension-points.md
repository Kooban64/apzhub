# SPR-007 — Activity & Timeline Extension Points

> **Story:** AT-001  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Specification — **no implementation**  
> **Authority:** [Activity architecture](./SPR-007-ATF-activity-architecture.md) · [Document 021](../021-notification-activity-attention-management-framework.md) · ADRs [0033](../adr/ADR-0033-activity-timeline-framework-package.md) · [0034](../adr/ADR-0034-activity-registry-and-timeline-model.md) · [0035](../adr/ADR-0035-activity-execution-routing.md)

---

## 1. Purpose

Document **extension points** for the Activity & Timeline Framework — deferred capabilities, interface stubs, and stable extension interfaces. Defines what SPR-007 delivers vs what future milestones own.

All extensions must preserve the canonical pipeline:

```text
Platform Capability → Domain Event → Event Bus → Activity Mapping
→ Activity Service → Activity Presentation Layer → Timeline Experiences
```

Extensions **must not** introduce module-to-module activity writes, Event Bus consumption in UI, or notification path coupling.

---

## 2. Extension matrix

| Extension                   | SPR-007                 | Mechanism                                               | Future owner             |
| --------------------------- | ----------------------- | ------------------------------------------------------- | ------------------------ |
| New activity types          | ✅ Foundation           | Catalogue + manifest `activities.types`                 | Capabilities M9+         |
| New timeline scopes         | ✅ Foundation           | Timeline Registry + manifest `timelines.scopes`         | Platform M8+             |
| Event → Activity mapper     | ✅ Scaffold             | `DefaultActivityMapper` + registry patterns             | AT-007                   |
| Personal timeline UI        | ✅ Context Panel tab    | Timeline Experiences                                    | AT-011–AT-012            |
| Team timeline subscriptions | Registry scaffold       | `team` scope stub                                       | Subscription Service M8+ |
| Real-time activity push     | Interface stub          | `ActivityTransport`                                     | WebSocket/SSE M8+        |
| Persistent activity store   | Interface stub          | `ActivityStoreBackend`                                  | PostgreSQL M8+           |
| Audit store alignment       | Reference source events | Correlation ids on ActivityItem                         | Audit framework M8+      |
| Notification correlation    | Interface stub          | `ActivityNotificationLink`                              | Attention Engine M8+     |
| Knowledge re-index activity | Interface stub          | KDF optional subscriber                                 | Knowledge M9+            |
| External activity sources   | Not in scope            | Connector adapters                                      | Integrations M9+         |
| Activity deduplication      | Extension point only    | Optional mapper `idempotencyStrategy`; default **none** |
| Digest / batched timeline   | Not in scope            | Digest Service                                          | Document 021 M8+         |

---

## 3. Stable extension interfaces (stubs)

### 3.1 ActivityStoreBackend

Persistent storage replacement for in-memory session store.

```typescript
interface ActivityStoreBackend {
  append(items: readonly ActivityItem[]): Promise<ActivityAppendResult>;
  list(filter: ActivityStoreFilter): Promise<readonly ActivityItem[]>;
  get(activityId: string): Promise<ActivityItem | undefined>;
  markViewed(activityId: string): Promise<boolean>;
  getDiagnostics(): ActivityStoreBackendDiagnostics;
}
```

SPR-007: `InMemoryActivityStoreBackend` only. Interface exported; no PostgreSQL implementation.

### 3.2 ActivityTransport

Real-time activity delivery to connected clients.

```typescript
interface ActivityTransport {
  connect(options: ActivityTransportOptions): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(listener: ActivityTransportListener): () => void;
  getDiagnostics(): ActivityTransportDiagnostics;
}
```

SPR-007: `NoOpActivityTransport` — connect succeeds; no messages. WebSocket/SSE deferred M8+.

### 3.3 ActivityMapperEnrichmentHook

Post-template enrichment without bypassing mapper.

```typescript
interface ActivityMapperEnrichmentHook {
  enrich(item: ActivityItem, envelope: PlatformEventEnvelope): ActivityItem;
}
```

SPR-007: No hooks registered. AI summarisation and custom payload formatting deferred.

### 3.4 TimelineSubscriptionResolver

Team and shared timeline membership.

```typescript
interface TimelineSubscriptionResolver {
  resolveSubscribedTimelines(
    context: TimelineSubscriptionContext,
  ): Promise<readonly string[]>;
}
```

SPR-007: Returns empty array. Subscription Service (Document 021) deferred M8+.

### 3.5 ActivityNotificationLink

Cross-reference activity items with notifications for unified attention UI.

```typescript
interface ActivityNotificationLink {
  readonly activityId: string;
  readonly notificationId: string;
  readonly linkType: "source-event" | "explicit";
}
```

SPR-007: Interface only. No UI correlation. Future Attention Engine may populate via shared `correlationId`.

### 3.6 ActivityAuditBridge

Forward activity-relevant events to audit store without conflating models.

```typescript
interface ActivityAuditBridge {
  recordActivityReference(item: ActivityItem): Promise<void>;
}
```

SPR-007: No-op stub. Audit framework M8+ owns immutable persistence.

---

## 4. Registry extension (manifest-first)

| Extension type           | Declaration                                     | Registration                          |
| ------------------------ | ----------------------------------------------- | ------------------------------------- |
| Activity type            | `activities.types[]` in capability manifest     | `bootstrapActivityRegistry()`         |
| Timeline scope           | `timelines.scopes[]` in capability manifest     | `bootstrapTimelineRegistry()`         |
| Platform catalogue entry | `@apzhub/activity-timeline-framework` catalogue | `registerPlatformActivityCatalogue()` |

**Rules:**

- Manifest before implementation (Document 024)
- No hardcoded activity types in shell or Experiences
- Duplicate ids fail bootstrap — no silent override

---

## 5. Presentation extension

| Extension                  | Interface                    | SPR-007                                     |
| -------------------------- | ---------------------------- | ------------------------------------------- |
| Custom grouping strategy   | `ActivityGroupingStrategy`   | `by-day`, `by-actor`, `by-category`, `flat` |
| Custom timestamp formatter | `ActivityTimestampFormatter` | Default relative formatter                  |
| Custom actor resolver      | `ActivityActorLabelResolver` | Platform id → display label stub            |

Custom strategies register via Presentation Layer options — not Experience inline logic.

---

## 6. Experience extension

| Extension               | Mechanism                             | SPR-007                            |
| ----------------------- | ------------------------------------- | ---------------------------------- |
| New timeline Experience | `experienceRef` on TimelineDescriptor | Personal + workspace scaffold      |
| Context Panel tabs      | Workbench tab registration            | Activity tab only                  |
| Deep links              | Navigation framework                  | Scaffold query param               |
| Action delegation       | `actionRef` → `execute()`             | ✅ Same as notifications/knowledge |

New Experiences **must** consume `useActivityPresentation()` — no bypass.

---

## 7. Forbidden extensions

These violate ADR-0035 and Document 021 — code review must reject:

| Pattern                                          | Why forbidden              |
| ------------------------------------------------ | -------------------------- |
| Module `recordActivity()` API                    | Bypasses Event Bus         |
| Experience Event Bus subscribe                   | UI layer violation         |
| ActivityMapper → NotificationService             | Cross-layer write          |
| Client-side activity registration                | Registry Pattern violation |
| Parallel execution pipeline for timeline actions | ADR-0029 applies           |
| Activity as audit replacement                    | Semantic conflation        |

---

## 8. Dependency injection extension

`createActivityTimelineContext(options)` accepts optional overrides for testing and future backends:

| Option                 | Default                           | Extension use          |
| ---------------------- | --------------------------------- | ---------------------- |
| `activityRegistry`     | `createDefaultActivityRegistry()` | Test injection         |
| `timelineRegistry`     | `createDefaultTimelineRegistry()` | Test injection         |
| `activityStore`        | In-memory session store           | Persistent backend M8+ |
| `activityTransport`    | `NoOpActivityTransport`           | WebSocket M8+          |
| `enrichmentHooks`      | `[]`                              | AI / custom enrichers  |
| `subscriptionResolver` | Empty stub                        | Team timelines M8+     |

Production path uses defaults unless ADR approves backend swap.

---

## 9. Cross-framework integration points

| Framework                  | Integration                | Direction                             |
| -------------------------- | -------------------------- | ------------------------------------- |
| Event & Notification (M6)  | Shared Event Bus instance  | ATF subscribes; never modifies ENF    |
| Action Framework (M5)      | Audit events publish       | Upstream publisher; no ATF change     |
| Knowledge & Discovery (M5) | Optional future subscriber | KDF may emit activity-relevant events |
| Workbench (M4)             | Context Panel tab          | Structural registration only          |
| Attention Engine (M8+)     | Suppression / correlation  | Interface stubs only                  |
| Audit (M8+)                | Immutable log              | Reference via correlation id          |

---

## 10. Milestone roadmap (deferred)

| Milestone    | Capability                                                         |
| ------------ | ------------------------------------------------------------------ |
| M7 (SPR-007) | Foundation — registry, mapper, service, personal timeline          |
| M8           | Persistent store, team RBAC, real-time transport, audit bridge     |
| M9+          | Connector activity, business module activity types, workflow steps |
| Future       | AI summarisation, semantic timeline search (020 integration)       |

---

## 11. Related

- [Activity architecture](./SPR-007-ATF-activity-architecture.md)
- [Architecture document](../architecture/activity-timeline-framework.md)
- [SPR-007 sprint guide](../sprint/SPR-007-activity-timeline-framework.md) §Extension points

---

_SPR-007 Activity & Timeline Extension Points — AT-001 specification._
