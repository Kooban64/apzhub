# APZHUB Law Platform — Reference Architecture

> **Product:** Law Firm Platform v1.0  
> **Platform baseline:** [Platform Version 5.0](../releases/APZHUB-Platform-v5.0.md) — **frozen**  
> **Status:** Planning architecture — no implementation  
> **Authority:** [Law Platform v1.0](../releases/APZHUB-Law-Platform-v1.0.md) · [Platform Reference Architecture](./APZHUB-Platform-Reference-Architecture.md)

---

## Purpose

This document defines how the Law Firm Platform sits **on top of** APZHUB Platform 5.0. Every legal capability must identify which platform framework it consumes. No legal module may duplicate platform functionality.

---

## Layer model

Dependencies flow **downward only**. Legal code consumes platform APIs; platform frameworks never depend on legal modules.

```text
┌─────────────────────────────────────────────────────────────┐
│              APZHUB Platform Version 5.0 (frozen)              │
│  Foundation · Runtime · Workbench · Action · Knowledge ·     │
│  Event/Notification · Activity/Timeline                      │
└───────────────────────────┬─────────────────────────────────┘
                            │ manifests · events · actions
┌───────────────────────────▼─────────────────────────────────┐
│                    Law Platform (product layer)                │
│  Legal manifest envelope · shared legal types · product health │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Legal Modules                             │
│  Clients · Matters · Documents · Time · Billing · Calendar ·   │
│  Workflow · Knowledge · Reporting · Administration               │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   Business Capabilities                        │
│  Platform Services (YAML) · capability handlers · integrations │
└─────────────────────────────────────────────────────────────┘
```

---

## Platform stack (consumption model)

```text
Platform Runtime
        ↓
Workbench Framework
        ↓
Action Framework
        ↓
Knowledge & Discovery Framework
        ↓
Event & Notification Framework
        ↓
Activity & Timeline Framework
        ↓
Future Business Capabilities  →  Law Platform legal modules (M9 validation pattern)
```

The Law Platform is the **first occupant** of the business-capability layer using Platform 5.0 patterns established in M4–M7.

---

## Platform → Law Platform integration

| Platform subsystem      | Law Platform usage                                                           |
| ----------------------- | ---------------------------------------------------------------------------- |
| **Runtime.bootstrap()** | Discovers all legal capability manifests under `services/legal-*`            |
| **Capability Registry** | Registers legal modules as `kind: service` or `kind: module`                 |
| **Health Manager**      | Aggregates legal service health into `/api/health` extension fields          |
| **Manifest Engine**     | Validates legal YAML — `workbench`, `actions`, `events`, `activities` blocks |
| **@apzhub/auth**        | Session for all legal routes; actor on domain events                         |

Law Platform adds **no parallel orchestrator**. Bootstrap remains `Runtime.bootstrap()`.

---

## Legal module → platform framework map

| Legal module          |       Workbench       |         Actions          |       Knowledge        |    Events    |      Notifications       |       Timeline       |     Runtime      |
| --------------------- | :-------------------: | :----------------------: | :--------------------: | :----------: | :----------------------: | :------------------: | :--------------: |
| **Clients**           |   Workspace + views   |       CRUD actions       | Client search provider |  `client.*`  |    Assignment alerts     |   Client activity    | Service manifest |
| **Matters**           |   Primary workspace   | Matter lifecycle actions |     Matter search      |  `matter.*`  |  Status/deadline alerts  | Matter timeline tab  | Service manifest |
| **Documents**         |    Document views     |  Upload/version actions  |    Document search     | `document.*` |   Review notifications   |   Filing activity    | Storage service  |
| **Time**              |   Time entry views    |    Log/submit actions    |      Time search       |   `time.*`   |  Approval notifications  | Time logged activity | Service manifest |
| **Billing**           |     Billing views     |     Invoice actions      |     Billing search     | `billing.*`  |  Payment notifications   |   Billing activity   | Service manifest |
| **Calendar**          |     Calendar view     |      Event actions       |    Calendar search     | `calendar.*` |  Reminder notifications  |  Calendar activity   | Service manifest |
| **Workflow**          |      Task views       |    Transition actions    |      Task search       |   `task.*`   | Assignment notifications |  Workflow activity   | Service manifest |
| **Knowledge (legal)** |   Research overlay    |     Citation actions     | Legal corpus provider  | `research.*` |     Optional alerts      |  Research activity   | Content service  |
| **Reporting**         |     Report views      |      Export actions      | Report metadata search |  `report.*`  | Completion notifications | Report run activity  | Service manifest |
| **Administration**    | Admin workspace views |      Admin actions       |      Admin search      |  `admin.*`   |  Security notifications  |    Admin activity    |  Config service  |

---

## Interaction flow — matter created (conceptual)

