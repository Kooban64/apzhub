# APZHUB ProjectService Specification

**Milestone:** OSS-101-01  
**Status:** Canonical vendor-neutral service contract — **specification only, no implementation**  
**Authority:** [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md) · [Platform Service SDK 027](../027-platform-service-sdk-business-service-framework-service-manifest-specification.md)

---

## Purpose

Define the **ProjectService** interface — the permanent, vendor-neutral contract between the Projects Workbench module and any project-management engine adapter.

**Rules:**

- APZHUB terminology only in this specification
- No Plane types, field names, or IDs in public surface
- All methods require `RequestContext` (tenant, user, correlation ID)
- All responses use platform global IDs and standard API envelope (010)

---

## Service identity

| Field                  | Value                                             |
| ---------------------- | ------------------------------------------------- |
| Service ID             | `project-service`                                 |
| Interface name         | `ProjectService`                                  |
| Contract package       | `@apzhub/platform-service-contracts` (OSS-110-01) |
| Planned implementation | `services/projects/`                              |
| Manifest               | `service.yaml`                                    |

---

## Domain types (APZHUB DTOs)

### Identifiers

```typescript
type ProjectId = string; // platform global ID, e.g. proj_*
type TaskId = string; // task_*
type SprintId = string; // sprint_*
type MilestoneId = string; // milestone_*
type TeamMemberId = string;
type CommentId = string;
type AttachmentId = string;
type LabelId = string;
type StatusId = string;
type UserId = string; // platform user ID
```

### Project

```typescript
interface Project {
  readonly id: ProjectId;
  readonly tenantId: string;
  readonly name: string;
  readonly identifier: string; // short code, e.g. APZ
  readonly description?: string;
  readonly status: ProjectStatus;
  readonly leadId?: UserId;
  readonly createdAt: string; // ISO-8601
  readonly updatedAt: string;
}

type ProjectStatus = "draft" | "active" | "on_hold" | "completed" | "archived";
```

### Task

```typescript
interface Task {
  readonly id: TaskId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly statusId: StatusId;
  readonly priority: TaskPriority;
  readonly assigneeId?: UserId;
  readonly sprintId?: SprintId;
  readonly milestoneId?: MilestoneId;
  readonly projectModuleId?: string;
  readonly parentTaskId?: TaskId;
  readonly estimate?: Estimate;
  readonly rank?: number; // backlog order
  readonly labelIds: readonly LabelId[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

type TaskStatus = "open" | "in_progress" | "blocked" | "done" | "cancelled";
type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

interface Estimate {
  readonly points?: number;
  readonly minutes?: number;
}
```

### Sprint

```typescript
interface Sprint {
  readonly id: SprintId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly goal?: string;
  readonly status: SprintStatus;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type SprintStatus = "planned" | "active" | "completed" | "cancelled";
```

### Milestone

```typescript
interface Milestone {
  readonly id: MilestoneId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly description?: string;
  readonly targetDate?: string;
  readonly status: "open" | "completed";
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

### Team

```typescript
interface TeamMember {
  readonly id: TeamMemberId;
  readonly projectId: ProjectId;
  readonly userId: UserId;
  readonly role: TeamRole;
  readonly joinedAt: string;
}

type TeamRole = "viewer" | "member" | "admin";
```

### Status, Label, Comment, Attachment, Activity

```typescript
interface Status {
  readonly id: StatusId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly group: StatusGroup;
  readonly order: number;
}

type StatusGroup = "todo" | "in_progress" | "done" | "cancelled";

interface Label {
  readonly id: LabelId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly color?: string;
}

