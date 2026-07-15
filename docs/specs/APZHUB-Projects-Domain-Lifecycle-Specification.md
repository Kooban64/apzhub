# APZHUB Projects Domain Lifecycle Specification

**Milestone:** OSS-101-01  
**Status:** Canonical entity lifecycle model — **specification only**  
**Authority:** [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md) · [Platform Lifecycle](../architecture/APZHUB-Lifecycle-State-Machine.md)

---

## Purpose

Define APZHUB domain lifecycle states for **Projects**, **Tasks**, and **Sprints**, and specify how the Projects capability participates in **Platform Lifecycle** (PRH-009).

All states use **APZHUB terminology**. Plane state names are translated in the adapter — never exposed.

---

## Project lifecycle

### States

| State | Description | User-visible |
|-------|-------------|--------------|
| `draft` | Created but not yet active | Yes |
| `active` | Normal operating state | Yes |
| `on_hold` | Paused; no sprint starts | Yes |
| `completed` | Delivered; read-heavy | Yes |
| `archived` | Hidden from default lists; read-only | Yes |

### Transitions

```text
draft ──► active ──► on_hold ◄──► active
              │         │
              ▼         ▼
         completed ──► archived
              │
              └──► archived (direct)
```

| From | To | Permission | Adapter action |
|------|-----|------------|----------------|
| `draft` | `active` | `projects.edit` | Activate Plane project |
| `active` | `on_hold` | `projects.edit` | Update project metadata |
| `on_hold` | `active` | `projects.edit` | Update project metadata |
| `active` | `completed` | `projects.edit` | Mark complete |
| `*` | `archived` | `projects.admin` | Archive Plane project |

### Events

- `project.created` (initial state: `draft` or `active` per policy)
- `project.status_changed` (payload: `from`, `to`)
- `project.archived`

---

## Task lifecycle

### States

| State | Description | Maps from Plane |
|-------|-------------|-----------------|
| `open` | Not started | State group: backlog/todo |
| `in_progress` | Active work | State group: in progress |
| `blocked` | Cannot proceed | Custom blocked state or label |
| `done` | Complete | State group: done |
| `cancelled` | Will not do | Cancelled state |

### Transitions

```text
open ──► in_progress ──► done
  │           │
  │           ├──► blocked ──► in_progress
  │           │
  └──► cancelled
  │
  └──► done (fast-close where permitted)
```

| From | To | Permission | Notes |
|------|-----|------------|-------|
| `open` | `in_progress` | `tasks.transition` | Board drag or menu |
| `in_progress` | `done` | `tasks.transition` | |
| `*` | `blocked` | `tasks.transition` | Optional comment |
| `blocked` | `in_progress` | `tasks.transition` | |
| `*` | `cancelled` | `tasks.edit` | Admin or owner |

**Mapping rule:** Adapter maps Plane **State** + **State group** → APZHUB `TaskStatus`. Multiple Plane states may map to one APZHUB status; reverse mapping uses `StatusId`.

### Events

- `task.created` (initial: `open`)
- `task.status_changed`
- `task.assigned`
- `task.completed` (when `to === done`)

---

## Sprint lifecycle

### States

| State | Description | Plane Cycle equivalent |
|-------|-------------|------------------------|
| `planned` | Defined, not started | Upcoming cycle |
| `active` | Current sprint | Active cycle |
| `completed` | Closed | Completed cycle |
| `cancelled` | Abandoned | Deleted/archived cycle |

### Transitions

```text
planned ──► active ──► completed
    │
    └──► cancelled
```

| From | To | Permission | Business rule |
|------|-----|------------|---------------|
| `planned` | `active` | `sprints.manage` | Only one `active` sprint per project (service rule) |
| `active` | `completed` | `sprints.manage` | Incomplete tasks remain or move to backlog (policy) |
| `planned` | `cancelled` | `sprints.manage` | |

### Events

- `sprint.created`
- `sprint.started`
- `sprint.completed`
- `sprint.cancelled`

---

## Platform Lifecycle participation

Projects registers as lifecycle **product** `projects`.

### Registration

```typescript
interface LifecycleProductRegistration {
  readonly productId: 'projects';
  readonly displayName: 'Projects';
  readonly capabilityId: 'projects';
  readonly connectorId: 'plane';
}
```

### Platform state → Projects behaviour

| Platform lifecycle state | Projects behaviour |
|--------------------------|-------------------|
| `operational` | Full read/write |
| `maintenance` | Read allowed; writes queued to outbox; user message: maintenance |
| `degraded` | Read from cache if fresh; writes queued or rejected per policy |
| `recovering` | Replay outbox; reconcile mappings |
| `stopped` | All requests fail closed with `SERVICE_UNAVAILABLE` |

### Service obligations

1. Register with `@apzhub/platform-lifecycle` on bootstrap
2. Expose `getProductHealth()` → delegates to PlaneAdapter health
3. Honor lifecycle callbacks: `onMaintenanceEnter`, `onOperationalEnter`, `onRecoveringEnter`
4. Pause reconciliation jobs during maintenance; resume on operational

### Diagnostics integration

Lifecycle manager reads connector health from operations control plane entry `projects`/`plane`.

---

## Milestone lifecycle (reference)

| State | Description |
|-------|-------------|
| `open` | Target not yet reached |
| `completed` | Milestone achieved |

Event: `milestone.completed`.

---

## Lifecycle vs workflow

| Concept | Scope |
|---------|-------|
| **Domain lifecycle** (this doc) | Project, task, sprint business states |
| **Platform lifecycle** (PRH-009) | Platform operational mode |
| **Task workflow** | Per-project status columns (Status entities) — configurable via Plane states, exposed as APZHUB Status |

---

## Validation rules (ProjectService)

| Rule | Enforcement |
|------|-------------|
| Cannot archive project with active sprint | Service rejects |
| Cannot delete team lead without replacement | Service rejects |
| Task transition must target valid StatusId for project | Service validates before adapter |
| Sprint start requires at least planned dates or name | Service validates |

---

## Related

- [ProjectService Specification](./APZHUB-ProjectService-Specification.md)
- [Event Mapping Specification](./APZHUB-Projects-Event-Mapping-Specification.md)
- [Platform Lifecycle Architecture](../architecture/APZHUB-Platform-Lifecycle-Architecture.md)
