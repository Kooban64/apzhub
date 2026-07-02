# Document 026 — Integration SDK, Adapter Framework & Integration Manifest Specification

> **Document Version:** 1.0  
> **Classification:** Developer Specification  
> **Status:** Mandatory  
> **Applies To:** Every Integration · Adapter · Connector · External System · Future Platform Service  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [025](./025-module-sdk-module-manifest-module-development-standard.md)  
> **Relationship:** Implements the **Connector SDK** category of [024 — APZHUB Platform SDK](./024-apzhub-platform-sdk-development-framework.md). Extends [008 — Module, Plugin & Connector Architecture](./008-module-plugin-connector-architecture.md) with manifest schema, capabilities, and development workflow.  
> **Terminology:** **Integration** / **Integration Adapter** in this document = **Service Connector** in [008](./008-module-plugin-connector-architecture.md) = **Adapter Layer** in [003](./003-overall-system-architecture-design-principles.md). User-facing code uses Platform Services only — never integration names in the UI ([002](./002-product-naming-positioning-terminology-standard.md)).  
> **Repository layout:** This document uses `integrations/` and `integration.yaml`. [004](./004-technology-stack-repository-standards-development-environment.md) references `/adapters` for the same layer — reconcile to one canonical path at implementation time.

## 1. Purpose

This document defines the APZHUB Integration SDK.

The Integration SDK provides the standard contract for integrating APZHUB with any external system.

An Integration is responsible only for communication with external systems.

It is **not** responsible for business logic.

It is **not** responsible for user interface.

It is **not** responsible for platform permissions.

Business logic belongs to Platform Services.

Presentation belongs to Platform Modules.

---

## 2. Core Principles

Every integration must:

- Be replaceable
- Be independently testable
- Be stateless where practical
- Hide implementation details
- Expose capabilities through a manifest
- Never expose backend APIs directly
- Never expose backend terminology to users
- Target Community Edition/self-hosted OSS features by default where integrating OSS products

Per [008](./008-module-plugin-connector-architecture.md) self-hosted OSS first.

---

## 3. Integration Architecture

Every integration follows the same pattern.

```text
Platform Module
        │
        ▼
Platform Service
        │
        ▼
Integration SDK
        │
        ▼
Integration Adapter
        │
        ▼
External System
```

No module may communicate directly with an external system.

Per [009](./009-platform-service-layer-integration-framework.md), [010](./010-api-gateway-integration-communication-standards.md), and [025](./025-module-sdk-module-manifest-module-development-standard.md).

---

## 4. Integration Types

Supported integration types include:

- OSS Application
- REST API
- GraphQL API
- Database
- File System
- Webhooks
- Message Queue
- Identity Provider
- AI Provider
- Payment Gateway
- Email Provider
- Telephony
- Storage Provider
- Monitoring System

Future integration types require no SDK redesign.

---

## 5. Integration Responsibilities

Every integration is responsible for:

- Authentication with the external system
- Connection management
- Request translation
- Response translation
- Retry logic
- Rate limiting
- Version compatibility
- Health reporting
- Error translation
- Capability discovery

No business rules belong in the integration.

Business rules live in Platform Services ([009](./009-platform-service-layer-integration-framework.md)).

---

## 6. Integration Manifest

Every integration begins with an `integration.yaml`.

The manifest is the contract between APZHUB and the integration.

Manifest-first per [024](./024-apzhub-platform-sdk-development-framework.md) Section 8.

---

## 7. Example Manifest

```yaml
integration:
  id: plane
  name: Plane Community Edition
  version: 1.0.0
  type: oss-application

metadata:
  vendor: Plane
  selfHosted: true
  communityEdition: true

authentication:
  type: api-key

capabilities:
  - projects
  - issues
  - members
  - comments

health:
  endpoint: /api/health

versioning:
  minimum: 0.23.0

permissions:
  managedByPlatform: true

tests:
  unit: true
  integration: true
  compatibility: true
```

Internal/developer naming may reference the vendor (Plane); user-facing surfaces never do ([002](./002-product-naming-positioning-terminology-standard.md)).

---

## 8. Integration Registration

Every integration registers:

- Identifier
- Name
- Version
- Supported capabilities
- Authentication method
- Health endpoint
- Configuration schema
- Supported platform version
- Documentation
- Tests

Registration is automatic.

Platform-owned registration metadata per [011](./011-platform-data-architecture-database-design-principles.md). Auto-discovery per [024](./024-apzhub-platform-sdk-development-framework.md).

---

## 9. Capability Discovery

Every integration must declare its capabilities.

**Examples:**

**Plane**

- Projects
- Issues
- Cycles
- Modules

**Paperless**

- Documents
- Tags
- OCR Status
- Correspondents

**Metabase**

- Dashboards
- Questions
- Collections

The Platform Service decides how these capabilities are used.

Capability mapping in services — not in modules or integrations as business logic ([008](./008-module-plugin-connector-architecture.md)).

---

## 10. Authentication

Integrations may support:

- API Keys
- OAuth2
- JWT
- Basic Authentication
- Mutual TLS
- Service Accounts