interface Comment {
  readonly id: CommentId;
  readonly taskId: TaskId;
  readonly authorId: UserId;
  readonly body: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Attachment {
  readonly id: AttachmentId;
  readonly taskId: TaskId;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly url?: string; // platform-mediated download URL
  readonly createdAt: string;
}

interface ActivityEntry {
  readonly id: string;
  readonly projectId: ProjectId;
  readonly taskId?: TaskId;
  readonly actorId: UserId;
  readonly action: string; // APZHUB action key, not engine event
  readonly summary: string;
  readonly occurredAt: string;
}
```

### Backlog and Roadmap (views)

```typescript
interface Backlog {
  readonly projectId: ProjectId;
  readonly tasks: readonly Task[]; // ordered by rank
}

interface RoadmapItem {
  readonly id: string;
  readonly projectId: ProjectId;
  readonly type: "milestone" | "sprint" | "task";
  readonly referenceId: string;
  readonly title: string;
  readonly startDate?: string;
  readonly endDate?: string;
}

interface Roadmap {
  readonly projectId: ProjectId;
  readonly items: readonly RoadmapItem[];
}
```

---

## Request context

```typescript
interface ProjectServiceContext {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId: string;
  readonly permissions: readonly string[];
}
```

Every method receives context. Service validates tenant membership before adapter calls.

---

## ProjectService interface

```typescript
interface ProjectService {
  // ── Projects ──────────────────────────────────────────
  listProjects(ctx: ProjectServiceContext, filter?: ProjectFilter): Promise<Project[]>;
  getProject(ctx: ProjectServiceContext, projectId: ProjectId): Promise<Project>;
  createProject(
    ctx: ProjectServiceContext,
    input: CreateProjectInput,
  ): Promise<Project>;
  updateProject(
    ctx: ProjectServiceContext,
    projectId: ProjectId,
    input: UpdateProjectInput,
  ): Promise<Project>;
  archiveProject(ctx: ProjectServiceContext, projectId: ProjectId): Promise<Project>;

  // ── Tasks ─────────────────────────────────────────────
  listTasks(
    ctx: ProjectServiceContext,
    projectId: ProjectId,
    filter?: TaskFilter,
  ): Promise<Task[]>;
  getTask(ctx: ProjectServiceContext, taskId: TaskId): Promise<Task>;
  createTask(
    ctx: ProjectServiceContext,
    projectId: ProjectId,
    input: CreateTaskInput,
  ): Promise<Task>;
  updateTask(
    ctx: ProjectServiceContext,
    taskId: TaskId,
    input: UpdateTaskInput,
  ): Promise<Task>;
  transitionTaskStatus(
    ctx: ProjectServiceContext,
    taskId: TaskId,
    statusId: StatusId,
  ): Promise<Task>;
  assignTask(
    ctx: ProjectServiceContext,
    taskId: TaskId,
    assigneeId: UserId | null,
  ): Promise<Task>;

  // ── Backlog ───────────────────────────────────────────
  getBacklog(ctx: ProjectServiceContext, projectId: ProjectId): Promise<Backlog>;
  reorderBacklog(
    ctx: ProjectServiceContext,
    projectId: ProjectId,
    taskIds: TaskId[],
  ): Promise<Backlog>;

  // ── Sprints ───────────────────────────────────────────
  listSprints(ctx: ProjectServiceContext, projectId: ProjectId): Promise<Sprint[]>;
  getSprint(ctx: ProjectServiceContext, sprintId: SprintId): Promise<Sprint>;
  createSprint(
    ctx: ProjectServiceContext,
    projectId: ProjectId,
    input: CreateSprintInput,
  ): Promise<Sprint>;
  startSprint(ctx: ProjectServiceContext, sprintId: SprintId): Promise<Sprint>;
  completeSprint(ctx: ProjectServiceContext, sprintId: SprintId): Promise<Sprint>;
  assignTasksToSprint(
    ctx: ProjectServiceContext,
    sprintId: SprintId,
    taskIds: TaskId[],
  ): Promise<void>;

  // ── Milestones ────────────────────────────────────────
  listMilestones(
    ctx: ProjectServiceContext,
    projectId: ProjectId,
  ): Promise<Milestone[]>;
  createMilestone(
    ctx: ProjectServiceContext,
    projectId: ProjectId,
    input: CreateMilestoneInput,
  ): Promise<Milestone>;

