# Document 017 — Navigation Framework & Workspace Navigation Architecture

> **Document Version:** 1.0  
> **Classification:** Platform Specification  
> **Status:** Foundation Standard  
> **Applies To:** Desktop Shell · All Platform Modules · All Future Plugins · Administration · Mobile (where applicable)  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [016](./016-desktop-shell-architecture-user-experience-framework.md)  
> **Relationship:** Implements navigation behaviour within the [Desktop Shell](./016-desktop-shell-architecture-user-experience-framework.md). Complements [005 — Desktop Experience & Workspace Framework](./005-desktop-experience-workspace-framework.md) (DEF and permission-driven UI). Modules register navigation per [008 — Module, Plugin & Connector Architecture](./008-module-plugin-connector-architecture.md); the shell renders it. Navigation state persistence aligns with [018 — Workspace Sessions](./018-workspace-sessions-window-management-state-persistence-framework.md). Command palette integration: [019 — Universal Command Palette](./019-universal-command-palette-action-framework.md). Search integration: [020 — Unified Search](./020-unified-search-knowledge-discovery-framework.md).

## 1. Purpose

This document defines the Navigation Framework for APZHUB.

Navigation is a platform capability.

Modules contribute navigation.

The Desktop Shell renders navigation.

Users never navigate backend systems.

Navigation should feel like switching workspaces inside a professional desktop application rather than loading unrelated web pages.

---

## 2. Navigation Philosophy

Navigation should answer three questions:

**Where am I?**

**What can I do?**

**Where can I go next?**

The user should never feel lost.

---

## 3. Navigation Principles

Navigation must be:

- Consistent
- Predictable
- Minimal
- Fast
- Discoverable
- Permission Aware
- Keyboard Friendly
- Extensible
- Context Sensitive

---

## 4. Navigation Hierarchy

The platform consists of four navigation levels.

**Level 1**

Activity Bar

↓

**Level 2**

Workspace Sidebar

↓

**Level 3**

Workspace Navigation

↓

**Level 4**

Context Navigation

Each level has a unique purpose.

Shell regions per [016](./016-desktop-shell-architecture-user-experience-framework.md).

---

## 5. Activity Bar

Purpose:

Select a Platform Workspace.

**Examples**

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

Each workspace owns its own navigation.

Workspace entries are registered dynamically — never hardcoded ([008](./008-module-plugin-connector-architecture.md)).

---

## 6. Workspace Sidebar

Displays navigation within the selected workspace.

**Example**

Projects

- Dashboard
- Projects
- Boards
- Tasks
- Calendar
- Reports
- Templates
- Settings

The sidebar changes only when the workspace changes.

---

## 7. Workspace Navigation

Inside each workspace, navigation may include:

- Tabs
- Lists
- Trees
- Breadcrumbs
- Filters
- Views
- Saved Searches

Workspace navigation should remain local to the workspace.

---

## 8. Context Navigation

Context navigation provides actions related to the active record.

**Examples**

- Properties
- History
- Comments
- Attachments
- Workflow
- Audit
- Related Items
- AI Insights (future)

Context navigation changes with the selected object.

Rendered in the Context Panel per [016](./016-desktop-shell-architecture-user-experience-framework.md).

---

## 9. Navigation Registration

Every module registers:

- Workspace
- Sidebar Items
- Commands
- Routes
- Permissions
- Icons
- Badges
- Keyboard Shortcuts
- Search Providers

The shell builds navigation dynamically.

Registration is part of the module contract ([003](./003-overall-system-architecture-design-principles.md), [008](./008-module-plugin-connector-architecture.md)). Platform-owned navigation metadata is stored per [011](./011-platform-data-architecture-database-design-principles.md).

---

## 10. Navigation Metadata

Navigation entries include:

- Identifier
- Display Name
- Description
- Icon
- Permission
- Order
- Badge
- Visibility Rules
- Workspace

Navigation metadata belongs to the platform.

Display names follow [002 — Terminology Standard](./002-product-naming-positioning-terminology-standard.md) — no backend product names in user-facing navigation.

---

## 11. Permission Awareness

Navigation should display only what the current user is authorised to access.

Hidden functionality should remain undiscoverable.

Permissions are evaluated before navigation is rendered.

Server-side evaluation is authoritative; **PermissionService** feeds the shell ([005](./005-desktop-experience-workspace-framework.md), [007](./007-identity-authentication-authorisation-rbac-architecture.md)). Deep links and restored state must re-validate permissions.

---

## 12. Navigation State

The platform remembers:

- Expanded Sections
- Collapsed Sections
- Selected Workspace
- Selected View
- Sidebar Width
- Pinned Items
- Recent Locations

Navigation state is restored automatically.

