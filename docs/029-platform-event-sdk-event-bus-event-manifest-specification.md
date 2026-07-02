# Document 029 — Platform Event SDK, Event Bus & Event Manifest Specification

> **Document Version:** 1.0  
> **Classification:** Developer Specification  
> **Status:** Mandatory  
> **Applies To:** Platform Services · Modules · Integrations · Background Workers · Desktop Shell · Future AI Services · Cursor · All Future Extensions  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [028](./028-ui-component-sdk-design-system-sdk-component-manifest-specification.md)  
> **Relationship:** Implements the **Event SDK** category of [024 — APZHUB Platform SDK](./024-apzhub-platform-sdk-development-framework.md). Expands [012 — Event-Driven Architecture & Background Processing](./012-event-driven-architecture-background-processing-workflow-framework.md) with `event.yaml`, Event Bus contracts, and development workflow. Platform Services publish business events per [027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md); modules and integrations publish state changes — not direct cross-module calls ([025](./025-module-sdk-module-manifest-module-development-standard.md), [026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md)).

## 1. Purpose

The Platform Event SDK defines the event-driven communication model for APZHUB.

Events enable independent platform capabilities to communicate without direct dependencies.

The Event SDK establishes a consistent contract for publishing, subscribing, routing and processing platform events.

The objective is to reduce coupling while increasing extensibility and scalability.

---

## 2. Core Philosophy

Modules do not communicate with Modules.

Services do not communicate directly with unrelated Services.

Integrations do not invoke business workflows.

Instead:

Components publish events.

Platform Services consume events.

Integrations publish state changes.

Background Workers execute asynchronous processing.

The Event Framework coordinates communication.

Per [012](./012-event-driven-architecture-background-processing-workflow-framework.md) — modules do not notify, search, audit, or activity directly; no module-to-module coupling ([009](./009-platform-service-layer-integration-framework.md)).

---

## 3. Architectural Position

```text
Desktop Shell
        │
        ▼
Platform Module
        │
        ▼
Platform Service
        │
        ▼
Platform Event Bus
        │
 ┌──────┼────────┐
 ▼      ▼        ▼
Search  Audit  Notifications
        │
        ▼
Background Workers
        │
        ▼
Integrations
```

The Event Bus is owned by the platform.

---

## 4. Objectives

The Event SDK enables:

- Loose coupling
- Scalability
- Auditability
- Observability
- Retry capability
- Background processing
- Event replay (future)
- AI event consumption (future)

---

## 5. Event Categories

The platform supports:

- Platform Events
- Business Events
- User Events
- Security Events
- Connector Events
- Infrastructure Events
- System Events
- Notification Events
- AI Events (future)

Every event belongs to one category.

---

## 6. Event Manifest

Every published event begins with:

```text
event.yaml
```

The manifest documents the event before implementation.

Manifest-first per [024](./024-apzhub-platform-sdk-development-framework.md) Section 8.

---

## 7. Example Event Manifest

```yaml
event:
  id: ProjectCreated
  version: 1.0.0

category: business

publisher: project-service

subscribers:
  - audit
  - notifications
  - activity
  - search

payload:
  projectId: uuid
  createdBy: uuid
  timestamp: datetime
```

---

## 8. Standard Event Envelope

Every event contains:

- Event ID
- Event Name
- Event Version
- Category
- Correlation ID
- Causation ID
- Timestamp
- Publisher
- Payload
- Tenant (future)
- User ID (where applicable)
- Source Service

This ensures consistent tracing and diagnostics.

Correlation and causation IDs per [010](./010-api-gateway-integration-communication-standards.md) and [012](./012-event-driven-architecture-background-processing-workflow-framework.md).

---

## 9. Event Registration

Every event registers:

- Identifier
- Version
- Publisher
- Subscribers
- Payload Schema
- Retention Policy
- Documentation
- Tests

Events are discovered automatically.

Platform-owned event metadata per [011](./011-platform-data-architecture-database-design-principles.md).

---

## 10. Publishing Rules

Events should be published only after successful completion of a business operation.

Publishing must never occur before transaction completion unless explicitly designed as a pre-operation event.

Duplicate event publication should be avoided through idempotent processing.

Platform Services publish after validation and business rules ([027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md)).

---

## 11. Subscription Rules

Subscribers should:

- Declare interest explicitly.
- Process events independently.
- Handle duplicate delivery safely.
- Avoid assumptions about processing order unless guaranteed by design.

Subscribers should not modify the original event.

Idempotent subscribers per [012](./012-event-driven-architecture-background-processing-workflow-framework.md).

---

## 12. Event Naming

Use past-tense names for completed actions.

**Examples:**

- UserCreated
- ProjectArchived
- TicketAssigned
- DocumentUploaded
- WorkflowCompleted

Avoid command-style names such as:

- CreateProject
- UpdateUser

---

## 13. Event Versioning

Events include semantic versions.

Breaking changes require:

- New event version
- Migration documentation
- Compatibility guidance

Older versions may be supported during transition periods.

Per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 14. Event Payloads

Payloads should contain only the information required by subscribers.

Avoid embedding large datasets.

Prefer identifiers and metadata over full object graphs.

Sensitive information should never be published unnecessarily.

No secrets or unnecessary PII in payloads ([013](./013-security-architecture-zero-trust-framework.md)). Prefer platform IDs over engine IDs ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 15. Delivery Guarantees

The framework should support:

- At-least-once delivery
- Retry handling
- Dead-letter queues
- Duplicate detection
- Idempotent subscribers

Exactly-once delivery may not be practical for every integration and should not be assumed.

Retry, backoff, and DLQ per [012](./012-event-driven-architecture-background-processing-workflow-framework.md).

---

## 16. Background Processing

Long-running event handlers should execute through the Background Processing Framework.

**Examples:**

- OCR
- Report generation
- Bulk synchronisation
- Email delivery
- Search indexing

User-facing operations should remain responsive.

Never long-running work in request handlers ([012](./012-event-driven-architecture-background-processing-workflow-framework.md)). Search indexing async per [020](./020-unified-search-knowledge-discovery-framework.md). Notifications via Attention Framework per [021](./021-notification-activity-attention-management-framework.md).

---

## 17. Security

Events must:

- Respect platform permissions
- Exclude unnecessary sensitive data
- Support auditability
- Prevent unauthorised publication
- Validate payload schemas

Security requirements apply to both publishers and subscribers.

Zero Trust per [013](./013-security-architecture-zero-trust-framework.md). Unauthorised publication blocked at Event Bus boundary.

---

## 18. Observability

Every event should expose:

- Publish timestamp
- Processing duration
- Subscriber status
- Retry count
- Failure count
- Correlation ID

Observability integrates with the Platform Monitoring Framework.

Per [014](./014-observability-monitoring-telemetry-health-framework.md).

---

## 19. Standard Directory Structure

```text
events/
└── project-created/
    ├── event.yaml
    ├── README.md
    ├── schema.json
    ├── publisher/
    ├── subscribers/
    ├── tests/
    │   ├── unit/
    │   ├── contract/
    │   ├── integration/
    │   └── replay/
    └── docs/
```

Align with monorepo event definitions per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 20. Testing Requirements

Every event requires:

- Schema validation tests
- Publisher tests
- Subscriber tests
- Retry tests
- Idempotency tests
- Contract tests
- Performance tests

Event reliability is critical.

Definition of Done per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 21. Cursor Instructions

When implementing platform events:

1. Read Documents 024, 026, 027 and 029.
2. Generate `event.yaml`.
3. Define the payload schema.
4. Register publishers.
5. Register subscribers.
6. Implement idempotent processing.
7. Generate automated tests.
8. Generate documentation.
9. Validate event registration.

Cursor must never bypass the Event Framework for cross-platform communication unless explicitly approved in the architecture.

**Phase gate:** Do not implement until project owner authorises development ([001](./001-project-vision-and-guiding-principles.md)).

---

## 22. Acceptance Criteria

The Platform Event SDK is complete when:

- Every business event has a manifest.
- Publishers and subscribers are registered dynamically.
- Events are versioned and documented.
- Event payloads are validated.
- Observability captures the complete event lifecycle.
- Background processing integrates seamlessly.
- Subscribers remain independent and idempotent.
- The platform can evolve without introducing tight coupling.
- **No module-to-module or service-to-service direct coupling replaces events without architectural approval.**
- **Modules do not send notifications, update search, or write audit directly — they publish events.**

The Platform Event SDK establishes the permanent communication model for APZHUB and enables a scalable, observable and maintainable event-driven architecture.
