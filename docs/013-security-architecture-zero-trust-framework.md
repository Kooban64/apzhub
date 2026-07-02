# Document 013 — Security Architecture & Zero Trust Framework

> **Document Version:** 1.0  
> **Classification:** Core Architecture  
> **Status:** Approved Foundation Standard  
> **Applies To:** Entire Platform · Every Module · Every Connector · Every Service · Every API · Every Background Worker · Every Future Integration  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [012](./012-event-driven-architecture-background-processing-workflow-framework.md)

## 1. Purpose

This document defines the security architecture for APZHUB.

Security is a platform capability rather than a feature.

Every architectural decision must consider security before convenience.

Every component developed for APZHUB must comply with this standard.

---

## 2. Security Philosophy

APZHUB adopts a Zero Trust architecture.

Nothing is trusted automatically.

Every request must prove:

- Identity
- Permission
- Integrity
- Intent
- Context

Every time.

---

## 3. Core Security Principles

The platform follows these principles:

- Never Trust
- Always Verify
- Least Privilege
- Defence in Depth
- Secure by Default
- Fail Securely
- Audit Everything
- Encrypt Sensitive Information
- Validate Every Input
- Never Assume Internal Systems Are Trusted

---

## 4. Security Layers

Security exists at every layer.

```
Desktop Client
    ↓
Gateway
    ↓
Authentication
    ↓
Authorisation
    ↓
Business Validation
    ↓
Platform Services
    ↓
Connectors
    ↓
Backend Engines
    ↓
Audit
    ↓
Monitoring
    ↓
Logging
```

Each layer provides additional protection.

Aligns with IAM permission pipeline ([007](./007-identity-authentication-authorisation-rbac-architecture.md)), API Gateway ([010](./010-api-gateway-integration-communication-standards.md)), and Platform Service Layer ([009](./009-platform-service-layer-integration-framework.md)).

---

## 5. Identity Verification

Every request must verify:

- Authenticated User
- Active Session
- Platform Identity
- Organisation Context
- Module Permission
- Policy Compliance

Identity is never assumed.

BetterAuth establishes authentication; APZHUB owns authorisation ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 6. Authorisation

Permissions are evaluated before execution.

Validation includes:

- Platform Roles
- Permission Sets
- Business Policies
- Object Ownership
- Department
- Organisation
- Context Rules

Backend permissions never replace platform authorisation.

Permission-driven UI in the Desktop Framework ([005](./005-desktop-experience-workspace-framework.md)) reflects authorisation; enforcement remains server-side.

---

## 7. Least Privilege

Users receive only permissions required for their responsibilities.

Services receive only permissions required to execute their tasks.

Connectors receive only permissions required to communicate with backend systems.

Background workers operate under dedicated service identities.

Superadmin is a special permission tier — not a bypass of verification ([007](./007-identity-authentication-authorisation-rbac-architecture.md), [005](./005-desktop-experience-workspace-framework.md)).

---

## 8. Secure Sessions

Sessions require:

- HTTP Only Cookies
- Secure Cookies
- SameSite Protection
- Session Rotation
- Sliding Expiration
- Session Revocation
- Device Awareness
- Concurrent Session Limits

Session integrity should be continuously monitored.

Session management per [007](./007-identity-authentication-authorisation-rbac-architecture.md); Redis-backed session/cache per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 9. Secret Management

Secrets include:

- API Keys
- Tokens
- Connector Credentials
- Database Passwords
- Certificates
- Encryption Keys

Secrets must never:

- Appear in source code
- Appear in logs
- Be committed to repositories
- Be stored unencrypted

Connector metadata stores credential **references** only ([011](./011-platform-data-architecture-database-design-principles.md)). Configuration from environment and secrets manager per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 10. Encryption

Encrypt:

- Secrets
- Sensitive Configuration
- Authentication Tokens
- Personally Identifiable Information where appropriate

Transport encryption is mandatory.

Data encryption should be applied where necessary.

HTTPS via Caddy or Nginx ([004](./004-technology-stack-repository-standards-development-environment.md)).

---

## 11. API Security

Every endpoint requires:

- Authentication
- Permission Validation
- Input Validation
- Rate Limiting
- Audit
- Logging
- Correlation ID

Endpoints should never expose backend implementations.

Per [010](./010-api-gateway-integration-communication-standards.md).

---

## 12. Input Validation

Every input should be validated.

Examples:

- Length
- Format
- Schema
- Business Rules
- Permissions
- Relationships

Reject invalid requests early.

Validation before business execution per [010](./010-api-gateway-integration-communication-standards.md) and [009](./009-platform-service-layer-integration-framework.md).

---

## 13. Output Protection

Responses should:

- Sanitise Data
- Hide Internal IDs
- Hide Stack Traces
- Prevent Information Leakage
- Translate Backend Errors

Users should only receive business-relevant information.

Permission denials must not leak hidden resources ([005](./005-desktop-experience-workspace-framework.md)).

---

## 14. CSRF Protection

State-changing requests require CSRF protection where applicable.

Tokens should be managed centrally.

---

## 15. XSS Protection

Prevent:

- Stored XSS
- Reflected XSS
- DOM-based XSS

Output encoding is mandatory.

---

## 16. SQL Injection

Use:

- Prepared Statements
- ORM
- Parameter Binding
- Schema Validation

Never construct SQL dynamically using user input.

PostgreSQL platform database per [011](./011-platform-data-architecture-database-design-principles.md).

---

## 17. File Security

Uploads require:

- Validation
- File Type Verification
- Size Validation
- Malware Scanning (future)
- Storage Isolation
- Audit Logging

