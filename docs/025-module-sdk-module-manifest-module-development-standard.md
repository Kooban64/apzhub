# Document 025 — Module SDK, Module Manifest & Module Development Standard

> **Document Version:** 1.0  
> **Classification:** Developer Specification  
> **Status:** Mandatory  
> **Applies To:** Every Platform Module · Future Module · Cursor · AI Development Agents · Internal Developers  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [024](./024-apzhub-platform-sdk-development-framework.md)  
> **Relationship:** Implements the **Module SDK** category of [024 — APZHUB Platform SDK](./024-apzhub-platform-sdk-development-framework.md). Extends [008 — Module, Plugin & Connector Architecture](./008-module-plugin-connector-architecture.md) with manifest schema, directory structure, and Cursor workflow. Registration integrates with [017](./017-navigation-framework-workspace-navigation-architecture.md), [019](./019-universal-command-palette-action-framework.md), [020](./020-unified-search-knowledge-discovery-framework.md), and [021](./021-notification-activity-attention-management-framework.md).

## 1. Purpose

This document defines the APZHUB Module SDK and Module Manifest standard.

Every business capability in APZHUB must be implemented as a Platform Module.

A Platform Module is not a standalone React app, not a page, and not a direct wrapper around an OSS backend.

A Platform Module is a packaged business capability that registers itself with APZHUB through a manifest and interacts with the rest of the system only through approved platform services.

---

## 2. Core Principle

Every module must begin with a manifest before implementation.

The manifest is the contract.

The code is the implementation of that contract.

Cursor must never begin module implementation before the module manifest exists.

Manifest-first per [024](./024-apzhub-platform-sdk-development-framework.md) Section 8.

---

## 3. What Is a Module?

A module is a user-facing business capability.

**Examples:**

- Projects
- Support
- Documents
- Time Tracking
- Automation
- Analytics
- Testing
- Compliance
- Security
- Monitoring
- Administration
- HR
- CRM
- Finance
- Legal
- AI Assistant

Modules are what users see.

Backend engines remain hidden implementation details.

User-facing names per [002 — Terminology Standard](./002-product-naming-positioning-terminology-standard.md).

---

## 4. What a Module Is Not

A module is not:

- A direct frontend over a backend product
- A collection of links
- A separate application
- A hardcoded route group
- A backend-specific wrapper
- A place for direct connector calls

Modules must never expose Plane, Kimai, Zammad, Paperless, Metabase, n8n, Kiwi TCMS, or any future backend engine directly to users.

Per [008](./008-module-plugin-connector-architecture.md) and [005](./005-desktop-experience-workspace-framework.md) — modules render inside the Desktop Shell only.

---

## 5. Module Architecture

Each module may contain:

- Manifest
- Navigation
- Routes
- Views
- Components
- Commands
- Permissions
- Search provider
- Events
- Notifications
- Widgets
- Dashboards
- Reports
- Settings
- Documentation
- Tests

Modules consume platform services.

Modules do not call connectors directly.

Per [009](./009-platform-service-layer-integration-framework.md) and [027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md) — modules call service interfaces only. Execution path: Module → Platform Service → Connector → Engine ([010](./010-api-gateway-integration-communication-standards.md)).

---

## 6. Module Lifecycle

Each module supports the following states:

- Not Installed
- Installed
- Configured
- Enabled
- Disabled
- Maintenance
- Deprecated
- Removed

The platform manages the lifecycle through the Module Registry.

Lifecycle and release per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 7. Module Manifest

Every module must provide a manifest file.

Recommended file name:

```text
module.yaml
```

The manifest must define the module identity, capabilities, permissions, routes, commands, search providers, settings, documentation and tests.

---

## 8. Example Module Manifest

