# Document 000 — APZHUB Engineering Constitution

> **Document Version:** 1.0  
> **Classification:** Engineering Constitution  
> **Status:** Mandatory  
> **Applies To:** Every Developer · Cursor · AI Coding Agents · Internal Teams · Third-Party Contributors · Every Repository · Every Module · Every Service · Every Integration · Every Component  
> **Supersedes:** On conflict, this document takes precedence over all other APZHUB documents, SDKs, sprint guides, and implementation guides.

## 1. Purpose

This document establishes the engineering principles, architectural rules and development standards governing APZHUB.

It is the highest-level engineering document in the project.

Every architecture document, SDK, implementation guide, sprint, pull request and code change must comply with this Constitution.

Where conflicts arise, this Constitution takes precedence.

---

## 2. Vision

APZHUB is an Enterprise Operating Platform.

It provides a single, unified workbench through which users interact with enterprise capabilities without being exposed to the underlying systems that implement those capabilities.

Users interact only with APZHUB.

Backend products are implementation details.

Per [001 — Project Vision](./001-project-vision-and-guiding-principles.md) and [002 — Terminology Standard](./002-product-naming-positioning-terminology-standard.md).

---

## 3. Mission

Build a modern, self-hosted, enterprise-grade platform that:

- Integrates best-of-breed open-source software.
- Presents a single, consistent user experience.
- Remains modular and replaceable.
- Can evolve without architectural redesign.
- Is maintainable for many years.

---

## 4. Core Principles

The following principles are non-negotiable.

### Principle 1 — Platform First

Always build the platform before business functionality.

Infrastructure and architecture take precedence over features.

Build order: Design System + Desktop Framework before modules ([005](./005-desktop-experience-workspace-framework.md), [006](./006-enterprise-design-system-ui-standards.md)). [BUILD-001](./build/BUILD-001-repository-bootstrap-guide.md) → [SPR-001](./SPR-001-monorepo-foundation-development-environment.md) before business modules.

---

### Principle 2 — Self-Hosted First

The preferred solution is always a self-hosted open-source product.

Commercial services may be integrated only where there is a documented business justification.

Per [008](./008-module-plugin-connector-architecture.md) Community Edition OSS first.

---

### Principle 3 — Backend Agnostic

Users must never know which backend product implements a capability.

Modules depend on Platform Services.

Platform Services depend on the Integration SDK.

Nothing depends directly on backend engines.

Per [003](./003-overall-system-architecture-design-principles.md), [008](./008-module-plugin-connector-architecture.md), [009](./009-platform-service-layer-integration-framework.md).

---

### Principle 4 — Manifest First

Every extension begins with a manifest.

Implementation follows the manifest.

Never implement first and document later.

Per [024](./024-apzhub-platform-sdk-development-framework.md) and SDK manifests ([025](./025-module-sdk-module-manifest-module-development-standard.md)–[029](./029-platform-event-sdk-event-bus-event-manifest-specification.md)).

---

### Principle 5 — SDK First

Every extension must comply with the relevant SDK.

No custom patterns.

No exceptions without an approved ADR.

---

### Principle 6 — Platform Services Own Business Logic

Business logic belongs only in Platform Services.

UI components present information.

Integrations communicate with external systems.

Business rules never belong elsewhere.

Per [027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md), [028](./028-ui-component-sdk-design-system-sdk-component-manifest-specification.md), [026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md).

---

### Principle 7 — Event Driven

Platform capabilities communicate through events wherever appropriate.

Avoid unnecessary direct dependencies.

Per [012](./012-event-driven-architecture-background-processing-workflow-framework.md), [029](./029-platform-event-sdk-event-bus-event-manifest-specification.md).

---

### Principle 8 — Security by Design

Authentication.

Authorisation.

Audit.

Validation.

Encryption.

Least privilege.

These are mandatory design requirements—not optional enhancements.

Per [007](./007-identity-authentication-authorisation-rbac-architecture.md), [013](./013-security-architecture-zero-trust-framework.md).

---

### Principle 9 — Test Everything

No feature is complete without automated testing.

Testing is part of development.

Not a later phase.

Per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

### Principle 10 — Documentation Is Code

Documentation evolves together with implementation.

A feature without documentation is incomplete.

---

## 5. Engineering Standards

Every contribution must:

- Compile successfully.
- Pass linting.
- Pass automated tests.
- Meet accessibility standards.
- Follow naming conventions.
- Follow repository standards.
- Update documentation.
- Update changelog where applicable.

