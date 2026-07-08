# SPR-007 — Activity Manifest Schema

> **Story:** AT-001 · AT-005 (implementation)  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented (AT-005)  
> **Authority:** [Document 021](../021-notification-activity-attention-management-framework.md) · [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md) · [Document 029](../029-platform-event-sdk-event-bus-event-manifest-specification.md)

---

## 1. Purpose

Define manifest schema for **ActivityType** and **Timeline** registration in capability manifests.

Manifest blocks extend the Platform SDK contract — capabilities declare activity types and timeline scopes; Runtime discovery extracts them at bootstrap.

---

## 2. Inline capability manifest — activity types

```yaml
activities:
  types:
    - id: capability.plane.task.assigned
      eventPattern: capability.plane.task.assigned
      category: team
      timelineScopes:
        - personal
        - workspace
      templateRef: task-assigned
      version: 1.0.0
      severity: info
      permissionKeys:
        - platform.activity.read
      titleTemplate: "Task assigned"
      summaryTemplate: "{{actorLabel}} assigned you {{taskTitle}}"
      bodyTemplate: "Project {{projectName}} — due {{dueDate}}"
      status: planned
```

### 2.1 Activity type field reference

| Field             | Required | Description                                                                          |
| ----------------- | -------- | ------------------------------------------------------------------------------------ |
| `id`              | ✅       | Stable `activityTypeId` (lowercase dot notation)                                     |
| `eventPattern`    | ✅       | Exact eventId or prefix pattern                                                      |
| `category`        | ✅       | `user` · `team` · `workspace` · `system` · `security` · `integration` · `capability` |
| `timelineScopes`  | ✅       | Non-empty array of scope ids                                                         |
| `templateRef`     | ✅       | Presentation template key                                                            |
| `version`         | ✅       | Semver                                                                               |
| `severity`        | Optional | `info` · `success` · `warning` · `error` (default `info`)                            |
| `iconRef`         | Optional | Lucide icon key                                                                      |
| `permissionKeys`  | Optional | Visibility gates                                                                     |
| `retentionHint`   | Optional | `session` · `short` · `standard` · `extended`                                        |
| `titleTemplate`   | Optional | String template — stored in manifest; mapper execution AT-007                        |
| `summaryTemplate` | Optional | Primary timeline line template                                                       |
| `bodyTemplate`    | Optional | Detail body template                                                                 |
| `status`          | Optional | `active` · `planned` · `disabled`                                                    |

---

## 3. Inline capability manifest — timelines

### 3.0 Primary block — `activities.timelines[]` (AT-005)

```yaml
activities:
  timelines:
    - id: team.support
      scope: team
      label: Support queue activity
      version: 1.0.0
      grouping: by-actor
      sortOrder: newest-first
      activityCategoryFilter:
        - integration
        - capability
      permissionKeys:
        - platform.team.support.read
      experienceRef: team-support-timeline
      status: planned
```

### 3.1 Legacy block — `timelines.scopes[]`

Extraction falls back to this block when `activities.timelines` is absent:

```yaml
timelines:
  scopes:
    - id: team.support
      scope: team
      label: Support queue activity
      version: 1.0.0
      grouping: by-actor
      sortOrder: newest-first
      activityCategoryFilter:
        - integration
        - capability
      permissionKeys:
        - platform.team.support.read
      experienceRef: team-support-timeline
      status: planned
```

### 3.1 Timeline field reference

| Field                    | Required | Description                                    |
| ------------------------ | -------- | ---------------------------------------------- |
| `id`                     | ✅       | Stable `timelineId`                            |
| `scope`                  | ✅       | `personal` · `workspace` · `system` · `team`   |
| `label`                  | ✅       | User-facing timeline name                      |
| `version`                | ✅       | Semver                                         |
| `grouping`               | ✅       | `by-day` · `by-actor` · `by-category` · `flat` |
| `sortOrder`              | Optional | `newest-first` (default) · `oldest-first`      |
| `activityTypeFilter`     | Optional | Allow-list of activity type ids or patterns    |
| `activityCategoryFilter` | Optional | Allow-list of categories                       |
| `permissionKeys`         | Optional | Visibility gates                               |
| `experienceRef`          | Optional | Shell experience binding                       |
| `description`            | Optional | Human-readable summary                         |
| `iconRef`                | Optional | Lucide icon key                                |
| `status`                 | Optional | `active` · `inactive` · `planned`              |

---

## 4. Validation rules

### 4.1 Activity type validation

