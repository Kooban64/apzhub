# Document 012 — Event-Driven Architecture, Background Processing & Workflow Framework

> **Status:** Active — EDA & background processing (operational nervous system)  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [011](./011-platform-data-architecture-database-design-principles.md)  
> **Relationship:** [029 — Platform Event SDK & Event Manifest Specification](./029-platform-event-sdk-event-bus-event-manifest-specification.md) defines `event.yaml`, Event Bus contracts, envelopes, registration, and mandatory development workflow implementing this document.

## 1. Purpose

This document defines the Event-Driven Architecture (EDA) and Background Processing Framework for APZHUB.

The objective is to ensure that long-running work, system events, integrations, notifications, synchronisation, AI processing and future automation execute independently of user interaction.

The user interface should remain responsive regardless of backend activity.

---

## 2. Philosophy

User requests should complete as quickly as possible.

Only work required to satisfy the current request should execute synchronously.

Everything else should become an event or background job.

---

## 3. Architectural Model

Every business action should follow this model.

```
User Action
    ↓
Validation
    ↓
Business Rules
    ↓
Immediate Response
    ↓
Publish Event
    ↓
Background Processing
    ↓
Notifications
    ↓
Audit
    ↓
Search Updates
    ↓
Completion Events
```

The user should never wait for unnecessary processing.

This extends event architecture in [003](./003-overall-system-architecture-design-principles.md), background processing in [009](./009-platform-service-layer-integration-framework.md), and API response patterns in [010](./010-api-gateway-integration-communication-standards.md).

---

## 4. Event Categories

- Platform Events
- Business Events
- Security Events
- Integration Events
- Connector Events
- Monitoring Events
- Notification Events
- AI Events
- Workflow Events
- Audit Events

Every event belongs to one category.

---

## 5. Platform Events

Examples:

- UserCreated
- UserUpdated
- UserDisabled
- RoleChanged
- PermissionGranted
- WorkspaceOpened
- ModuleInstalled
- ConnectorRegistered

Events describe facts that have already occurred.

Aligns with IAM and module registration ([007](./007-identity-authentication-authorisation-rbac-architecture.md), [008](./008-module-plugin-connector-architecture.md)).

---

## 6. Business Events

Examples:

- ProjectCreated
- TaskAssigned
- TicketOpened
- DocumentUploaded
- WorkflowStarted
- WorkflowCompleted
- ReportGenerated
- InvoiceApproved

Events should describe business outcomes.

Business data remains owned by backend engines; events carry platform-level facts and references ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 7. Integration Events

Examples:

- ProvisioningStarted
- ConnectorOnline
- ConnectorOffline
- SynchronisationStarted
- SynchronisationCompleted
- SynchronisationFailed
- VersionDetected

Integration events describe communication with external systems.

Provisioning and SSO synchronisation per [007](./007-identity-authentication-authorisation-rbac-architecture.md).

---

## 8. Notification Events

Examples:

- Assignment
- Reminder
- Approval Required
- Completion
- Warning
- Failure
- Escalation

Notification events trigger the Notification Service.

Notification entities are platform-owned ([011](./011-platform-data-architecture-database-design-principles.md)); generation is centralised in Platform Services ([009](./009-platform-service-layer-integration-framework.md)).

---

## 9. Security Events

Examples:

- Login
- Logout
- Permission Changed
- Failed Login
- Session Revoked
- Connector Authentication Failure

Security events integrate with monitoring and audit.

Aligns with IAM security events and immutable audit ([007](./007-identity-authentication-authorisation-rbac-architecture.md), [011](./011-platform-data-architecture-database-design-principles.md)).

---

## 10. Event Principles

Events are immutable.

Events represent facts.

Events are timestamped.

Events should be descriptive.

Events should be independently processable.

Events must never modify themselves after publication.

---

## 11. Background Jobs

Long-running work should execute asynchronously.

Examples:

- OCR
- Large Imports
- Report Generation
- Bulk Export
- Provisioning
- Connector Synchronisation
- Search Indexing
- AI Analysis
- Virus Scanning (future)
- Document Conversion
- Notification Delivery

Jobs should never block the UI.

Platform background jobs are platform-owned data ([011](./011-platform-data-architecture-database-design-principles.md)). Redis queues per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 12. Job States

- Queued
- Waiting
- Running
- Retrying
- Paused
- Completed
- Cancelled
- Failed
- Expired

Every job must have a lifecycle.

---

## 13. Retry Policy

Retryable failures should support:

- Exponential Backoff
- Maximum Retry Count
- Dead Letter Queue
- Manual Retry
- Automatic Recovery

Retries should be configurable.

Complements connector retry policy in [009](./009-platform-service-layer-integration-framework.md) and [010](./010-api-gateway-integration-communication-standards.md).

---

## 14. Scheduled Jobs

Examples:

- Connector Health Checks
- Nightly Synchronisation
- Search Re-index
- Audit Maintenance
- Database Cleanup
- Cache Refresh
- Report Scheduling

Scheduled jobs belong to the platform.

---

## 15. Job Priorities

- Critical
- High
- Normal
- Low
- Background

Priority determines scheduling order.

---

## 16. Workflow Engine

Business workflows should be orchestrated through Platform Services.

Backend workflow engines remain implementation details.

Platform workflows may span multiple connectors.

Example:

```
Employee Onboarding
    ↓
Identity
    ↓
Projects
    ↓
Support
    ↓
Documents
    ↓
Time Tracking
    ↓
Notifications
    ↓
Audit
    ↓
Completion
```

