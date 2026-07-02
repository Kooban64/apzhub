# Document 018 — Workspace Sessions, Window Management & State Persistence Framework

> **Document Version:** 1.0  
> **Classification:** Platform Specification  
> **Status:** Core Platform Standard  
> **Applies To:** Desktop Shell · All Platform Modules · Future Desktop Client · Future Mobile Client (where applicable)  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [017](./017-navigation-framework-workspace-navigation-architecture.md)  
> **Relationship:** Extends [016 — Desktop Shell](./016-desktop-shell-architecture-user-experience-framework.md) window behaviour and [017 — Navigation Framework](./017-navigation-framework-workspace-navigation-architecture.md) state persistence. Session metadata is platform-owned per [011 — Platform Data Architecture](./011-platform-data-architecture-database-design-principles.md). Restore and visibility are permission-aware per [005](./005-desktop-experience-workspace-framework.md) and [007](./007-identity-authentication-authorisation-rbac-architecture.md). User preference categories and hierarchy: [023 — User Preferences](./023-user-preferences-personalisation-workspace-experience-framework.md).

## 1. Purpose

This document defines how APZHUB manages workspaces, sessions, windows, layouts and user state.

Unlike traditional web applications, APZHUB maintains persistent working environments.

The platform should feel like an operating system rather than a collection of pages.

---

## 2. Vision

A Workspace Session represents an entire working environment.

A Workspace Session contains everything necessary for a user to resume work exactly where they left off.

Users should never feel that they are "starting over."

---

## 3. Workspace Session

A Workspace Session includes:

- Open Workspaces
- Open Tabs
- Selected Records
- Filters
- Sorting
- Panel Sizes
- Window Positions
- Context Panels
- Sidebars
- Expanded Trees
- Search Results
- Pinned Items
- Recently Viewed
- Command History (optional)
- Temporary Drafts

The session represents the user's complete working context.

Session payloads store **references and UI state** — not authoritative business data ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 4. Session Philosophy

Users do not merely open pages.

Users enter working environments.

Changing sessions should feel similar to changing virtual desktops.

---

## 5. Session Types

- Default Session
- Personal Session
- Temporary Session
- Pinned Session
- Shared Session
- Read-only Session
- Administrative Session

Future session types may be introduced.

Administrative sessions use explicit administrative permissions — not a security bypass ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 6. Automatic Session Restore

When a user signs in:

**Restore:**

- Workspace
- Tabs
- Panel Sizes
- Window Layout
- Selected Objects
- Recent Searches
- Context
- Cursor Position (where practical)

Users should continue where they left off.

Restored tabs, records, and context must **re-validate permissions** before display ([005](./005-desktop-experience-workspace-framework.md), [017](./017-navigation-framework-workspace-navigation-architecture.md)).

---

## 7. Multiple Sessions

Users may have multiple named sessions.

**Examples**

- Morning Support
- Month End
- Compliance Review
- Development
- Executive Dashboard
- Legal Review

Switching sessions should require only a single action.

---

## 8. Session Switching

Switching sessions should:

- Save current state.
- Load new state.
- Restore navigation.
- Restore layout.
- Restore active records.
- Restore filters.
- Restore context.

No manual setup should be required.

---

## 9. Workspace Windows

Each Workspace may contain:

- Tabs
- Panels
- Editors
- Dashboards
- Tables
- Reports
- Calendars
- Kanban Boards

Every workspace behaves consistently.