Credentials are stored by the platform's secret management solution.

Integrations never hardcode credentials.

Per [013](./013-security-architecture-zero-trust-framework.md) and [007](./007-identity-authentication-authorisation-rbac-architecture.md) — SSO and per-engine auth config owned by APZHUB. Connector config refs in platform DB — not plain secrets ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 11. Configuration

Each integration exposes a configuration schema.

**Examples:**

- Base URL
- Authentication
- Timeouts
- Retry policy
- SSL configuration
- Proxy settings
- Feature flags

Configuration is validated before activation.

Declarative configuration per [024](./024-apzhub-platform-sdk-development-framework.md) Section 15.

---

## 12. Health Monitoring

Every integration exposes:

- Status
- Latency
- Last successful connection
- Authentication status
- Version
- Retry count
- Error state

Health integrates with the Platform Observability Framework.

Per [014](./014-observability-monitoring-telemetry-health-framework.md) — Administration Workspace; mask raw backend dashboards from standard users ([002](./002-product-naming-positioning-terminology-standard.md)).

---

## 13. Error Translation

Integrations translate external errors into platform-standard errors.

**Examples:**

- Authentication Failed
- Validation Failed
- Service Unavailable
- Timeout
- Rate Limited
- Configuration Error

Backend-specific error messages should never reach end users.

Per [010](./010-api-gateway-integration-communication-standards.md) — typed error categories; no backend details in client errors.

---

## 14. Retry Strategy

Support:

- Configurable retries
- Exponential backoff
- Circuit breaker integration
- Dead-letter handling where appropriate

Retries must not create duplicate business operations.

Idempotent operations per [012](./012-event-driven-architecture-background-processing-workflow-framework.md). Circuit breakers per [010](./010-api-gateway-integration-communication-standards.md).

---

## 15. Version Compatibility

Each integration declares:

- Supported external versions
- Minimum supported version
- Maximum tested version
- Deprecated versions

Compatibility checks run automatically during startup and upgrades.

Release and migration per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 16. Security

Integrations must:

- Encrypt communications
- Validate certificates (unless explicitly configured otherwise for trusted internal environments)
- Store no secrets in source code
- Respect platform permissions
- Generate audit events
- Support credential rotation

Per [013](./013-security-architecture-zero-trust-framework.md). Integrations do not enforce user RBAC — Platform Services do ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 17. Observability

Every integration exposes:

- Metrics
- Logs
- Traces
- Health
- Configuration status
- Performance statistics

All telemetry integrates into the platform observability stack.

Correlation IDs per [010](./010-api-gateway-integration-communication-standards.md). Self-hosted OSS telemetry backends per [014](./014-observability-monitoring-telemetry-health-framework.md).

---

## 18. Events

Integrations may publish:

- Connected
- Disconnected
- Synchronisation Started
- Synchronisation Completed
- Synchronisation Failed
- Version Changed
- Authentication Failed

Events are consumed through the Platform Event Framework.

Per [012](./012-event-driven-architecture-background-processing-workflow-framework.md) — async sync must not block UI.

---

## 19. Testing

Every integration requires:

- Unit tests
- Mock tests
- Integration tests
- Compatibility tests
- Failure tests
- Performance tests
- Regression tests

Where practical, automated compatibility tests should be run against supported versions of the external system.

Definition of Done per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 20. Standard Directory Structure

```text
integrations/
└── plane/
    ├── integration.yaml
    ├── README.md
    ├── CHANGELOG.md
    ├── src/
    │   ├── client/
    │   ├── auth/
    │   ├── mapper/
    │   ├── health/
    │   ├── config/
    │   ├── capabilities/
    │   ├── events/
    │   ├── types/
    │   └── index.ts
    ├── tests/
    │   ├── unit/
    │   ├── integration/
    │   ├── compatibility/
    │   └── performance/
    └── docs/
```

See repository layout note in document header — align with [004](./004-technology-stack-repository-standards-development-environment.md) `/adapters` at implementation.

---

## 21. Cursor Instructions

Before implementing an integration:

1. Read Document 026.
2. Generate `integration.yaml`.
3. Implement the client.
4. Implement authentication.
5. Implement response mapping.
6. Implement health monitoring.
7. Register capabilities.
8. Generate automated tests.
9. Generate documentation.
10. Validate compatibility.

Cursor must never place business logic inside integrations.

**Phase gate:** Do not implement until project owner authorises development ([001](./001-project-vision-and-guiding-principles.md)).

---

## 22. Acceptance Criteria

The Integration SDK is complete when:

- Every external system implements a common integration contract.
- Integrations are automatically discoverable.
- Platform Services remain independent of implementation details.
- External systems are replaceable with minimal impact.
- Health, configuration and capabilities are visible to administrators.
- Integrations are independently testable and version-aware.
- OSS Community Edition and self-hosted deployments remain first-class supported targets.
- **No module or integration bypasses Platform Services for business operations.**
- **Backend errors and vendor terminology never reach end users.**

The Integration SDK establishes the permanent integration contract for every external system connected to APZHUB.