Multi-connector orchestration per [009](./009-platform-service-layer-integration-framework.md). Automation module may use n8n Connector internally; users see APZHUB workflows only ([002](./002-product-naming-positioning-terminology-standard.md)).

---

## 17. Event Publishing

Every Platform Service may publish events.

Example:

```
ProjectCreated
    ↓
Search Updated
    ↓
Notification Sent
    ↓
Audit Recorded
    ↓
Activity Feed Updated
    ↓
Analytics Updated
```

Consumers remain independent.

Event publishing is a Platform Service responsibility ([009](./009-platform-service-layer-integration-framework.md)); modules publish through services, not directly to subscribers.

---

## 18. Event Subscribers

Subscribers may include:

- Notification Service
- Audit Service
- Search Service
- Activity Feed
- Analytics
- AI Services
- Monitoring
- Future Modules

Subscribers should remain loosely coupled.

No direct module-to-module communication ([008](./008-module-plugin-connector-architecture.md)).

---

## 19. Dead Letter Queue

Events that cannot be processed should move to a Dead Letter Queue.

Administrators should be able to:

- Inspect
- Retry
- Discard
- Investigate

Every failed event should remain traceable.

Superadmin/administration surfaces for DLQ management per [005](./005-desktop-experience-workspace-framework.md), [007](./007-identity-authentication-authorisation-rbac-architecture.md).

---

## 20. Idempotency

Background jobs must be idempotent.

Executing the same job multiple times should not create inconsistent platform state.

Provisioning idempotency required per [007](./007-identity-authentication-authorisation-rbac-architecture.md).

---

## 21. Observability

Every event should expose:

- Execution Time
- Queue Time
- Retries
- Status
- Errors
- Originating Service
- Correlation ID

Observability is mandatory.

Extends service observability ([009](./009-platform-service-layer-integration-framework.md)) and API monitoring ([010](./010-api-gateway-integration-communication-standards.md)).

---

## 22. Correlation IDs

Events inherit the Correlation ID from the originating request.

This enables complete tracing across:

- Gateway
- Services
- Jobs
- Connectors
- Audit
- Logs
- Notifications

Correlation ID standard per [010](./010-api-gateway-integration-communication-standards.md).

---

## 23. AI Processing

Future AI workloads should execute as background jobs.

Examples:

- Document Summarisation
- OCR Enhancement
- Risk Analysis
- Meeting Notes
- Classification
- Recommendations
- Semantic Search

AI should never block normal user interaction.

Future AI APIs category per [010](./010-api-gateway-integration-communication-standards.md).

---

## 24. Connector Synchronisation

Synchronisation should execute independently.

Examples:

- User Provisioning
- Permission Updates
- Health Checks
- Metadata Refresh
- Role Synchronisation

Failures should not affect unrelated services.

Circuit breakers and isolation per [010](./010-api-gateway-integration-communication-standards.md); connector lifecycle per [008](./008-module-plugin-connector-architecture.md).

---

## 25. Activity Feed

Business events automatically contribute to the platform activity feed.

No module should update activity directly.

Activity feed is platform-owned ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 26. Notifications

Notifications originate from events.

Modules should publish events rather than sending notifications directly.

This centralises notification behaviour.

---

## 27. Search

Search indexes update through background processing.

Search updates should never delay user operations.

Search index is derived, non-authoritative ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 28. Scalability

The architecture should support:

- Multiple Workers
- Distributed Queues
- Horizontal Scaling
- Multiple Organisations
- Future Cloud Deployment
- Future Desktop Synchronisation
- Future Mobile Clients

No redesign should be required.

---

## 29. Monitoring

Platform administrators should monitor:

- Queue Depth
- Worker Health
- Failed Jobs
- Retry Counts
- Execution Times
- Connector Delays
- Scheduled Jobs

Monitoring should be built into the platform.

Future Monitoring Module integrates via same event/subscriber model ([008](./008-module-plugin-connector-architecture.md)).

---

## 30. Security

Background workers require:

- Authentication
- Authorisation
- Audit
- Secure Secrets
- Connector Permissions

Workers operate under platform-managed identities.

Workers must not bypass IAM pipeline ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 31. Testing

Every workflow requires:

- Unit Tests
- Integration Tests
- Queue Tests
- Retry Tests
- Failure Tests
- Performance Tests
- Playwright Tests for user-facing workflows

Workflow reliability is essential.

Aligns with testing standards in [004](./004-technology-stack-repository-standards-development-environment.md) and IAM workflow tests ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 32. Cursor Instructions

When implementing background processing:

- Prefer asynchronous execution where appropriate.
- Keep UI responsive.
- Publish events instead of tightly coupling modules.
- Make every job idempotent.
- Support retries and recovery.
- Build workflows through Platform Services.
- Never place long-running operations inside request handlers.
- Design for future distributed workers.

Background processing is a core platform capability, not an implementation detail.

---

## 33. Acceptance Criteria

The Event & Background Processing Framework is complete when:

- Long-running operations execute asynchronously.
- Platform events drive notifications, search, audit and activity.
- Jobs support retries and recovery.
- Correlation IDs provide complete traceability.
- Modules remain loosely coupled.
- Background workers scale independently.
- Future AI services integrate naturally.
- Connector synchronisation does not block user interaction.

The Event-Driven Architecture forms the operational nervous system of APZHUB and enables the platform to scale reliably while maintaining a fast and responsive user experience.
