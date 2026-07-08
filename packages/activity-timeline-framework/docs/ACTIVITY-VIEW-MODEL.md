# Activity View Model (AT-011)

> **Package:** `@apzhub/activity-timeline-framework`  
> **Story:** AT-011  
> **Status:** Implemented

---

## Purpose

`ActivityViewModel` is the immutable UI-ready projection of an `ActivityDocument`. Timeline Experiences consume view models — not raw service documents.

---

## Shape

```typescript
interface ActivityViewModel {
  readonly activityId: string;
  readonly activityTypeId: string;
  readonly sourceEventId: string;
  readonly title: string;
  readonly description: string;
  readonly timelineScope: TimelineScopeId;
  readonly category: ActivityCategory;
  readonly severity: ActivitySeverity;
  readonly timestamp: string;
  readonly relativeTimestamp: string;
  readonly icon?: string;
  readonly actor: ActivityDocumentActor;
  readonly metadata: ActivityDocumentMetadata;
  readonly correlationId: string;
  readonly actionRef?: ActivityActionRef;
}
```

---

## Field sources

| Field                                                                    | Source                                                         |
| ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `title`, `description`, `category`, `timelineScope`, `actor`, `metadata` | `ActivityDocument`                                             |
| `severity`                                                               | `document.metadata.severity`                                   |
| `relativeTimestamp`                                                      | `formatActivityRelativeTimestamp(document.timestamp)`          |
| `icon`                                                                   | Registry `iconRef` (hook) or `metadata.payloadSummary.iconRef` |
| `correlationId`                                                          | `document.metadata.correlationId`                              |
| `actionRef`                                                              | `metadata.payloadSummary.actionRef` passthrough                |

---

## Rules

- View models are deep-frozen at creation
- No user state (viewed, pinned, hidden) — deferred to future session models
- Presentation never mutates source documents
- `actionRef` is passthrough only — Experiences delegate execution to Action Framework

---

_Activity View Model — AT-011._
