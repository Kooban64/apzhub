# APZHUB PlaneAdapter Specification

**Milestone:** OSS-101-01  
**Status:** Canonical adapter boundary contract — **specification only, no implementation**  
**Authority:** [Adapter Boundary Pattern](../architecture/APZHUB-Adapter-Boundary-Pattern.md) · [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md)

---

## Purpose

Define the **PlaneAdapter** interface — the only component permitted to know Plane models, API shapes, and event names.

The adapter **owns translation**. ProjectService, Workbench module, Search, Notifications, and Activity must never depend on Plane types.

---

## Integration identity

| Field           | Value                          |
| --------------- | ------------------------------ |
| Integration ID  | `plane`                        |
| Adapter name    | `PlaneAdapter`                 |
| Internal client | `PlaneClient` (never exported) |
| Planned package | `integrations/plane/`          |
| Manifest        | `integration.yaml`             |

---

## Translation ownership matrix

| APZHUB (public)   | Plane (adapter-internal)   | Direction                           |
| ----------------- | -------------------------- | ----------------------------------- |
| Project           | Project                    | Bidirectional                       |
| Task              | Issue                      | Bidirectional                       |
| Sprint            | Cycle                      | Bidirectional                       |
| Milestone         | Milestone                  | Bidirectional                       |
| Status            | State                      | Bidirectional                       |
| Status group      | State group                | Bidirectional                       |
| Team / TeamMember | Member / Project member    | Bidirectional                       |
| Label             | Label                      | Bidirectional                       |
| Comment           | Comment                    | Bidirectional                       |
| Attachment        | Asset / attachment         | Bidirectional                       |
| Activity          | Issue activity / audit log | Plane → APZHUB only                 |
| Assignee          | Assignee (user UUID)       | Bidirectional                       |
| Estimate          | Estimate (points)          | Bidirectional                       |
| Backlog           | Unscheduled issues (view)  | Read + rank write                   |
| Roadmap           | Timeline / modules view    | Read                                |
| Project module    | Module                     | Bidirectional                       |
| Tenant workspace  | Workspace                  | Provision only — not in public DTOs |
| Parent task       | Parent issue               | Bidirectional                       |

**Never exposed outside adapter:** `workspace`, `issue`, `cycle`, `module`, `state`, Plane UUIDs, Plane slugs, Plane role names.

---

## PlaneAdapter interface

