# Document 008 — Module, Plugin & Connector Architecture

> **Status:** Active — modular architecture (permanent design principle)  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [007](./007-identity-authentication-authorisation-rbac-architecture.md)  
> **Relationship:** [024 — APZHUB Platform SDK & Development Framework](./024-apzhub-platform-sdk-development-framework.md) defines Module SDK, Connector SDK, manifest-first registration, and extension lifecycle implementing this architecture. [025 — Module SDK & Manifest Standard](./025-module-sdk-module-manifest-module-development-standard.md) defines `module.yaml`, Module Registry, directory structure, and mandatory Cursor workflow for every Platform Module. [026 — Integration SDK & Manifest Specification](./026-integration-sdk-adapter-framework-integration-manifest-specification.md) defines `integration.yaml`, Integration Adapter contract, and Service Connector implementation standard.

## Terminology note

**Service Connectors** in this document are the implementation of the **Adapter Layer** in [003](./003-overall-system-architecture-design-principles.md). User-facing code uses **Platform Services** (`ProjectService`, not `PlaneService`). Internal connector names may reference the backend (e.g. Plane Connector) in developer/infrastructure contexts only — never in the UI ([002](./002-product-naming-positioning-terminology-standard.md)).

---

## 1. Purpose

This document defines the modular architecture of APZHUB.

The platform is built from independent Platform Modules that communicate with backend systems through Service Connectors.

This separation is fundamental to the architecture.

```
Users        → Platform Modules
Modules      → Platform Services
Services     → Service Connectors
Connectors   → Backend Engines
```

This layered approach ensures complete separation between user experience and backend implementation.

---

## 2. Core Philosophy

APZHUB consists of three independent concepts:

```
Platform Modules
        ↓
Platform Services
        ↓
Service Connectors
```

These concepts must never be combined.

---

## 3. Platform Module

A Platform Module is a business capability presented to the user.

Examples:

- Projects
- Support
- Documents
- Time Tracking
- Automation
- Analytics
- Testing
- Compliance
- Monitoring
- Security
- Administration

A module represents business functionality, not technology.

Modules render inside the Desktop Framework ([005](./005-desktop-experience-workspace-framework.md)) and register navigation, permissions, and commands for permission-driven discovery ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 4. Service Connector

A Service Connector integrates APZHUB with an external backend engine.

Examples:

- Plane Connector
- Kimai Connector
- Paperless Connector
- Zammad Connector
- Kiwi Connector
- Metabase Connector
- n8n Connector

Future examples:

- Greenbone Connector
- Faraday Connector
- MobSF Connector
- Grafana Connector
- Prometheus Connector
- Loki Connector
- Wazuh Connector

Connectors are infrastructure components.

Users should never know they exist.

Connectors implement SSO/auth bridges and provisioning hooks per [007](./007-identity-authentication-authorisation-rbac-architecture.md).

---

## 5. Module Independence

Every Platform Module must operate independently.

Modules must never depend directly on other modules.

Shared functionality belongs in Platform Services.

---

## 6. Connector Independence

Every connector must be isolated.

Replacing one backend engine must require changes only within that connector.

No business logic should exist inside connectors.

---

## 7. Module Responsibilities

Every module owns:

- Navigation
- Workspace
- Views
- Commands
- Permissions (declarations and UI; evaluation via Permission Service)
- UI Components (from Design System [006](./006-enterprise-design-system-ui-standards.md))
- Business Workflows
- Search Registration
- Notifications
- Documentation
- Testing

Modules do not own authentication or backend communication.

---

## 8. Connector Responsibilities

Every connector owns:

- API Client
- Authentication (engine SSO/session integration)
- Request Translation
- Response Translation
- Retry Logic
- Version Compatibility
- Error Translation
- Health Monitoring
- Capability Discovery
- Connector Testing

Nothing else.

---

## 9. Platform Service Responsibilities

Platform Services provide the contract between modules and connectors.

Examples:

- ProjectService
- DocumentService
- TestingService
- AutomationService
- SupportService
- AnalyticsService

Services orchestrate business operations.

They hide connector implementation details.

Application and Domain layers invoke services — not connectors ([003](./003-overall-system-architecture-design-principles.md)).

---

## 10. Module Registration

Every module must register itself with APZHUB.

Registration includes:

- Module Name
- Display Name
- Navigation
- Permissions
- Routes
- Icons
- Search Provider
- Commands
- Notifications
- Settings
- Version
- Health Status

The platform automatically discovers registered modules.

Registration entries include **required permissions**; the shell filters visibility per [005](./005-desktop-experience-workspace-framework.md).

---

## 11. Connector Registration

Each connector must register:

- Supported Backend
- Version
- Supported Features
- Supported Roles
- Authentication Method
- Health Endpoint
- Provisioning Support
- API Version
- Capabilities

The platform should understand connector capabilities dynamically.

Aligns with service registration in [007](./007-identity-authentication-authorisation-rbac-architecture.md).

---

## 12. Module Lifecycle

Each module supports:

- Installed
- Enabled
- Disabled
- Maintenance
- Deprecated
- Removed

Future marketplace support should require no redesign.

---

## 13. Connector Lifecycle

Each connector supports:

- Configured
- Connected
- Synchronising
- Healthy
- Warning
- Degraded
- Offline
- Failed

The platform should monitor connector health continuously.

---

## 14. Module Manifest

Every module must expose a manifest describing:

- Identity
- Dependencies
- Permissions
- Routes
- Navigation
- Commands
- Services
- Configuration
- Documentation
- Tests
- Health Checks

Manifest-driven discovery reduces manual configuration.

---

## 15. Connector Manifest

Every connector exposes:

- Supported Backend
- API Version
- Authentication Method
- Capabilities
- Rate Limits
- Provisioning Features
- Health Endpoints
- Configuration Schema
- Error Codes

This allows connectors to evolve independently.

---

## 16. Module Communication

Modules communicate only through Platform Services.

Example:

```
Support Module
    ↓
Notification Service
    ↓
Notification Connector
    ↓
Notification Backend
```

Direct module-to-module communication is prohibited.

---

## 17. Shared Platform Services

Shared services include:

- Identity
- Permissions
- Search
- Notifications
- Audit
- Configuration
- Logging
- Telemetry
- Feature Flags
- File Storage
- Reporting
- Activity Feed

No module should duplicate these capabilities.

---

## 18. Dependency Rules

**Allowed**

```
Module → Platform Service → Connector → Backend
```

**Not allowed**

```
Module → Backend
Module → Connector
Module → Another Module
Connector → Module
```

These rules are mandatory.

---

## 19. Capability Discovery

The platform should discover:

- Installed Modules
- Available Connectors
- Connector Health
- Module Health
- Supported Features
- Configuration Status

No hardcoded assumptions should exist.

---

## 20. Plugin Architecture

Future modules should be installable without modifying the platform core.

Examples:

- Risk Module
- HR Module
- CRM Module
- Finance Module
- Legal AI Module
- Asset Management
- Monitoring
- DevOps
- Compliance

The platform must scale horizontally through modules.

---

## 21. Feature Registration

Every module should be able to register:

- Commands
- Search Providers
- Navigation
- Context Menus
- Workspace Tabs
- Notifications
- Keyboard Shortcuts
- Widgets
- Dashboards

This keeps the desktop shell extensible ([005](./005-desktop-experience-workspace-framework.md)).

---

## 22. Version Compatibility

Connectors should isolate backend version changes.

The Projects module should not require changes when the underlying project management engine is upgraded.

Connector compatibility should be tested independently.

---

## 23. Self-Hosted First Principle

APZHUB is designed around self-hosted, open-source software.

The architecture must never require Enterprise Edition features to function.

If an OSS product offers additional Enterprise capabilities, those may be supported through optional connector enhancements but must never become mandatory platform dependencies.

Every connector should target the Community Edition APIs and documented extension points wherever possible.

---

## 24. Testing Standards

Every Platform Module requires:

- Unit Tests
- Component Tests
- Integration Tests
- Playwright Tests
- Documentation

Every Connector requires:

- API Tests
- Compatibility Tests
- Mock Tests
- Health Tests
- Provisioning Tests
- Regression Tests
- SSO / auth integration tests where applicable

Modules and connectors should be testable independently.

---

## 25. Cursor Instructions

When implementing new functionality, determine whether it is:

- A Platform Module
- A Platform Service
- A Shared Service
- A Service Connector
- A Desktop Extension

Do not combine responsibilities.

Hide backend implementation completely.

Assume every backend engine may one day be replaced.

Design for isolation, extensibility, and long-term maintainability.

Target self-hosted Community Edition APIs unless optional enterprise enhancements are explicitly approved.

---

## 26. Acceptance Criteria

The Module & Connector Architecture is successful when:

- Users interact only with Platform Modules.
- Platform Services provide stable business contracts.
- Connectors isolate backend implementations.
- Community Edition / self-hosted OSS products remain fully supported without Enterprise dependencies.
- Backend engines can be replaced by changing only their connector.
- New modules can be added without modifying the platform core.
- New connectors can be introduced without changing user-facing modules.
- The platform can grow from ten modules to fifty modules while maintaining a consistent architecture.

The modular architecture defined in this document is a permanent design principle of APZHUB and must be followed for all future development.
