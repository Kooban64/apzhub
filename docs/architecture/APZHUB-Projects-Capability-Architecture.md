# APZHUB Projects Capability Architecture

**Milestone:** OSS-101-01  
**Status:** **Canonical** — permanent contract between Platform Core, APZHUB Projects, and Plane  
**Authority:** [Capability Abstraction Standard](./APZHUB-Capability-Abstraction-Standard.md) · [ADR-0047](../adr/ADR-0047-projects-plane-integration-architecture.md) · [Document 002](../002-product-naming-positioning-terminology-standard.md)

---

## Purpose

This document is the **permanent architectural contract** for the APZHUB **Projects** capability. It defines how Platform Core, the Projects module, `ProjectService`, and the Plane engine interact.

Users experience **Projects**. Plane is the hidden engine. No layer above the adapter may depend on Plane models or terminology.

**Supersedes for contract detail:** OSS-101 planning docs remain reference; this document is authoritative for implementation (OSS-101-02+).

---

## Architectural invariant

```text
Workbench (projects)  →  ProjectService  →  PlaneAdapter  →  Plane CE
         ↑                      ↑                  ↑
    APZHUB DTOs only      APZHUB domain only   Plane types OK here only
```

**Prohibited:** Module → PlaneAdapter · Module → Plane API · ProjectService → Plane types in public interface · Plane terminology in API/UI.

---

## Layer boundaries

| Layer | Package (planned) | Responsibility | May import |
|-------|-------------------|----------------|------------|
| **Presentation** | `modules/projects/` | Workbench UI, routing, presentation state | `ProjectService` client API, design system, platform prefs |
| **Application** | `services/project-service/` | `ProjectService` — orchestration, validation, permissions, audit, events | `PlaneAdapter` **interface** only; Platform Core SDKs |
| **Adapter** | `integrations/plane/` | Translation, provisioning, health, error mapping | `PlaneClient`, Plane DTOs (internal) |
| **Engine** | Plane CE (external) | SoR for project domain | — |

### Domain service boundaries

| Concern | Owner | Not owned by |
|---------|-------|--------------|
| Business rules (who can transition task) | ProjectService | Adapter, Module |
| Permission checks | ProjectService (+ Authorization) | Adapter |
| Audit trail | ProjectService | Adapter |
| Event publication (APZHUB names) | ProjectService | Module |
| Entity ID mapping | PlaneAdapter + platform metadata repo | Module |
| Plane API calls | PlaneAdapter | ProjectService (except via interface) |
| DTO → Plane payload translation | PlaneAdapter | ProjectService |
| Plane → APZHUB DTO translation | PlaneAdapter | Module |
| Search index content | Search subscriber (async) | Adapter direct |
| Notification delivery | Notification Framework | Module, Adapter |
| UI state, filters, layout | Module + Personalisation | Service |

---

## Component registry

| Component | ID | Manifest |
|-----------|-----|----------|
| Module | `projects` | `module.yaml` |
| Service | `project-service` | `service.yaml` |
| Integration | `plane` | `integration.yaml` |
| Capability (governance) | `projects` | governance registration |

---

## ProjectService contract (summary)

Full specification: [ProjectService Specification](../specs/APZHUB-ProjectService-Specification.md).

- Vendor-neutral interface — APZHUB terminology only
- Stable contract for module UI and cross-product links (QE, Kimai, etc.)
- Replacement of Plane requires new adapter only

---

## PlaneAdapter contract (summary)

Full specification: [PlaneAdapter Specification](../specs/APZHUB-PlaneAdapter-Specification.md).

- Owns all Plane ↔ APZHUB translation
- Plane Issue → Task, Cycle → Sprint, State → Status, etc.
- Rest of platform never imports Plane types

---

## Domain lifecycles (summary)

Full specification: [Domain Lifecycle Specification](../specs/APZHUB-Projects-Domain-Lifecycle-Specification.md).

| Entity | APZHUB lifecycle states |
|--------|-------------------------|
| Project | `draft` · `active` · `on_hold` · `completed` · `archived` |
| Task | `open` · `in_progress` · `blocked` · `done` · `cancelled` |
| Sprint | `planned` · `active` · `completed` · `cancelled` |

Participates in **Platform Lifecycle** (PRH-009) as registered product `projects`.

---

## Events (summary)

Full specification: [Event Mapping Specification](../specs/APZHUB-Projects-Event-Mapping-Specification.md).

- Canonical events: `project.created`, `task.status_changed`, etc.
- Plane webhook/poll event names **never** leave adapter
- ProjectService publishes platform envelope events only

---

## Capability registration model

Projects registers with Platform Core as follows. No duplicate implementations.

### Workbench