```yaml
module:
  id: projects
  name: Projects
  version: 1.0.0
  category: productivity
  status: enabled
  description: Project and task management workspace.

metadata:
  owner: APZHUB
  icon: folder-kanban
  tags:
    - projects
    - tasks
    - work
  selfHostedOnly: true

compatibility:
  platformVersion: ">=1.0.0"
  requires:
    - identity
    - permissions
    - workspace
    - search
    - audit
    - notifications

navigation:
  activityBar:
    enabled: true
    label: Projects
    icon: folder-kanban
    order: 20
    permission: project.view

  sidebar:
    - id: projects.dashboard
      label: Dashboard
      route: /projects
      icon: layout-dashboard
      permission: project.view

    - id: projects.list
      label: Projects
      route: /projects/list
      icon: folder
      permission: project.view

    - id: projects.tasks
      label: Tasks
      route: /projects/tasks
      icon: check-square
      permission: task.view

permissions:
  - id: project.view
    description: View projects

  - id: project.create
    description: Create projects

  - id: project.edit
    description: Edit projects

  - id: project.delete
    description: Delete projects

commands:
  - id: projects.create
    label: Create Project
    category: Creation
    permission: project.create

  - id: projects.open
    label: Open Project
    category: Navigation
    permission: project.view

search:
  providers:
    - id: projects.search
      entity: Project
      permission: project.view

events:
  publishes:
    - ProjectCreated
    - ProjectUpdated
    - ProjectArchived

  subscribes:
    - UserProvisioned

notifications:
  types:
    - id: project.assigned
      label: Project Assigned
      attention: normal

settings:
  sections:
    - id: projects.general
      label: General

health:
  enabled: true

tests:
  unit: true
  integration: true
  playwright: true
  accessibility: true

documentation:
  overview: docs/overview.md
  admin: docs/admin-guide.md
  developer: docs/developer-guide.md
```

---

## 9. Module Registry

APZHUB maintains a Module Registry.

The registry stores:

- Module ID
- Name
- Version
- Status
- Installed state
- Enabled state
- Permissions
- Navigation entries
- Commands
- Search providers
- Health status
- Configuration state
- Dependencies

The Desktop Shell reads from the Module Registry rather than hardcoding modules.

Platform-owned metadata per [011](./011-platform-data-architecture-database-design-principles.md). Auto-discovery per [024](./024-apzhub-platform-sdk-development-framework.md).

---

## 10. Navigation Registration

Modules may contribute:

- Activity Bar entries
- Sidebar entries
- Workspace routes
- Context panel entries
- Breadcrumb rules
- Badges
- Keyboard shortcuts

Navigation is rendered by the Desktop Shell.

Modules register navigation; they do not own the shell.

Per [017](./017-navigation-framework-workspace-navigation-architecture.md) — permission-filtered before display ([005](./005-desktop-experience-workspace-framework.md)).

---

## 11. Command Registration

Modules may register commands for the Command Palette.

**Examples:**

- Create Project
- Open Ticket
- Upload Document
- Start Timer
- Run Workflow
- Generate Report

Commands must execute through Platform Services.

Commands must be permission-aware.

Per [019](./019-universal-command-palette-action-framework.md) — Command → Platform Service → Connector → Engine.

---

## 12. Permission Registration

Modules define their permissions declaratively.

Permissions should be granular.

**Examples:**

- project.view
- project.create
- project.edit
- ticket.assign
- document.approve
- workflow.execute

Platform Permission Services enforce permissions.

Modules must not implement their own authorisation engine.

Per [007](./007-identity-authentication-authorisation-rbac-architecture.md) — APZHUB owns RBAC; BetterAuth is authentication only.

---

## 13. Search Registration

Modules register search providers.

Search providers expose metadata to the Platform Search Service.

Modules must not create independent search systems.

Search results must respect platform permissions.

Per [020](./020-unified-search-knowledge-discovery-framework.md).

---

## 14. Event Registration

Modules publish events rather than calling other modules directly.

**Examples:**

- ProjectCreated
- TicketAssigned
- DocumentUploaded
- WorkflowCompleted

Events allow notifications, audit, search and activity to update consistently.

Per [012](./012-event-driven-architecture-background-processing-workflow-framework.md) — no module-to-module coupling.

---

## 15. Notification Registration

Modules define notification types only.

The Notification and Attention Framework decides delivery.

Modules must not send notifications directly.

Per [021](./021-notification-activity-attention-management-framework.md).

---

## 16. Settings Registration

Modules may expose configuration sections.

Settings are rendered inside the platform Settings Workspace.

Modules must not create separate settings experiences.

