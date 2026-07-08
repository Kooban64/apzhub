# APZHUB Platform Capability Matrix

> **Platform Version:** 5.0  
> **Status:** Authoritative cross-framework pattern reference  
> **Authority:** [Platform v5.0](../releases/APZHUB-Platform-v5.0.md) · [Platform Reference Patterns](./APZHUB-Platform-Reference-Patterns.md) · [Platform Reference Architecture](./APZHUB-Platform-Reference-Architecture.md)

---

## Purpose

This matrix shows how each platform layer implements the common APZHUB extension patterns. Use it to validate new capabilities **consume** existing patterns rather than invent parallel pipelines.

### Status legend

| Status             | Meaning                                    |
| ------------------ | ------------------------------------------ |
| **Complete**       | Delivered and tested in milestone closeout |
| **Partial**        | Scaffold or session-only; known deferrals  |
| **Planned**        | Defined in roadmap; not yet implemented    |
| **Not applicable** | Pattern does not apply to this layer       |

---

## Matrix

| Pattern                |       Runtime (M2)        |        Workbench (M3)         |                Action (M4)                |         Knowledge (M5)          |                  Event/Notification (M6)                  |                  Activity/Timeline (M7)                  |
| ---------------------- | :-----------------------: | :---------------------------: | :---------------------------------------: | :-----------------------------: | :-------------------------------------------------------: | :------------------------------------------------------: |
| **Registry**           |    Capability Registry    |      Workbench Registry       |              ActionRegistry               |        KnowledgeRegistry        |           EventRegistry + NotificationRegistry            |           ActivityRegistry + TimelineRegistry            |
| **Manifest**           |  Envelope + kind schemas  |     `workbench.*` blocks      |       `workbench.actions`, toolbar        |      Knowledge source refs      |             `events`, `notifications.routes`              |        `activities.types`, `activities.timelines`        |
| **Bootstrap**          |   `Runtime.bootstrap()`   | `bootstrapWorkbenchRegistry`  |         `bootstrapActionRegistry`         |  `bootstrapKnowledgeRegistry`   | `bootstrapEventRegistry`, `bootstrapNotificationRegistry` | `bootstrapActivityRegistry`, `bootstrapTimelineRegistry` |
| **DTO**                |    Capability records     |     WorkbenchRegistryDto      |             ActionRegistryDto             |   KnowledgeSourceRegistryDto    |         EventRegistryDto, NotificationRegistryDto         |         ActivityRegistryDto, TimelineRegistryDto         |
| **Client hydration**   |     N/A (server-only)     |       WorkbenchProvider       |          CommandRegistryProvider          |   KnowledgeDiscoveryProvider    |               NotificationRegistryProvider                |                 ActivityTimelineProvider                 |
| **Service API**        |      Health Manager       |         WorkbenchAPI          |           DefaultActionExecutor           |        KnowledgeService         |                    NotificationService                    |                 ActivityTimelineService                  |
| **Presentation layer** |            N/A            |     Presentation adapters     |        N/A (surfaces map registry)        | `@apzhub/workspace` KDF helpers |                 ENF presentation helpers                  |                 ATF presentation helpers                 |
| **Experiences**        |            N/A            | Shell regions (via workspace) | Palette, toolbar, shortcuts, context menu | Knowledge Overlay, palette mode |                       Badge, Panel                        |         Context Panel Activity tab, inline feed          |
| **Health**             |      Runtime summary      |      Workbench hydration      |             `commands` field              |        `knowledge` field        |                 `events`, `notifications`                 |                `activities`, `timelines`                 |
| **Diagnostics**        |   Subsystem diagnostics   |      Engine diagnostics       |            Action diagnostics             |      Knowledge diagnostics      |              Event/notification diagnostics               |              Activity timeline diagnostics               |
| **E2E verification**   |          spr-002          |            spr-003            |                  spr-004                  |             spr-005             |                          spr-006                          |                         spr-007                          |
| **Governance**         | Runtime Development Guide |  Workbench Development Guide  |             Action onboarding             |         KDF onboarding          |                      ENF onboarding                       |                      ATF onboarding                      |
| **Closeout**           |         M2 review         |           M3 review           |               M4 readiness                |           M5 closeout           |                        M6 closeout                        |                       M7 closeout                        |

---

## Pattern status detail

### Registry

| Layer              | Status   | Notes                                       |
| ------------------ | -------- | ------------------------------------------- |
| Runtime            | Complete | Kind-specific getters; conflict diagnostics |
| Workbench          | Complete | Navigation, views, workspaces               |
| Action             | Complete | Platform catalogue + manifest extraction    |
| Knowledge          | Complete | Source + provider registration              |
| Event/Notification | Complete | Parallel registries                         |
| Activity/Timeline  | Complete | Independent registries                      |

