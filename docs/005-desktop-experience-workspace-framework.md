# Document 005 — Desktop Experience & Workspace Framework

> **Status:** Active — Desktop Framework (DEF) standard  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [004](./004-technology-stack-repository-standards-development-environment.md)  
> **Relationship:** [016 — Desktop Shell Architecture & User Experience Framework](./016-desktop-shell-architecture-user-experience-framework.md) provides the detailed shell layout, regions, window behaviour, and implementation acceptance criteria. [017 — Navigation Framework](./017-navigation-framework-workspace-navigation-architecture.md) defines the four-level navigation hierarchy, registration, and deep-link behaviour. [018 — Workspace Sessions](./018-workspace-sessions-window-management-state-persistence-framework.md) defines session, window, and layout persistence. [019 — Universal Command Palette](./019-universal-command-palette-action-framework.md) defines the primary command and action interface. [020 — Unified Search](./020-unified-search-knowledge-discovery-framework.md) defines platform-wide search and discovery. [021 — Notifications & Attention](./021-notification-activity-attention-management-framework.md) defines events, activity, and attention management. This document (005) defines DEF principles, permission-driven UI, and module integration rules.

## 1. Purpose

This document defines the Desktop Experience Framework (DEF) for APZHUB.

The Desktop Framework is the permanent user interface shell of the platform.

Every screen, workspace, module and future capability must operate inside this shell.

The shell is never replaced.

Modules are loaded into the shell.

**Critical:** The entire UI/UX is dynamic. Navigation, workspaces, commands, and actions are driven by roles and permissions in real time. Users only see menu items, workspaces, and capabilities they are authorised to access. This applies to every shell region (Activity Bar, Sidebar, Command Palette, Search, Context Panel actions, toolbars).

---

## 2. Design Vision

The application should feel like a professional desktop application rather than a traditional website.

The design should draw inspiration from:

- Cursor
- Visual Studio Code
- Linear
- GitHub
- Vercel
- JetBrains IDEs
- Modern Enterprise ERP systems

The objective is to maximise productivity.

Every pixel should have purpose.

Whitespace should be intentional.

Navigation should be predictable.

---

## 3. User Experience Principles

The interface should feel:

- Fast
- Responsive
- Professional
- Consistent
- Minimal
- Elegant
- Keyboard Friendly
- Mouse Friendly
- Accessible
- Distraction Free

The application should encourage long working sessions without fatigue.

---

## 4. Desktop Shell

The shell consists of permanent areas. Full layout diagram, overlay layer, window behaviour, and acceptance criteria: [016](./016-desktop-shell-architecture-user-experience-framework.md).

```
Top Header
Activity Bar
Navigation Sidebar
Workspace
Context Panel
Status Bar
Notification Layer
Dialog Layer
Command Palette
```

Every module is loaded inside the Workspace.

All shell regions must respect the current user's effective permissions before rendering controls or routes.

---

## 5. Header

The header is always visible.

Contains:

- Platform Logo
- Workspace Name
- Global Search (permission-scoped results)
- Quick Actions (permission-gated)
- Notifications
- User Menu
- Organisation Switcher (future)
- Environment Indicator
- Connection Status
- Theme Switch

The header should remain compact.

Items that the user cannot access must not appear (not merely disabled unless UX explicitly requires disabled state with explanation).

---

## 6. Activity Bar

A narrow vertical toolbar positioned on the far left.

Purpose:

Quick navigation between major workspaces.

Examples (shown only when permitted):

- Home
- Projects
- Support
- Documents
- Testing
- Automation
- Analytics
- Compliance
- Security
- Administration

Each icon should support:

- Tooltip
- Unread badges (for permitted workspaces only)
- Keyboard shortcut
- Context menu
- Drag ordering (future)

Workspace icons are registered by modules together with required permissions. No icon is shown without authorisation.

---

## 7. Navigation Sidebar

Displays navigation for the currently selected workspace.

Example (Projects workspace — items permission-filtered):

- Dashboard
- Projects
- Tasks
- Boards
- Calendar
- Reports

The sidebar should support:

- Collapse
- Expand
- Resize
- Pinned sections
- Favourite items
- Recently visited items
- Search (within permitted scope)

Sidebar entries are computed from module navigation metadata and the user's effective permissions, not from static configuration.

---

## 8. Workspace

The workspace is the primary working area.

