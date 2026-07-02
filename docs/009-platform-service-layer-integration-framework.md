# Document 009 — Platform Service Layer & Integration Framework

> **Status:** Active — Platform Service Layer (operational backbone)  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [008](./008-module-plugin-connector-architecture.md)  
> **Relationship:** [027 — Platform Service SDK & Service Manifest Specification](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md) defines `service.yaml`, Service Registry, directory structure, orchestration patterns, and mandatory Cursor workflow implementing this document.

## 1. Purpose

This document defines the Platform Service Layer (PSL), which is the core integration framework of APZHUB.

The Platform Service Layer is the only mechanism through which Platform Modules communicate with backend services.

It forms the business boundary between the APZHUB platform and all external systems.

No exceptions are permitted.

---

## 2. Philosophy

The Platform Service Layer exists to ensure that:

- Users never communicate with backend systems.
- Modules never communicate with backend systems.
- Business logic never depends on backend implementations.
- Backend engines remain replaceable.
- Every backend integration follows identical architectural principles.

---

## 3. Layer Position

```
Desktop Framework
        ↓
Platform Module
        ↓
Platform Service Layer
        ↓
Service Connector
        ↓
Backend Engine
```

The Platform Service Layer is mandatory.

No layer may bypass it.

This extends the module architecture in [008](./008-module-plugin-connector-architecture.md) and the layered model in [003](./003-overall-system-architecture-design-principles.md).

---

## 4. Responsibilities

Platform Services are responsible for:

- Business orchestration
- Workflow execution
- Validation
- Permission enforcement
- Data transformation
- Audit generation
- Notification generation
- Search indexing
- Caching
- Transaction coordination
- Connector orchestration
- Platform events
- Business rules

No backend-specific logic belongs inside Platform Services.

Permission enforcement integrates with [007](./007-identity-authentication-authorisation-rbac-architecture.md); UI visibility remains in the Desktop Framework ([005](./005-desktop-experience-workspace-framework.md)).

---

## 5. Service Categories

### Core Platform Services

Examples:

- Identity Service
- Permission Service
- Audit Service
- Search Service
- Configuration Service
- Notification Service
- Telemetry Service
- Feature Flag Service
- Logging Service
- Workspace Service

### Shared Platform Services

Examples:

- Project Service
- Support Service
- Document Service
- Automation Service
- Analytics Service
- Testing Service
- Monitoring Service
- Compliance Service

Future services follow exactly the same architecture.

---

## 6. Service Contracts

Every Platform Service must expose a stable contract.

Consumers should never know which backend implementation is being used.

Service contracts must remain stable even when connectors change.

---

## 7. Interface First Design

Every Platform Service begins with an interface.

Implementation details remain hidden.

Modules depend only on interfaces.

This enables:

- Testing
- Mocking
- Future replacement
- Multiple implementations

---

## 8. Business Workflows

Platform Services own business workflows.

Example:

```
Create Project
    ↓
Validate User
    ↓
Validate Permissions
    ↓
Apply Business Rules
    ↓
Execute Connector
    ↓
Audit Action
    ↓
Generate Notification
    ↓
Update Search Index
    ↓
Publish Events
    ↓
Return Response
```

Backend engines should never perform platform business logic.

---

## 9. Validation

Every service validates:

- Input
- Permissions
- Business Rules
- Dependencies
- Connector Availability
- Configuration

Failures should occur before backend calls are made.

---

## 10. Data Mapping

Platform Services translate:

```
Platform Models → Connector Models → Backend Models
```

Responses follow the reverse path.

Backend models must never leak into the UI ([002](./002-product-naming-positioning-terminology-standard.md)).

---

## 11. Multiple Connectors

A Platform Service may coordinate multiple connectors.

Example:

```
Project Service
    ↓
Plane Connector
    ↓
Notification Connector
    ↓
Search Connector
    ↓
Audit Connector
    ↓
Workflow Connector
```

Platform Services orchestrate these interactions.

---

## 12. Transaction Coordination

Some business actions affect multiple systems.

Example:

```
Create Employee
    ↓
Identity → Projects → Support → Documents → Time Tracking
    ↓
Notifications → Audit → Search
```