Module configuration sections are distinct from user preferences — platform prefs per [023](./023-user-preferences-personalisation-workspace-experience-framework.md).

---

## 17. Connector Dependencies

Modules may declare required connectors.

**Example:**

The Projects module may use a Project Service, which may be backed by a Plane connector today and another project engine tomorrow.

Modules must not depend directly on connector implementations.

Per [008](./008-module-plugin-connector-architecture.md) — `ProjectService`, not `PlaneService` or `PlaneConnector` in module code. Per [026 — Integration SDK](./026-integration-sdk-adapter-framework-integration-manifest-specification.md) — `integration.yaml` defines the adapter contract.

---

## 18. Standard Module Directory Structure

```text
modules/
└── projects/
    ├── module.yaml
    ├── README.md
    ├── CHANGELOG.md
    ├── src/
    │   ├── index.ts
    │   ├── views/
    │   ├── components/
    │   ├── commands/
    │   ├── search/
    │   ├── events/
    │   ├── widgets/
    │   ├── reports/
    │   ├── settings/
    │   ├── permissions/
    │   ├── types/
    │   └── utils/
    ├── tests/
    │   ├── unit/
    │   ├── integration/
    │   ├── playwright/
    │   ├── accessibility/
    │   └── performance/
    └── docs/
        ├── overview.md
        ├── admin-guide.md
        ├── developer-guide.md
        └── user-guide.md
```

Monorepo `/modules` per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 19. Testing Requirements

Every module requires:

- Unit tests
- Component tests
- Integration tests
- Permission tests
- Playwright E2E tests
- Accessibility tests
- Regression tests

A module is not complete unless tests pass.

Definition of Done per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md). Permission tests must verify hidden nav, commands, and search ([017](./017-navigation-framework-workspace-navigation-architecture.md), [019](./019-universal-command-palette-action-framework.md), [020](./020-unified-search-knowledge-discovery-framework.md)).

---

## 20. Documentation Requirements

Every module requires:

- Overview
- Architecture notes
- User guide
- Admin guide
- Developer guide
- Configuration guide
- Test instructions
- Known limitations

Documentation must be updated with implementation.

Must not contradict foundation documents ([001](./001-project-vision-and-guiding-principles.md)–[024](./024-apzhub-platform-sdk-development-framework.md)).

---

## 21. Security Requirements

Every module must:

- Respect platform authentication
- Use platform authorisation
- Validate inputs
- Avoid direct backend calls
- Avoid hardcoded secrets
- Generate audit events
- Respect user permissions
- Hide backend implementation details

Per [013](./013-security-architecture-zero-trust-framework.md). Audit centralised in Platform Services ([009](./009-platform-service-layer-integration-framework.md)).

---

## 22. Observability Requirements

Every module must expose:

- Health status
- Version
- Dependencies
- Errors
- Performance metrics
- Configuration status

The Administration Workspace must be able to inspect module health.

Per [014](./014-observability-monitoring-telemetry-health-framework.md) — permission-gated admin surfaces.

---

## 23. Cursor Instructions

Cursor must follow this process when creating or modifying a module:

1. Read Document 025.
2. Generate or update `module.yaml`.
3. Validate the manifest.
4. Generate interfaces.
5. Register navigation.
6. Register commands.
7. Register permissions.
8. Register search providers.
9. Register events.
10. Generate tests.
11. Generate documentation.
12. Implement only the approved module scope.

Cursor must not implement direct backend calls inside modules.

Cursor must not hardcode modules into the Desktop Shell.

Cursor must not skip tests.

**Phase gate:** Do not implement until project owner authorises development ([001](./001-project-vision-and-guiding-principles.md)).

---

## 24. Acceptance Criteria

The Module SDK is complete when:

- Every module begins with a manifest.
- Modules register themselves dynamically.
- Navigation is generated from module metadata.
- Commands are generated from module metadata.
- Search providers are registered through the platform.
- Permissions are enforced by platform services.
- Modules are independently testable.
- Modules can be enabled, disabled or removed without changing the Desktop Shell.
- Backend engines remain hidden from users.
- **No module calls connectors or backend engines directly.**
- **No module sends notifications or implements standalone search.**

The Module SDK establishes the permanent development model for all APZHUB business capabilities.
