# APZHUB Projects / Plane Reference Architecture

**Milestone:** OSS-101  
**Status:** Wave 1 **certified** (OSS-101-10) — Reference Adapter live; Projects UI still deferred  
**Authority:** [Capability Abstraction Standard](./APZHUB-Capability-Abstraction-Standard.md) · [Adapter Boundary Pattern](./APZHUB-Adapter-Boundary-Pattern.md) · [Reference Adapter Standard](./REFERENCE-ADAPTER-STANDARD.md) · [Document 002](../002-product-naming-positioning-terminology-standard.md)

---

## Executive summary

APZHUB **Projects** is the user-facing capability for project and work management. **Plane** is the underlying OSS engine — never exposed to standard users. All interaction flows through native APZHUB Workbench UI, `ProjectService`, and `PlaneAdapter`.

**Preferred integration direction:** Native APZHUB UI over Plane CE REST API. No raw Plane UI for normal users.

---

## Architecture overview

```text
┌────────────────────────────────────────────────────────────────────┐
│  Projects Workbench Module (module.yaml: projects)                  │
│  Dashboard · List · Detail · Board · Sprint · Backlog · Roadmap     │
└───────────────────────────────┬────────────────────────────────────┘
                                │ Platform API Gateway only
┌───────────────────────────────▼────────────────────────────────────┐
│  ProjectService (service.yaml)                                     │
│  Validation · Permissions · Audit · Events · Business rules          │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│  PlaneAdapter (integration.yaml)                                   │
│  Auth bridge · Mapping · Provisioning · Health · Error translation │
└───────────────────────────────┬────────────────────────────────────┘
                                │ Internal only
┌───────────────────────────────▼────────────────────────────────────┐
│  Plane CE (self-hosted) — REST API                                 │
│  Workspace · Projects · Issues · Cycles · Modules · States         │
└────────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────────┐
         │  Platform Core (no duplication)           │
         │  Identity · Authz · Governance · Events   │
         │  Search · Notify · Activity · Ops · Lifecycle │
         └──────────────────────────────────────────┘
```

---

## Component definitions

### Projects Workbench module

| Attribute          | Value                               |
| ------------------ | ----------------------------------- |
| Module ID          | `projects`                          |
| User-facing name   | Projects                            |
| Type               | OSS-backed product module           |
| Location (planned) | `modules/projects/`                 |
| UI strategy        | **100% native APZHUB Workbench UI** |

Presentation only — calls `ProjectService` APIs; never imports `PlaneAdapter` or `PlaneClient`.

### ProjectService

| Attribute          | Value                                                 |
| ------------------ | ----------------------------------------------------- |
| Service ID         | `project-service`                                     |
| Interface          | `ProjectService`                                      |
| Location (planned) | `services/project-service/`                           |
| SoR                | **Plane** for project/work-item domain data           |
| Platform metadata  | Tenant↔workspace mapping, entity ID map, sync cursors |

Owns orchestration, permission checks, validation, audit, event publication, and search/activity projection triggers.

### PlaneAdapter

| Attribute          | Value                                 |
| ------------------ | ------------------------------------- |
| Integration ID     | `plane`                               |
| Location (planned) | `integrations/plane/`                 |
| API                | Plane CE REST (version-pinned)        |
| Client             | `PlaneClient` — adapter-internal only |

Implements [Adapter Boundary Pattern](./APZHUB-Adapter-Boundary-Pattern.md) — no business rules.

---

## Authentication bridge

| Layer           | Mechanism                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| User session    | Better Auth — single APZHUB login                                                                             |
| User → Plane    | JIT user mapping; adapter obtains Plane user token or acts via service account with user attribution in audit |
| Service account | Per-tenant Plane API token in Vault (PCv2-04); rotated via config governance                                  |
| SSO             | No user-visible Plane login — silent bridge per Document 007                                                  |
| Superadmin      | Operator diagnostics may use masked engine connectivity check — not user impersonation in Plane UI            |

---

## Tenant mapping

```text
Platform Tenant (authoritative)
    └── 1:1 ──► Plane Workspace (connector-internal ID)
                    └── 1:N ──► Plane Projects
                                    └── 1:N ──► Plane Issues (Tasks)
```

- Platform tenant ID stored in governance/provisioning metadata
- Plane workspace ID is connector-internal — mapped in platform PostgreSQL reference table
- `validateUserTenantMembership` before every tenant-scoped operation
- Cross-tenant access impossible at service layer

---

## Permission mapping

| APZHUB permission (illustrative) | Plane capability (internal) |
| -------------------------------- | --------------------------- |
| `projects.view`                  | Project guest/member read   |
| `projects.edit`                  | Project member write        |
| `projects.admin`                 | Project admin               |
| `projects.create`                | Workspace project create    |
| `tasks.assign`                   | Issue assignee update       |
| `tasks.transition`               | Issue state change          |

Plane role names **never** appear in UI or API responses. Translation occurs in `ProjectService` before adapter calls.

---

## Provisioning

### Tenant provisioning

1. Governance enables `projects` capability for tenant
2. Platform Provisioning invokes `PlaneAdapter.provision(tenantId)`
3. Adapter creates Plane workspace (idempotent)
4. Platform stores workspace mapping + connection config ref

### Project provisioning

1. User creates project via APZHUB UI
2. `ProjectService` validates permission + tenant
3. Adapter creates Plane project in tenant workspace
4. Entity mapping row: platform project ID ↔ Plane project ID
5. Event: `project.created`