Per [004](./004-technology-stack-repository-standards-development-environment.md) and [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 6. Architectural Rules

The following are prohibited unless an ADR explicitly approves an exception:

- Direct module-to-module communication.
- Direct UI-to-integration communication.
- Business logic inside React components.
- Hardcoded permissions.
- Hardcoded colours or design values.
- Secrets committed to source control.
- Proprietary platform dependencies without approval.
- Duplicate implementations of existing platform capabilities.
- **Bypassing the API layering model** (see §6.1) — e.g. capabilities calling Workbench engines directly, or UI calling Runtime bootstrap APIs for orchestration.

Permission-driven UI per [005](./005-desktop-experience-workspace-framework.md). Tokens only per [006](./006-enterprise-design-system-ui-standards.md), [022](./022-presentation-engine-theme-framework-branding-architecture.md).

### 6.1 API Layering Model

APZHUB separates platform interaction into three permanent API layers. Each layer has a defined authority boundary and intended consumer. **Lower layers must not depend on higher layers.**

```text
┌─────────────────────────────────────────────────────────┐
│  Layer 3 — Capability API                               │
│  Consumers: Business modules, platform capabilities   │
│  Authority: Module/service manifests, capability SDKs   │
└───────────────────────────┬─────────────────────────────┘
                            │ publishes Workbench Requests
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2 — Workbench API                              │
│  Consumers: Shell UI, in-app capability views           │
│  Authority: Workbench Manager, Request Bus              │
│  Package: @apzhub/workbench-framework                   │
└───────────────────────────┬─────────────────────────────┘
                            │ consumes registry at bootstrap
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 1 — Runtime API                                │
│  Consumers: Server bootstrap, registry hydration, ops   │
│  Authority: Platform Runtime orchestrator               │
│  Package: @apzhub/platform-runtime/server               │
└─────────────────────────────────────────────────────────┘
```

| Layer                  | API                                                                                                                         | Primary consumers                                                                    | Responsibilities                                                                                                                       | Must not                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **1 — Runtime API**    | `Runtime.bootstrap()`, `Runtime.registry()`, `Runtime.getDiagnostics()`, configuration and health APIs                      | `apps/web` server bootstrap, platform services, operational tooling                  | Manifest discovery, validation, dependency resolution, capability registration, lifecycle, platform-ready transition                   | Orchestrate UI layout, sessions, or user navigation                                        |
| **2 — Workbench API**  | `WorkbenchAPI` (`execute`, `executeAction`, typed helpers), `WorkbenchRequestBus.publish()` (internal), `useWorkbenchAPI()` | Platform capabilities (via injection), shell React components, framework integration | Route Workbench Requests to engines; aggregate workbench state; permission gate; session restore; registry-driven navigation and views | Expose engine internals; replace Runtime authority                                         |
| **3 — Capability API** | Module manifests, Platform Service contracts, Integration SDK adapters                                                      | Business modules (Milestone 9+), platform capability authors                         | Declare views, navigation, commands, and business behaviour; publish Workbench Requests for UI changes                                 | Import Workbench engines; manipulate shell DOM directly; call backend integrations from UI |

**Rules:**

1. **Capabilities use Workbench API only** for UI orchestration — never Workbench Manager engines, Layout/View/Navigation engines, or `@apzhub/ui` shell internals for state changes (ADR-0020).
2. **Server bootstrap uses Runtime API only** for platform readiness and registry access — workbench hydration consumes filtered registry DTOs, not raw engine state.
3. **Runtime API is server-side by default** — client bundles must not import `@apzhub/platform-runtime/server` except through approved server boundaries.
4. **Capability API evolves through manifests and SDKs** — implementation follows manifest; Workbench Actions evolve toward Platform Commands (Document 019, Sprint 004).

Established: Sprint 003 Phase 8 (`v0.3.0-workbench-framework`). See [Workbench Framework architecture](./architecture/workbench-framework.md) and ADR-0020.

---

## 7. Repository Philosophy

The repository is organised around responsibilities.

- Applications
- Packages
- Services
- Workers
- Infrastructure
- Documentation

Code should always live in the correct layer.

Monorepo layout per [004](./004-technology-stack-repository-standards-development-environment.md) and [BUILD-001](./build/BUILD-001-repository-bootstrap-guide.md).

---

## 8. Quality Expectations

The platform must prioritise:

- Maintainability
- Readability
- Simplicity
- Performance
- Accessibility
- Reliability
- Replaceability

Optimisation should never compromise maintainability without a documented reason.

---

## 9. Governance

Architecture evolves through Architecture Decision Records (ADRs).

Core architecture documents remain stable.

Every significant architectural change requires:

- Problem statement
- Proposed solution
- Alternatives considered
- Decision
- Consequences

ADRs live in `docs/decisions/` per [BUILD-001](./build/BUILD-001-repository-bootstrap-guide.md).

---

## 10. Definition of Engineering Excellence

Engineering excellence within APZHUB means:

- Consistent architecture.
- Predictable behaviour.
- High automated test coverage.
- Comprehensive documentation.
- Minimal technical debt.
- Observable systems.
- Secure implementations.
- Clear ownership.

---

## 11. Responsibilities of Cursor

Before generating code, Cursor shall:

1. Read the relevant architecture documents.
2. Read the applicable SDK.
3. Read the current sprint guide.
4. Confirm dependencies.
5. Implement only the approved scope.
6. Generate tests.
7. Generate documentation.
8. Stop when the sprint scope is complete.

Cursor must never implement future sprint work.

Read [000](./000-apzhub-engineering-constitution.md) first, then foundation docs [001](./001-project-vision-and-guiding-principles.md)–[029](./029-platform-event-sdk-event-bus-event-manifest-specification.md). Execution order: [BUILD-001](./build/BUILD-001-repository-bootstrap-guide.md) before [SPR-001](./SPR-001-monorepo-foundation-development-environment.md).

---

## 12. Responsibilities of Human Developers

Developers must:

- Preserve architectural integrity.
- Prefer existing platform capabilities.
- Raise ADRs when necessary.
- Keep modules independent.
- Avoid shortcuts that increase long-term maintenance costs.

---

## 13. Definition of Success

APZHUB succeeds when:

- Users experience one unified platform.
- Backend systems remain replaceable.
- New capabilities can be added without redesign.
- AI coding agents can contribute safely using documented standards.
- The platform remains maintainable for many years.

---

## 14. Acceptance

All contributors agree to follow this Constitution.

Every architecture document, SDK, sprint guide and implementation is subordinate to this document.

Document 000 is the authoritative engineering standard for APZHUB.