Platform Services coordinate these operations safely.

---

## 13. Retry Strategy

Transient failures should support:

- Retry
- Backoff
- Queueing
- Recovery
- User notification

Retries belong inside Platform Services or Connectors — not UI components.

---

## 14. Error Translation

Backend-specific errors must be translated into platform-standard errors.

Users should receive consistent messages regardless of backend source.

Connectors perform initial translation; services present platform-standard errors to modules and APIs.

---

## 15. Caching

Platform Services may cache:

- Reference Data
- Configuration
- Search Results
- Permissions
- Navigation
- Metadata

Business data should only be cached where appropriate.

The backend engine remains the source of truth ([003](./003-overall-system-architecture-design-principles.md)).

---

## 16. Search Integration

Every Platform Service contributes to platform search.

Search indexing belongs to the Platform Service.

Not to individual modules.

---

## 17. Audit Integration

Every Platform Service generates audit events.

Audit should occur automatically.

Business modules should not implement their own audit logic.

---

## 18. Notification Integration

Platform Services decide when notifications should be generated.

Examples:

- Project Created
- Document Approved
- Ticket Assigned
- Workflow Completed
- Approval Rejected

Notification logic should remain centralised.

---

## 19. Security

Every service must perform:

- Authentication
- Permission Checks
- Business Policy Evaluation
- Input Validation
- Output Sanitisation
- Audit
- Logging

Security should never depend on the frontend.

---

## 20. Event Publishing

Every significant business action should publish platform events.

Examples:

- ProjectCreated
- TicketClosed
- WorkflowExecuted
- UserProvisioned
- RoleChanged

Events allow future modules to subscribe without creating tight coupling ([003](./003-overall-system-architecture-design-principles.md)).

---

## 21. Performance

Platform Services should optimise:

- Connector usage
- Parallel execution
- Caching
- Lazy loading
- Pagination
- Batch operations

Avoid unnecessary backend requests.

---

## 22. Background Processing

Long-running tasks should execute asynchronously.

Examples:

- Document OCR
- Report Generation
- Provisioning
- Bulk Import
- Exports
- Notifications

Background jobs should not block user interaction.

Provisioning and SSO-related sync align with [007](./007-identity-authentication-authorisation-rbac-architecture.md).

---

## 23. Service Discovery

All Platform Services should register themselves.

Registration includes:

- Name
- Capabilities
- Version
- Dependencies
- Health
- Configuration

The platform should understand available services dynamically.

---

## 24. Observability

Every service should expose:

- Health Status
- Performance Metrics
- Execution Times
- Error Rates
- Connector Status
- Queue Length
- Retry Counts

These metrics support future monitoring dashboards.

---

## 25. Versioning

Service contracts should remain backwards compatible.

Breaking changes require versioning.

Connector upgrades should not require Platform Module changes.

---

## 26. Testing Standards

Every Platform Service requires:

- Unit Tests
- Integration Tests
- Mock Connector Tests
- Contract Tests
- Performance Tests
- Failure Scenario Tests
- Playwright coverage for user-facing workflows

Services must be testable without live backend engines.

---

## 27. Development Rules

- Platform Modules may call only Platform Services.
- Platform Services may call only registered Connectors.
- Connectors may call only backend engines.

Violation of these rules is considered an architectural defect.

---

## 28. Cursor Instructions

When implementing Platform Services:

- Build interface-first.
- Hide connector implementation details.
- Keep business rules within the service layer.
- Keep services stateless where practical.
- Prefer composition over inheritance.
- Optimise for maintainability and testability.
- Assume connectors will change over time.
- Design every service for reuse across multiple modules.

Never allow a Platform Module to depend directly on a connector or backend engine.

---

## 29. Acceptance Criteria

The Platform Service Layer is complete when:

- Every module communicates exclusively through Platform Services.
- Business logic is centralised.
- Connectors remain replaceable.
- Backend engines remain hidden.
- Platform events, auditing, notifications, and search are integrated consistently.
- Services are independently testable.
- New connectors can be introduced without changing business modules.
- The platform remains modular, maintainable, and extensible.

The Platform Service Layer is the operational backbone of APZHUB and all future development must conform to this architecture.
