# Document 019 — Universal Command Palette & Action Framework

> **Document Version:** 1.0  
> **Classification:** Platform Specification  
> **Status:** Core Platform Standard  
> **Applies To:** Desktop Shell · All Platform Modules · All Platform Services · Future Plugins · Future AI Extensions  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [018](./018-workspace-sessions-window-management-state-persistence-framework.md)  
> **Relationship:** Expands [005 — Desktop Experience & Workspace Framework](./005-desktop-experience-workspace-framework.md) Section 14 (Command Palette summary). Presented by the [Desktop Shell](./016-desktop-shell-architecture-user-experience-framework.md). Integrates with [017 — Navigation Framework](./017-navigation-framework-workspace-navigation-architecture.md), [018 — Workspace Sessions](./018-workspace-sessions-window-management-state-persistence-framework.md), and [020 — Unified Search](./020-unified-search-knowledge-discovery-framework.md). Commands execute via [009 — Platform Service Layer](./009-platform-service-layer-integration-framework.md); modules register per [008](./008-module-plugin-connector-architecture.md).

## 1. Purpose

The Universal Command Palette (UCP) is the primary command interface for APZHUB.

It provides a single, searchable interface through which users can execute commands, navigate the platform, perform actions, locate resources and interact with future AI capabilities.

The Command Palette is a platform capability.

Modules contribute commands.

The Desktop Shell presents them.

---

## 2. Vision

The Command Palette should become the fastest way to interact with APZHUB.

A user should eventually be able to perform nearly every platform action without navigating menus.

The experience should be familiar to users of Cursor, Visual Studio Code and JetBrains IDEs while remaining intuitive for business users.

---

## 3. Philosophy

The Command Palette is not merely search.

It is an **Action Engine**.

Users search for:

- Actions
- Objects
- Commands
- Reports
- People
- Projects
- Documents
- Tickets
- Settings
- Workflows

Everything accessible within APZHUB should be discoverable through the Command Palette.

---

## 4. Activation

Default shortcut:

**Ctrl + Shift + P**

Additional access:

- Header Button
- Quick Launcher
- Future Voice Commands
- Future AI Assistant

The Command Palette should open instantly.

Shared Command Palette component per [006 — Enterprise Design System](./006-enterprise-design-system-ui-standards.md).

---

## 5. Command Categories

- Platform Commands
- Workspace Commands
- Record Commands
- Navigation Commands
- Search Commands
- Workflow Commands
- Administration Commands
- Connector Commands
- AI Commands (future)
- Developer Commands

Each command belongs to exactly one category.

---

## 6. Command Registration

Every module may register commands.

Registration includes:

- Command ID
- Display Name
- Description
- Category
- Required Permission
- Keyboard Shortcut
- Icon
- Parameters
- Search Keywords
- Command Handler

Visibility Rules

Commands should be discovered automatically.

Registration is part of the module contract ([003](./003-overall-system-architecture-design-principles.md), [008](./008-module-plugin-connector-architecture.md)). Command metadata is platform-owned ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 7. Examples

Examples include:

- Create Project
- Open Project
- Create Ticket
- Assign Ticket
- Upload Document
- Start Timer
- Generate Report
- Open Analytics
- Switch Workspace
- Run Workflow
- View Audit History
- Manage Users
- Open Settings

Every major platform action should have a command.

Display names follow [002 — Terminology Standard](./002-product-naming-positioning-terminology-standard.md).

---

## 8. Navigation Commands

Support:

- Open Workspace
- Open Tab
- Switch Session
- Recent Items
- Favourite Items
- Go to Dashboard
- Quick Navigation

Navigation should never require deep menu traversal.

Aligns with [017 — Navigation Framework](./017-navigation-framework-workspace-navigation-architecture.md). Session switching per [018](./018-workspace-sessions-window-management-state-persistence-framework.md).

---

## 9. Search Integration

The Command Palette integrates with:

- Global Search
- Workspace Search
- Recent Items
- Pinned Items
- Favourites
- Saved Searches

Results should remain organised and prioritised.

Search results are permission-filtered ([005](./005-desktop-experience-workspace-framework.md)). The palette must not duplicate navigation unnecessarily ([017](./017-navigation-framework-workspace-navigation-architecture.md)).

---

## 10. Intelligent Ranking

Commands should be ranked using:

- Usage Frequency
- Recent Usage
- Workspace Context
- Permissions
- Current Record
- Current Module
- User Preferences
- Future AI Ranking

Users should see the most relevant actions first.

Usage and preferences are platform metadata — not engine data ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 11. Parameters

Commands may require parameters.

**Examples**

Create Project

↓

Project Name

↓

Template

↓

Department

↓

Create

Parameters should be collected through lightweight dialogs.

Per [006](./006-enterprise-design-system-ui-standards.md) overlay layer and [016](./016-desktop-shell-architecture-user-experience-framework.md) — no module-specific dialog styles.

---

## 12. Context Awareness

Commands should adapt to:

- Current Workspace
- Current Selection
- Current Record
- Permissions
- Organisation
- Session

Users should only see commands they can execute.

Server-side permission evaluation is authoritative ([005](./005-desktop-experience-workspace-framework.md), [007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 13. Keyboard Navigation

Support:

- Arrow Keys
- Tab
- Enter
- Escape
- Ctrl+P
- Ctrl+Shift+P
- Quick Selection
- Multi-Step Commands

The palette must be fully keyboard accessible.

Per [006](./006-enterprise-design-system-ui-standards.md) focus management and shell keyboard-first objectives ([016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 14. Command History

Maintain:

- Recent Commands
- Pinned Commands
- Favourite Commands
- Frequently Used Commands

Users should quickly repeat previous actions.

Command history is platform-managed user preference metadata ([011](./011-platform-data-architecture-database-design-principles.md), [018](./018-workspace-sessions-window-management-state-persistence-framework.md)).

---

## 15. Command Groups

Commands should appear in groups.

**Examples**

- Navigation
- Creation
- Editing
- Administration
- Reports
- Automation
- Security
- AI

Groups improve discoverability.

---

## 16. Command Chaining

Future capability.

**Example**

Create Project

↓

Assign Manager

↓

Create Sprint

↓

Generate Tasks

↓

Notify Team

Multiple commands execute as one workflow.

Orchestration via Platform Services and workflow framework ([009](./009-platform-service-layer-integration-framework.md), [012](./012-event-driven-architecture-background-processing-workflow-framework.md)).

---

## 17. AI Integration

Future AI capabilities may register commands.

**Examples**

- Summarise Document
- Analyse Ticket
- Draft Email
- Explain Dashboard
- Generate Meeting Notes
- Review Compliance

AI becomes another command provider.

AI commands follow the same registration, permission, and execution path as module commands.

---

## 18. Module Independence

Modules register commands.

The Desktop Shell renders commands.

No module should modify the Command Palette itself.

Per [008](./008-module-plugin-connector-architecture.md) extensibility rules.

---

## 19. Permissions

Commands evaluate:

- Authentication
- Platform Roles
- Permissions
- Business Policies
- Context

Users should never see unavailable administrative commands.

Administrative and superadmin commands require explicit permissions — superadmin is not a normal user persona ([005](./005-desktop-experience-workspace-framework.md), [007](./007-identity-authentication-authorisation-rbac-architecture.md)). Hidden commands must be undiscoverable via palette search ([017](./017-navigation-framework-workspace-navigation-architecture.md)).

---

## 20. Connector Independence

Commands never invoke backend engines directly.

Execution path:

Command

↓

Platform Service

↓

Connector

↓

Backend Engine

This maintains architectural consistency.

Per [003](./003-overall-system-architecture-design-principles.md), [009](./009-platform-service-layer-integration-framework.md), and [010](./010-api-gateway-integration-communication-standards.md). Client traffic through API Gateway only.

---

## 21. Extensibility

Future modules may contribute:

- Commands
- Categories
- Shortcuts
- Command Groups
- AI Actions
- Search Providers

No modification of the Command Palette architecture should be required.

---

## 22. Performance

The palette should:

- Open instantly.
- Search incrementally.
- Cache metadata.
- Avoid backend requests until execution.
- Support thousands of commands efficiently.

Per [004](./004-technology-stack-repository-standards-development-environment.md) and shell performance targets ([016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 23. Accessibility

Support:

- Keyboard
- Screen Readers
- Focus Management
- High Contrast
- Reduced Motion

Accessibility applies to every command.

WCAG AA per [006](./006-enterprise-design-system-ui-standards.md).

---

## 24. Testing

Command functionality requires:

- Unit Tests
- Registration Tests
- Permission Tests
- Playwright Tests
- Accessibility Tests
- Performance Tests
- Regression Tests

Command reliability is essential.

Permission tests must verify unavailable commands are not listed or executable ([015](./015-software-quality-testing-qa-cicd-release-management-framework.md)).

---

## 25. Cursor Instructions

When implementing the Command Palette:

- Build it as a reusable platform service.
- Register commands dynamically from modules.
- Never hardcode module commands.
- Keep execution independent of backend implementations.
- Optimise for keyboard-driven productivity.
- Design for future AI integration.
- Treat the Command Palette as a primary interaction model rather than a convenience feature.

---

## 26. Acceptance Criteria

The Universal Command Palette is complete when:

- Every module can register commands independently.
- Commands are permission-aware.
- Search is fast and context-sensitive.
- Keyboard navigation is fully supported.
- Commands execute through Platform Services.
- Future AI capabilities integrate naturally.
- New modules extend the palette without changing its architecture.
- Users can perform the majority of platform actions through the Command Palette.
- **Unavailable commands are not discoverable** in search or shortcuts.
- **No command bypasses Platform Services or invokes connectors directly.**

The Universal Command Palette establishes APZHUB's primary interaction model and is a defining feature of the Enterprise Workbench.