| Rule                                                  | Error                   |
| ----------------------------------------------------- | ----------------------- |
| `id` matches `^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$`    | `INVALID_ID`            |
| `eventPattern` non-empty                              | `INVALID_EVENT_PATTERN` |
| `category` in allowed set                             | `INVALID_CATEGORY`      |
| `timelineScopes` non-empty; each scope in allowed set | `INVALID_SCOPES`        |
| `templateRef` non-empty                               | `INVALID_TEMPLATE`      |
| `version` valid semver                                | `INVALID_VERSION`       |
| `severity` in allowed set when present                | `INVALID_SEVERITY`      |

### 4.2 Timeline validation

| Rule                                    | Error                |
| --------------------------------------- | -------------------- |
| `id` matches id pattern                 | `INVALID_ID`         |
| `scope` in allowed set                  | `INVALID_SCOPE`      |
| `label` non-empty                       | `INVALID_LABEL`      |
| `grouping` in allowed set               | `INVALID_GROUPING`   |
| `sortOrder` in allowed set when present | `INVALID_SORT_ORDER` |

### 4.3 Cross-block policy

Activity types and timelines are validated independently. No manifest requirement that `timelineScopes` reference registered timeline ids (diagnostics report orphans).

---

## 5. Template placeholders

| Placeholder         | Source                                          |
| ------------------- | ----------------------------------------------- |
| `{{actionId}}`      | Event payload                                   |
| `{{actorId}}`       | Envelope actorId                                |
| `{{actorLabel}}`    | Resolved actor display name                     |
| `{{eventId}}`       | Envelope eventId                                |
| `{{timestamp}}`     | Envelope timestamp                              |
| `{{workspaceId}}`   | Payload or context                              |
| `{{workspaceName}}` | Resolved workspace label                        |
| Custom payload keys | `{{payload.fieldName}}` — redaction rules apply |

Template strings remain **server-side** for mapper execution. Client DTOs expose rendered content only via ActivityItem instances.

---

## 6. Platform catalogue (built-in activity types)

Implemented in `packages/activity-timeline-framework/src/catalogue/platform-activity-catalogue.ts`:

| activityTypeId                       | sourceEventPattern                     | category   | timelineScopes                           |
| ------------------------------------ | -------------------------------------- | ---------- | ---------------------------------------- |
| `platform.lifecycle.started`         | `platform.lifecycle.started`           | system     | timeline.personal, timeline.system       |
| `platform.action.executed`           | `capability.action.executed`           | capability | timeline.personal, timeline.organization |
| `platform.knowledge.query.completed` | `capability.knowledge.query.completed` | capability | timeline.personal                        |
| `platform.notification.generated`    | `capability.notification.generated`    | system     | timeline.personal                        |

See [Platform Activity Catalogue](../../packages/activity-timeline-framework/docs/PLATFORM-ACTIVITY-CATALOGUE.md).

---

## 7. Platform catalogue (built-in timelines)

Implemented in `packages/activity-timeline-framework/src/timeline/platform-timeline-catalogue.ts`:

| timelineId              | scope        | label        | status  |
| ----------------------- | ------------ | ------------ | ------- |
| `timeline.personal`     | personal     | Personal     | active  |
| `timeline.team`         | team         | Team         | planned |
| `timeline.organization` | organization | Organization | planned |
| `timeline.system`       | system       | System       | planned |

See [Timeline Bootstrap](../../packages/activity-timeline-framework/docs/TIMELINE-BOOTSTRAP.md).

---

## 8. Relationship to event and notification manifests

A capability manifest may declare all three blocks independently:

```yaml
events:
  publishes: [...]
notifications:
  routes: [...]
activities:
  types: [...]
  timelines: [...] # primary (AT-005)
timelines:
  scopes: [...] # legacy fallback
```

| Block                                       | Registry             | Subscriber         |
| ------------------------------------------- | -------------------- | ------------------ |
| `events`                                    | EventRegistry        | Publishers         |
| `notifications.routes`                      | NotificationRegistry | NotificationMapper |
| `activities.types`                          | ActivityRegistry     | ActivityMapper     |
| `activities.timelines` / `timelines.scopes` | TimelineRegistry     | Presentation Layer |

No cross-block coupling at manifest level.

---

## 9. Manifest-first rule (Document 024)

Capabilities **must** declare activity types in manifest before implementation code references them. Module Registry validates manifest presence at registration time (future gate).

---

## 10. Related

- [Activity bootstrap](./SPR-007-ATF-activity-bootstrap.md)
- [Activity Registry](./SPR-007-ATF-activity-registry.md)
- [Timeline model](./SPR-007-ATF-timeline-model.md)
- [SPR-006 Notification manifest](./SPR-006-ENF-notification-manifest.md) — parallel pattern

---

_SPR-007 Activity Manifest Schema — AT-001 / AT-005 specification._
