# Document 011 — Platform Data Architecture & Database Design Principles

> **Status:** Active — platform data architecture (operational foundation)  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [010](./010-api-gateway-integration-communication-standards.md)

## 1. Purpose

This document defines how APZHUB stores, manages, protects and governs platform data.

It establishes ownership boundaries between APZHUB and every integrated backend engine.

Every table, entity, cache, search index and future data store must comply with this document.

---

## 2. Core Principle

Every piece of information must have exactly one System of Record (SoR).

Never duplicate authoritative business data unless required for:

- Performance
- Caching
- Search
- Reporting
- Temporary processing
- Offline capability (future)

Duplicated data must never become authoritative.

This extends data ownership rules in [003](./003-overall-system-architecture-design-principles.md) and [009](./009-platform-service-layer-integration-framework.md).

---

## 3. Data Ownership

### APZHUB Owns

- Identity
- Authentication
- Sessions
- Permissions
- Platform Roles
- Navigation
- Workspace Configuration
- User Preferences
- Notifications
- Audit Logs
- Activity Feed
- Module Registration
- Connector Registration
- Feature Flags
- Search Index
- Application Settings
- Organisation Configuration
- Platform Metadata
- Connector Configuration
- System Health
- Telemetry
- Platform Cache
- Background Jobs
- Platform Events

### Backend Engines Own

- Projects
- Tasks
- Documents
- Tickets
- Timesheets
- Automations
- Dashboards
- Reports
- Test Cases
- Security Findings
- Monitoring Data
- Source Code
- Assets
- Knowledge Base Articles
- Any future specialist business data

Platform Services ([009](./009-platform-service-layer-integration-framework.md)) orchestrate access to engine-owned data via connectors ([008](./008-module-plugin-connector-architecture.md)); they do not become the system of record for that business data.

---

## 4. Platform Database

The Platform Database stores only platform information.

It should remain independent from backend products.

The platform database should never contain duplicated copies of backend business data.

---

## 5. Database Philosophy

The Platform Database is the operational brain.

Backend databases remain specialists.

This separation allows backend engines to be upgraded or replaced independently.

---

## 6. Primary Database

PostgreSQL is the official platform database ([004](./004-technology-stack-repository-standards-development-environment.md)).

All platform metadata resides here.

Future clustering should require no schema redesign.

---

## 7. Data Categories

- Platform Data
- Configuration Data
- Reference Data
- Operational Data
- Audit Data
- Security Data
- Telemetry
- Search Metadata
- Background Jobs
- Temporary Data
- Cached Data

Each category should have clearly defined lifecycle rules.

---

## 8. Entity Design

Every entity should have:

- Unique Identifier
- Creation Timestamp
- Modification Timestamp
- Created By
- Modified By
- Status
- Version
- Soft Delete Indicator (where applicable)
- Audit Reference
- Organisation Reference (future)

Entities should be immutable where practical.

---

## 9. Naming Standards

**Tables:** Singular nouns.

Examples:

- User
- Permission
- Notification
- Workspace
- Connector
- Module

Columns should use consistent naming.

Avoid abbreviations.

Align with platform naming in [002](./002-product-naming-positioning-terminology-standard.md) — no vendor-specific table names for platform entities.

---

## 10. Relationships

Relationships should be explicit.

Avoid hidden dependencies.

Support:

- One-to-One
- One-to-Many
- Many-to-Many
- Hierarchical Structures
- Self References

Relationships should be documented.

---

## 11. Identifiers

Every platform entity uses globally unique identifiers.

Backend identifiers remain backend-specific.

Never expose backend identifiers directly to users unless necessary for support or diagnostics.

Platform APIs return platform identifiers; backend IDs remain inside connectors ([010](./010-api-gateway-integration-communication-standards.md)).

---

## 12. Platform Metadata

Platform metadata includes:

- Display Names
- Icons
- Navigation
- Workspace Settings
- Module Configuration
- Connector Capabilities
- Permission Mapping
- Search Registration
- User Preferences

Metadata belongs exclusively to APZHUB.

