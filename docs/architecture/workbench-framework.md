# Workbench Framework — Architecture

> **Status:** Active — Milestone 3 complete (SPR-003)  
> **Package:** `@apzhub/workbench-framework` ([ADR-0019](../adr/ADR-0019-workbench-framework-package.md))  
> **Authority:** [005 — Desktop Experience & Workspace Framework](../005-desktop-experience-workspace-framework.md) · [016 — Desktop Shell](../016-desktop-shell-architecture-user-experience-framework.md) · [Platform Roadmap](./platform-roadmap.md)

---

## 1. Terminology

**Workbench Framework** is the standard platform term for the user interaction layer previously referred to as "Desktop Framework" in Sprint 003 planning documents.

| Legacy term (planning)           | Standard term                                           |
| -------------------------------- | ------------------------------------------------------- |
| Desktop Framework (DEF)          | **Workbench Framework (WBF)**                           |
| Desktop Framework package        | **Workbench Framework** (`@apzhub/workbench-framework`) |
| Navigation Framework (component) | **Navigation Manager** (Workbench subsystem)            |

Document 005 remains authoritative for UX principles. Workbench Framework is the **implementation architecture** for Milestone 3 onward.

### Support workspace (OSS-110-13)

The **Support** product mounts inside the workbench:

- Activity Bar entry and sidebar children from `services/support/manifests/`
- Routes under `/workspace/support/*` resolved by `SupportWorkspaceRouter`
- Presentation-only — calls `/api/v1/support-*` via typed client; no engine branding

See [APZHUB-Support-Module-UI.md](./APZHUB-Support-Module-UI.md) and [APZHUB-Support-User-Guide.md](../guides/APZHUB-Support-User-Guide.md).

---

## 2. Platform architecture layers

```text
┌─────────────────────────────────────────────────────────────┐
│                    Business Data                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                 Business Capabilities                        │
│         (Projects, Support, Documents — Milestone 9+)        │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                 Platform Capabilities                        │
│    (Command, Search, Notification, Theme — Milestones 4–7)   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Workbench Framework                         │
│   Workbench Manager · React · Desktop Shell integration      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Platform Runtime                            │
│   UI-agnostic · No React · Manifest · Registry · Lifecycle   │
└─────────────────────────────────────────────────────────────┘
```

### Layer rules

| Layer                 | May depend on                                                     | Must not depend on                  |
| --------------------- | ----------------------------------------------------------------- | ----------------------------------- |
| Platform Runtime      | Node.js, YAML, Zod                                                | React, UI, Desktop Shell, Workbench |
| Workbench Framework   | Runtime, React, `@apzhub/ui`, `@apzhub/workspace`, `@apzhub/auth` | Business capabilities               |
| Platform Capabilities | Workbench + Runtime                                               | Direct UI manipulation              |
| Business Capabilities | All above                                                         | Bypassing Workbench requests        |

---

## 3. Purpose

The **Workbench Framework** owns all user interaction infrastructure.

Capabilities **must never** manipulate the user interface directly. Capabilities publish **Workbench Requests**; the Workbench Framework decides how requests are presented.

The Workbench Framework is the **first layer that depends on React** and the Desktop Shell (`@apzhub/workspace`, `@apzhub/ui`).

---

## 4. Primary subsystem

The Workbench Framework exposes one coordinating entry point:

**Workbench Manager** — see [workbench-manager.md](./workbench-manager.md)

All workbench behaviour flows through the Workbench Manager and its sub-managers.

---

## 5. Capability integration model

The only approved UI interaction model:

```text
Capability
    │
    │  publishes Workbench Request
    ▼
Workbench Manager
    │
    │  delegates to sub-manager
    ▼
Sub-manager (View, Panel, Navigation, Context, Selection, …)
    │
    ▼
UI Update (React / Desktop Shell)
```

### Workbench request types (initial set)

| Request                | Handler                  | Description                                       |
| ---------------------- | ------------------------ | ------------------------------------------------- |
| `openView`             | View Manager             | Open or focus a registered view in workspace tabs |
| `closeView`            | View Manager             | Close a view by id                                |
| `focusView`            | View Manager             | Bring view to foreground                          |
| `openPanel`            | Panel Manager            | Show or expand a panel region                     |
| `closePanel`           | Panel Manager            | Hide or collapse a panel                          |
| `revealNavigationItem` | Navigation Manager       | Expose nav item (e.g. after permission grant)     |
| `setSelection`         | Selection Manager        | Update platform selection context                 |
| `setContext`           | Context Manager          | Update context panel content key                  |
| `showNotification`     | _(future — Milestone 6)_ | Notification layer request                        |

Capabilities publish requests. They do **not** call React APIs, layout APIs, or shell components directly.

---

## 6. Mandatory architectural rule

Capabilities must **never**:

- Open windows or tabs directly
- Open, resize, or dock panels directly
- Manipulate layouts
- Change navigation or Activity Bar state
- Modify workbench session state directly
- Import `@apzhub/ui` shell layout internals for orchestration

Capabilities **must**:

- Publish typed Workbench Requests to the Workbench Manager
- Declare views, navigation, and permissions via capability manifests
- Remain UI-agnostic beyond their own view content components

---

## 7. Runtime boundary

The Platform Runtime (`@apzhub/platform-runtime`):

- Has **no React dependency** (`package.json`: `yaml`, `zod` only)
- Has **no UI dependency** (no `@apzhub/ui`, `@apzhub/workspace`)
- Has **no Desktop Shell dependency**
- Remains reusable independently of the Workbench Framework

The Workbench Framework consumes Runtime **after** `Runtime.bootstrap()` via server-side registry hydration and internal APIs — never by embedding Runtime inside React component trees for orchestration logic.

See [Runtime boundary verification](../reviews/SPR-003-architecture-refinement.md#runtime-boundary-verification).

---

## 8. Relationship to Desktop Shell

The **Desktop Shell** (Document 016) defines permanent layout **regions**: Header, Activity Bar, Sidebar, Workspace, Context Panel, Status Bar, overlay layers.

The Workbench Framework **orchestrates** those regions through managers. The Shell remains the visual composition layer; the Workbench Framework is the behavioural layer.

SPR-003 enhances the existing Shell incrementally — no rewrite.

---

## 9. Extension points

Future Workbench subsystems may be added without redesigning the Workbench Manager:

- Command routing (Milestone 4) — registers with Workbench Manager
- Search overlay (Milestone 5)
- Notification layer (Milestone 6)
- Activity stream (Milestone 7)

---

## 10. Sprint 003 scope (planning)

SPR-003 implements Workbench Framework infrastructure only — no business capabilities. See [SPR-003-workbench-framework.md](../sprint/SPR-003-workbench-framework.md).

---

_Workbench Framework architecture — planning document. No implementation until approved._
