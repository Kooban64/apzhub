# Document 003 — Overall System Architecture & Design Principles

> **Status:** Active — architectural standard (non-negotiable)  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md), [002](./002-product-naming-positioning-terminology-standard.md)

## 1. Purpose

This document defines the architectural principles for APZHUB.

Every component, service, API, database object, user interface, backend integration, plugin, and future module must comply with these principles.

Architecture consistency is more important than development speed.

If a proposed implementation conflicts with this document, the implementation must be redesigned.

---

## 2. Architectural Vision

APZHUB is an Enterprise Application Platform.

It is not a thin web interface over third-party products.

Instead, APZHUB owns:

- User Experience
- Business Logic
- Authentication
- Authorisation
- Navigation
- Workflows
- Permissions
- Auditing
- Notifications
- Search
- Dashboards
- Reporting
- API Contracts

Backend products provide specialised services only.

---

## 3. Architecture Philosophy

The architecture must follow these principles.

### Principle 1

The User only knows APZHUB.

Never expose backend engines.

### Principle 2

The Frontend never communicates directly with backend engines.

All communication passes through APZHUB.

### Principle 3

Every backend engine has an isolated adapter.

Adapters are replaceable.

Changing one backend product must not affect the rest of the platform.

### Principle 4

Business logic belongs inside APZHUB.

Never embed business logic inside backend engines.

Backend engines perform specialised functions.

APZHUB decides how those functions are used.

### Principle 5

Every feature is modular.

Modules should be installable, removable and upgradeable with minimal impact.

### Principle 6

Every module must be independently testable.

### Principle 7

Everything is API-first.

No UI should depend on implementation details.

---

## 4. Layered Architecture

The system is divided into strict architectural layers.

```
Presentation Layer
        ↓
Application Layer
        ↓
Domain Layer
        ↓
Service Layer
        ↓
Adapter Layer
        ↓
Backend Engines
```

Each layer has a single responsibility.

No layer may bypass another layer.

---

## 5. Presentation Layer

Responsible for:

- Desktop UI
- Workspaces
- Navigation
- Panels
- Forms
- Tables
- Dialogs
- Notifications
- Themes
- Accessibility
- Keyboard shortcuts

No business logic belongs here.

Presentation requests services.

---

## 6. Application Layer

Responsible for:

- Use cases
- Commands
- Queries
- Validation
- Orchestration
- Transactions
- Workflow execution

Business operations begin here.

---

## 7. Domain Layer

Contains:

- Business rules
- Entities
- Permissions
- Policies
- Validation
- Platform models

No backend-specific logic belongs here.

---

## 8. Service Layer

Every business capability has its own service.

Examples:

- IdentityService
- ProjectService
- DocumentService
- TestingService
- AutomationService
- SupportService
- AnalyticsService
- NotificationService
- PermissionService
- SearchService
- WorkspaceService

Each service provides a stable API for the rest of the platform.

Services never expose backend implementation details.

---

## 9. Adapter Layer

Every backend engine has an adapter.

Examples:

- ProjectAdapter
- DocumentAdapter
- SupportAdapter
- AnalyticsAdapter
- AutomationAdapter
- TestingAdapter

The adapter translates between APZHUB and the backend engine.

Responsibilities include:

- Authentication
- Request mapping
- Response mapping
- Data conversion
- Retry logic
- Caching
- Health monitoring
- Version compatibility
- Error translation
- Logging
- Auditing

Backend-specific behaviour remains inside the adapter.

---

## 10. Backend Engines

Backend engines remain the authoritative source for their specialist domain.

Examples:

- Projects
- Time Tracking
- Documents
- Support
- Testing
- Automation
- Analytics
- Monitoring
- Security

Each backend engine can evolve independently.

Replacing one engine should require changes only within its adapter.

---

## 11. Plugin Architecture

Every major capability is implemented as a Platform Module.

Examples:

- Projects Module
- Support Module
- Documents Module
- Testing Module
- Automation Module
- Analytics Module
- Compliance Module
- Security Module
- Monitoring Module
- Administration Module

Modules register themselves with the platform.

Modules should not require changes to existing modules.

---

## 12. Module Contract

Every module should provide:

- Navigation
- Permissions
- Routes
- Services
- API Endpoints
- Search integration
- Notifications
- Audit integration
- Health checks
- Configuration
- Tests
- Documentation

No exceptions.

---

## 13. Dependency Direction

Dependencies always point inward.

```
Presentation
    ↓
Application
    ↓
Domain
    ↓
Services
    ↓
Adapters
    ↓
Backend Engines
```

Reverse dependencies are prohibited.

---

## 14. Cross-Cutting Services

The following services are shared across every module.

- Identity
- Permissions
- Audit
- Notifications
- Logging
- Configuration
- Search
- Feature Flags
- Observability
- Telemetry
- Error Handling
- Caching

These services must never be duplicated.

---

## 15. Data Ownership

Every piece of data has exactly one system of record.

| Data                 | System of record  |
| -------------------- | ----------------- |
| Projects             | Project Engine    |
| Support Requests     | Support Engine    |
| Timesheets           | Time Engine       |
| Documents            | Document Engine   |
| Automation Workflows | Automation Engine |
| Analytics Metadata   | Analytics Engine  |

APZHUB owns:

- User preferences
- Platform settings
- Permissions
- Navigation
- Workspaces
- Activity feed
- Notifications
- Audit history
- Search index
- Module configuration

Never duplicate backend data unless required for caching, indexing or performance.

---

## 16. API Design

Every module exposes internal APIs through Platform Services.

External APIs communicate with:

```
Gateway
    ↓
Platform Service
    ↓
Adapter
    ↓
Backend Engine
```

Never expose backend APIs directly.

---

## 17. Event Architecture

Major business actions should publish events.

Examples:

- UserCreated
- ProjectUpdated
- TicketAssigned
- DocumentUploaded
- WorkflowExecuted
- RoleChanged

Events enable future integrations without coupling modules together.

---

## 18. Error Handling

Errors originating from backend engines must never be exposed directly.

Adapters translate backend errors into platform-standard error responses.

Users should receive consistent messages regardless of which backend generated the error.

---

## 19. Scalability Principles

The architecture must support:

- Multiple organisations
- Multiple tenants (future)
- Plugin installation
- Backend replacement
- Distributed services
- Horizontal scaling
- Future mobile applications
- Future desktop application
- Future AI services

No architectural redesign should be required.

---

## 20. Security Principles

All requests pass through:

```
Authentication
    ↓
Authorisation
    ↓
Validation
    ↓
Business Rules
    ↓
Audit
    ↓
Execution
```

Security must never rely on frontend enforcement.

---

## 21. Cursor Instructions

When generating code:

- Follow the layered architecture exactly.
- Never allow Presentation to call backend engines.
- Always use Platform Services.
- Hide backend implementation details.
- Prefer composition over inheritance.
- Prefer interfaces over concrete implementations.
- Keep modules independent.
- Make adapters replaceable.
- Keep business logic inside the Domain and Application layers.
- Design every module so it can evolve independently.

If uncertain, prioritise modularity, maintainability and testability over convenience.

---

## 22. Success Criteria

The architecture is considered successful when:

- Backend engines can be replaced with minimal code changes.
- Users experience one seamless APZHUB application.
- Every module is independently testable.
- Every service has a clear responsibility.
- Business logic remains platform-owned.
- The platform can grow from a handful of modules to dozens without architectural degradation.

This architecture is the foundation for all future development and must be treated as a non-negotiable standard.
