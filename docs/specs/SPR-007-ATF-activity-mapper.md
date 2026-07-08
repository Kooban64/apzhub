# SPR-007 — Event-to-Activity Mapper

> **Story:** AT-007  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented (AT-007)  
> **Authority:** [ADR-0035](../adr/ADR-0035-activity-execution-routing.md) · [Activity document](./SPR-007-ATF-activity-document.md) · [SPR-006 Notification Mapper](./SPR-006-ENF-notification-mapper.md)

---

## 1. Purpose

Define the **Event-to-Activity Mapper** — declarative runtime component that consumes Platform Events and produces immutable ActivityDocuments. Returns documents only — no storage, Event Bus subscription, Activity Service, or UI.

---

## 2. Components (implemented)

| Component                                   | Path                                             | Role                  |
| ------------------------------------------- | ------------------------------------------------ | --------------------- |
| `DefaultEventToActivityMapper`              | `src/mapper/default-event-to-activity-mapper.ts` | Composition root      |
| `ActivityMapperRegistry`                    | `src/mapper/default-activity-mapper-registry.ts` | Template store        |
| `resolveActivityTypes`                      | `src/mapper/resolve-activity-types.ts`           | Pattern matching      |
| `renderActivityTemplate`                    | `src/mapper/render-activity-template.ts`         | Placeholder rendering |
| `createActivityDocument`                    | `src/mapper/create-activity-document.ts`         | Document factory      |
| `syncActivityMapperRegistryFromDescriptors` | `src/mapper/sync-activity-mapper-registry.ts`    | Template seeding      |

---

## 3. Mapping pipeline

```text
map(envelope: EventEnvelope): ActivityMapperResult
  1. resolveActivityTypes(activityRegistry, envelope.eventId)
  2. for each descriptor:
       template = templateRegistry.get(activityTypeId)
       renderActivityTypeDocument(envelope, descriptor, template)
  3. return frozen documents + issues
```

---

## 4. Event pattern resolution

Uses `sourceEventPattern` on ActivityDescriptor:

| Pattern | Example                      | Matches                                                     |
| ------- | ---------------------------- | ----------------------------------------------------------- |
| Exact   | `capability.action.executed` | Same event id only                                          |
| Prefix  | `capability.action.*`        | `capability.action.executed`, `capability.action.scheduled` |

Implemented via shared `matchesEventPattern` from Event Notification Framework. No regex.

Planned and disabled activity types are skipped unless explicitly included in resolver options.

---

## 5. ActivityMapperResult

```typescript
interface ActivityMapperResult {
  readonly ok: boolean;
  readonly createdCount: number;
  readonly matchedTypeCount: number;
  readonly documents: readonly ActivityDocument[];
  readonly issues: readonly ActivityMappingIssue[];
}
```

| Issue code       | When                               |
| ---------------- | ---------------------------------- |
| `NO_MATCH`       | No activity types matched event id |
| `TEMPLATE_ERROR` | Empty or invalid template          |
| `TYPE_SKIPPED`   | Reserved for future skip rules     |

---

## 6. Diagnostics

### 6.1 Mapper diagnostics (`getDiagnostics()`)

| Field                  | Description                      |
| ---------------------- | -------------------------------- |
| `status`               | `ready` · `empty` · `scaffold`   |
| `mappedCount`          | Cumulative documents created     |
| `lastMappedCount`      | Documents from last `map()` call |
| `lastMatchedTypeCount` | Types matched on last call       |
| `lastSourceEventId`    | Last event id processed          |
| `templateErrorCount`   | Template render failures         |
| `message`              | Human-readable status            |

### 6.2 Document diagnostics

Captured on each ActivityDocument at creation — see [Activity document spec](./SPR-007-ATF-activity-document.md).

---

## 7. DI integration

```typescript
const context = createActivityTimelineContext();
// context.mapper — DefaultEventToActivityMapper
// context.registry — bootstrapped ActivityRegistry (platform catalogue)
```

`ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "mapper"`.

---

## 8. Architectural boundaries

| Rule                            | AT-007 |
| ------------------------------- | ------ |
| Declarative — no business logic | ✅     |
| Registry-driven type resolution | ✅     |
| Immutable frozen documents      | ✅     |
| No Event Bus subscribe          | ✅     |
| No Activity Service / storage   | ✅     |
| No React / UI                   | ✅     |

Event Bus wiring deferred to AT-013 application bootstrap.

---

## 9. Related

- [Template rendering](../../packages/activity-timeline-framework/docs/ACTIVITY-TEMPLATE-RENDERING.md)
- [Activity bootstrap](./SPR-007-ATF-activity-bootstrap.md)
- [Activity Service](./SPR-007-ATF-activity-service.md) — AT-008

---

_SPR-007 Event-to-Activity Mapper — AT-007 specification._
