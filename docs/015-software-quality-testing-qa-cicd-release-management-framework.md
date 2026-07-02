# Document 015 — Software Quality, Testing, QA, CI/CD & Release Management Framework

> **Document Version:** 1.0  
> **Classification:** Core Engineering Standard  
> **Status:** Mandatory  
> **Applies To:** Entire Platform · Every Module · Every Connector · Every Platform Service · Every Shared Component · Every API · Every Future Integration  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [014](./014-observability-monitoring-telemetry-health-framework.md)

## 1. Purpose

This document defines the Software Quality Framework for APZHUB.

Quality is a platform capability.

Quality begins before development and continues throughout the software lifecycle.

Testing is never considered a separate phase.

Testing forms part of development.

---

## 2. Engineering Philosophy

Every feature progresses through the following lifecycle.

```
Requirements
    ↓
Architecture
    ↓
Design
    ↓
Implementation
    ↓
Unit Testing
    ↓
Component Testing
    ↓
Integration Testing
    ↓
API Testing
    ↓
End-to-End Testing
    ↓
Regression Testing
    ↓
Performance Testing
    ↓
Security Validation
    ↓
Documentation
    ↓
Approval
    ↓
Release
```

Skipping stages is prohibited.

Aligns with development methodology in [001](./001-project-vision-and-guiding-principles.md) and definition of complete in [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 3. Definition of Done

A feature is complete only when:

- Requirements Approved
- Architecture Approved
- Code Complete
- Code Reviewed
- Unit Tests Pass
- Integration Tests Pass
- API Tests Pass
- Playwright Tests Pass
- Regression Tests Pass
- Accessibility Verified
- Documentation Complete
- No Critical Defects
- Merged to Main

If any item is incomplete, the feature is not complete.

---

## 4. Test Pyramid

Testing follows this order.

```
Unit Tests
    ↓
Component Tests
    ↓
Integration Tests
    ↓
API Tests
    ↓
End-to-End Tests
    ↓
Manual Validation (when required)
```

Lower-level tests should provide the majority of coverage.

---

## 5. Unit Testing

Every business rule requires unit tests.

Requirements:

- Fast
- Independent
- Repeatable
- Deterministic
- No external dependencies

Mock external systems where appropriate.

Business rules belong in Domain and Application layers ([003](./003-overall-system-architecture-design-principles.md)); Platform Services unit-tested in isolation ([009](./009-platform-service-layer-integration-framework.md)).

---

## 6. Component Testing

Every reusable UI component requires tests.

Examples:

- Buttons
- Tables
- Forms
- Dialogs
- Panels
- Tabs
- Command Palette
- Notifications

Components should be tested in isolation.

Design System components per [006](./006-enterprise-design-system-ui-standards.md); shared UI library in `/packages` per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 7. Integration Testing

Integration tests validate communication between:

- Modules
- Services
- Connectors
- Database
- Cache
- Search
- Authentication

Integration tests should use realistic scenarios.

Module and connector independence per [008](./008-module-plugin-connector-architecture.md); IAM integration per [007](./007-identity-authentication-authorisation-rbac-architecture.md).

---

## 8. API Testing

Every API endpoint requires:

- Success Cases
- Validation Cases
- Permission Cases
- Failure Cases
- Rate Limiting
- Version Validation
- Authentication

API contracts should remain stable.

Per [010](./010-api-gateway-integration-communication-standards.md) and permission enforcement per [013](./013-security-architecture-zero-trust-framework.md).

---

## 9. Playwright End-to-End Testing

Every critical user journey requires automated Playwright coverage.

Examples:

- Login
- Logout
- Password Reset
- Create Project
- Assign Task
- Upload Document
- Submit Support Request
- Approve Workflow
- Search
- Notifications
- Role Changes
- Provisioning

End-to-end tests simulate real users.

Permission-driven UI journeys per [005](./005-desktop-experience-workspace-framework.md); SSO flows per [007](./007-identity-authentication-authorisation-rbac-architecture.md).

---

## 10. Regression Testing

Every release executes:

- Existing Unit Tests
- Existing Component Tests
- Existing Integration Tests
- Existing API Tests
- Existing Playwright Tests

Regression failures block release.

---

## 11. Accessibility Testing

Validate:

- Keyboard Navigation
- Focus Order
- ARIA
- Contrast
- Screen Readers
- Reduced Motion

Accessibility forms part of release quality.

WCAG AA target per [004](./004-technology-stack-repository-standards-development-environment.md) and [006](./006-enterprise-design-system-ui-standards.md).

---

## 12. Performance Testing

Performance testing includes:

- API Latency
- Database Queries
- Connector Performance
- Large Datasets
- Bulk Operations
- Search
- Dashboard Rendering
- Background Jobs

Performance regressions should be detected automatically.

Observability baselines per [014](./014-observability-monitoring-telemetry-health-framework.md).

---

## 13. Security Testing

Includes:

- Authentication
- Permissions
- CSRF
- XSS
- Input Validation
- Dependency Scanning
- Secret Detection

Security tests run continuously.

Per [013](./013-security-architecture-zero-trust-framework.md).

---

## 14. Test Data

Test data should be:

- Repeatable
- Version Controlled
- Independent
- Anonymised where required
- Disposable

Production data should never be used directly.

---

## 15. Test Environments

Support:

- Development
- Integration
- QA
- User Acceptance Testing
- Staging
- Production

Environments should remain consistent.

Coexistence with legacy `apz-stack` on host documented in [ENVIRONMENT.md](../ENVIRONMENT.md); APZHUB environments must not disrupt legacy without approval.

---

## 16. Continuous Integration

Every commit triggers:

- Dependency Validation
- Formatting
- Linting
- Type Checking
- Build
- Unit Tests
- Integration Tests
- API Tests
- Playwright
- Security Checks
- Artifact Generation

No failing build reaches the main branch.

pnpm, ESLint, Prettier, strict TypeScript per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 17. Continuous Delivery

Deployment should support:

- Development
- Testing
- Staging
- Production
- Rollback
- Blue-Green (future)
- Canary (future)

Deployment should be repeatable.

---

## 18. Code Reviews

Every Pull Request requires review.

Review should evaluate:

- Architecture
- Readability
- Maintainability
- Security
- Testing
- Performance
- Documentation

No direct commits to the protected main branch.

Architecture compliance against documents 001–014.

---

## 19. Quality Gates

Every Pull Request must satisfy:

- Build Success
- Lint Success
- Type Safety
- Test Success
- Security Checks
- Documentation Updated
- Architecture Compliance

Quality gates are mandatory.

---

## 20. Branch Strategy

Suggested branches:

- main
- develop
- feature/*
- bugfix/*
- release/*
- hotfix/*

Branch protection should prevent accidental changes.

---

## 21. Versioning

Follow Semantic Versioning.

- Major
- Minor
- Patch

Connector versions remain independent.

Module versions remain independent.

Platform version coordinates releases.

Per connector version isolation [008](./008-module-plugin-connector-architecture.md) and API versioning [010](./010-api-gateway-integration-communication-standards.md).

---

## 22. Release Management

Every release requires:

- Release Notes
- Migration Notes
- Database Changes
- Configuration Changes
- Known Issues
- Rollback Procedure
- Approval

Every release should be reproducible.

Platform database migrations per [011](./011-platform-data-architecture-database-design-principles.md).

---

## 23. Defect Management

Every defect records:

- Severity
- Priority
- Module
- Service
- Connector
- Steps to Reproduce
- Expected Result
- Actual Result
- Root Cause
- Resolution

Defects become organisational knowledge.

---

## 24. Technical Debt

Technical debt must be recorded explicitly.

Every item includes:

- Reason
- Impact
- Owner
- Estimated Effort
- Target Resolution

Hidden technical debt is prohibited.

Per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 25. Documentation Standards

Every feature requires:

- Requirements
- Architecture
- API Documentation
- User Documentation
- Administrator Documentation
- Developer Notes
- Testing Documentation

Documentation evolves with the code.

Platform documentation suite in `docs/` ([docs/README.md](./README.md)).

---

## 26. Release Checklist

Before production:

- All Tests Pass
- Security Checks Pass
- Documentation Updated
- Migration Verified
- Rollback Tested
- Monitoring Configured
- Health Checks Validated
- Approval Received

No checklist item may be skipped.

Monitoring and health per [014](./014-observability-monitoring-telemetry-health-framework.md).

---

## 27. Metrics

Track:

- Coverage
- Build Success
- Deployment Frequency
- Lead Time
- Change Failure Rate
- Mean Time to Recovery
- Defect Density
- Test Duration

Quality metrics drive continuous improvement.

DORA-style metrics complement observability telemetry [014](./014-observability-monitoring-telemetry-health-framework.md).

---

## 28. Self-Hosted First Principle

The quality framework should use self-hosted, open-source tooling wherever practical.

Examples include:

- Kiwi TCMS
- Playwright
- Vitest
- ESLint
- GitHub Actions (self-hosted runners)
- SonarQube Community Edition (optional)
- OpenTelemetry
- Future OSS testing tools

The architecture must not depend on commercial CI/CD or testing platforms.

Aligns with self-hosted first across [008](./008-module-plugin-connector-architecture.md), [013](./013-security-architecture-zero-trust-framework.md), and [014](./014-observability-monitoring-telemetry-health-framework.md).

Note: Kiwi TCMS as a **testing tool** in this document refers to the OSS test management system; the APZHUB **Testing** module may integrate Kiwi TCMS engine via connector while presenting APZHUB Testing UX to users ([002](./002-product-naming-positioning-terminology-standard.md)).

---

## 29. Cursor Instructions

When implementing features:

- Write tests before considering a feature complete.
- Keep tests deterministic.
- Keep tests independent.
- Prefer reusable test helpers.
- Update documentation with every feature.
- Never bypass quality gates.
- Assume every feature will evolve over time.
- Build for maintainability.

Quality is a permanent platform responsibility.

---

## 30. Acceptance Criteria

The Software Quality Framework is complete when:

- Every feature follows the documented lifecycle.
- Automated testing protects all critical functionality.
- Releases are repeatable and auditable.
- Quality gates prevent unstable code reaching production.
- Documentation remains synchronised with implementation.
- Self-hosted, open-source tooling supports the full engineering lifecycle.
- Quality is continuously measured and improved.

The Software Quality Framework establishes the engineering discipline required to ensure APZHUB remains reliable, maintainable and scalable as it grows.
