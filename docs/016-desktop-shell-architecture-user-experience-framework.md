# Document 016 — Desktop Shell Architecture & User Experience Framework

> **Document Version:** 1.0  
> **Classification:** Platform Specification  
> **Status:** Foundation  
> **Applies To:** Entire Desktop Application · Every Platform Module · Every Workspace · Every Future Plugin  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [015](./015-software-quality-testing-qa-cicd-release-management-framework.md)  
> **Relationship:** Complements [005 — Desktop Experience & Workspace Framework](./005-desktop-experience-workspace-framework.md). Document 005 defines DEF principles, permission-driven UI, and module integration rules. Document 016 defines the **permanent shell architecture**, layout regions, behaviour, and acceptance criteria for implementation. Navigation behaviour: [017](./017-navigation-framework-workspace-navigation-architecture.md). Session and layout persistence: [018](./018-workspace-sessions-window-management-state-persistence-framework.md). Command interface: [019](./019-universal-command-palette-action-framework.md). Search & discovery: [020](./020-unified-search-knowledge-discovery-framework.md). Notifications & attention: [021](./021-notification-activity-attention-management-framework.md). Presentation & theming: [022](./022-presentation-engine-theme-framework-branding-architecture.md). User preferences: [023](./023-user-preferences-personalisation-workspace-experience-framework.md).

## 1. Purpose

The Desktop Shell is the permanent user interface framework of APZHUB.

It is **not** a page.

It is **not** a layout.

It is the operating environment in which every feature of APZHUB executes.

Every module, connector, service and future capability must operate inside this shell.

The shell is never replaced.

Only its contents change.

---

## 2. Design Philosophy

The shell should feel closer to:

- Cursor
- Visual Studio Code
- JetBrains IDEs
- GitHub Desktop
- Linear
- Vercel

than a traditional web application.

The objective is to create an environment users can comfortably work in for many hours.

Visual and interaction standards per [006 — Enterprise Design System](./006-enterprise-design-system-ui-standards.md).

---

## 3. Primary Objectives

The Desktop Shell must:

- Feel like a native desktop application.
- Minimise unnecessary navigation.
- Keep users in context.
- Support multitasking.
- Reduce clicks.
- Optimise screen real estate.
- Maintain visual consistency.
- Be keyboard-first.
- Support accessibility.
- Support future desktop packaging (Electron/Tauri) without redesign.

---

## 4. Permanent Layout

The Desktop Shell consists of fixed structural regions.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header / Global Toolbar                                                     │
├───┬──────────────────────────────────────────────────────────────┬───────────┤
│   │                                                              │           │
│ A │                                                              │ Context   │
│ c │                                                              │ Panel     │
│ t │                                                              │           │
│ i │            Workspace Area                                    │           │
│ v │            (Tabs + Active View)                              │           │
│ i │                                                              │           │
│ t │                                                              │           │
│ y │                                                              │           │
│ B │                                                              │           │
│ a │                                                              │           │
│ r │                                                              │           │
├───┴──────────────────────────────────────────────────────────────┴───────────┤
│ Status Bar                                                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

These regions remain constant across the platform.

---

## 5. Shell Components

The Desktop Shell consists of:

- Global Header
- Activity Bar
- Workspace Sidebar
- Workspace Tabs
- Workspace Area
- Context Panel
- Status Bar
- Overlay Layer
- Notification Layer
- Command Palette
- Global Search

Every component has a single responsibility.

No business logic belongs in shell components ([003](./003-overall-system-architecture-design-principles.md)).

---

## 6. Global Header

The header provides platform-wide functionality.

Contents:

- APZHUB logo
- Current workspace
- Global search
- Quick actions
- Notification indicator
- User profile
- Organisation selector (future)
- Environment indicator
- Theme selector
- Help
- AI Assistant entry point (future)

The header remains fixed.

