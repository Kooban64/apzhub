# APZHUB Projects Workbench UX Specification

**Milestone:** OSS-101  
**Status:** Planning specification — no UI implementation  
**Authority:** [Document 005](../005-desktop-experience-workspace-framework.md) · [Document 016](../016-desktop-shell-architecture-user-experience-framework.md) · [Document 017](../017-navigation-framework-workspace-navigation-architecture.md)

---

## UX principles

1. **100% native APZHUB Workbench UI** — no embedded Plane iframe, no Plane branding
2. **Permission-driven** — every view, action, and route gated by `PermissionService`
3. **APZHUB Design System only** — tokens, shadcn/ui, Lucide icons (006)
4. **Platform API only** — module calls `/api/platform/v1/projects/*`; never Plane URLs
5. **Deep links** — APZHUB paths only, e.g. `/workspace/projects/{projectId}/board`

---

## Integration strategy: UI vs engine

| Surface            | Strategy          | Rationale                                                        |
| ------------------ | ----------------- | ---------------------------------------------------------------- |
| Projects dashboard | **Native APZHUB** | Unified shell; personalisation                                   |
| Project list       | **Native APZHUB** | Permission-filtered; search integration                          |
| Project detail     | **Native APZHUB** | Tabs: overview, board, backlog, sprints, roadmap, team, activity |
| Task board         | **Native APZHUB** | Kanban via Plane API; drag-drop in APZHUB components             |
| Sprint view        | **Native APZHUB** | Cycle data from Plane; APZHUB sprint UX                          |
| Backlog            | **Native APZHUB** | Ordered list; sprint assignment                                  |
| Roadmap            | **Native APZHUB** | Timeline component; Plane roadmap data                           |
| My work            | **Native APZHUB** | Cross-project assignee filter                                    |
| Task detail        | **Native APZHUB** | Drawer or workspace panel                                        |
| Project activity   | **Native APZHUB** | Activity Timeline Framework (007)                                |
| Project search     | **Native APZHUB** | Unified Search (020) — not Plane search                          |
| Project knowledge  | **Native APZHUB** | Knowledge Discovery links                                        |
| Plane web UI       | **Hidden**        | Not linked for standard users                                    |
| Plane admin        | **Operator-only** | Administration workspace if ever required                        |

**Prohibited:** Deep links to `plane.example.com`, embedded Plane login, Plane favicon/logo in module chrome.

---

## Module registration

| Field              | Value                                               |
| ------------------ | --------------------------------------------------- |
| Module ID          | `projects`                                          |
| Activity Bar label | Projects                                            |
| Activity Bar icon  | Lucide `FolderKanban` or `LayoutGrid`               |
| Permission         | `projects.view` minimum for Activity Bar visibility |
| Default route      | `/workspace/projects`                               |

---

## Navigation structure

```text
Activity Bar: Projects
  Sidebar:
    Dashboard          /workspace/projects
    All projects       /workspace/projects/list
    My work            /workspace/projects/my-work
    Recent             /workspace/projects/recent
    ─── (context) ───
    [Current project]
      Overview         .../projects/{id}
      Task board       .../projects/{id}/board
      Backlog          .../projects/{id}/backlog
      Sprints          .../projects/{id}/sprints
      Roadmap          .../projects/{id}/roadmap
      Team             .../projects/{id}/team
      Activity         .../projects/{id}/activity
      Knowledge        .../projects/{id}/knowledge
```

Sidebar collapses to project context when inside a project. Breadcrumb: Projects → {Project name} → {View}.

---

## Screen specifications

### Projects dashboard

**Purpose:** Landing view — summary across accessible projects.

| Region          | Content                                                           |
| --------------- | ----------------------------------------------------------------- |
| Header          | "Projects" + create project (if permitted)                        |
| Summary cards   | Active projects count, my open tasks, overdue (if data available) |
| Recent projects | Personalisation recent list                                       |
| My work preview | Top assigned tasks                                                |
| Activity feed   | Cross-project activity stream (permission-filtered)               |

**Permissions:** `projects.view`; create requires `projects.create`.

---

### Project list

**Purpose:** Searchable, filterable directory of projects.

| Feature     | Detail                                       |
| ----------- | -------------------------------------------- |
| DataTable   | TanStack Table — name, status, lead, updated |
| Filters     | Status, team member, label                   |
| Search      | Unified search provider scoped to projects   |
| Actions     | Open, create, archive (permission-gated)     |
| Empty state | Design System empty state + create CTA       |

---

### Project detail (overview)

**Purpose:** Project home — metadata and quick links.

| Section         | Content                                |
| --------------- | -------------------------------------- |
| Header          | Project name, identifier, status badge |
| Meta            | Lead, dates, description               |
| Quick links     | Board, backlog, sprints, roadmap       |
| Recent activity | Project-scoped activity timeline       |
| Team preview    | Avatar row + manage link               |