Downloads require permission validation.

Central file handling per [010](./010-api-gateway-integration-communication-standards.md); S3-compatible storage per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 18. Connector Security

Every connector requires:

- Dedicated Credentials
- Health Monitoring
- Credential Rotation Support
- Secure Storage
- Audit
- Retry Controls

Connectors should never expose backend credentials.

Per-engine SSO configuration owned by APZHUB ([007](./007-identity-authentication-authorisation-rbac-architecture.md)). Circuit breakers and isolation per [010](./010-api-gateway-integration-communication-standards.md).

---

## 19. Background Worker Security

Workers require:

- Dedicated Identity
- Scoped Permissions
- Audit
- Secure Secrets
- Limited Network Access

Workers should never execute with administrator privileges unless explicitly required.

Per [012](./012-event-driven-architecture-background-processing-workflow-framework.md).

---

## 20. Audit

Every security event should be audited.

Examples:

- Login
- Logout
- Failed Login
- Permission Change
- Session Revocation
- Secret Rotation
- Connector Failure
- Provisioning Failure
- Administrative Override

Audit records should be immutable.

Per [007](./007-identity-authentication-authorisation-rbac-architecture.md), [011](./011-platform-data-architecture-database-design-principles.md), and security events in [012](./012-event-driven-architecture-background-processing-workflow-framework.md).

---

## 21. Security Monitoring

Monitor:

- Authentication Failures
- Permission Violations
- Connector Failures
- Unexpected Errors
- Rate Limit Violations
- Suspicious Activity
- Privilege Escalation

Monitoring supports rapid incident detection.

Future Monitoring Module and security engine connectors ([008](./008-module-plugin-connector-architecture.md), Section 28 below).

---

## 22. Rate Limiting

Protect:

- Authentication
- Public APIs
- Connector APIs
- Background Jobs
- Search
- Uploads

Limits should be configurable.

Redis-backed rate limiting per [004](./004-technology-stack-repository-standards-development-environment.md) and [010](./010-api-gateway-integration-communication-standards.md).

---

## 23. Security Headers

Responses should include appropriate security headers.

Managed centrally through the reverse proxy and application.

Modules must not implement their own security header logic.

Caddy or Nginx at edge; APZHUB API Gateway at application layer ([004](./004-technology-stack-repository-standards-development-environment.md), [010](./010-api-gateway-integration-communication-standards.md)).

---

## 24. Dependency Security

All dependencies should be:

- Reviewed
- Version Controlled
- Regularly Updated
- Scanned for Vulnerabilities

Unused dependencies should be removed.

pnpm lock file committed per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 25. Logging

Security logs should include:

- Timestamp
- Identity
- Correlation ID
- Action
- Module
- Outcome
- IP Information (where appropriate)

No sensitive information should appear in logs.

Structured logging per [004](./004-technology-stack-repository-standards-development-environment.md). Correlation IDs per [010](./010-api-gateway-integration-communication-standards.md).

---

## 26. Secure Defaults

Every new feature should default to:

- Private
- Least Privilege
- Audited
- Validated
- Secure

Developers should explicitly enable broader access where required.

Aligns with permission-driven UI — hide by default ([005](./005-desktop-experience-workspace-framework.md)).

---

## 27. Incident Readiness

The platform should support:

- Investigation
- Correlation
- Recovery
- Revocation
- Forensics
- Connector Isolation

Future incident response capabilities should integrate naturally.

Correlation IDs and DLQ traceability per [010](./010-api-gateway-integration-communication-standards.md) and [012](./012-event-driven-architecture-background-processing-workflow-framework.md).

---

## 28. Future Security Services

The architecture should support integration with:

- Greenbone
- Faraday
- MobSF
- Wazuh
- OpenVAS
- Dependency Scanners
- Secret Scanners
- Container Scanners

Without architectural redesign.

Integrate via Service Connectors and Platform Modules ([008](./008-module-plugin-connector-architecture.md)); self-hosted OSS first per [008](./008-module-plugin-connector-architecture.md) Section 23.

---

## 29. Testing

Security testing includes:

- Unit Tests
- Integration Tests
- Permission Tests
- Authentication Tests
- Playwright Security Flows
- Dependency Scanning
- Static Analysis
- Dynamic Analysis
- Penetration Testing (future)

Security testing is continuous.

Per [004](./004-technology-stack-repository-standards-development-environment.md) and IAM testing ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 30. Self-Hosted First Principle

Security must not rely on proprietary SaaS platforms.

The platform should operate entirely using self-hosted, open-source technologies wherever practical.

Optional commercial integrations may be supported through connectors but must never become mandatory.

Aligns with connector self-hosted first principle ([008](./008-module-plugin-connector-architecture.md)).

---

## 31. Cursor Instructions

When implementing security:

- Apply Zero Trust principles.
- Authenticate every request.
- Validate every permission.
- Encrypt sensitive information.
- Never expose backend details.
- Keep security logic centralised.
- Assume all external systems are untrusted.
- Build secure defaults into every component.

Security is a foundational architecture concern and not an optional enhancement.

---

## 32. Acceptance Criteria

The Security Architecture is complete when:

- Every request is authenticated and authorised.
- Platform permissions govern all access.
- Secrets are securely managed.
- Audit records capture all significant security events.
- Connectors operate with least privilege.
- Background workers have dedicated identities.
- Security monitoring provides visibility into platform health.
- The platform operates securely using self-hosted, open-source infrastructure without mandatory proprietary dependencies.

The Security Architecture establishes the trust boundary for APZHUB and must be adhered to throughout the lifetime of the platform.
