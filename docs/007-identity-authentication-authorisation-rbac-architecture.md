# Document 007 — Identity, Authentication, Authorisation & RBAC Architecture

> **Status:** Active — IAM architecture (core platform capability)  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [006](./006-enterprise-design-system-ui-standards.md)

## 1. Purpose

This document defines the complete identity and access management (IAM) architecture for APZHUB.

Identity is a platform capability, not a module.

Every feature, service, adapter, workspace, API, backend engine and future plugin must integrate with this architecture.

No alternative authentication or authorisation mechanisms may be introduced without explicit approval.

---

## 2. Objectives

The IAM architecture must provide:

- Single Sign-On (SSO)
- Centralised identity
- Centralised permissions
- Service-specific role mapping
- Secure session management
- User lifecycle management
- Backend account provisioning
- Auditability
- Least privilege access
- Future multi-tenant capability

The user authenticates once and interacts only with APZHUB.

**Seamless experience:** SSO must feel invisible to the user — one login, no repeated backend login screens, no engine branding in auth flows. Where backend engines require additional configuration (SAML, OIDC, forward-auth, API tokens, outposts, or engine-specific SSO settings), APZHUB owns that configuration and integration work so the user never manages per-engine sign-in.

---

## 3. Guiding Principles

- Identity belongs to APZHUB.
- Authentication belongs to APZHUB.
- Permissions belong to APZHUB.
- Backend systems receive only the permissions required to perform their functions.
- Backend systems are never the source of truth for identity.

---

## 4. Core Components

The IAM subsystem consists of:

- BetterAuth
- Identity Service
- Authorisation Service
- Permission Service
- Role Service
- Provisioning Service
- Session Service
- Audit Service
- Adapter Layer

Each component has a single responsibility.

The **Permission Service** feeds permission-driven UI in the Desktop Framework ([005](./005-desktop-experience-workspace-framework.md)).

---

## 5. Authentication

BetterAuth is the official authentication provider.

Supported authentication methods should include:

- Email and password
- Passkeys (future)
- Multi-factor authentication (future)
- External identity providers (future)

Authentication establishes identity only.

Authentication does not grant permissions.

---

## 6. Session Management

Sessions are managed by APZHUB.

Requirements:

- Secure cookies
- HTTP Only
- SameSite protection
- Configurable expiry
- Sliding expiration
- Session revocation
- Device tracking
- Concurrent session management

Users authenticate once per session.

Session validity is re-checked for sensitive operations and permission changes.

---

## 7. Identity Model

Every user has one platform identity.

The identity includes:

- Platform User ID
- Profile
- Organisation
- Status
- Authentication Credentials
- Preferences
- Security Settings
- Linked Backend Accounts

Platform identity remains stable regardless of backend integrations.

---

## 8. User Lifecycle

Supported lifecycle states:

- Pending
- Invited
- Active
- Suspended
- Locked
- Disabled
- Archived
- Deleted

State transitions must be auditable.

Lifecycle state affects authentication, provisioning, and UI visibility.

---

## 9. Platform Roles

Platform roles describe organisational responsibilities.

Examples:

- Platform Administrator
- Administrator
- Manager
- Supervisor
- Employee
- Support Agent
- Auditor
- Compliance Officer
- Executive
- Developer

Roles define broad responsibilities, not individual permissions.

---

## 10. Permission Model

Permissions are granular.

Examples:

- `project.create`
- `project.edit`
- `project.delete`
- `project.assign`
- `ticket.view`
- `ticket.assign`
- `document.upload`
- `workflow.execute`
- `analytics.view`
- `testing.manage`

Permissions are assigned to roles.

Users inherit permissions through role assignments.

Effective permissions drive navigation, commands, and API authorisation ([005](./005-desktop-experience-workspace-framework.md)).

---

## 11. Service Roles

Backend systems have their own native roles.

Examples:

- Plane → Project Admin
- Kimai → Time User
- Zammad → Agent
- Paperless → Consumer
- Kiwi TCMS → Tester
- Metabase → Viewer

These roles remain internal implementation details.

---

## 12. Role Translation

The Platform Role Service translates platform permissions into backend-specific roles.

```
Platform Role
    ↓
Permission Set
    ↓
Service Mapping
    ↓
Backend Role
```

The frontend must never depend on backend role names.

---

## 13. Multiple Service Roles

A user may hold different roles in different services simultaneously.

Example:

- Platform: Manager
- Projects → Administrator
- Support → Agent
- Testing → Reviewer
- Analytics → Viewer
- Documents → Consumer

The mapping is independent for each service.

---

## 14. Provisioning Service

Provisioning is owned by APZHUB.

Responsibilities:

- Create backend accounts
- Update backend roles
- Disable backend accounts
- Synchronise changes
- Detect failures
- Retry failed provisioning
- Maintain audit history

Provisioning must be idempotent.

---

## 15. Provisioning States

Every service assignment should track:

- Not Assigned
- Pending
- Provisioning
- Provisioned
- Synchronising
- Failed
- Suspended
- Revoked

These states are visible to administrators.

Users should not see provisioning mechanics unless an admin surface is required; failures must not block unrelated workspaces.

---

## 16. Permission Evaluation

Every request follows this sequence:

```
Authenticate User
    ↓
Validate Session
    ↓
Load Platform Roles
    ↓
Resolve Permissions
    ↓
Evaluate Policies
    ↓
Execute Business Logic
    ↓
Audit Action
    ↓
Return Response
```

Backend permissions are never evaluated directly by the frontend.

---

## 17. Policy Engine

Permissions may include contextual rules.

Examples:

- Department
- Business Unit
- Project Membership
- Document Ownership
- Time Restrictions
- Approval Chains
- Location (future)

Policies supplement role-based permissions.

---

## 18. Superadmin & Elevated Access

**Superadmin is not a normal user** (see [005](./005-desktop-experience-workspace-framework.md)).

- Superadmin is a **special permission tier** with explicit superadmin permissions — not a default role for standard users.
- Superadmin capabilities (platform configuration, integration diagnostics, IAM administration, engine SSO configuration) are granted only through defined superadmin permissions.
- Superadmin actions are fully audited; superadmin is not a bypass of the permission pipeline — it uses elevated permissions evaluated through the same Authorisation and Permission services.
- Superadmin surfaces appear in the shell only when those permissions are present.

---

## 19. Audit Requirements

Every identity-related event must be audited.

Examples:

- Login
- Logout
- Failed Login
- Password Change
- Role Assignment
- Permission Change
- Provisioning
- Revocation
- Session Revocation
- Administrative Override

Audit records must be immutable.

---

## 20. Security Events

Generate events for:

- Suspicious Login
- Repeated Failures
- Privilege Escalation
- Role Changes
- Provisioning Failures
- Permission Violations

Events integrate with future monitoring modules.

---

## 21. Service Registration

Every backend integration must register:

- Supported Roles
- Supported Permissions
- Provisioning Capabilities
- Authentication Method
- Health Status
- API Version

This allows APZHUB to understand service capabilities dynamically.

---

## 22. Backend SSO & Engine Configuration (Mandatory)

Many backend engines **do not** work with platform SSO out of the box. APZHUB must plan for **per-engine integration configuration** so users still experience **single sign-on through BetterAuth** without seeing engine login pages.

### 22.1 APZHUB-owned integration

- All SSO-related configuration (SAML/OIDC clients, forward-auth, outposts, trusted headers, API tokens for provisioning, callback URLs, certificate rotation) is **owned and documented by APZHUB** — not left to end users.
- Adapters and Provisioning Service implement engine-specific auth bridges; engines authenticate **through Platform Services** where possible ([001](./001-project-vision-and-guiding-principles.md)).
- Configuration lives in platform settings, environment, or secrets manager ([004](./004-technology-stack-repository-standards-development-environment.md)) — never hardcoded in UI or scattered in modules.