Permission mapping and navigation metadata support permission-driven UI ([005](./005-desktop-experience-workspace-framework.md), [007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 13. Caching

Caching exists for performance only.

Cached data must:

- Expire
- Refresh
- Invalidate
- Recover
- Gracefully degrade

The cache is never authoritative.

Redis is used for platform cache per [004](./004-technology-stack-repository-standards-development-environment.md). Caching rules in Platform Services per [009](./009-platform-service-layer-integration-framework.md).

---

## 14. Search Index

Search indexes are derived data.

Indexes should be rebuilt automatically.

Search never replaces the source of truth.

Search integration standards per [010](./010-api-gateway-integration-communication-standards.md); indexing owned by Platform Services per [009](./009-platform-service-layer-integration-framework.md).

---

## 15. Audit Storage

Audit data is immutable.

Every significant business action should generate audit records.

Audit history should never be modified.

Retention policies should be configurable.

Aligns with IAM audit requirements ([007](./007-identity-authentication-authorisation-rbac-architecture.md)) and API audit hooks ([010](./010-api-gateway-integration-communication-standards.md)).

---

## 16. Activity Feed

Activity is platform-owned.

Examples:

- User logged in
- Project created
- Document approved
- Workflow executed
- Permission changed
- Notification sent

Activities may reference backend records but remain platform-managed.

Reference backend records by platform-level correlation or opaque references — not as duplicated business payloads.

---

## 17. Notifications

Notifications are platform entities.

Examples:

- Assignment
- Reminder
- Approval
- Failure
- Completion
- System Alert

Notification history belongs to APZHUB.

Notification generation is centralised in Platform Services ([009](./009-platform-service-layer-integration-framework.md)).

---

## 18. Connector Metadata

Each connector stores:

- Configuration
- Credentials Reference
- Health
- Capabilities
- Version
- Provisioning Status
- Supported Features

No connector should store business data locally.

Connector configuration supports per-engine SSO and integration settings ([007](./007-identity-authentication-authorisation-rbac-architecture.md)). Secrets are references only — never plain-text credentials in the platform database ([024](#24-security) below).

---

## 19. Synchronisation

Synchronisation should exchange metadata only where possible.

Business data should be requested from the backend engine when required.

Avoid unnecessary replication.

Provisioning state synchronisation per [007](./007-identity-authentication-authorisation-rbac-architecture.md) — platform tracks provisioning status; engine holds account data.

---

## 20. Data Lifecycle

Each entity defines:

- Creation
- Update
- Archival
- Retention
- Deletion
- Recovery
- Compliance Requirements

Lifecycle rules should be documented.

User lifecycle states in IAM ([007](./007-identity-authentication-authorisation-rbac-architecture.md)) apply to identity entities.

---

## 21. Versioning

Platform entities should support optimistic concurrency where appropriate.

Conflicting updates should be detected rather than silently overwritten.

---

## 22. Data Integrity

Maintain:

- Foreign Keys
- Unique Constraints
- Check Constraints
- Referential Integrity
- Validation Rules

Integrity should be enforced at multiple layers — database, domain, and API ([010](./010-api-gateway-integration-communication-standards.md)).

---

## 23. Performance

Optimise:

- Indexes
- Queries
- Caching
- Connection Pooling
- Pagination
- Bulk Operations

Performance should not compromise maintainability.

---

## 24. Security

Sensitive platform data should be protected.

Examples:

- Credentials
- Sessions
- Tokens
- Secrets
- API Keys
- Personally Identifiable Information

Encryption should be applied where appropriate.

Secrets should never be stored in plain text.

Use secrets manager / environment configuration per [004](./004-technology-stack-repository-standards-development-environment.md). Session and auth data align with [007](./007-identity-authentication-authorisation-rbac-architecture.md).

---

## 25. Backup & Recovery

Platform data requires:

- Automated Backups
- Point-in-Time Recovery
- Restore Testing
- Retention Policies
- Disaster Recovery Procedures

Recovery should be regularly validated.

Backend engine backups remain the responsibility of each engine's infrastructure; platform backups cover platform PostgreSQL and platform-owned stores only.

---

## 26. Future Multi-Tenancy

The schema should accommodate:

- Tenant Isolation
- Shared Infrastructure
- Tenant Configuration
- Tenant Permissions
- Tenant Metadata

Future expansion should not require major schema redesign.

Aligns with IAM multi-tenancy goals ([007](./007-identity-authentication-authorisation-rbac-architecture.md)) and scalability principles ([003](./003-overall-system-architecture-design-principles.md)).

---

## 27. Documentation

Every entity requires:

- Purpose
- Owner
- Relationships
- Constraints
- Lifecycle
- Permissions
- Search Behaviour
- Audit Behaviour

Documentation is mandatory.

---

## 28. Cursor Instructions

When designing platform data:

- Keep platform metadata separate from business data.
- Never duplicate backend data without justification.
- Use PostgreSQL as the authoritative platform store.
- Prefer metadata references over copied records.
- Design entities for long-term maintainability.
- Assume backend engines may be replaced.
- Ensure every entity has a clearly defined owner.

The Platform Database must remain clean, focused, and independent of individual backend implementations.

---

## 29. Acceptance Criteria

The Platform Data Architecture is complete when:

- Every entity has a clearly defined System of Record.
- Platform metadata is separated from business data.
- Backend engines remain authoritative for their domains.
- Platform entities support auditing, security and lifecycle management.
- Caching and search remain non-authoritative.
- Connector replacement does not require database redesign.
- Future multi-tenancy can be introduced without restructuring the platform.

The Platform Database is the operational foundation of APZHUB and must remain independent, consistent and maintainable throughout the lifetime of the platform.
