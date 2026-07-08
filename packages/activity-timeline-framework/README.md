# @apzhub/activity-timeline-framework

Activity & Timeline Framework for APZHUB — consumes Platform Events and presents historical activity timelines.

> **Status:** `ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "timeline-registry"` (AT-004)  
> **Authority:** [ADR-0033](../../docs/adr/ADR-0033-activity-timeline-framework-package.md) · [SPR-007 sprint guide](../../docs/sprint/SPR-007-activity-timeline-framework.md)

## What this package is

- Historical **activity timeline** for users and administrators
- Parallel **Event Bus subscriber** (sibling of Notification Mapping — AT-007+)
- Registry → Service → Presentation → Timeline Experiences pipeline

## What this package is not

- Audit framework
- Notification framework, inbox, or notification history
- Event store or logging system

## Exports

| Subpath                                      | Purpose                                            |
| -------------------------------------------- | -------------------------------------------------- |
| `@apzhub/activity-timeline-framework`        | Types, placeholders, composition root              |
| `@apzhub/activity-timeline-framework/server` | Server-only registry, mapper, service placeholders |
| `@apzhub/activity-timeline-framework/react`  | React subpath (hydration AT-009+)                  |

## Locked decisions (SPR-007)

| Topic                  | Decision                                                             |
| ---------------------- | -------------------------------------------------------------------- |
| Manifest block         | `activities.types` (not `activity.types`)                            |
| Default timeline scope | `timeline.personal`                                                  |
| Reserved scopes        | `timeline.team`, `timeline.organization`, `timeline.system`          |
| Permissions            | Platform Permission Adapter only — no framework RBAC                 |
| Deduplication          | Optional — default none                                              |
| UI                     | Independent Workbench Experience — not notification surfaces         |
| Bootstrap              | Platform activity types only; business types in capability manifests |

## Composition root

```typescript
import { createActivityTimelineContext } from "@apzhub/activity-timeline-framework";

const context = createActivityTimelineContext();
// context.registry, context.mapper, context.service — placeholders until AT-003+
```

## Domain model

See [docs/DOMAIN-MODEL.md](./docs/DOMAIN-MODEL.md).

## Story progression

| Story   | Deliverable          |
| ------- | -------------------- |
| AT-002  | Package scaffold     |
| AT-003  | Activity Registry    | ✅ Complete |
| AT-004  | Timeline Registry    | ✅ Complete |
| AT-005  | Manifest bootstrap   |
| AT-007  | Event Bus mapper     |
| AT-008  | Activity Service     |
| AT-009  | Client hydration     |
| AT-011+ | Timeline Experiences |

## Canonical pipeline

```text
Platform Capability → Domain Event → Event Bus → Activity Mapping
→ Activity Service → Activity Presentation Layer → Timeline Experiences
```