Restored navigation must respect current permissions ([005](./005-desktop-experience-workspace-framework.md), [016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 13. Breadcrumbs

Breadcrumbs provide orientation.

**Example**

Projects

↓

Project Alpha

↓

Sprint 12

↓

Task 458

Breadcrumbs should always reflect the current context.

---

## 14. Favourites

Users may favourite:

- Projects
- Documents
- Tickets
- Dashboards
- Reports
- Workflows
- People
- Saved Searches

Favourites are platform-managed.

Favourited items the user no longer may access must not appear ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 15. Recently Visited

The platform maintains recently visited items.

**Examples**

- Projects
- Tickets
- Documents
- Reports
- Workflows

Users can quickly resume previous work.

Recent items are permission-filtered on display.

---

## 16. Badges

Navigation supports badges.

**Examples**

- Unread
- Assigned
- Pending Approval
- Failed Jobs
- Alerts
- Warnings

Badge updates occur dynamically.

Modules publish badge data through platform services — not by mutating shell internals ([009](./009-platform-service-layer-integration-framework.md)).

---

## 17. Search Integration

Navigation integrates with:

- Global Search
- Workspace Search
- Command Palette
- Quick Open

Search should never duplicate navigation.

Search results are permission-filtered ([005](./005-desktop-experience-workspace-framework.md)). Commands register alongside navigation ([016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 18. Keyboard Navigation

Support:

- Arrow Keys
- Tab
- Shift+Tab
- Enter
- Escape
- Quick Open
- Workspace Switching
- Command Palette

Keyboard users should have full functionality.

Per [006](./006-enterprise-design-system-ui-standards.md) focus indicators and [016](./016-desktop-shell-architecture-user-experience-framework.md) keyboard-first objectives.

---

## 19. Context Menus

Navigation items may expose context menus.

**Examples**

- Pin
- Rename (where applicable)
- Open in New Workspace
- Copy Link
- Favourite
- Recent
- Administrative Actions

Context menus should remain consistent.

Administrative actions require explicit permissions; superadmin surfaces are distinct from standard workspaces ([005](./005-desktop-experience-workspace-framework.md), [007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 20. Drag & Drop

Future support includes:

- Reorder Favourites
- Reorder Workspaces
- Pin Sections
- Dock Navigation
- Custom Layouts

The architecture should accommodate future enhancements.

---

## 21. Responsive Behaviour

**Desktop**

Permanent sidebar.

**Tablet**

Collapsible sidebar.

**Mobile**

Overlay navigation.

Navigation behaviour adapts without changing functionality.

Permission-gated hiding is authorisation, not responsive removal ([005](./005-desktop-experience-workspace-framework.md), [016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 22. Deep Linking

Every navigable object should have a stable route.

Users should be able to:

- Bookmark
- Share
- Restore
- Resume

Deep links should restore context where possible.

Routes are APZHUB-owned — never engine URLs ([002](./002-product-naming-positioning-terminology-standard.md), [010](./010-api-gateway-integration-communication-standards.md)). Deep link access requires auth and authz on arrival.

---

## 23. Extensibility

Future modules may contribute:

- Workspaces
- Sidebar Sections
- Commands
- Badges
- Search Providers
- Status Items
- Navigation Groups

No module should modify the navigation framework itself.

Each contribution declares required permissions ([008](./008-module-plugin-connector-architecture.md)).

---

## 24. Performance

Navigation should:

- Load instantly.
- Cache metadata.
- Lazy-load modules.
- Avoid unnecessary refreshes.
- Handle thousands of navigation items efficiently.

Per [004](./004-technology-stack-repository-standards-development-environment.md) and shell performance targets ([016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 25. Accessibility

Navigation must support:

- Keyboard
- Screen Readers
- ARIA
- Visible Focus
- High Contrast
- Reduced Motion

Accessibility is mandatory.

WCAG AA per [006](./006-enterprise-design-system-ui-standards.md).

---

## 26. Testing

Navigation requires:

- Unit Tests
- Integration Tests
- Permission Tests
- Playwright Navigation Tests
- Accessibility Tests
- Regression Tests

Navigation quality is essential to platform usability.

Per [015 — Software Quality Framework](./015-software-quality-testing-qa-cicd-release-management-framework.md). Permission tests must verify hidden items are undiscoverable via URL, search, and command palette.

---

## 27. Cursor Instructions

When implementing navigation:

- Build navigation from registered module metadata.
- Never hardcode workspace entries.
- Evaluate permissions before rendering.
- Maintain consistent behaviour across every workspace.
- Keep navigation independent of backend engines.
- Optimise for keyboard-driven productivity.
- Preserve user navigation state between sessions.

Navigation is a core platform capability rather than a UI convenience.

---

## 28. Acceptance Criteria

The Navigation Framework is complete when:

- Workspaces register themselves dynamically.
- Navigation is permission-aware.
- State persists across sessions.
- Modules contribute navigation without modifying the shell.
- Keyboard navigation is fully supported.
- Deep links restore user context.
- Navigation remains consistent across all platform modules.
- The framework scales to dozens of workspaces without architectural changes.
- **Hidden navigation is undiscoverable** (no URL, search, or command leakage).
- **Deep links and restored state re-validate permissions.**

The Navigation Framework establishes how users move through APZHUB and must remain consistent throughout the platform.