### 22.2 Seamless user experience

- User signs in **once** via BetterAuth / APZHUB login.
- Accessing Projects, Support, Documents, etc. must **not** prompt for a second login to the underlying engine under normal operation.
- Engine login screens, logout redirects, and branding must remain **masked** from standard users ([002](./002-product-naming-positioning-terminology-standard.md)).
- If an engine requires a session handoff (token exchange, proxy auth, embedded session), the handoff is **automatic and silent** from the user's perspective.
- Permission or provisioning gaps surface as clear APZHUB messages — not raw engine 401/403 pages.

### 22.3 Engine-specific readiness

During integration, each adapter must document:

- Required SSO/auth mode for that engine
- Additional config keys and secrets
- Provisioning prerequisites (account must exist before SSO works)
- Known limitations and fallback behaviour
- Health check for auth integration

Examples of engines likely needing extra config: Metabase, Kimai, n8n, Plane, Paperless, Zammad, Kiwi TCMS, Grafana, and future security/compliance tools.

### 22.4 Migration from legacy auth

The live host may still run Authentik for legacy `apz-stack` forward-auth
([ENVIRONMENT.md](../ENVIRONMENT.md)). **APZHUB AuthN is BetterAuth only** —
Owner decision [OWNER-BETTERAUTH-SOLE-AUTHN](./decisions/OWNER-BETTERAUTH-SOLE-AUTHN.md).
Do not add Authentik features. Retire Authentik when APZPRD is working and
engine handoff is via APZHUB adapters. Until cutover, coexist without
breaking legacy vhosts.

---

## 23. Future Multi-Tenancy

The IAM architecture must support:

- Multiple organisations
- Isolated identities
- Tenant-specific roles
- Tenant-specific permissions
- Tenant-specific provisioning

Without redesigning the platform.

---

## 24. API Standards

Identity APIs include:

- Authentication
- Users
- Roles
- Permissions
- Provisioning
- Sessions
- Policies
- Audit

Every endpoint requires authentication and authorisation.

---

## 25. Error Handling

Identity errors must be consistent.

Users should receive meaningful messages.

Internal implementation details must never be exposed.

Provisioning failures should be recoverable where possible.

Never expose backend engine auth errors directly to users.

---

## 26. Testing Standards

Identity functionality requires:

- Unit Tests
- Integration Tests
- API Tests
- Security Tests
- Playwright Authentication Tests
- Permission Matrix Tests
- Provisioning Tests
- Regression Tests
- SSO / engine handoff tests per integrated backend

Identity changes require comprehensive automated testing.

---

## 27. Cursor Instructions

When implementing identity:

- Treat BetterAuth as the authentication engine only.
- Keep business permissions within APZHUB.
- Never expose backend roles to users.
- Build services that are backend-agnostic.
- Make provisioning reliable and repeatable.
- Keep identity logic independent of individual modules.
- Design for future expansion without architectural changes.
- **Plan per-engine SSO config and silent session handoff** — seamless UX is a requirement, not optional polish.
- **Implement superadmin as explicit permissions**, not as an informal bypass.

Identity must remain a first-class platform capability.

---

## 28. Acceptance Criteria

The IAM architecture is complete when:

- Users authenticate only once via APZHUB / BetterAuth.
- Platform permissions govern access across all modules and permission-driven UI.
- Backend roles are assigned automatically through translation.
- Provisioning is automated and auditable.
- Sessions are securely managed.
- Identity changes propagate reliably to integrated services.
- Backend engines remain implementation details.
- New services can integrate without redesigning the identity model.
- **Integrated engines work through configured SSO without user-visible engine login flows.**
- **Engine-specific auth configuration is documented and operable by administrators.**
- **Superadmin and standard user permission models are distinct and audited.**

The IAM subsystem is the trust foundation of APZHUB and must be treated as a core platform service rather than a feature.