```text
User: Create Matter (Action Framework)
        ↓
DefaultActionExecutor → permission check → handler
        ↓
Matter Platform Service persists record
        ↓
Capability publishes matter.created (Event Bus)
        ↓
        ├─► NotificationMapper → inbox: "Matter opened"
        └─► ActivityMapper → Context Panel timeline item
        ↓
Knowledge Provider indexes new matter document
        ↓
Workbench navigates to matter workspace (Workbench API)
```

Same platform pipeline as M7 validation — legal domain supplies **events and handlers only**.

---

## Workbench integration

| Concern                | Platform owner     | Law Platform provides                                 |
| ---------------------- | ------------------ | ----------------------------------------------------- |
| Activity Bar workspace | Workbench Registry | `legal.matters` workspace manifest                    |
| Sidebar navigation     | Workbench Registry | Matter sub-views (overview, documents, time, billing) |
| Active view / route    | View Engine        | View manifests per legal screen                       |
| Session restore        | Session Engine     | Standard snapshot — no custom store                   |
| Context Panel          | Workbench + ATF    | Matter activity tab via `enableActivityTimelinePanel` |

**Rule:** Legal modules declare `workbench.navigation` and `workbench.views` — they do not render shell chrome.

---

## Action integration

| Concern             | Platform owner        | Law Platform provides                        |
| ------------------- | --------------------- | -------------------------------------------- |
| Action registration | ActionRegistry        | `workbench.actions` in legal manifests       |
| Execution           | DefaultActionExecutor | Service handlers                             |
| Surfaces            | Desktop Shell         | Toolbar/palette entries from registry        |
| Audit events        | Action audit hook     | `capability.action.executed` + legal payload |

**Rule:** Legal services never call executor internals — actions declared in manifest.

---

## Knowledge integration

| Concern             | Platform owner              | Law Platform provides                         |
| ------------------- | --------------------------- | --------------------------------------------- |
| Source registration | KnowledgeRegistry           | Legal KnowledgeProviders                      |
| Query               | KnowledgeService            | Provider projections (clients, matters, docs) |
| Experiences         | Knowledge Overlay / palette | Legal document types in results               |
| Delegation          | Action + Workbench bridges  | `actionRef` / navigation refs                 |

**Rule:** One search UX — legal content is providers, not a second search engine.

---

## Event, notification, and activity integration

| Concern            | Platform owner              | Law Platform provides                    |
| ------------------ | --------------------------- | ---------------------------------------- |
| Event registration | EventRegistry               | `events[]` in legal manifests            |
| Event Bus          | InProcessEventBus           | Publish after successful operations      |
| Notifications      | NotificationRegistry routes | `notifications.routes[]` per legal event |
| Activity types     | ActivityRegistry            | `activities.types[]` per legal event     |
| Timelines          | TimelineRegistry            | Matter + personal scopes                 |

**Rule:** Legal modules **publish events** — never write NotificationService or ActivityService directly.

---

## Dependency rules

| Rule                           | Enforcement                               |
| ------------------------------ | ----------------------------------------- |
| Downward dependencies only     | Legal → Platform; never Platform → Legal  |
| No duplicate platform features | Architecture review + capability map      |
| Manifest-first                 | Legal capability YAML before handler code |
| Public API boundaries          | Experiences use platform hooks only       |
| Platform 5.0 frozen            | ADR required for any framework change     |
| Validation traceability        | Every story cites frameworks validated    |

---

## Package and repository layout (planned)

```text
services/
  legal-clients/          # Platform service manifest + handler
  legal-matters/
  legal-documents/
  ...
apps/web/                 # Existing shell — no fork
  # Legal hydration extends layout parallel loads (future LAW stories)
packages/                 # Unchanged platform packages
docs/
  architecture/           # This document + capability map
  backlog/                # LAW-Platform-Backlog.md
```

No `@apzhub/law-platform-framework` that reimplements Workbench or Action layers.

---

## Related documents

| Document                            | Path                                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Law Platform architecture index** | [LAW-Architecture-Index.md](./LAW-Architecture-Index.md)                                             |
| Canonical domain model              | [APZHUB-Law-Domain-Model.md](./APZHUB-Law-Domain-Model.md)                                           |
| Trust Accounting (LAW-015)          | [LAW-Trust-Accounting-Reference-Architecture.md](./LAW-Trust-Accounting-Reference-Architecture.md)   |
| Legal Business Core                 | [APZHUB-Legal-Business-Core.md](./APZHUB-Legal-Business-Core.md)                                     |
| Law capability map                  | [APZHUB-Law-Capability-Map.md](./APZHUB-Law-Capability-Map.md)                                       |
| Law validation strategy             | [APZHUB-Law-Platform-Validation-Strategy.md](../strategy/APZHUB-Law-Platform-Validation-Strategy.md) |
| Platform Reference Architecture     | [APZHUB-Platform-Reference-Architecture.md](./APZHUB-Platform-Reference-Architecture.md)             |

---

_APZHUB Law Platform Reference Architecture — planning only._
