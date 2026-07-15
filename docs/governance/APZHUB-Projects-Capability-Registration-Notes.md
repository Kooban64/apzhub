# APZHUB Projects Capability Registration Notes

**Milestone:** OSS-101-03  
**Status:** Registration contract — manifest metadata only  
**Authority:** [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md) · [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md)

---

## Purpose

Describe how OSS-101-03 manifests register Projects with platform subsystems. This milestone **declares** registration metadata; runtime wiring occurs in later phases.

---

## Registration flow (target state)

```text
Discovery Engine
  ├── services/projects/service.yaml        → Service Registry
  ├── services/projects/manifests/projects/module.yaml → Module Registry
  ├── integrations/plane/integration.yaml   → Integration Registry
  └── events/projects/**/event.yaml         → Event Registry

Governance Registry  ← documentation.governanceCapabilityKey: projects
Authorization Registry ← permissions on service + module manifests
Workbench Registry   ← module navigation + workbench.actions
Command Registry     ← module.commands (UCP placeholders)
Knowledge Registry   ← service.knowledge.sources
Event Bus            ← event manifests + service.events.publishes
Notification Registry ← notification routes (event subscribers)
Activity Registry    ← activity types (event subscribers)
Lifecycle Registry   ← lifecycleProductId + lifecycleParticipation
Operations Registry  ← operationsCapabilityId + diagnosticsExtension
Provisioning Registry ← provisioningKind: plane-workspace
```

Plane engine details never cross the integration boundary into user-visible registries.

---

## Governance registration

| Field | Value | Notes |
|-------|-------|-------|
| Capability key | `projects` | Enables/disables Projects product |
| Capability type | `productivity` | Portfolio classification |
| Feature flag | `capability.projects.enabled` | Evaluated before module activation |
| Module status | `disabled` | Remains off until OSS-101-05 UI gate |

Governance consumes `project-service` and `projects` manifests at bootstrap. No runtime toggle implementation in OSS-101-03.

---

## Authorization registration

Seven canonical permissions registered on both service and module manifests:

```
projects.view
projects.manage
projects.task.view
projects.task.manage
projects.sprint.view
projects.sprint.manage
projects.admin
```

Role templates and backend role translation (Plane) are **OSS-101-04+** — manifests define the permission namespace only.

---

## Workbench registration

| Surface | Registration source | Status |
|---------|---------------------|--------|
| Activity Bar | `module.navigation.activityBar` | Planned |
| Sidebar routes | `module.navigation.sidebar` | Planned |
| Default workspace view | `module.workbench.view` | Planned |
| Command palette actions | `module.workbench.actions` | Placeholder handlers |
| Planned project detail route | `documentation.plannedRouteProjectDetail` | `/workspace/projects/{projectId}` |

Module remains `disabled` — shell will not render Projects until governance enables capability and OSS-101-05 delivers views.

---

## Command registration

Ten placeholder commands registered under category **Projects**. Each command binds to a permission and mirrors a workbench action ID.

Execution path (future): Command → `ProjectService` → `PlaneAdapter` → Plane CE — never direct engine access from UI.

---

## Event registration

| Canonical key | Manifest ID | Publisher |
|---------------|-------------|-----------|
| `projects.project.created` | `projects-project-created` | `project-service` |
| `projects.project.updated` | `projects-project-updated` | `project-service` |
| `projects.task.created` | `projects-task-created` | `project-service` |
| `projects.task.updated` | `projects-task-updated` | `project-service` |
| `projects.task.status_changed` | `projects-task-status-changed` | `project-service` |
| `projects.task.assigned` | `projects-task-assigned` | `project-service` |
| `projects.sprint.created` | `projects-sprint-created` | `project-service` |
| `projects.sprint.completed` | `projects-sprint-completed` | `project-service` |

Service manifest `events.publishes` lists the same keys for discovery aggregation.

---

## Knowledge registration

| Source ID | Provides | Phase |
|-----------|----------|-------|
| `projects.search` | project metadata search | OSS-101-08 |
| `projects.knowledge` | project + document knowledge | OSS-101-08 |

Tier T2, permission-gated at `projects.view`.

---

## Notification route registration

| Route ID | Subscribing event | Planned delivery |
|----------|-------------------|------------------|
| `projects.task.assigned` | `projects.task.assigned` | In-app + optional email to assignee |
| `projects.task.status_changed` | `projects.task.status_changed` | In-app to watchers |
| `projects.sprint.completed` | `projects.sprint.completed` | In-app to project team |

Declared via event `subscribers` (`notification:*`) and service `documentation.notificationRoute*`.

---

## Activity registration

Activity provider: `projects.activity`

Activity types mirror business events (see [Manifest Notes](./APZHUB-Projects-Manifest-Notes.md)). Event manifests reference `activity:projects.activity` as subscriber; mappers implemented in OSS-101-08.

---

## Lifecycle registration

| Field | Value |
|-------|-------|
| Product ID | `projects` |
| Participation | enable, disable, provision, reconcile |
| Provisioning kind | `plane-workspace` |
| Integration | `plane` |

Lifecycle orchestration connects to Plane workspace provisioning in OSS-101-04. OSS-101-03 declares IDs only.

---

## Operations registration

| Field | Value |
|-------|-------|
| Capability ID | `projects` |
| Connector ID | `plane` |
| Diagnostics extension | `projectsDiagnostics` |
| Health | `health.enabled: true` on service and integration |

Configuration diagnostics from OSS-101-02 (`getPlaneConfigurationDiagnostics`) complement connector health when adapter lands in OSS-101-04. Full diagnostics extension in OSS-101-09.

---

## Integration registration (`plane`)

| Attribute | Value |
|-----------|-------|
| Type | `oss-application` |
| User visible | `false` |
| Engine branding | hidden |
| Supported version | `0.23.0` – `0.24.x` |
| Implementation | OSS-101-04 |

Registered as internal connector — not exposed in Activity Bar or user navigation.

---

## Constraints confirmed

| Constraint | OSS-101-03 |
|------------|------------|
| No Plane adapter code | ✅ |
| No REST client | ✅ |
| No UI implementation | ✅ |
| No database schema | ✅ |
| No Platform Core package changes | ✅ |
| APZHUB terminology only in manifests | ✅ |

---

## Next phase

**OSS-101-04** — Plane adapter foundation (health, provisioning skeleton, mapping store). Requires owner approval before start.

---

## Related

- [Projects Manifest Notes](./APZHUB-Projects-Manifest-Notes.md)
- [OSS-101 Backlog](../backlog/OSS-101-Plane-Integration-Backlog.md)
- [OSS-101-03 Completion Report](../sprint/OSS-101-03-completion-report.md)
