# Document 027 — Platform Service SDK, Business Service Framework & Service Manifest Specification

> **Document Version:** 1.0  
> **Classification:** Developer Specification  
> **Status:** Mandatory  
> **Applies To:** Every Platform Service · Shared Service · Business Service · Future Service  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md)  
> **Relationship:** Implements the **Platform Service SDK** category of [024 — APZHUB Platform SDK](./024-apzhub-platform-sdk-development-framework.md). Expands [009 — Platform Service Layer & Integration Framework](./009-platform-service-layer-integration-framework.md) with `service.yaml`, Service Registry, directory structure, and Cursor workflow. Modules consume services per [025](./025-module-sdk-module-manifest-module-development-standard.md); services delegate integrations per [026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md).

## 1. Purpose

The Platform Service SDK defines the architecture, contracts and lifecycle for every business service within APZHUB.

Platform Services are the business layer of the platform.

Every business rule, orchestration, validation, workflow, policy and transaction coordination must execute inside Platform Services.

Platform Services separate user interfaces from backend integrations.

---

## 2. Core Philosophy

Platform Modules present information.

Platform Services make business decisions.

Integrations communicate with external systems.

Background Workers execute asynchronous tasks.

No other layer may contain business logic.

Per [003](./003-overall-system-architecture-design-principles.md) layered architecture.

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
Integration SDK
        │
        ▼
External System
```

The Platform Service is the only layer authorised to coordinate business operations.

Per [009](./009-platform-service-layer-integration-framework.md) — mandatory boundary; no exceptions.

---

## 4. Service Categories

The platform supports multiple service categories.

### Core Platform Services

- Identity Service
- Permission Service
- Session Service
- Audit Service
- Notification Service
- Activity Service
- Search Service
- Settings Service
- Workspace Service
- Theme Service
- Configuration Service
- Event Service

### Business Services

- Project Service
- Ticket Service
- Document Service
- Time Service
- Workflow Service
- Testing Service
- Analytics Service
- Compliance Service
- Monitoring Service

### Infrastructure Services

- File Service
- Queue Service
- Cache Service
- Storage Service
- Email Service
- Secret Service

Future services require no framework changes.

User-facing names per [002](./002-product-naming-positioning-terminology-standard.md) — `ProjectService`, not engine names.

---

## 5. Responsibilities

Platform Services own:

- Business rules
- Validation
- Workflow orchestration
- Transaction coordination
- Permission enforcement
- Policy enforcement
- Audit generation
- Notification generation
- Search updates
- Activity generation
- Event publication
- Background job scheduling

They never own presentation or integration.

Centralised audit, search, notifications, and activity per [009](./009-platform-service-layer-integration-framework.md) — modules do not implement their own.

---

## 6. Service Manifest

Every Platform Service begins with a manifest.

Recommended filename:

```text
service.yaml
```

The manifest defines the service contract before implementation begins.

Manifest-first per [024](./024-apzhub-platform-sdk-development-framework.md) Section 8.

---

## 7. Example Service Manifest

```yaml
service:
  id: project-service
  name: Project Service
  version: 1.0.0

metadata:
  category: business
  owner: APZHUB

dependencies:
  platform:
    - identity
    - permissions
    - audit
    - search
    - notifications

integrations:
  - plane

events:
  publishes:
    - ProjectCreated
    - ProjectUpdated
    - ProjectArchived

permissions:
  - project.view
  - project.create
  - project.edit

health:
  enabled: true

tests:
  unit: true
  integration: true
  contract: true

documentation:
  overview: docs/overview.md
