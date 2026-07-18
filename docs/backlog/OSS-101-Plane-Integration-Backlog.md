# OSS-101 Plane Integration Backlog

**Milestone:** OSS-101 — planning backlog  
**Status:** Phased implementation plan — **no code until OSS-101-01 approved**  
**Authority:** [Projects Plane Reference Architecture](../architecture/APZHUB-Projects-Plane-Reference-Architecture.md)

---

## Prerequisites

| Gate                      | Required before           |
| ------------------------- | ------------------------- |
| OSS-101 planning complete | OSS-101-01                |
| PCv2-02 Workers           | OSS-101-04+ (outbox/sync) |
| M17 CI/CD                 | OSS-101-10                |
| Owner approval            | Each phase                |

---

## Phase overview

| Phase | ID         | Theme                                                |
| ----- | ---------- | ---------------------------------------------------- |
| 1     | OSS-101-01 | Architecture & ADR                                   |
| 2     | OSS-101-02 | Plane environment and configuration                  |
| 3     | OSS-101-03 | Projects capability manifest                         |
| 4     | OSS-101-04 | Plane adapter foundation                             |
| 5     | OSS-101-05 | Project list/detail                                  |
| 6     | OSS-101-06 | Task board                                           |
| 7     | OSS-101-07 | Plane collaboration & project intelligence           |
| 8     | OSS-101-08 | Plane synchronisation, events & production readiness |
| 9     | OSS-101-09 | Plane operations, diagnostics & certification        |
| 10    | OSS-101-10 | E2E validation and closeout                          |

---

## OSS-101-01 — Architecture & ADR

**Status:** ✅ **Complete** — [OSS-101-01 Completion Report](../sprint/OSS-101-01-completion-report.md) · [ADR-0047](../adr/ADR-0047-projects-plane-integration-architecture.md)

**Deliverables:** Projects Capability Architecture, ProjectService spec, PlaneAdapter spec, Domain Lifecycle spec, Event Mapping spec.

**Stop condition:** ✅ Complete — await owner approval before OSS-101-02.

---

## OSS-101-02 — Plane environment and configuration

**Status:** ✅ **Complete** — [OSS-101-02 Completion Report](../sprint/OSS-101-02-completion-report.md)

**Deliverables:** `@apzhub/config` Plane registry entries, config diagnostics scaffold, environment/deployment docs.

**Stop condition:** ✅ Complete — await owner approval before OSS-101-03.

---

## OSS-101-03 — Projects capability manifest

**Status:** ✅ **Complete** — [OSS-101-03 Completion Report](../sprint/OSS-101-03-completion-report.md)

**Deliverables:** `project-service` service manifest, `projects` module manifest, `plane` integration manifest, eight event manifests, manifest validation tests, governance/registration notes.

**Stop condition:** ✅ Complete — await owner approval before OSS-101-04.

**Prerequisite:** OSS-100-05 (AdapterBase) must complete before OSS-101-04 begins.

---

## OSS-101-03 — Projects capability manifest (archive)

**Objective:** Author manifests and service interface before implementation.

**Scope:**

- `integration.yaml` for `plane`
- `service.yaml` for `project-service`
- `module.yaml` for `projects`
- Initial `event.yaml` entries (project._, task._)
- Permission definitions
- Governance capability registration metadata
- API contract sketch (OpenAPI planning doc)

**Out of scope:**

- Adapter implementation
- UI components
- Database migrations (mapping table design only)

**Platform capabilities consumed:**

- Platform Runtime, Governance, Authorization registry

**Tests:**

- Manifest schema validation tests
- Permission manifest lint

**Deliverables:**

- Approved manifests
- API contract planning spec
- OSS-101-03 completion report

**Stop condition:** Manifests reviewed; await approval before OSS-101-04.

---

## OSS-101-04 — Plane adapter foundation

**Status:** ✅ **Complete** — [OSS-101-04 Completion Report](../sprint/OSS-101-04-completion-report.md)

**Deliverables:** `@apzhub/integration-plane` package, `PlaneAdapter`, configuration, error translation, health/diagnostics, 24 unit tests (mocked API).

**Stop condition:** ✅ Complete — await owner approval before OSS-101-05.

---

## OSS-101-04 — Plane adapter foundation (archive)

**Objective:** Implement adapter skeleton with health, provisioning, and mapping store.

**Scope:**

- `integrations/plane/` package
- `PlaneClient` (REST)
- `PlaneAdapter` — health, provision workspace, entity mapping repository
- Auth bridge (service token)
- Error translation module
- Contract tests with mocked Plane

**Out of scope:**

- Full CRUD for tasks/projects
- UI
- Search projections

**Platform capabilities consumed:**

- Configuration, Bootstrap diagnostics, Operations registry, Provisioning, Identity (user mapping stub)

**Tests:**

- Contract tests
- Error translation tests
- Health probe tests
- Provisioning idempotency tests