### Manifest

| Layer              | Status   | Notes                                           |
| ------------------ | -------- | ----------------------------------------------- |
| Runtime            | Complete | Zod validation; fail-fast                       |
| Workbench          | Complete | `workbench.navigation`, views                   |
| Action             | Complete | `workbench.actions`, toolbar                    |
| Knowledge          | Partial  | Provider refs; no standalone manifest block yet |
| Event/Notification | Complete | `events`, `notifications.routes`                |
| Activity/Timeline  | Complete | `activities.types`, `activities.timelines`      |

### Bootstrap

| Layer              | Status   | Notes                                             |
| ------------------ | -------- | ------------------------------------------------- |
| Runtime            | Complete | Single orchestrator entry                         |
| Workbench          | Complete | Post-runtime discovery                            |
| Action             | Complete | Parallel with workbench                           |
| Knowledge          | Complete | Parallel DTO registration for providers           |
| Event/Notification | Complete | Shared EventNotificationContext                   |
| Activity/Timeline  | Complete | Shared ActivityTimelineContext; wire on Event Bus |

### DTO + filter

| Layer                   | Status  | Notes                                                   |
| ----------------------- | ------- | ------------------------------------------------------- |
| All platform frameworks | Partial | Filter functions exist; **RBAC population deferred M8** |

### Client hydration

| Layer              | Status         | Notes                                               |
| ------------------ | -------------- | --------------------------------------------------- |
| Runtime            | Not applicable | Server-only package                                 |
| Workbench          | Complete       | Read-only registry DTO                              |
| Action             | Complete       | Read-only CommandRegistry                           |
| Knowledge          | Complete       | Read-only + live KnowledgeService                   |
| Event/Notification | Complete       | Read-only registries + live NotificationService     |
| Activity/Timeline  | Complete       | Read-only registries + live ActivityTimelineService |

### Service API

| Layer              | Status   | Notes                                |
| ------------------ | -------- | ------------------------------------ |
| Workbench          | Complete | Request Bus pattern                  |
| Action             | Complete | Single shared executor in apps/web   |
| Knowledge          | Complete | Public `useKnowledgeService()`       |
| Event/Notification | Partial  | Session store only                   |
| Activity/Timeline  | Partial  | Session store; no live subscriptions |

### Presentation layer

| Layer              | Status         | Notes                                       |
| ------------------ | -------------- | ------------------------------------------- |
| Knowledge          | Complete       | Grouping, mapping in workspace              |
| Event/Notification | Complete       | View models, priority grouping              |
| Activity/Timeline  | Complete       | Date grouping, relative timestamps          |
| Action             | Not applicable | Surfaces consume registry directly          |
| Workbench          | Partial        | Adapters only; not a separate package layer |

### Experiences

| Layer              | Status   | Notes                                |
| ------------------ | -------- | ------------------------------------ |
| Action             | Complete | Four shell surfaces                  |
| Knowledge          | Partial  | Overlay not shell-mounted by default |
| Event/Notification | Partial  | Toast/banner regions deferred        |
| Activity/Timeline  | Partial  | Context Panel tab; no live refresh   |

### Health

| Layer | Status   | Notes                            |
| ----- | -------- | -------------------------------- |
| All   | Complete | Incremental `/api/health` fields |

### E2E verification

| Layer | Status   | Notes                                |
| ----- | -------- | ------------------------------------ |
| M2–M7 | Complete | Dedicated spr-NNN spec per milestone |

### Governance + closeout

| Layer | Status   | Notes                                           |
| ----- | -------- | ----------------------------------------------- |
| M1–M7 | Complete | Handbook sections, onboarding, closeout reports |

---

## Milestone 8 additions (planned)

| Pattern                | M8 target                             |
| ---------------------- | ------------------------------------- |
| PermissionService      | Complete — session-backed RBAC        |
| Registry filter        | Complete — real permission population |
| Preference persistence | Complete — Document 023               |
| Admin workspace        | Complete — scaffold only              |
| Audit visibility       | Partial — framework audit hooks       |

See [SPR-008 backlog](../backlog/SPR-008-platform-identity-administration-ux-backlog.md).

---

## Usage rules

1. **Extend, do not redesign** — new capabilities add manifest blocks and subscribers; no orchestrator rewrite
2. **One pipeline per concern** — Activity ≠ Notification ≠ Knowledge ≠ Action
3. **Server authority** — bootstrap + filter before client hydration
4. **Experiences consume public hooks** — never Event Bus or internal stores directly
5. **Health + E2E mandatory** — every new platform layer follows spr-NNN pattern

---

_APZHUB Platform Capability Matrix — Platform Version 5.0._
