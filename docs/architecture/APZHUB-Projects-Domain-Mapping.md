# APZHUB Projects Domain Mapping

**Milestone:** OSS-101  
**Status:** Authoritative Plane → APZHUB concept map  
**Authority:** [Document 002](../002-product-naming-positioning-terminology-standard.md)

---

## Mapping principles

1. **User-facing:** APZHUB terminology only — never Plane names in UI
2. **API responses:** APZHUB DTOs — no Plane field names or IDs exposed to client (opaque platform IDs)
3. **Adapter layer:** Plane API types and IDs — connector-internal only
4. **Platform metadata:** Mapping table links platform global IDs ↔ Plane UUIDs

---

## Concept mapping table

| Plane concept (engine)  | APZHUB concept (user/API) | Notes                                                                   |
| ----------------------- | ------------------------- | ----------------------------------------------------------------------- |
| Workspace               | **Tenant workspace**      | 1:1 with platform tenant; not shown as "Workspace" to users             |
| Project                 | **Project**               | Primary container for work                                              |
| Issue / Work item       | **Task**                  | User-facing; "Issue" acceptable in API paths as legacy alias internally |
| Issue (type: epic)      | **Epic**                  | Large work item; optional Phase 2                                       |
| Cycle                   | **Sprint**                | Time-boxed iteration; Plane "cycle" → APZHUB "Sprint" in UX             |
| Module                  | **Project module**        | Feature area / component within a project                               |
| State                   | **Status**                | Workflow column on board                                                |
| State group             | **Status group**          | Todo / In progress / Done grouping                                      |
| Label                   | **Label**                 | Tags on tasks                                                           |
| Priority                | **Priority**              | Urgent / High / Medium / Low / None                                     |
| Assignee                | **Assignee**              | Mapped from platform user                                               |
| Member                  | **Team member**           | Project team                                                            |
| Comment                 | **Comment**               | Task discussion                                                         |
| Attachment              | **Attachment**            | Linked file metadata                                                    |
| Milestone (view/entity) | **Milestone**             | Release or checkpoint                                                   |
| Backlog (view)          | **Backlog**               | Unscheduled tasks view                                                  |
| Roadmap (view)          | **Roadmap**               | Timeline / planning view                                                |
| Board (view)            | **Task board**            | Kanban by status                                                        |
| Estimate (points)       | **Estimate**              | Story points or time                                                    |
| Parent issue            | **Parent task**           | Sub-task hierarchy                                                      |
| Intake (view)           | **Intake**                | Optional; triage queue — Phase 2                                        |
| Page (Plane docs)       | **Project notes**         | Optional; may defer to Documents wave                                   |

---

## Entity relationship (APZHUB view)

```text
Tenant (platform)
  └── Project
        ├── Team (members)
        ├── Project modules
        ├── Sprints (cycles)
        ├── Milestones
        ├── Labels (project-scoped)
        ├── Statuses (workflow)
        └── Tasks
              ├── Sub-tasks
              ├── Assignee
              ├── Labels
              ├── Status
              ├── Sprint (optional)
              ├── Project module (optional)
              ├── Comments
              └── Attachments (refs)
```

---

## ID mapping strategy

| Layer              | ID type                                           | Exposure              |
| ------------------ | ------------------------------------------------- | --------------------- |
| Client / Module UI | Platform global ID (`proj_…`, `task_…`)           | Public                |
| ProjectService     | Platform global ID                                | Internal service      |
| PlaneAdapter       | Plane UUID                                        | Adapter-internal only |
| Mapping store      | `(platform_id, plane_id, entity_type, tenant_id)` | Platform PostgreSQL   |

- Create: service generates platform ID → adapter creates in Plane → mapping persisted
- Read: service resolves platform ID → adapter fetches from Plane → DTO mapping
- Delete: soft-delete in service; adapter tombstone; audit retained

---

## Terminology in navigation (Document 002)

| Activity Bar | Sidebar (examples)              |
| ------------ | ------------------------------- |
| Projects     | All projects · My work · Recent |

User never sees: Plane, workspace slug, cycle ID, module UUID.

---

## Permission vocabulary (APZHUB)

| Permission key     | User-facing label     |
| ------------------ | --------------------- |
| `projects.view`    | View projects         |
| `projects.create`  | Create projects       |
| `projects.edit`    | Edit project settings |
| `projects.admin`   | Administer project    |
| `tasks.view`       | View tasks            |
| `tasks.create`     | Create tasks          |
| `tasks.edit`       | Edit tasks            |
| `tasks.assign`     | Assign tasks          |
| `tasks.transition` | Change task status    |
| `sprints.manage`   | Manage sprints        |
| `backlog.manage`   | Manage backlog        |

Plane equivalents resolved in adapter — never returned to client.

---

## Event naming (past tense, platform envelope)

| Domain event          | Trigger                  |
| --------------------- | ------------------------ |
| `project.created`     | Project provisioned      |
| `project.updated`     | Project metadata changed |
| `task.created`        | Task created             |
| `task.assigned`       | Assignee changed         |
| `task.status_changed` | Status transition        |
| `task.commented`      | Comment added            |
| `sprint.started`      | Sprint activated         |
| `sprint.completed`    | Sprint closed            |

---

## Cross-product references (future waves)

| APZHUB product        | Link to Projects       |
| --------------------- | ---------------------- |
| Time Tracking (Kimai) | Task ↔ time entry      |
| Documents (Paperless) | Task ↔ document        |
| Support (Zammad)      | Ticket ↔ task          |
| Quality Engineering   | Defect ↔ task          |
| Automation (n8n)      | Workflow ↔ task events |

References use platform task ID only — never Plane ID.

---

## Replacement strategy

If Plane is replaced:

1. Implement new adapter (e.g. `OpenProjectAdapter`) behind same `ProjectService` interface
2. Migration tool: export via Plane API → import via new engine
3. Remap platform ID mapping table
4. **No module UI changes** if DTO contract stable

---

## Related

- [Projects Plane Reference Architecture](./APZHUB-Projects-Plane-Reference-Architecture.md)
- [Plane Adapter Design](./APZHUB-Plane-Adapter-Design.md)