  // ── Roadmap ───────────────────────────────────────────
  getRoadmap(ctx: ProjectServiceContext, projectId: ProjectId): Promise<Roadmap>;

  // ── Team ──────────────────────────────────────────────
  listTeam(ctx: ProjectServiceContext, projectId: ProjectId): Promise<TeamMember[]>;
  addTeamMember(
    ctx: ProjectServiceContext,
    projectId: ProjectId,
    input: AddTeamMemberInput,
  ): Promise<TeamMember>;
  removeTeamMember(
    ctx: ProjectServiceContext,
    projectId: ProjectId,
    userId: UserId,
  ): Promise<void>;

  // ── Statuses & Labels ─────────────────────────────────
  listStatuses(ctx: ProjectServiceContext, projectId: ProjectId): Promise<Status[]>;
  listLabels(ctx: ProjectServiceContext, projectId: ProjectId): Promise<Label[]>;

  // ── Comments & Attachments ────────────────────────────
  listComments(ctx: ProjectServiceContext, taskId: TaskId): Promise<Comment[]>;
  addComment(
    ctx: ProjectServiceContext,
    taskId: TaskId,
    input: AddCommentInput,
  ): Promise<Comment>;
  listAttachments(ctx: ProjectServiceContext, taskId: TaskId): Promise<Attachment[]>;

  // ── My work ───────────────────────────────────────────
  listMyTasks(ctx: ProjectServiceContext, filter?: TaskFilter): Promise<Task[]>;

  // ── Activity ──────────────────────────────────────────
  listProjectActivity(
    ctx: ProjectServiceContext,
    projectId: ProjectId,
    cursor?: string,
  ): Promise<ActivityPage>;
}
```

Input types (`CreateProjectInput`, `TaskFilter`, etc.) are defined in implementation phase; shapes must use APZHUB field names only.

---

## Permission requirements (illustrative)

| Method                            | Minimum permission            |
| --------------------------------- | ----------------------------- |
| `listProjects`, `getProject`      | `projects.view`               |
| `createProject`                   | `projects.create`             |
| `updateProject`, `archiveProject` | `projects.edit`               |
| `createTask`, `updateTask`        | `tasks.create` / `tasks.edit` |
| `transitionTaskStatus`            | `tasks.transition`            |
| `assignTask`                      | `tasks.assign`                |
| `startSprint`, `completeSprint`   | `sprints.manage`              |
| `addTeamMember`                   | `projects.admin`              |

Denied calls return `FORBIDDEN` — never adapter errors.

---

## Events emitted (by service)

Service publishes canonical platform events after successful mutations. See [Event Mapping Specification](./APZHUB-Projects-Event-Mapping-Specification.md).

---

## Adapter dependency

```typescript
interface ProjectServiceDependencies {
  readonly planeAdapter: PlaneAdapter; // interface from PlaneAdapter spec
  readonly authorization: AuthorizationService;
  readonly audit: AuditService;
  readonly eventBus: EventBus;
  readonly entityMapping: EntityMappingRepository; // platform IDs
}
```

`ProjectService` depends on **`PlaneAdapter` interface** — not `PlaneClient`.

---

## API gateway mapping (planned)

| Service method         | HTTP (illustrative)                          |
| ---------------------- | -------------------------------------------- |
| `listProjects`         | `GET /api/platform/v1/projects`              |
| `getProject`           | `GET /api/platform/v1/projects/{id}`         |
| `listTasks`            | `GET /api/platform/v1/projects/{id}/tasks`   |
| `transitionTaskStatus` | `PATCH /api/platform/v1/tasks/{id}/status`   |
| `getBacklog`           | `GET /api/platform/v1/projects/{id}/backlog` |

Route handlers delegate to `ProjectService` only.

---

## Replacement guarantee

Any future engine implements the same `PlaneAdapter` interface (or renamed `ProjectEngineAdapter`) behind `ProjectService`. Module and HTTP contracts remain stable.

---

## Related

- [PlaneAdapter Specification](./APZHUB-PlaneAdapter-Specification.md)
- [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md)