### Module provisioning

- Plane **Module** (feature area) provisioned on project create with defaults or on first use
- APZHUB "Project Module" maps to Plane module — user sees APZHUB terminology

---

## Plane API usage (planned)

| Operation          | Plane API (CE REST)                    | APZHUB API                                 |
| ------------------ | -------------------------------------- | ------------------------------------------ |
| List projects      | `GET /api/workspaces/{slug}/projects/` | `GET /api/platform/v1/projects`            |
| Get project        | `GET .../projects/{id}/`               | `GET /api/platform/v1/projects/{id}`       |
| Create project     | `POST .../projects/`                   | `POST /api/platform/v1/projects`           |
| List issues        | `GET .../issues/`                      | `GET /api/platform/v1/projects/{id}/tasks` |
| Update issue state | `PATCH .../issues/{id}/`               | `PATCH /api/platform/v1/tasks/{id}`        |
| Cycles             | `GET/POST .../cycles/`                 | `GET/POST .../projects/{id}/sprints`       |
| Modules            | `GET/POST .../modules/`                | `GET/POST .../projects/{id}/modules`       |
| Members            | `GET/POST .../members/`                | `GET/POST .../projects/{id}/team`          |

Exact endpoint mapping finalized in OSS-101-04 adapter design implementation.

---

## Diagnostics

| Signal           | Source                                     |
| ---------------- | ------------------------------------------ |
| Connector health | PlaneAdapter health probe                  |
| API latency p95  | Adapter metrics                            |
| Sync lag         | Outbox consumer cursor vs Plane updated_at |
| Error rate       | Adapter error translation counts           |
| Engine version   | Plane version probe                        |

Registered in operations control plane under capability `projects` / connector `plane`.

---

## Lifecycle participation

- Register `projects` as lifecycle product
- **Maintenance:** read-only mode; queue mutations via outbox
- **Degraded:** serve cached project list; block writes with user message
- **Recovery:** replay outbox; reconcile entity mapping

---

## Operations control plane integration

| Field            | Value                                                            |
| ---------------- | ---------------------------------------------------------------- |
| Capability ID    | `projects`                                                       |
| Connector ID     | `plane`                                                          |
| Health hierarchy | Platform → tenant → module → service → connector → engine        |
| Operator actions | Force sync, view diagnostics, toggle degraded (governance-gated) |

---

## Platform Core consumption

| Platform capability     | Projects usage                                   |
| ----------------------- | ------------------------------------------------ |
| Identity                | Tenant + user mapping                            |
| Authorization           | Permission checks; role translation              |
| Personalisation         | Dashboard layout, board filters, recent projects |
| Governance              | Capability enablement per tenant                 |
| Provisioning            | Workspace + project provisioning                 |
| Security                | API guards, session, traffic policies            |
| Configuration           | Engine URL, token refs (masked)                  |
| Traffic Governance      | Rate limits on project APIs                      |
| Operations              | Connector health in control plane                |
| Lifecycle               | Product registration; maintenance behaviour      |
| Search (020)            | Project/task search provider                     |
| Knowledge (020)         | Link tasks to documents, matters                 |
| Notifications (021)     | Assignment, status change, comment               |
| Activity (007)          | Issue lifecycle timeline                         |
| API Framework (010)     | Gateway envelope, correlation IDs                |
| Workbench (005/016/017) | Module registration, navigation                  |

**No duplication** of identity, auth, search, notify, audit, or ops.

---

## Integration strategy summary

| Approach                     | Decision                                                               |
| ---------------------------- | ---------------------------------------------------------------------- |
| Deep link to Plane           | **Prohibited** for standard users                                      |
| Embedded Plane UI            | **Prohibited** for standard users                                      |
| Native APZHUB UI + Plane API | **Required**                                                           |
| Plane admin UI               | Operator-only (if ever needed) — Administration workspace              |
| Replacement                  | New adapter implementing `ProjectService`; stable module/API contracts |

See [Projects Workbench UX](../specs/APZHUB-Projects-Workbench-UX.md).

---

## Data strategy summary

| Concern           | Decision                                                        |
| ----------------- | --------------------------------------------------------------- |
| SoR               | Plane for project/task domain                                   |
| Platform metadata | Mappings, sync cursors, cache TTL refs                          |
| Sync              | Write-through on mutation; async projection for search/activity |
| Cache             | Short-lived read cache in service; invalidated on events        |
| Search            | Derived index — not SoR                                         |
| Failure           | Outbox retry; fail closed on auth/tenant errors                 |

See [Projects Domain Mapping](./APZHUB-Projects-Domain-Mapping.md) and [Plane Adapter Design](./APZHUB-Plane-Adapter-Design.md).

---

## Prerequisites

| Gate                | Status                                    |
| ------------------- | ----------------------------------------- |
| OSS-001 / OSS-002   | Complete                                  |
| OSS-101 planning    | This document                             |
| PCv2-02 Workers     | Required before OSS-101-04 implementation |
| M17 CI/CD           | Required before OSS-101-10                |
| OSS-101-01 approval | Required before any implementation        |

---

## Related

- [Projects Domain Mapping](./APZHUB-Projects-Domain-Mapping.md)
- [Plane Adapter Design](./APZHUB-Plane-Adapter-Design.md)
- [Projects Workbench UX](../specs/APZHUB-Projects-Workbench-UX.md)
- [OSS-101 Backlog](../backlog/OSS-101-Plane-Integration-Backlog.md)