---

### Task board

**Purpose:** Kanban view by status.

| Feature   | Detail                                              |
| --------- | --------------------------------------------------- |
| Columns   | Status groups (Todo / In progress / Done)           |
| Cards     | Task title, assignee, labels, priority              |
| Drag-drop | Status transition via `tasks.transition` permission |
| Filters   | Assignee, label, sprint, module                     |
| Create    | Inline add task in column                           |

**API:** `GET/PATCH` platform task APIs — Plane state IDs resolved server-side.

---

### Sprint view

**Purpose:** Manage and view current sprint.

| Feature         | Detail                                           |
| --------------- | ------------------------------------------------ |
| Sprint selector | Active / planned / completed                     |
| Sprint goal     | Editable text                                    |
| Task list       | Tasks in sprint                                  |
| Burndown        | Phase 2 — optional chart                         |
| Actions         | Start sprint, complete sprint (`sprints.manage`) |

**Terminology:** User sees "Sprint"; Plane cycle mapped internally.

---

### Backlog

**Purpose:** Prioritised unscheduled work.

| Feature          | Detail                              |
| ---------------- | ----------------------------------- |
| Ordered list     | Drag reorder (updates rank via API) |
| Assign to sprint | Bulk or single                      |
| Filters          | Label, module, assignee             |
| Create task      | Top of backlog                      |

---

### Roadmap

**Purpose:** Timeline planning view.

| Feature    | Detail                                    |
| ---------- | ----------------------------------------- |
| Timeline   | Milestones and sprints on horizontal axis |
| Zoom       | Month / quarter                           |
| Milestones | Create/edit milestone (`projects.edit`)   |
| Tasks      | Optional overlay on timeline — Phase 2    |

---

### My work

**Purpose:** Cross-project personal task list.

| Feature         | Detail                    |
| --------------- | ------------------------- |
| Grouping        | By project or by due date |
| Filters         | Status, priority          |
| Quick actions   | Open task, change status  |
| Personalisation | Saved filter prefs (023)  |

---

### Project activity

**Purpose:** Audit and collaboration timeline.

| Feature | Detail                                                        |
| ------- | ------------------------------------------------------------- |
| Source  | Activity Timeline Framework — not Plane activity API directly |
| Events  | Task created, assigned, status changed, commented             |
| Filters | Actor, event type, date                                       |

---

### Project knowledge

**Purpose:** Linked documents and discovery.

| Feature | Detail                                                  |
| ------- | ------------------------------------------------------- |
| Source  | Knowledge Discovery Framework (020)                     |
| Content | Linked documents, related matters (Law Platform future) |
| Actions | Link/unlink knowledge items                             |

---

### Project search

**Purpose:** Scoped search within Projects module.

| Feature        | Detail                                        |
| -------------- | --------------------------------------------- |
| Implementation | Unified Search provider — `projects` scope    |
| Index          | Project name, task title, description, labels |
| Results        | Navigate to project or task detail            |

No standalone Plane search box.

---

## Context panel integration

When task selected:

| Context Panel tab | Content                                |
| ----------------- | -------------------------------------- |
| Details           | Status, assignee, labels, dates        |
| Comments          | Thread — native UI                     |
| Activity          | Task-scoped events                     |
| Links             | Documents, time entries (future waves) |

---

## Command palette (future)

Register module commands (019):

- Create project
- Create task
- Go to my work
- Open recent project

Permission-filtered at registration.

---

## Responsive and accessibility

- WCAG AA target (015)
- Keyboard navigation for board drag alternative (move via menu)
- Mobile: list views primary; board simplified

---

## Personalisation hooks

| Preference            | Scope   |
| --------------------- | ------- |
| Default project view  | User    |
| Board column collapse | Session |
| My work grouping      | User    |
| Recent projects       | User    |

Via `@apzhub/platform-personalisation` — module does not store prefs locally.

---

## Operations via Plane API (server-side only)

| User action | Plane API (via adapter) |
| ----------- | ----------------------- |
| View board  | List issues + states    |
| Move card   | Patch issue state       |
| Create task | Post issue              |
| Assign      | Patch assignee          |
| Comment     | Post comment            |
| Sprint CRUD | Cycle endpoints         |
| Team change | Member endpoints        |

Module never calls these — `ProjectService` orchestrates.

---

## Replacement UX guarantee

If Plane replaced:

- Routes, labels, and layouts unchanged
- DTO field stability maintained in `ProjectService` contract
- Only adapter and mapping migration required

---

## Related

- [Projects Plane Reference Architecture](../architecture/APZHUB-Projects-Plane-Reference-Architecture.md)
- [Projects Domain Mapping](../architecture/APZHUB-Projects-Domain-Mapping.md)
- [OSS-101 Backlog](../backlog/OSS-101-Plane-Integration-Backlog.md)