```

Integration references are internal (`plane` integration id per [026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md)) — never exposed in UI.

---

## 8. Service Registration

Every service registers:

- Service ID
- Name
- Version
- Category
- Dependencies
- Supported operations
- Events
- Health endpoint
- Documentation
- Tests

The Platform Service Registry discovers services automatically.

Platform-owned metadata per [011](./011-platform-data-architecture-database-design-principles.md). Auto-discovery per [024](./024-apzhub-platform-sdk-development-framework.md).

---

## 9. Dependency Rules

Platform Services may depend on:

- Platform Services
- Shared Services
- Platform SDK
- Event SDK
- Integration SDK

Platform Services must never depend directly on:

- Platform Modules
- UI Components
- Backend Engines

No module-to-service reverse dependencies. Modules call service **interfaces** only ([009](./009-platform-service-layer-integration-framework.md), [025](./025-module-sdk-module-manifest-module-development-standard.md)).

---

## 10. Business Transactions

A Platform Service coordinates complete business operations.

**Example:**

Create Employee

↓

Validate Identity

↓

Validate Permissions

↓

Create Platform User

↓

Provision External Systems

↓

Publish Events

↓

Generate Notifications

↓

Update Search

↓

Record Audit

↓

Return Success

Every step belongs to the service layer.

Respond fast where appropriate; async follow-up per [012](./012-event-driven-architecture-background-processing-workflow-framework.md).

---

## 11. Validation

Every Platform Service validates:

- Input schema
- Business rules
- Platform permissions
- Organisational policies
- Dependency availability
- Integration availability

Validation occurs before business execution.

Auth → Authz → Validation pipeline per [003](./003-overall-system-architecture-design-principles.md) and [013](./013-security-architecture-zero-trust-framework.md). Permission enforcement via [007](./007-identity-authentication-authorisation-rbac-architecture.md).

---

## 12. Orchestration

Platform Services orchestrate multiple integrations.

**Example:**

Employee Onboarding

↓

Identity Service

↓

Project Integration

↓

Support Integration

↓

Document Integration

↓

Time Integration

↓

Notification Service

↓

Audit Service

The Platform Service coordinates the complete workflow.

Multi-connector coordination via Integration SDK ([026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md)) — not direct engine calls.

---

## 13. Events

Platform Services publish business events.

**Examples:**

- ProjectCreated
- UserProvisioned
- TicketClosed
- WorkflowCompleted

Events are immutable and consumed by other platform capabilities.

Per [012](./012-event-driven-architecture-background-processing-workflow-framework.md) — Platform Services publish; modules do not notify/search/audit directly.

---

## 14. Background Processing

Long-running work should be delegated to the Background Processing Framework.

**Examples:**

- Provisioning
- Imports
- OCR
- Report generation
- Synchronisation

Services schedule jobs but do not execute them synchronously.

Never long-running work in request handlers ([012](./012-event-driven-architecture-background-processing-workflow-framework.md)).

---

## 15. Security

Every Platform Service must:

- Authenticate requests
- Enforce permissions
- Apply business policies
- Generate audit events
- Protect sensitive data
- Validate inputs

Security is mandatory.

Zero Trust per [013](./013-security-architecture-zero-trust-framework.md). Every API: auth, authz, validation, audit, correlation ID ([010](./010-api-gateway-integration-communication-standards.md)).

---

## 16. Observability

Every service exposes:

- Health
- Metrics
- Execution times
- Error counts
- Queue usage
- Dependency status

Services integrate with the Observability Framework.

Per [014](./014-observability-monitoring-telemetry-health-framework.md). Correlation IDs end-to-end ([010](./010-api-gateway-integration-communication-standards.md)).

---

## 17. Configuration

Every service provides:

- Configuration schema
- Default values
- Validation rules
- Environment requirements
- Feature flags

Configuration remains declarative.

Per [024](./024-apzhub-platform-sdk-development-framework.md) Section 15. Secrets never in code ([013](./013-security-architecture-zero-trust-framework.md)).

---

## 18. Versioning

Services declare:

- Current version
- Supported platform version
- Breaking changes
- Migration notes

Version compatibility is validated during deployment.

Per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 19. Standard Directory Structure

```text
services/
└── project-service/
    ├── service.yaml
    ├── README.md
    ├── CHANGELOG.md
    ├── src/
    │   ├── contracts/
    │   ├── orchestrators/
    │   ├── policies/
    │   ├── validators/
    │   ├── events/
    │   ├── jobs/
    │   ├── handlers/
    │   ├── types/
    │   └── index.ts
    ├── tests/
    │   ├── unit/
    │   ├── integration/
    │   ├── contract/
    │   ├── performance/
    │   └── regression/
    └── docs/
        ├── overview.md
        ├── architecture.md
        ├── developer-guide.md
        └── admin-guide.md
```

Monorepo `/services` per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 20. Testing Requirements

Every Platform Service requires:

- Unit tests
- Integration tests
- Contract tests
- Policy tests
- Failure tests
- Performance tests
- Regression tests

Business logic must achieve high automated test coverage.

Definition of Done per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md). Permission and policy tests mandatory.

---

## 21. Cursor Instructions

When implementing a Platform Service:

1. Read Documents 009, 024, 026 and 027.
2. Generate `service.yaml`.
3. Define interfaces before implementation.
4. Implement business rules only.
5. Delegate integrations to the Integration SDK.
6. Publish events.
7. Generate automated tests.
8. Generate documentation.
9. Validate service registration.

Cursor must never place business logic inside modules or integrations.

**Phase gate:** Do not implement until project owner authorises development ([001](./001-project-vision-and-guiding-principles.md)).

---

## 22. Acceptance Criteria

The Platform Service SDK is complete when:

- Every business capability is implemented through Platform Services.
- Services register automatically.
- Business rules remain centralised.
- Integrations remain replaceable.
- Services expose health and metrics.
- Services publish events consistently.
- Automated testing validates business behaviour.
- Documentation remains synchronised with implementation.
- **No business logic exists in modules or integrations.**
- **Modules call service interfaces only — never integrations or engines.**

The Platform Service SDK establishes the permanent business execution model for APZHUB and ensures that business logic remains independent, testable and maintainable throughout the platform's lifecycle.