```typescript
/** All Plane types below are adapter-internal — not exported from integrations/plane package public API */

interface PlaneAdapter {
  // ── Infrastructure ──────────────────────────────────────
  health(ctx: AdapterContext): Promise<AdapterHealthResult>;
  getEngineVersion(ctx: AdapterContext): Promise<string>;

  // ── Provisioning ────────────────────────────────────────
  provisionTenantWorkspace(
    ctx: AdapterContext,
    tenantId: string,
  ): Promise<TenantWorkspaceProvisionResult>;
  deprovisionTenantWorkspace(ctx: AdapterContext, tenantId: string): Promise<void>;

  // ── User mapping ────────────────────────────────────────
  syncUser(ctx: AdapterContext, platformUserId: string): Promise<PlaneUserRef>;

  // ── Projects ────────────────────────────────────────────
  createProject(
    ctx: AdapterContext,
    tenantId: string,
    input: PlaneCreateProjectPayload,
  ): Promise<PlaneProjectRecord>;
  getProject(ctx: AdapterContext, planeProjectId: string): Promise<PlaneProjectRecord>;
  listProjects(ctx: AdapterContext, tenantId: string): Promise<PlaneProjectRecord[]>;
  updateProject(
    ctx: AdapterContext,
    planeProjectId: string,
    input: PlaneUpdateProjectPayload,
  ): Promise<PlaneProjectRecord>;
  archiveProject(
    ctx: AdapterContext,
    planeProjectId: string,
  ): Promise<PlaneProjectRecord>;

  // ── Tasks (Plane Issues) ────────────────────────────────
  createTask(
    ctx: AdapterContext,
    planeProjectId: string,
    input: PlaneCreateIssuePayload,
  ): Promise<PlaneIssueRecord>;
  getTask(ctx: AdapterContext, planeIssueId: string): Promise<PlaneIssueRecord>;
  listTasks(
    ctx: AdapterContext,
    planeProjectId: string,
    filter?: PlaneIssueFilter,
  ): Promise<PlaneIssueRecord[]>;
  updateTask(
    ctx: AdapterContext,
    planeIssueId: string,
    input: PlaneUpdateIssuePayload,
  ): Promise<PlaneIssueRecord>;
  transitionTaskState(
    ctx: AdapterContext,
    planeIssueId: string,
    planeStateId: string,
  ): Promise<PlaneIssueRecord>;
  assignTask(
    ctx: AdapterContext,
    planeIssueId: string,
    planeUserId: string | null,
  ): Promise<PlaneIssueRecord>;
  reorderBacklog(
    ctx: AdapterContext,
    planeProjectId: string,
    orderedPlaneIssueIds: string[],
  ): Promise<void>;

  // ── Sprints (Plane Cycles) ──────────────────────────────
  createSprint(
    ctx: AdapterContext,
    planeProjectId: string,
    input: PlaneCreateCyclePayload,
  ): Promise<PlaneCycleRecord>;
  listSprints(ctx: AdapterContext, planeProjectId: string): Promise<PlaneCycleRecord[]>;
  getSprint(ctx: AdapterContext, planeCycleId: string): Promise<PlaneCycleRecord>;
  startSprint(ctx: AdapterContext, planeCycleId: string): Promise<PlaneCycleRecord>;
  completeSprint(ctx: AdapterContext, planeCycleId: string): Promise<PlaneCycleRecord>;
  assignIssuesToSprint(
    ctx: AdapterContext,
    planeCycleId: string,
    planeIssueIds: string[],
  ): Promise<void>;

  // ── Milestones ──────────────────────────────────────────
  listMilestones(
    ctx: AdapterContext,
    planeProjectId: string,
  ): Promise<PlaneMilestoneRecord[]>;
  createMilestone(
    ctx: AdapterContext,
    planeProjectId: string,
    input: PlaneCreateMilestonePayload,
  ): Promise<PlaneMilestoneRecord>;

  // ── Team ────────────────────────────────────────────────
  listTeam(ctx: AdapterContext, planeProjectId: string): Promise<PlaneMemberRecord[]>;
  addTeamMember(
    ctx: AdapterContext,
    planeProjectId: string,
    planeUserId: string,
    role: PlaneMemberRole,
  ): Promise<PlaneMemberRecord>;
  removeTeamMember(
    ctx: AdapterContext,
    planeProjectId: string,
    planeUserId: string,
  ): Promise<void>;

  // ── Statuses & Labels ───────────────────────────────────
  listStates(ctx: AdapterContext, planeProjectId: string): Promise<PlaneStateRecord[]>;
  listLabels(ctx: AdapterContext, planeProjectId: string): Promise<PlaneLabelRecord[]>;

  // ── Comments & Attachments ──────────────────────────────
  listComments(
    ctx: AdapterContext,
    planeIssueId: string,
  ): Promise<PlaneCommentRecord[]>;
  addComment(
    ctx: AdapterContext,
    planeIssueId: string,
    input: PlaneCreateCommentPayload,
  ): Promise<PlaneCommentRecord>;
  listAttachments(
    ctx: AdapterContext,
    planeIssueId: string,
  ): Promise<PlaneAttachmentRecord[]>;

  // ── Activity (internal ingest) ──────────────────────────
  listIssueActivity(
    ctx: AdapterContext,
    planeIssueId: string,
  ): Promise<PlaneActivityRecord[]>;

  // ── Mapping helpers (used by service layer) ─────────────
  toProject(dto: PlaneProjectRecord, mapping: EntityMapping): Project;
  toTask(dto: PlaneIssueRecord, mapping: EntityMapping): Task;
  toSprint(dto: PlaneCycleRecord, mapping: EntityMapping): Sprint;
  toMilestone(dto: PlaneMilestoneRecord, mapping: EntityMapping): Milestone;
  toTeamMember(dto: PlaneMemberRecord, mapping: EntityMapping): TeamMember;
  toStatus(dto: PlaneStateRecord): Status;
  toLabel(dto: PlaneLabelRecord): Label;
  toComment(dto: PlaneCommentRecord): Comment;
  toAttachment(dto: PlaneAttachmentRecord): Attachment;
  toActivityEntry(dto: PlaneActivityRecord, mapping: EntityMapping): ActivityEntry;
}
```

Types `Project`, `Task`, etc. are imported from the **ProjectService domain** — adapter maps Plane records → APZHUB DTOs via `to*` methods.