Header actions and quick actions are **permission-gated** — items the user cannot access must not appear ([005](./005-desktop-experience-workspace-framework.md), [007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 7. Activity Bar

A narrow vertical toolbar located on the far left.

Purpose:

Switch between major workspaces.

Initial workspaces include:

- Home
- Projects
- Support
- Documents
- Automation
- Testing
- Analytics
- Compliance
- Security
- Administration

The Activity Bar must support:

- Tooltips
- Keyboard shortcuts
- Notification badges
- Context menus
- Pinning (future)

Workspace icons are shown **only when the user has permission** to access that workspace. Registration includes required permissions; the shell filters before display ([005](./005-desktop-experience-workspace-framework.md)).

---

## 8. Workspace Sidebar

Displays navigation for the selected workspace.

Features:

- Tree navigation
- Search
- Favourites
- Recently opened
- Expand/collapse
- Resizable width
- Persistent state

Only one workspace sidebar is visible at a time.

Sidebar entries are computed from module navigation metadata and the user's effective permissions — not from static configuration ([005](./005-desktop-experience-workspace-framework.md), [007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 9. Workspace Area

The primary working area.

Supports:

- Tables
- Dashboards
- Forms
- Editors
- Kanban boards
- Reports
- Calendars
- Graphs
- AI views (future)

The Workspace Area owns business interaction.

Module content renders here only; modules do not define alternate page layouts outside the shell ([008](./008-module-plugin-connector-architecture.md)).

---

## 10. Workspace Tabs

Multiple workspaces may be open simultaneously.

Tabs support:

- Pin
- Close
- Reorder
- Restore
- Unsaved indicators
- Keyboard navigation
- Session restore

Users should not lose their working context.

Tab restore must **re-validate permissions**; tabs for resources the user no longer may access must not reopen ([005](./005-desktop-experience-workspace-framework.md)).

---

## 11. Context Panel

Provides contextual information.

Examples:

- Properties
- Activity
- History
- Comments
- Attachments
- Workflow
- Related records
- AI suggestions (future)

Supports:

- Resize
- Collapse
- Hide
- Persistent width

Each section is permission-gated where applicable ([005](./005-desktop-experience-workspace-framework.md)).

---

## 12. Status Bar

Displays platform status.

Examples:

- Logged-in user
- Background jobs
- Connector status
- Notifications
- Version
- Environment
- Synchronisation
- Keyboard shortcut hints

The Status Bar should remain compact.

Operational status for administrators may include connector health without exposing backend product branding to standard users ([002](./002-product-naming-positioning-terminology-standard.md), [014](./014-observability-monitoring-telemetry-health-framework.md)).

---

## 13. Overlay Layer

Shared infrastructure for:

- Dialogs
- Wizards
- Pickers
- Confirmation windows
- Full-screen modals

All overlays follow one visual standard.

Per [006](./006-enterprise-design-system-ui-standards.md) — no module-specific dialog styles.

---

## 14. Notification Layer

Supports:

Full specification: [021 — Notification, Activity & Attention Management Framework](./021-notification-activity-attention-management-framework.md).

- Toasts
- Alerts
- Progress
- Background job updates
- Reminder banners
- System notifications

Notifications originate from Platform Services.

Modules publish events; they do not send notifications directly ([009](./009-platform-service-layer-integration-framework.md), [012](./012-event-driven-architecture-background-processing-workflow-framework.md)).

---

## 15. Window Behaviour

The shell remembers:

- Open tabs
- Active workspace
- Sidebar width
- Context panel width
- Window layout
- Scroll position
- Expanded sections

State is restored automatically.

Restored state must respect current permissions ([005](./005-desktop-experience-workspace-framework.md)).

---

## 16. Responsive Behaviour

Desktop is primary.

Tablet is secondary.

Mobile is supported but simplified.

No business functionality should disappear because of screen size.

Permission-gated hiding is authorisation, not responsive removal ([005](./005-desktop-experience-workspace-framework.md)).

---

## 17. Performance Targets

The shell should:

- Load rapidly.
- Avoid unnecessary re-renders.
- Lazy-load modules.
- Virtualise large datasets.
- Cache navigation intelligently.

The shell must remain responsive regardless of module complexity.

Per [004](./004-technology-stack-repository-standards-development-environment.md) and [015](./015-software-quality-testing-qa-cicd-release-management-framework.md) performance testing.

---

## 18. Accessibility

Support:

- Keyboard-only operation
- Screen readers
- High contrast
- Focus indicators
- Reduced motion
- ARIA compliance

Accessibility applies to the shell before any modules are added.

WCAG AA per [006](./006-enterprise-design-system-ui-standards.md).

---

## 19. Extensibility

Every future module integrates through defined extension points.

Modules may contribute:

- Activity Bar items
- Sidebar entries
- Commands
- Search providers
- Notifications
- Status items
- Context panels
- Workspace tabs

Modules may **not** modify shell architecture.

Each contribution declares **required permissions**; the shell filters before display ([005](./005-desktop-experience-workspace-framework.md), [008](./008-module-plugin-connector-architecture.md)).

**Superadmin** is not a normal user — Administration and diagnostic surfaces use explicit superadmin permissions; distinct from standard workspaces ([005](./005-desktop-experience-workspace-framework.md), [007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 20. Cursor Instructions

When implementing the Desktop Shell:

- Build reusable shell components first.
- Do not include business logic.
- Optimise for long-term extensibility.
- Treat the shell as a platform, not a page layout.
- Every future feature must plug into the shell rather than altering it.
- Ensure shell state persists across sessions.
- Maintain a consistent visual language.

Build order: Design System ([006](./006-enterprise-design-system-ui-standards.md)) with shell; business modules after shell acceptance ([005](./005-desktop-experience-workspace-framework.md)).

---

## 21. Acceptance Criteria

The Desktop Shell is complete when:

- The shell loads independently of business modules.
- Navigation is functional.
- Multiple workspaces can be opened.
- Layout state persists.
- Accessibility requirements are met.
- Themes apply globally.
- Notifications, overlays and search integrate consistently.
- New modules can be added without modifying the shell itself.
- **Navigation, Activity Bar, Sidebar, commands, and search show only permitted items.**
- **Permission changes and session restore behave correctly.**

The Desktop Shell is the permanent operating environment of APZHUB and forms the visual and interaction foundation for the entire platform.
