# APZHUB Projects Manifest Notes

**Milestone:** OSS-101-03  
**Status:** Authoritative manifest reference  
**Authority:** [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md) · [025 Module SDK](../025-module-sdk-module-manifest-module-development-standard.md) · [027 Platform Service SDK](../027-platform-service-sdk-business-service-framework-service-manifest-specification.md) · [026 Integration SDK](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [029 Platform Event SDK](../029-platform-event-sdk-event-bus-event-manifest-specification.md)

---

## Overview

OSS-101-03 registers **APZHUB Projects** as a first-class platform capability through manifest-first contracts. Plane remains hidden behind the `plane` integration manifest — no adapter code, REST client, UI, or database schema in this milestone.

**User-facing terminology:** Project, Task, Sprint, Milestone, Backlog, Roadmap, Team, Status — never Plane terms.

---

## Manifest inventory

| Capability          | Kind        | Path                                               | ID                             |
| ------------------- | ----------- | -------------------------------------------------- | ------------------------------ |
| Project Service     | service     | `services/projects/service.yaml`                   | `project-service`              |
| Projects module     | module      | `services/projects/manifests/projects/module.yaml` | `projects`                     |
| Plane integration   | integration | `integrations/plane/integration.yaml`              | `plane`                        |
| Project created     | event       | `events/projects/project-created/event.yaml`       | `projects-project-created`     |
| Project updated     | event       | `events/projects/project-updated/event.yaml`       | `projects-project-updated`     |
| Task created        | event       | `events/projects/task-created/event.yaml`          | `projects-task-created`        |
| Task updated        | event       | `events/projects/task-updated/event.yaml`          | `projects-task-updated`        |
| Task status changed | event       | `events/projects/task-status-changed/event.yaml`   | `projects-task-status-changed` |
| Task assigned       | event       | `events/projects/task-assigned/event.yaml`         | `projects-task-assigned`       |
| Sprint created      | event       | `events/projects/sprint-created/event.yaml`        | `projects-sprint-created`      |
| Sprint completed    | event       | `events/projects/sprint-completed/event.yaml`      | `projects-sprint-completed`    |

Discovery roots (`packages/platform-runtime/src/discovery-engine/config.ts`) include `services/`, `integrations/`, and `events/`.

---

## Service manifest (`project-service`)

### Permissions

| Permission               | Purpose                                      |
| ------------------------ | -------------------------------------------- |
| `projects.view`          | View projects workspace and project list     |
| `projects.manage`        | Create and update projects                   |
| `projects.task.view`     | View tasks, backlog, and board               |
| `projects.task.manage`   | Create, update, assign, and transition tasks |
| `projects.sprint.view`   | View sprints and sprint board                |
| `projects.sprint.manage` | Create, start, and complete sprints          |
| `projects.admin`         | Administer project settings, team, archive   |

### Published events

Canonical event keys (see [Event Mapping Specification](../specs/APZHUB-Projects-Event-Mapping-Specification.md)):

- `projects.project.created`
- `projects.project.updated`
- `projects.task.created`
- `projects.task.updated`
- `projects.task.status_changed`
- `projects.task.assigned`
- `projects.sprint.created`
- `projects.sprint.completed`

### Knowledge sources

| Source ID            | Kind           | Tier | Permission      |
| -------------------- | -------------- | ---- | --------------- |
| `projects.search`    | metadata-index | T2   | `projects.view` |
| `projects.knowledge` | event-index    | T2   | `projects.view` |

Both sources are `status: planned` until OSS-101-08.

### Platform dependencies (runtime)

Manifest `dependencies.platform` arrays are empty (discovery-safe pattern per legal-platform manifests). Intended platform consumption is documented in [Capability Registration Notes](./APZHUB-Projects-Capability-Registration-Notes.md) and wired at implementation time.

---

## Module manifest (`projects`)

### Status

`module.status: disabled` — UI and handlers are placeholders until OSS-101-05+.

### Workbench navigation

| Sidebar item | Route                         | Permission             |
| ------------ | ----------------------------- | ---------------------- |
| Dashboard    | `/workspace/projects`         | `projects.view`        |
| All Projects | `/workspace/projects/list`    | `projects.view`        |
| My Work      | `/workspace/projects/my-work` | `projects.task.view`   |
| Tasks        | `/workspace/projects/tasks`   | `projects.task.view`   |
| Backlog      | `/workspace/projects/backlog` | `projects.task.view`   |
| Sprints      | `/workspace/projects/sprints` | `projects.sprint.view` |
| Roadmap      | `/workspace/projects/roadmap` | `projects.view`        |

Project detail (planned): `/workspace/projects/{projectId}` — documented in `documentation.plannedRouteProjectDetail`.

Activity Bar entry: **Projects** (`folder-kanban`, order 20).

### Commands (placeholders)

| Command ID        | Permission               |
| ----------------- | ------------------------ |
| `project.open`    | `projects.view`          |
| `project.create`  | `projects.manage`        |
| `project.update`  | `projects.manage`        |
| `task.open`       | `projects.task.view`     |
| `task.create`     | `projects.task.manage`   |
| `task.update`     | `projects.task.manage`   |
| `task.assign`     | `projects.task.manage`   |
| `sprint.open`     | `projects.sprint.view`   |
| `sprint.create`   | `projects.sprint.manage` |
| `sprint.complete` | `projects.sprint.manage` |

Workbench actions mirror commands with `service:project-service:placeholder.*` handlers — no runtime implementation.

---

## Integration manifest (`plane`)

Internal-only OSS application adapter boundary:

- `userVisible: false` — engine branding hidden
- Capabilities: health, provisioning, authentication-bridge, entity-mapping, error-translation
- Adapter implementation deferred to **OSS-101-04**

---

## Event manifests

Each event manifest sets:

- `event.publisher: project-service`
- `documentation.eventKey` — canonical dotted name (e.g. `projects.task.assigned`)
- Subscribers where applicable:
  - Search: `search:projects.search`
  - Activity: `activity:projects.activity`
  - Notification: `notification:projects.task.assigned`, `notification:projects.task.status_changed`, `notification:projects.sprint.completed`

---

## Notification routes

| Route ID                       | Trigger event                  | Audience (planned)  |
| ------------------------------ | ------------------------------ | ------------------- |
| `projects.task.assigned`       | `projects.task.assigned`       | Assignee            |
| `projects.task.status_changed` | `projects.task.status_changed` | Watchers / assignee |
| `projects.sprint.completed`    | `projects.sprint.completed`    | Project team        |

Routes are declared in service `documentation` and event subscriber references — delivery wiring is OSS-101-06+.

---

## Activity types

Registered activity actions (OSS-101-08 mappers):

- `projects.project.created`
- `projects.project.updated`
- `projects.task.created`
- `projects.task.updated`
- `projects.task.status_changed`
- `projects.task.assigned`
- `projects.sprint.created`
- `projects.sprint.completed`

Activity provider ID: `projects.activity`.

---

## Governance, lifecycle, and operations metadata

| Key                       | Value                                 |
| ------------------------- | ------------------------------------- |
| Governance capability key | `projects`                            |
| Feature flag              | `capability.projects.enabled`         |
| Provisioning kind         | `plane-workspace`                     |
| Lifecycle product ID      | `projects`                            |
| Lifecycle participation   | enable, disable, provision, reconcile |
| Operations capability ID  | `projects`                            |
| Operations connector ID   | `plane`                               |
| Diagnostics extension     | `projectsDiagnostics`                 |

Full registration behaviour documented in [Capability Registration Notes](./APZHUB-Projects-Capability-Registration-Notes.md).

---

## Validation

Manifest schema validation tests: `packages/platform-runtime/src/manifest-engine/projects-manifests.test.ts`.

---

## Out of scope (OSS-101-03)

| Item                            | Phase       |
| ------------------------------- | ----------- |
| Plane adapter / REST client     | OSS-101-04  |
| ProjectService implementation   | OSS-101-04+ |
| Workbench UI                    | OSS-101-05+ |
| Database schema / mapping store | OSS-101-04  |
| Search index population         | OSS-101-08  |
| Live notification delivery      | OSS-101-06+ |

---

## Related

- [Projects Capability Registration Notes](./APZHUB-Projects-Capability-Registration-Notes.md)
- [ProjectService Specification](../specs/APZHUB-ProjectService-Specification.md)
- [PlaneAdapter Specification](../specs/APZHUB-PlaneAdapter-Specification.md)
- [OSS-101-03 Completion Report](../sprint/OSS-101-03-completion-report.md)
