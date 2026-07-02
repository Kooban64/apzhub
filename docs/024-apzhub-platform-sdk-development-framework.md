# Document 024 — APZHUB Platform SDK & Development Framework

> **Document Version:** 1.0  
> **Classification:** Developer Specification  
> **Status:** Mandatory  
> **Applies To:** Every Developer · Cursor · Future AI Coding Agents · Every Module · Every Connector · Every Platform Service · Every Shared Library  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [023](./023-user-preferences-personalisation-workspace-experience-framework.md)  
> **Relationship:** Codifies development contracts implied across [003](./003-overall-system-architecture-design-principles.md), [004](./004-technology-stack-repository-standards-development-environment.md), and [008](./008-module-plugin-connector-architecture.md). Module manifest: [025](./025-module-sdk-module-manifest-module-development-standard.md). Integration manifest: [026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md). Platform Service manifest: [027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md). UI Component manifest: [028](./028-ui-component-sdk-design-system-sdk-component-manifest-specification.md). Platform Event manifest: [029](./029-platform-event-sdk-event-bus-event-manifest-specification.md). Registration patterns align with [017](./017-navigation-framework-workspace-navigation-architecture.md), [019](./019-universal-command-palette-action-framework.md), [020](./020-unified-search-knowledge-discovery-framework.md), and [022](./022-presentation-engine-theme-framework-branding-architecture.md). Lifecycle and testing per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

## 1. Purpose

This document defines the APZHUB Platform SDK.

The SDK establishes the architectural contracts every extension must follow.

No code may become part of APZHUB unless it complies with this specification.

The objective is to ensure that hundreds of future modules can be developed by different teams while maintaining one consistent platform.

---

## 2. Philosophy

Developers do not extend code.

Developers extend the platform.

Everything added to APZHUB becomes part of a larger ecosystem.

Every contribution should feel native.

---

## 3. SDK Principles

The SDK is built around:

- Consistency
- Replaceability
- Discoverability
- Testability
- Maintainability
- Security
- Extensibility
- Documentation

Every extension follows the same lifecycle.

---

## 4. Platform Layers

Every contribution belongs to one layer.

Desktop Shell

↓

Platform SDK

↓

Platform Services

↓

Shared Services

↓

Module SDK

↓

Connector SDK

↓

Backend Engine

No component may bypass the SDK contracts.

Per [003](./003-overall-system-architecture-design-principles.md) — no layer bypassing.

---

## 5. SDK Categories

The SDK consists of:

- Platform SDK
- Module SDK
- Connector SDK
- Platform Service SDK
- Component SDK
- Event SDK
- Testing SDK
- Documentation SDK

Each SDK has one responsibility.

Module and connector boundaries per [008](./008-module-plugin-connector-architecture.md). Shared UI per [006](./006-enterprise-design-system-ui-standards.md) Component SDK.

---

## 6. Development Lifecycle

Every feature follows:

Requirements

↓

Architecture

↓

SDK Contract

↓

Implementation

↓

Testing

↓

Documentation

↓

Review

↓

Release

Skipping SDK definition is prohibited.

Mandatory lifecycle per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 7. Platform Registration

Every extension must register itself.

Registration provides:

- Identity
- Version
- Capabilities
- Dependencies
- Permissions
- Routes
- Health
- Documentation
- Tests

The platform discovers extensions automatically.

Module contract per [003](./003-overall-system-architecture-design-principles.md) and [008](./008-module-plugin-connector-architecture.md).

---

## 8. Manifest First

Every platform extension begins with a manifest.

The manifest is the platform contract.

Implementation is secondary.

The platform should understand every extension before executing it.

Manifest declares navigation, commands, search providers, permissions, health, and dependencies before runtime ([017](./017-navigation-framework-workspace-navigation-architecture.md), [019](./019-universal-command-palette-action-framework.md), [020](./020-unified-search-knowledge-discovery-framework.md)).

---

## 9. Coding Principles

Every extension should be:

- Modular
- Stateless where practical
- Strongly Typed
- Dependency Injected
- Interface First
- Reusable
- Loosely Coupled
- Observable
- Auditable

TypeScript strict, no `any` per [004](./004-technology-stack-repository-standards-development-environment.md). Interface-first Platform Services per [009](./009-platform-service-layer-integration-framework.md).

---

## 10. Business Logic

Business logic belongs only inside Platform Services.

Modules should contain presentation logic.

Connectors contain integration logic.

No business logic belongs in UI components.

Per [003](./003-overall-system-architecture-design-principles.md), [008](./008-module-plugin-connector-architecture.md), and [009](./009-platform-service-layer-integration-framework.md).

---

## 11. Platform Metadata

Every extension contributes metadata.

**Examples**

- Navigation
- Commands
- Permissions
- Search Providers
- Notifications
- Health
- Documentation
- Settings

Metadata drives the platform.

Platform-owned metadata per [011](./011-platform-data-architecture-database-design-principles.md). Settings are platform preferences — modules consume, not own ([023](./023-user-preferences-personalisation-workspace-experience-framework.md)).

---

## 12. Extension Discovery

The platform automatically discovers:

- Modules
- Services
- Connectors
- Commands
- Themes
- Widgets
- Dashboards
- Providers

No manual registration should be required.

Never hardcode workspace or module entries ([005](./005-desktop-experience-workspace-framework.md), [017](./017-navigation-framework-workspace-navigation-architecture.md)). Theme Registry per [022](./022-presentation-engine-theme-framework-branding-architecture.md).