It contains:

- Pages
- Panels
- Editors
- Tables
- Forms
- Dashboards
- Graphs
- Kanban Boards
- Reports

Every module must render inside the workspace.

Opening a workspace or deep link must fail gracefully (or redirect) when the user lacks permission — never render protected content first.

---

## 9. Workspace Tabs

Users may have multiple workspaces open simultaneously.

Examples:

- Project Alpha
- Support Ticket #302
- Customer Record
- Analytics Dashboard
- Document Review

Tabs should support:

- Close
- Pin
- Reorder
- Restore Previous Session (only permitted tabs)
- Unsaved Changes Indicator
- Keyboard Navigation

Tab restoration must re-validate permissions; tabs the user no longer has access to must not reopen.

---

## 10. Context Panel

Positioned on the right.

Displays contextual information.

Examples (each section permission-gated):

- Activity
- Properties
- History
- Audit
- Notes
- Comments
- Attachments
- Workflow
- Details

Users may:

- Collapse
- Resize
- Hide
- Dock

---

## 11. Bottom Status Bar

Displays:

- Logged-in User
- Current Workspace
- Connection Status
- Background Jobs
- Notifications
- Version
- Environment
- Sync Status

The status bar should remain minimal.

---

## 12. Notification Layer

Supports:

Full specification: [021 — Notification, Activity & Attention Management Framework](./021-notification-activity-attention-management-framework.md).

- Toast Notifications
- Success
- Information
- Warning
- Errors
- Long-running Tasks
- Notification Centre

Users should never lose important notifications.

Notification types and actions must respect permissions (e.g. admin-only alerts not shown to standard users).

---

## 13. Dialog Framework

Standardise:

- Confirmation Dialogs
- Wizard Dialogs
- Selection Dialogs
- Warning Dialogs
- Error Dialogs
- Fullscreen Dialogs

No module may implement its own dialog style.

---

## 14. Command Palette

Inspired by Cursor and VS Code.

Shortcut: **Ctrl + Shift + P**

Full specification: [019 — Universal Command Palette & Action Framework](./019-universal-command-palette-action-framework.md).

Capabilities (all commands permission-filtered):

- Navigate
- Search
- Run Actions
- Open Workspaces
- Create Records
- Switch Modules
- Launch Automation
- System Commands

Every module may contribute commands with declared permission requirements.

The palette must never list commands the user cannot execute.

---

## 15. Global Search

Single search experience.

Full specification: [020 — Unified Search, Knowledge & Discovery Framework](./020-unified-search-knowledge-discovery-framework.md).

Must support (each category only if permitted):

- Projects
- Documents
- Users
- Support Requests
- Tasks
- Reports
- Settings
- Commands

Search results grouped by category.

Search index and result visibility are permission-scoped at query time.

---

## 16. Workspace Layout

Each workspace may contain:

- Navigation
- Toolbar
- Filters
- Content Area
- Side Panel
- Footer Actions

Every workspace should follow the same layout principles.

Toolbar and footer actions are permission-gated.

---

## 17. Panels

Panels are reusable UI containers.

Supported behaviour:

- Move
- Resize
- Collapse
- Expand
- Fullscreen
- Dock
- Undock (future)
- Persistent State

---

## 18. Toolbar

Every workspace toolbar follows the same design.

May contain (each action permission-gated):

- Create
- Edit
- Delete
- Export
- Refresh
- Filter
- Search
- Bulk Actions
- Settings
- Help

Toolbars should remain uncluttered.

---

## 19. Keyboard First Design

Every major action should have a shortcut.

- Navigation
- Search
- Command Palette
- Save
- Close
- Switch Tabs
- Move Panels
- Notifications

Accessibility is improved through keyboard support.

Shortcuts for unauthorised actions must not be registered or must no-op with consistent feedback.

---

## 20. Theme Framework

Support:

- Light
- Dark
- High Contrast
- Future Custom Themes

Themes should be token-based.

Avoid hardcoded colours.

---

## 21. Responsive Behaviour

Desktop is the primary target.

Tablet support is required.

Mobile support is secondary.

On smaller screens:

- Sidebar collapses.
- Panels become overlays.
- Tabs scroll.
- Toolbars simplify.

Never remove functionality — only hide or collapse what the user is permitted to use.

---

## 22. State Persistence

Remember:

- Last Workspace (if still permitted)
- Open Tabs (re-validated on restore)
- Sidebar Width
- Panel Sizes
- Collapsed Sections
- Theme
- Recent Activity (permitted items only)
- Window Preferences

Users should feel continuity between sessions.

---

## 23. Animations

Animations should be subtle.

Examples:

- Fade
- Slide
- Expand
- Collapse
- Loading Skeletons

No unnecessary animation.

Performance always takes priority.

---

## 24. Error Experience

Errors should appear consistently.

Examples:

- Inline Validation
- Toast
- Dialog
- Recovery Suggestions
- Retry Buttons

Backend errors must be translated into platform language.

Permission denials use consistent, non-leaking messages (no hint of hidden resources).

---

## 25. Accessibility

Support:

- Keyboard Navigation
- Focus Indicators
- ARIA Labels
- Screen Readers
- Colour Contrast
- Reduced Motion

Accessibility is part of every component.

---

## 26. Extensibility

Every new module must integrate with:

- Activity Bar (with permission metadata)
- Sidebar (with permission metadata)
- Command Palette
- Search
- Notifications
- Permissions
- Workspace Tabs
- Context Panel

No module should bypass the desktop framework.

No module should render navigation or actions without registering permission requirements.

---

## 27. Role & Permission-Driven UI (Mandatory)

The Desktop Framework is not a static layout with fixed menus.

### 27.1 Dynamic visibility

- **Activity Bar**, **Sidebar**, **Header actions**, **Toolbars**, **Command Palette**, **Global Search**, **Context Panel sections**, and **Workspace entry points** are computed from the user's effective roles and permissions.
- If a user does not have access to a system or capability, the corresponding menu item, workspace icon, command, or search category **must not appear**.
- Prefer hide-over-disable for navigation; use disable only when UX requires showing that an action exists but is temporarily unavailable.

### 27.2 Permission service integration

- The shell consumes **PermissionService** (and related identity/role data) — never hardcoded role checks in presentation components.
- Permission evaluation must be consistent server-side and client-side; server is authoritative.
- Permission changes (role assignment, revocation) should update the shell dynamically where possible (session refresh, realtime, or explicit re-auth as designed).

### 27.3 Module registration contract

Modules register:

- Navigation items
- Activity Bar entries
- Commands
- Search providers
- Toolbar actions

Each registration includes **required permissions** (and optional role hints). The shell filters registrations before display.

### 27.4 Superadmin

**Superadmin is not a normal user.**

- Superadmin is a **special permission tier**, not a standard end-user persona.
- Superadmin capabilities (platform configuration, integration diagnostics, elevated administration) use **explicit superadmin permissions**, separate from regular user roles.
- The shell may expose additional Administration / diagnostic surfaces only when superadmin (or equivalent) permissions are present.
- Superadmin UI must not be conflated with standard user workspaces; it remains within the same Desktop Framework but with a clearly distinct permission model.
- Never treat "superadmin" as a bypass that skips audit, authorisation checks, or permission metadata — it is a defined permission set, not an escape hatch.

### 27.5 Deep links and APIs

- Direct URLs and API calls must enforce permissions independently of UI visibility.
- UI hiding is not security; enforcement happens in Application, Service, and API layers per Document 003.

---

## 28. Cursor Instructions

Cursor must treat the Desktop Framework as a permanent platform shell.

The shell must be developed before business modules.

Every future screen must inherit from this framework.

Avoid creating isolated page layouts.

Build reusable components.

Prefer composition over duplication.

Maintain a consistent visual language throughout the platform.

All shell navigation and actions must be permission-driven per Section 27.

---

## 29. Acceptance Criteria

The Desktop Framework is complete when:

- A user can navigate between workspaces without page reloads.
- The shell remains consistent across all modules.
- Panels are resizable and state is persisted.
- Keyboard shortcuts work consistently.
- The Command Palette can invoke platform actions.
- Themes apply globally.
- Notifications, dialogs and search behave uniformly.
- The platform feels like a cohesive desktop application rather than a collection of web pages.
- **Navigation, Activity Bar, Sidebar, commands, and search only show items the user is permitted to access.**
- **Permission changes are reflected correctly; superadmin surfaces appear only for superadmin permission holders.**
- **Direct access without permission is blocked server-side with consistent error handling.**

The Desktop Framework becomes the foundation for every future feature developed within APZHUB.
