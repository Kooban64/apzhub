# APZHUB Product Validation Strategy

> **Platform Version:** 5.0  
> **Status:** Planning document — no product implementation  
> **Authority:** [Platform v5.0](../releases/APZHUB-Platform-v5.0.md) · [Platform Roadmap](../architecture/platform-roadmap.md) · [Document 001 — Project Vision](../001-project-vision-and-guiding-principles.md)

---

## Purpose

Platform Version 5.0 delivers seven platform layers (Foundation through Activity & Timeline). Before commercial general availability, APZHUB must **validate the platform through real product workloads** — not additional platform redesign.

This document defines how future business applications will exercise the platform and recommends the first product validation stream.

**Constraint:** Platform Validation Phase 1 planning is **complete** (Law Platform). Implementation begins after owner approval of [Law Platform Readiness](../reviews/APZHUB-Law-Platform-Readiness.md). **Milestone 8 (IAUX) is not started** per owner directive. Full RBAC validation remains deferred until M8 or explicit owner decision.

---

## Validation principles

| Principle               | Rationale                                                         |
| ----------------------- | ----------------------------------------------------------------- |
| Consume, don't redesign | Products use manifests, registries, and public APIs               |
| One workbench           | All product modules load through Workbench Framework              |
| Manifest-first          | Capabilities declare before implement                             |
| Platform events         | Products publish events; platform maps notifications and activity |
| Permission-gated        | Real RBAC from M8 required for meaningful validation              |
| E2E per product stream  | Each validation stream adds Playwright coverage                   |

---

## Validation phases

```text
Platform 5.0 frozen (M1–M7)
        ↓
Milestone 8 — Identity, Administration & UX (IAUX)
        ↓
Product validation stream selected (Law Firm Platform)
        ↓
Capability manifests + Platform Services (M9 pattern)
        ↓
End-to-end product E2E + operator readiness
        ↓
Commercial readiness review
```

---

## Recommended first product stream: Law Firm Platform

The **Law Firm Platform** is the recommended first product validation stream because it exercises the full Platform 5.0 stack across realistic enterprise domains without requiring external OSS engine integration on day one.

### Why Law Firm

| Factor                | Benefit                                                             |
| --------------------- | ------------------------------------------------------------------- |
| Domain clarity        | Matters, documents, tasks, users map cleanly to platform primitives |
| Permission complexity | Client/matter-scoped RBAC validates M8 PermissionService            |
| Document-heavy UX     | Validates Workbench views, Context Panel, Knowledge discovery       |
| Workflow density      | Validates Actions, events, notifications, activity timeline         |
| Regulated context     | Audit visibility and activity history align with platform deferrals |

### Out of scope for validation planning

- Production deployment to external tenants
- External DMS/Practice management integrations (Phase 2)
- Billing, trust accounting, court filing systems
- Mobile-native clients

---

## Platform exercise map — Law Firm Platform

| Platform layer        | Law Firm validation scenario                                                             |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **Workbench**         | Matter workspace on Activity Bar; sidebar views for overview, documents, tasks, timeline |
| **Actions**           | Create matter, upload document, assign task, change matter status — palette + toolbar    |
| **Knowledge**         | Search matters, documents, tasks, clients via Knowledge Overlay and palette mode         |
| **Events**            | `matter.created`, `document.uploaded`, `task.assigned`, `matter.status.changed`          |
| **Notifications**     | In-app inbox for assignments, deadlines, status changes                                  |
| **Activity timeline** | Context Panel Activity tab — matter-scoped and personal timelines                        |
| **Documents**         | Document list view, metadata, upload action, document-linked activity                    |
| **Matters**           | Primary business entity; workspace context; permission scope                             |
| **Tasks**             | Task list, assignment, due dates; notification + activity fan-out                        |
| **Users**             | User directory; matter team membership; actor attribution on events                      |
| **Permissions**       | Role: partner, associate, paralegal, admin; matter-level access                          |

---

## Validation architecture (conceptual)

```text
Law Firm Capabilities (manifests)
        ↓
Platform Services (matters, documents, tasks — YAML + handlers)
        ↓
Workbench Requests → Workbench API
        ↓
Action Framework → Event Bus
       / \
      /   \
Notification Service    Activity Service
      ↓                       ↓
Badge / Panel           Context Panel Timeline
```

Products **never**:

- Call NotificationService or ActivityService directly
- Import Event Bus in UI Experiences
- Bypass PermissionService for registry filtering

---

## Validation success criteria

| Criterion            | Measure                                            |
| -------------------- | -------------------------------------------------- |
| Manifest-driven      | All Law Firm capabilities discovered at bootstrap  |
| RBAC enforced        | Disallowed views/actions stripped server-side      |
| Action audit         | Workbench actions produce notifications + activity |
| Knowledge discovery  | Cross-entity search returns actionable results     |
| Session persistence  | Workspace + preferences survive reload (post-M8)   |
| E2E coverage         | Dedicated `law-firm-platform.spec.ts` (future)     |
| No platform redesign | Zero ADRs modifying M1–M7 layer contracts          |

---

## Dependencies before product validation

| Dependency                          | Milestone | Status   |
| ----------------------------------- | --------- | -------- |
| PermissionService                   | M8        | Planned  |
| User / role administration          | M8        | Planned  |
| Preference persistence              | M8        | Planned  |
| Audit visibility                    | M8        | Planned  |
| Activity persistence (optional)     | M8+       | Deferred |
| Business capability SDK consumption | M9        | Planned  |

**Do not begin Law Firm implementation** until owner approves M8 closeout and product validation charter.

---

## Recommended sequencing

| Step | Action                                                            | Owner gate   |
| ---- | ----------------------------------------------------------------- | ------------ |
| 1    | Approve Platform 5.0 baseline                                     | Owner        |
| 2    | Complete M8 (IAUX-001–IAUX-018)                                   | Sprint gates |
| 3    | Author Law Firm product charter + capability manifests (planning) | Product      |
| 4    | Implement first Law Firm capability (single matter workspace)     | M9 story     |
| 5    | Expand documents, tasks, users incrementally                      | M9 stories   |
| 6    | Product validation review                                         | Architecture |

---

## Related documents

| Document                   | Path                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Platform v5.0              | [APZHUB-Platform-v5.0.md](../releases/APZHUB-Platform-v5.0.md)                                             |
| Platform Capability Matrix | [APZHUB-Platform-Capability-Matrix.md](../architecture/APZHUB-Platform-Capability-Matrix.md)               |
| M8 sprint guide            | [SPR-008-platform-identity-administration-ux.md](../sprint/SPR-008-platform-identity-administration-ux.md) |
| Platform Roadmap           | [platform-roadmap.md](../architecture/platform-roadmap.md)                                                 |

---

_APZHUB Product Validation Strategy — planning only._