**Deliverables:**

- Adapter foundation merged
- Connector registered in control plane (health only)
- OSS-101-04 completion report

**Stop condition:** Adapter health visible in ops console; await approval before OSS-101-05.

---

## OSS-101-05 — Plane core services

**Status:** ✅ **Complete** — [OSS-101-05 Completion Report](../sprint/OSS-101-05-completion-report.md)

**Deliverables:** `PlaneCoreServices` with seven entity APIs, canonical mapping, validation, paging/filter/sort, capability discovery, 13 contract tests (37 total in package).

**Stop condition:** ✅ Complete — await owner approval before OSS-101-06.

---

## OSS-101-05 — Plane core services (archive)

**Objective:** Transform Plane adapter into usable APZHUB Projects provider at adapter boundary.

**Scope:**

- Core service APIs: workspaces, projects, states, labels, cycles, modules, members
- CRUD + archive/delete where supported
- Paging, filtering, sorting, validation
- Entity mapping to APZHUB canonical models
- Contract tests with mocked Plane API

**Out of scope:**

- ProjectService platform layer
- UI / module shell
- Task/issue CRUD (OSS-101-06)

**Stop condition:** Adapter provider APIs complete; await approval before OSS-101-06.

---

## OSS-101-05 — Project list/detail (superseded scope note)

The backlog originally scoped OSS-101-05 as ProjectService + UI. Owner milestone **OSS-101-05 — Plane Core Services** delivered adapter-layer provider APIs first. Platform `ProjectService` + UI remain a separate track.

---

## OSS-101-05 — Project list/detail (archive)

**Objective:** Deliver first user-visible Projects views — list and project overview.

**Scope:**

- `ProjectService` — listProjects, getProject, createProject
- Platform API routes `/api/platform/v1/projects`
- Mapping store migration
- Module shell + project list + project detail overview
- Governance enablement wiring
- Basic audit + events (`project.created`)

**Out of scope:**

- Task board, sprints, backlog
- Search index (OSS-101-08)
- Comments

**Platform capabilities consumed:**

- Authorization, API Gateway, Audit, Events, Workbench, Personalisation (recent)

**Tests:**

- API integration tests
- Permission denial tests
- Playwright smoke: list + create project

**Deliverables:**

- Project list/detail UI
- OSS-101-05 completion report

**Stop condition:** Create and list projects via APZHUB UI only; await approval before OSS-101-06.

---

## OSS-101-06 — Plane Task / Issue Capability

**Status:** ✅ Complete (`@apzhub/integration-plane` v0.3.0)  
**Objective:** Plane adapter task/issue capability (canonical Task terminology).

**Scope delivered:**

- `PlaneTaskService` on `adapter.core.tasks`
- List/get/create/update/soft-archive
- State transitions with project-state validation
- Assignees, labels, cycle (sprint), module, parent
- Query filters, paging, sorting
- Mock API + contract tests
- Additive canonical Task contract fields

**Out of scope (deferred):**

- Platform `TaskServiceImpl` / mapping / gateway (OSS-110-08)
- Task HTTP routes / task-board UI
- Comments, attachments, notifications, search index

**Deliverables:**

- [PLANE-TASK-SERVICE.md](../../integrations/plane/docs/PLANE-TASK-SERVICE.md)
- [OSS-101-06 Completion Report](../sprint/OSS-101-06-completion-report.md)

**Stop condition:** ✅ Complete — await owner approval before OSS-110-08 (recommended) or OSS-101-07.

---

## OSS-101-07 — Plane Collaboration & Project Intelligence

> **Owner-approved scope (2026-07-10):** Collaboration & project intelligence on the Plane adapter.  
> Historical backlog title “Backlog and sprint views” is superseded for this delivery.

**Objective:** Expand Plane beyond CRUD with comments, activity, watchers, and read-only analytics.

**Scope:**

- `PlaneCommentService` (list/get/create/update/delete)
- `PlaneActivityService` (task + project activity, pagination, filtering)
- Watchers (list/add/remove via Plane subscribers)
- Project intelligence (progress, velocity, burn-down, distributions, workloads)
- Additive canonical DTOs only; adapter-only delivery

**Out of scope:**

- UI / Kanban / notifications / webhooks / realtime
- Attachments / documents / chat
- HTTP routes / PlatformService changes
- Zammad

**Tests:**

- Mocked contract tests for comments, activity, watchers, analytics
- Permission / provider failure / mapping / error translation

**Deliverables:**

- `@apzhub/integration-plane` v0.4.0 collaboration & intelligence
- [OSS-101-07 Completion Report](../sprint/OSS-101-07-completion-report.md)

**Stop condition:** ✅ Complete — await owner approval before OSS-101-08.

---

## OSS-101-08 — Plane synchronisation, events & production readiness

**Status:** ✅ **Complete** — [OSS-101-08 Completion Report](../sprint/OSS-101-08-completion-report.md)