| Registration | Mechanism | Detail |
|--------------|-----------|--------|
| Activity Bar | `module.yaml` → Module Registry | Label: Projects; permission: `projects.view` |
| Sidebar routes | `module.yaml` navigation | Dashboard, list, my work, project context |
| Workspaces | Workbench manager | Board, backlog, sprint, roadmap views |
| Commands | Action Framework (future) | Create project/task — permission-filtered |

### Search (020)

| Field | Value |
|-------|-------|
| Provider ID | `projects-search` |
| Index scope | Project name, task title, description, labels |
| Trigger | Subscribe to `project.*`, `task.*` events |
| Query | Permission-filtered at query time |
| SoR | Derived index — Plane not queried from search UI |

### Knowledge (020)

| Field | Value |
|-------|-------|
| Provider ID | `projects-knowledge` |
| Experiences | Project knowledge panel; task ↔ document links |
| Trigger | Link events + manual registration via service |

### Notifications (021)

| Field | Value |
|-------|-------|
| Routes | Registered in notification catalogue |
| Source | ProjectService publishes domain events |
| Examples | `task.assigned`, `task.status_changed`, `project.member_added` |

### Activity (007)

| Field | Value |
|-------|-------|
| Mapper ID | `projects-activity` |
| Source events | All `project.*`, `task.*`, `sprint.*` |
| Presentation | Project activity view; global activity feed |

### Operations (PRH-008)

| Field | Value |
|-------|-------|
| Capability ID | `projects` |
| Connector ID | `plane` |
| Health | Adapter probe → control plane |
| Metrics | Latency, error rate, sync lag |

### Lifecycle (PRH-009)

| Field | Value |
|-------|-------|
| Product ID | `projects` |
| Behaviour | Maintenance: read-only + queued writes; degraded: cache reads |
| Registration | `platform-lifecycle` product registry |

### Diagnostics

| Field | Value |
|-------|-------|
| Extension | Bootstrap loader extension `projectsDiagnostics` |
| Payload | Connector health, last sync, engine version (masked) |

### Governance

| Field | Value |
|-------|-------|
| Capability ID | `projects` |
| Feature flag | `capability.projects.enabled` per tenant |
| Entitlement | Commercial tier mapping (future) |

### Provisioning

| Field | Value |
|-------|-------|
| Trigger | Governance enables capability for tenant |
| Action | `PlaneAdapter.provisionTenantWorkspace()` |
| Metadata | Tenant ↔ Plane workspace mapping stored platform-side |

### Platform Core consumption (complete)

| Capability | Usage |
|------------|-------|
| Identity | User mapping for assignees, team |
| Authorization | All mutations gated |
| Personalisation | Dashboard, my work, board prefs |
| Governance | Enablement |
| Provisioning | Workspace provision |
| Security | API guards, session |
| Configuration | Engine URL, token refs |
| Traffic Governance | Rate limits on `/projects` APIs |
| Operations | Control plane |
| Lifecycle | Product registration |
| Search | Provider |
| Knowledge | Provider |
| Notifications | Routes |
| Activity | Mappers |
| API Framework | Gateway envelope |
| Workbench | Module shell |

---

## Data strategy

| Data class | SoR | Location |
|------------|-----|----------|
| Project, task, sprint, team domain | Plane | Plane PostgreSQL |
| Platform global IDs, mappings | Platform | Platform PostgreSQL (OSS-101-04+) |
| Search index | Derived | Platform search store |
| Activity feed | Derived | Activity framework |
| Audit | Platform | Platform audit store |

Sync: write-through on mutation; async projections via outbox (PCv2-02).

---

## Integration strategy (locked)

| Approach | Decision |
|----------|----------|
| Native APZHUB UI | **Required** |
| Plane UI for users | **Prohibited** |
| Plane API | Adapter only |
| Replacement | New adapter; same `ProjectService` interface |

---

## Related documents

| Document | Purpose |
|----------|---------|
| [ProjectService Specification](../specs/APZHUB-ProjectService-Specification.md) | Vendor-neutral service contract |
| [PlaneAdapter Specification](../specs/APZHUB-PlaneAdapter-Specification.md) | Translation boundary |
| [Domain Lifecycle Specification](../specs/APZHUB-Projects-Domain-Lifecycle-Specification.md) | Entity state machines |
| [Event Mapping Specification](../specs/APZHUB-Projects-Event-Mapping-Specification.md) | Canonical events |
| [Projects Workbench UX](../specs/APZHUB-Projects-Workbench-UX.md) | UI planning (OSS-101) |
| [ADR-0047](../adr/ADR-0047-projects-plane-integration-architecture.md) | Decision record |

---

## Implementation gate

**OSS-101-01 complete.** Await owner approval before **OSS-101-02** (Plane environment and configuration).

No REST client, Plane deployment, UI, or schema until subsequent phases.