Window and tab behaviour is platform-owned — modules contribute content, not window chrome ([016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 10. Tab Management

Tabs support:

- Open
- Close
- Pin
- Duplicate
- Move
- Restore
- Unsaved Changes
- Multi-select
- Drag & Drop

Tabs are platform-owned.

Unsaved indicators and restore align with [016](./016-desktop-shell-architecture-user-experience-framework.md) Workspace Tabs.

---

## 11. Split Views

Support:

- Vertical Split
- Horizontal Split
- Nested Split
- Resizable Dividers
- Independent Scrolling

Users may compare multiple records simultaneously.

Split views are reusable shell capabilities — not per-module implementations ([016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 12. Docking

Panels support:

- Dock Left
- Dock Right
- Dock Bottom
- Float (future)
- Collapse
- Expand
- Hide
- Reset

Docking is consistent across every module.

Context Panel docking per [016](./016-desktop-shell-architecture-user-experience-framework.md).

---

## 13. Layout Persistence

Persist:

- Panel Sizes
- Panel Visibility
- Sidebar Width
- Context Width
- Split Ratios
- Toolbar Preferences
- Workspace Order

No user configuration should be lost.

Layout state is user preference metadata — platform PostgreSQL ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 14. Workspace Templates

Users may create templates.

**Examples**

- Support Agent
- Project Manager
- Executive
- Developer
- Compliance Officer

Templates accelerate onboarding.

Templates declare default layout and navigation — permissions still gate what the user can actually open ([005](./005-desktop-experience-workspace-framework.md)).

---

## 15. Shared Sessions

Future capability.

Users may share:

- Layouts
- Dashboards
- Tabs
- Reports
- Workspace Configuration

Without sharing personal preferences.

Shared sessions must not expose records or layouts the recipient cannot access ([007](./007-identity-authentication-authorisation-rbac-architecture.md), [013](./013-security-architecture-zero-trust-framework.md)).

---

## 16. Draft Recovery

The platform should recover:

- Unsaved Forms
- Draft Notes
- Comments
- Filters
- Searches

User work should never be lost because of accidental refreshes or browser closure.

Drafts are platform-managed temporary state — not duplicated engine records ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 17. Undo & Recovery

Where appropriate support:

- Undo
- Redo
- Recently Closed Tabs
- Recently Closed Workspaces
- Session History

Recovery improves confidence.

---

## 18. Session Metadata

Every session stores:

- Name
- Owner
- Created
- Modified
- Workspace Count
- Last Used
- Pinned
- Favourite
- Sharing Information

Sessions are platform metadata.

Stored in platform data layer with standard audit fields ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 19. Context Preservation

Navigation should preserve:

- Selected Project
- Selected Ticket
- Selected Document
- Current Folder
- Selected Report
- Current Dashboard

Users remain in context while navigating.

Aligns with [017](./017-navigation-framework-workspace-navigation-architecture.md) context preservation and breadcrumbs.

---

## 20. Temporary Workspaces

Support temporary workspaces.

**Examples**

- Search Results
- Quick Comparison
- Preview
- Import Wizard
- Review Tasks

Temporary workspaces close automatically when no longer required.

---

## 21. Background State

Background jobs should continue regardless of session changes.

Users may switch sessions without interrupting long-running operations.

Jobs are platform-owned per [012](./012-event-driven-architecture-background-processing-workflow-framework.md); session switch does not cancel in-flight work.

---

## 22. Performance

Session loading should be extremely fast.

Optimise using:

- Lazy Loading
- Metadata
- Caching
- Incremental Restore
- Parallel Loading

Avoid unnecessary backend requests.

Per [004](./004-technology-stack-repository-standards-development-environment.md) and shell performance targets ([016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 23. Multi-Device Support

Future capability.

Users should eventually resume sessions across:

- Desktop
- Laptop
- Browser
- Tablet
- Mobile

Session architecture should support future synchronisation.

Session model must remain client-agnostic for future Electron/Tauri packaging ([016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 24. Accessibility

Support:

- Keyboard Navigation
- Screen Readers
- Focus Restoration
- Reduced Motion
- High Contrast

Workspace accessibility is mandatory.

Focus restoration after session switch per [006](./006-enterprise-design-system-ui-standards.md).

---

## 25. Security

Session data should respect:

- Permissions
- Workspace Access
- Connector Permissions
- Sensitive Information
- Administrative Policies

Sessions should never expose inaccessible records.

Zero Trust applies to every restore path ([013](./013-security-architecture-zero-trust-framework.md)). Session payloads must not store secrets or connector credentials ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 26. Testing

Workspace Sessions require:

- Unit Tests
- Persistence Tests
- Performance Tests
- Playwright Tests
- Recovery Tests
- Regression Tests

State restoration must be reliable.

Permission tests must verify restored sessions cannot surface inaccessible tabs or records ([015](./015-software-quality-testing-qa-cicd-release-management-framework.md)).

---

## 27. Cursor Instructions

When implementing Workspace Sessions:

- Treat sessions as first-class platform objects.
- Persist only platform metadata, never duplicate backend business data.
- Restore context automatically.
- Build split views and docking as reusable platform capabilities.
- Ensure layouts remain independent of business modules.
- Optimise for productivity rather than page navigation.

Workspace Sessions are a defining capability of APZHUB.

---

## 28. Acceptance Criteria

The Workspace Session Framework is complete when:

- Users can save and restore complete working environments.
- Multiple named sessions are supported.
- Window layouts persist automatically.
- Tabs, panels and context are restored accurately.
- Long-running work continues independently of session changes.
- Sessions remain secure and permission-aware.
- Future desktop and mobile clients can reuse the same session model.
- **Restored sessions re-validate permissions** — inaccessible tabs and records are not shown.
- **Session storage holds references and UI state only** — no authoritative business data duplication.

The Workspace Session Framework transforms APZHUB from a conventional web application into a persistent Enterprise Workbench.