> **Owner scope note:** Historical backlog title was “Search/knowledge/activity integration”. Owner-approved OSS-101-08 delivered adapter-level webhooks, event translation, and synchronisation APIs instead. Search/knowledge platform integration remains a future approved milestone.

**Objective:** Production-grade Plane adapter synchronisation, webhook management, and event translation.

**Scope:**

- `PlaneWebhookService` (create/update/delete/list/validate) — adapter only
- Canonical integration event models + Plane payload translation
- Incremental / full sync APIs, cursors, resume tokens, safe restart (no scheduler/workers)
- Sync status, diagnostics, metrics, error mapping extensions
- Capability registration: `events`, `webhooks`, `synchronisation`
- Mock API + contract tests

**Out of scope:**

- PlatformService / HTTP routes / UI
- Background scheduler / workers
- Notifications / WebSockets / SSE / platform event bus
- Zammad

**Deliverables:**

- `@apzhub/integration-plane` v0.5.0
- [PLANE-SYNC-EVENTS.md](../../integrations/plane/docs/PLANE-SYNC-EVENTS.md)
- [OSS-101-08 Completion Report](../sprint/OSS-101-08-completion-report.md)

**Stop condition:** ✅ Complete — await owner approval before OSS-101-09.

---

## OSS-101-09 — Plane operations, diagnostics & certification

**Status:** ✅ **Complete** — [OSS-101-09 Completion Report](../sprint/OSS-101-09-completion-report.md)

> **Owner scope note:** Historical backlog emphasised control-plane registration and reconciliation jobs. Owner-approved OSS-101-09 delivered adapter-level certification, compatibility, readiness, health, feature detection, and operational reports instead. Control-plane wiring remains a future approved milestone.

**Objective:** Certify the Plane adapter as production-ready and document reference patterns for future adapters.

**Scope:**

- Capability self-assessment framework
- Compatibility matrix (version / edition / optional gaps)
- Runtime diagnostics & readiness checks
- Feature detection (optional endpoints as metadata)
- Health classification: HEALTHY / DEGRADED / LIMITED / UNAVAILABLE
- Structured operational reports
- Mock degraded/unsupported/version scenarios

**Out of scope:**

- PlatformService / HTTP / UI
- Webhook ingress / event bus / workers / scheduler
- Zammad / second adapter

**Deliverables:**

- `@apzhub/integration-plane` v0.6.0
- [PLANE-OPERATIONS.md](../../integrations/plane/docs/PLANE-OPERATIONS.md)
- [OSS-101-09 Completion Report](../sprint/OSS-101-09-completion-report.md)

**Stop condition:** ✅ Complete — await owner approval before OSS-101-10.

---

## OSS-101-10 — E2E validation and closeout

**Objective:** Certify Wave 1 Projects integration for production; certify Plane as Reference Adapter.

**Scope (as executed under owner approval):**

- Architecture & static dependency audit
- Capability certification matrix
- Mocked E2E (HTTP → Gateway → Services → Provider → Plane → Mock Plane API)
- Wave1 regression + OpenAPI validation
- Coverage certification (scoped) + performance baseline (measure only)
- Reference Adapter Standard + Wave 1 certification report
- Foundation / catalogue documentation closeout

**Out of scope:**

- New Plane/Platform/SDK/HTTP features
- Live Plane instance
- UI, webhook ingress, Platform Event Bus
- Wave 2 (Zammad / Kimai)

**Deliverables:**

- [OSS-101-10 Wave 1 Certification](../sprint/OSS-101-10-Wave1-Certification.md)
- [REFERENCE-ADAPTER-STANDARD.md](../architecture/REFERENCE-ADAPTER-STANDARD.md)
- Architecture / dependency / capability audit artefacts

**Stop condition:** ✅ Complete — Wave 1 closed; await owner approval before OSS-102 (Zammad).

---

## Data strategy (applies all phases)

| Concern              | Approach                                                |
| -------------------- | ------------------------------------------------------- |
| SoR                  | Plane for project/task domain                           |
| Platform metadata    | ID mapping, sync cursors in PostgreSQL                  |
| Sync boundaries      | Write-through mutations; async search/activity          |
| Caching              | Short TTL read cache in service; invalidate on events   |
| Search projections   | Event-driven; derived index                             |
| Activity projections | Event mappers; not live Plane poll                      |
| Event mapping        | See Domain Mapping doc                                  |
| Failure handling     | Outbox retry; fail closed on auth errors                |
| Upgrade handling     | Pin Plane version; contract tests gate adapter upgrades |

---

## Related

- [Projects Plane Reference Architecture](../architecture/APZHUB-Projects-Plane-Reference-Architecture.md)
- [Projects Workbench UX](../specs/APZHUB-Projects-Workbench-UX.md)
- [OSS-101 Readiness Review](../reviews/OSS-101-Readiness-Review.md)