---

## Mapper responsibilities

| Mapper             | Plane source            | APZHUB target   | Notes                                      |
| ------------------ | ----------------------- | --------------- | ------------------------------------------ |
| `projectMapper`    | `PlaneProjectRecord`    | `Project`       | Map `archived_at` → `archived` status      |
| `taskMapper`       | `PlaneIssueRecord`      | `Task`          | Issue → Task; never expose `issue` in name |
| `sprintMapper`     | `PlaneCycleRecord`      | `Sprint`        | Cycle → Sprint                             |
| `statusMapper`     | `PlaneStateRecord`      | `Status`        | State → Status                             |
| `teamMapper`       | `PlaneMemberRecord`     | `TeamMember`    | Translate Plane role → `TeamRole`          |
| `labelMapper`      | `PlaneLabelRecord`      | `Label`         | Direct                                     |
| `commentMapper`    | `PlaneCommentRecord`    | `Comment`       | Strip Plane HTML if needed                 |
| `attachmentMapper` | `PlaneAttachmentRecord` | `Attachment`    | Platform-mediated URL                      |
| `activityMapper`   | `PlaneActivityRecord`   | `ActivityEntry` | Map Plane verb → APZHUB action key         |

Mappers live in `integrations/plane/src/mappers/` — not exported.

---

## Entity mapping store (contract)

Adapter reads/writes mapping via `EntityMappingRepository` (platform-side):

```typescript
interface EntityMapping {
  readonly platformId: string;
  readonly planeId: string;
  readonly entityType: "project" | "task" | "sprint" | "milestone" | "label" | "status";
  readonly tenantId: string;
  readonly syncVersion: number;
}
```

ProjectService owns repository interface; adapter receives resolved `planeId` for calls or creates mapping on provision.

---

## Authentication bridge

| Operation                | Auth mode                                |
| ------------------------ | ---------------------------------------- |
| Health, provision        | Service token                            |
| User-attributed mutation | Service token + user mapping             |
| Read                     | Service token scoped to tenant workspace |

Tokens resolved from config/Vault — never passed through service interface strings.

---

## Error translation

Adapter throws `AdapterError` with platform category — ProjectService catches and maps to API envelope.

| Plane HTTP   | AdapterError code     |
| ------------ | --------------------- |
| 401, 403     | `FORBIDDEN`           |
| 404          | `NOT_FOUND`           |
| 409          | `CONFLICT`            |
| 422          | `VALIDATION_ERROR`    |
| 429          | `RATE_LIMITED`        |
| 5xx, timeout | `SERVICE_UNAVAILABLE` |

Raw Plane response body never propagated.

---

## Plane event ingestion (internal)

When Plane webhooks or poll sync are used (OSS-101-04+), adapter normalizes to internal `PlaneDomainEvent` — **not exported**:

```typescript
/** INTERNAL — adapter only */
type PlaneDomainEvent =
  | { type: 'plane.issue.created'; planeIssueId: string; ... }
  | { type: 'plane.issue.updated'; ... }
  | { type: 'plane.cycle.started'; ... };
```

ProjectService converts to canonical APZHUB events — see Event Mapping Specification.

---

## Health and diagnostics

```typescript
interface AdapterHealthResult {
  readonly status: "healthy" | "degraded" | "unavailable";
  readonly latencyMs: number;
  readonly engineVersion: string;
  readonly lastSuccessfulSync?: string;
  readonly errorCount24h: number;
}
```

Reported to operations control plane via bootstrap extension.

---

## Version compatibility

Declared in `integration.yaml`:

```yaml
engine:
  name: plane
  edition: community
  supportedVersions:
    min: "0.23.0" # TBD at OSS-101-02
    max: "0.24.x"
```

---

## Import rules (enforced at architecture review)

| Package                    | May import `integrations/plane`    |
| -------------------------- | ---------------------------------- |
| `services/project-service` | `PlaneAdapter` interface type only |
| `modules/projects`         | **Never**                          |
| `apps/web` route handlers  | `ProjectService` only              |
| `integrations/plane`       | `PlaneClient`, Plane types         |

---

## Related

- [ProjectService Specification](./APZHUB-ProjectService-Specification.md)
- [Event Mapping Specification](./APZHUB-Projects-Event-Mapping-Specification.md)
- [Plane Adapter Design](../architecture/APZHUB-Plane-Adapter-Design.md)
