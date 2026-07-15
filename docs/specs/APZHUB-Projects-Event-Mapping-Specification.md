# APZHUB Projects Event Mapping Specification

**Milestone:** OSS-101-01  
**Status:** Canonical event catalogue — **specification only**  
**Authority:** [Platform Event SDK 029](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · [Event Envelope](./SPR-006-ENF-event-envelope.md)

---

## Purpose

Define **canonical APZHUB Projects events** published by `ProjectService`. Map internal Plane events to APZHUB events **inside the adapter/service boundary only**.

**Rule:** Plane event names and payloads **never** appear outside `integrations/plane/`.

---

## Event envelope

All Projects events use `PlatformEventEnvelope` with:

| Field | Value |
|-------|-------|
| `category` | `business` |
| `publisher` | `project-service` |
| `sourceService` | `project-service` |
| `tenantId` | Required |

Each event requires `event.yaml` manifest before implementation (029).

---

## Canonical event catalogue

### Project events

| Event ID | Description | Payload (summary) |
|----------|-------------|-------------------|
| `project.created` | Project provisioned | `projectId`, `name`, `status` |
| `project.updated` | Metadata changed | `projectId`, `changedFields` |
| `project.status_changed` | Lifecycle transition | `projectId`, `from`, `to` |
| `project.archived` | Project archived | `projectId` |
| `project.member_added` | Team member joined | `projectId`, `userId`, `role` |
| `project.member_removed` | Team member removed | `projectId`, `userId` |

### Task events

| Event ID | Description | Payload (summary) |
|----------|-------------|-------------------|
| `task.created` | Task created | `taskId`, `projectId`, `title`, `status` |
| `task.updated` | Task metadata changed | `taskId`, `projectId`, `changedFields` |
| `task.status_changed` | Status transition | `taskId`, `projectId`, `from`, `to`, `statusId` |
| `task.assigned` | Assignee changed | `taskId`, `projectId`, `assigneeId`, `previousAssigneeId` |
| `task.completed` | Task reached done | `taskId`, `projectId` |
| `task.commented` | Comment added | `taskId`, `projectId`, `commentId`, `authorId` |
| `task.deleted` | Task removed | `taskId`, `projectId` |

### Sprint events

| Event ID | Description | Payload (summary) |
|----------|-------------|-------------------|
| `sprint.created` | Sprint defined | `sprintId`, `projectId`, `name` |
| `sprint.started` | Sprint activated | `sprintId`, `projectId` |
| `sprint.completed` | Sprint closed | `sprintId`, `projectId` |
| `sprint.cancelled` | Sprint cancelled | `sprintId`, `projectId` |

### Milestone events

| Event ID | Description | Payload (summary) |
|----------|-------------|-------------------|
| `milestone.created` | Milestone created | `milestoneId`, `projectId` |
| `milestone.completed` | Milestone reached | `milestoneId`, `projectId` |

### Backlog events

| Event ID | Description | Payload (summary) |
|----------|-------------|-------------------|
| `backlog.reordered` | Backlog order changed | `projectId`, `taskIds` |

---

## Example payload schemas

### `task.status_changed`

```typescript
interface TaskStatusChangedPayload {
  readonly taskId: string;
  readonly projectId: string;
  readonly from: TaskStatus;
  readonly to: TaskStatus;
  readonly statusId: string;
  readonly actorId: string;
}
```

### `project.created`

```typescript
interface ProjectCreatedPayload {
  readonly projectId: string;
  readonly name: string;
  readonly identifier: string;
  readonly status: ProjectStatus;
  readonly leadId?: string;
}
```

---

## Plane → APZHUB event mapping (adapter-internal)

Mapping occurs in adapter ingest layer or ProjectService after adapter normalizes. **Not exported.**

| Plane internal signal | APZHUB event | Notes |
|-----------------------|--------------|-------|
| `plane.issue.created` | `task.created` | After DTO mapping |
| `plane.issue.updated` (state) | `task.status_changed` | Detect state field change |
| `plane.issue.updated` (assignee) | `task.assigned` | |
| `plane.issue.updated` (other) | `task.updated` | |
| `plane.issue.deleted` | `task.deleted` | |
| `plane.comment.created` | `task.commented` | |
| `plane.project.created` | `project.created` | |
| `plane.project.updated` | `project.updated` | |
| `plane.cycle.created` | `sprint.created` | |
| `plane.cycle.started` | `sprint.started` | |
| `plane.cycle.completed` | `sprint.completed` | |
| `plane.member.added` | `project.member_added` | |
| `plane.member.removed` | `project.member_removed` | |

Plane webhook event names (if used) are consumed only in `integrations/plane/src/ingest/` — converted to `PlaneDomainEvent` then to APZHUB events by ProjectService.

---

## Publication flow

```text
User action → ProjectService mutation
           → PlaneAdapter call (success)
           → ProjectService.publish(TaskStatusChangedPayload)
           → Event Bus (PlatformEventEnvelope)
           → Subscribers: Notification, Activity, Search index
```

Async reconciliation (outbox) publishes same canonical events — idempotent by `envelopeId` + entity version.

---

## Subscriber registration

| Framework | Subscribes to | Action |
|-----------|---------------|--------|
| **Notifications (021)** | `task.assigned`, `task.status_changed`, `task.commented`, `project.member_added` | Route to notification templates |
| **Activity (007)** | All `project.*`, `task.*`, `sprint.*` | Activity mappers → timeline |
| **Search (020)** | `project.*`, `task.*` | Async index upsert/delete |
| **Knowledge (020)** | `task.updated` (link fields) | Knowledge graph update |
| **Automation (future n8n)** | `task.completed`, `sprint.completed` | Workflow triggers |

Modules **do not** subscribe directly — frameworks only.

---

## Notification route mapping (illustrative)

| Event | Notification template ID | Audience |
|-------|-------------------------|----------|
| `task.assigned` | `projects.task.assigned` | Assignee |
| `task.status_changed` | `projects.task.status_changed` | Watchers |
| `task.commented` | `projects.task.commented` | Assignee + watchers |
| `project.member_added` | `projects.member.added` | Added user |

---

## Activity mapper mapping (illustrative)

| Event | Activity action key | Summary template |
|-------|---------------------|------------------|
| `task.created` | `projects.task.created` | "{actor} created task {title}" |
| `task.status_changed` | `projects.task.status_changed` | "{actor} moved {title} to {status}" |
| `task.assigned` | `projects.task.assigned` | "{actor} assigned {title} to {assignee}" |
| `sprint.started` | `projects.sprint.started` | "{actor} started sprint {name}" |

Activity mappers use APZHUB payload only — no Plane fields.

---

## Idempotency

| Concern | Rule |
|---------|------|
| Duplicate publish | Subscribers use `envelopeId` dedup |
| Outbox replay | Same `correlationId` chain; payload includes `syncVersion` |
| Webhook duplicate | Adapter dedup by Plane event ID before normalize |

---

## event.yaml manifest template (per event)

```yaml
id: task.status_changed
version: "1.0.0"
category: business
publisher: project-service
schema: ./schemas/task-status-changed.v1.json
description: Published when a task transitions between statuses
```

Manifests authored in OSS-101-03; this specification defines IDs and payloads.

---

## Related

- [ProjectService Specification](./APZHUB-ProjectService-Specification.md)
- [PlaneAdapter Specification](./APZHUB-PlaneAdapter-Specification.md)
- [Domain Lifecycle Specification](./APZHUB-Projects-Domain-Lifecycle-Specification.md)