---

## 13. Versioning

Every extension has:

- Identifier
- Version
- Compatibility
- Dependencies
- Migration Information
- Supported Platform Version

The platform validates compatibility automatically.

Release and migration standards per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 14. Dependency Rules

Extensions depend only on published SDKs.

Never depend directly on another module.

Shared functionality belongs to Platform Services.

No module-to-module coupling per [008](./008-module-plugin-connector-architecture.md) and [003](./003-overall-system-architecture-design-principles.md).

---

## 15. Configuration

Every extension exposes:

- Configuration Schema
- Default Values
- Validation
- Environment Variables
- Documentation

Configuration should be declarative.

Connector config refs in platform DB — not plain secrets ([011](./011-platform-data-architecture-database-design-principles.md), [013](./013-security-architecture-zero-trust-framework.md)).

---

## 16. Events

Extensions publish events.

Extensions subscribe through the Event Framework.

Direct coupling is discouraged.

Per [012](./012-event-driven-architecture-background-processing-workflow-framework.md) — modules publish events; Platform Services orchestrate notify, audit, search, activity.

---

## 17. Search

Search integration occurs through the Search SDK.

Every searchable extension registers providers.

Search remains platform-owned.

Per [020](./020-unified-search-knowledge-discovery-framework.md) — no standalone module search UIs.

---

## 18. Notifications

Extensions publish events.

The Notification Framework determines delivery.

Extensions never send notifications directly.

Per [021](./021-notification-activity-attention-management-framework.md) and [009](./009-platform-service-layer-integration-framework.md).

---

## 19. Security

Every extension requires:

- Authentication
- Permission Validation
- Audit
- Logging
- Input Validation
- Secure Configuration

Security is inherited from the platform.

Per [007](./007-identity-authentication-authorisation-rbac-architecture.md) and [013](./013-security-architecture-zero-trust-framework.md). Permission-driven UI per [005](./005-desktop-experience-workspace-framework.md).

---

## 20. Observability

Every extension exposes:

- Health
- Metrics
- Logs
- Tracing
- Performance
- Version

The platform monitors every extension consistently.

Per [014](./014-observability-monitoring-telemetry-health-framework.md). Correlation IDs per [010](./010-api-gateway-integration-communication-standards.md).

---

## 21. Testing

Every extension requires:

- Unit Tests
- Integration Tests
- Playwright Tests (where applicable)
- Accessibility Tests
- Performance Tests
- Regression Tests

Testing is part of the SDK contract.

Definition of Done per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md). Permission tests for navigation, commands, and search ([017](./017-navigation-framework-workspace-navigation-architecture.md), [019](./019-universal-command-palette-action-framework.md), [020](./020-unified-search-knowledge-discovery-framework.md)).

---

## 22. Documentation

Every extension requires:

- Overview
- Architecture
- Configuration
- Permissions
- Events
- Search Integration
- Commands
- Testing
- Known Limitations

Documentation is mandatory.

Foundation docs ([001](./001-project-vision-and-guiding-principles.md)–[023](./023-user-preferences-personalisation-workspace-experience-framework.md)) are authoritative; extension docs must not contradict them.

---

## 23. Packaging

Every extension should be independently buildable.

Support:

- Installation
- Upgrade
- Removal
- Migration
- Rollback

Extensions should never require platform redesign.

Monorepo layout per [004](./004-technology-stack-repository-standards-development-environment.md) — `/modules`, `/services`, `/adapters`, `/packages`.

---

## 24. Self-Hosted First Principle

The SDK assumes self-hosted deployment.

Extensions should integrate with self-hosted infrastructure first.

Commercial integrations remain optional through connectors.

Per [008](./008-module-plugin-connector-architecture.md) Community Edition OSS first.

---

## 25. AI Development

AI coding agents should consume SDK contracts before generating code.

The SDK provides:

- Architecture
- Manifest
- Interfaces
- Standards
- Testing
- Documentation

The SDK reduces implementation ambiguity.

Cursor and future agents must read foundation documents ([001](./001-project-vision-and-guiding-principles.md)–[023](./023-user-preferences-personalisation-workspace-experience-framework.md)) and manifests before implementation. See Section 26 and `.cursor/rules/apzhub-foundation.mdc`.

---

## 26. Cursor Instructions

When generating code:

- Read the SDK contract first.
- Build from interfaces.
- Generate manifests before implementation.
- Register capabilities dynamically.
- Never bypass Platform Services.
- Keep modules isolated.
- Prefer reusable abstractions.
- Write tests alongside implementation.
- Update documentation with every change.

Cursor should treat the SDK as the authoritative development contract.

**Phase gate:** Do not implement until project owner authorises development ([001](./001-project-vision-and-guiding-principles.md), foundation rules).

---

## 27. Acceptance Criteria

The Platform SDK is complete when:

- Every extension follows a common lifecycle.
- Platform discovery is automatic.
- Architecture remains consistent.
- Modules remain replaceable.
- Documentation and testing are mandatory.
- AI agents can generate compliant extensions.
- Future teams can extend APZHUB without architectural knowledge beyond the SDK.
- **No extension bypasses Platform Services, publishes notifications directly, or implements standalone search.**
- **Every extension ships manifest, tests, and documentation before merge.**

The Platform SDK establishes the permanent development contract for APZHUB and ensures the platform remains scalable, maintainable and consistent regardless of how many contributors or modules are introduced.
