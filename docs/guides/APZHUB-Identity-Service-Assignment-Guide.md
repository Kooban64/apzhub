# APZHUB Identity Service Assignment Guide

**Milestone:** APZIDENTITY-002

## Purpose

`gateway.identity.serviceAssignments` stores **metadata** assigning users (or other subjects) to platform capabilities. Assignments do **not** provision accounts, create engine users, or grant authentication.

## Capabilities

Canonical catalogue (`IDENTITY_SERVICE_CAPABILITIES`):

- Projects
- Support
- Testing
- Reporting
- Documents
- Search
- Workflow
- Workflow Engine
- Notifications
- Configuration
- Administration

## Usage

```typescript
await gateway.identity.serviceAssignments.create(ctx, {
  subjectKind: "user",
  subjectId: userId,
  serviceCapability: "workflow-engine",
});
```

Requires `identity.assignment` (or `identity.*`).

## Boundaries

- Metadata only — no provisioning, SCIM, LDAP, Entra ID, or Google Workspace sync
- Does not create authentication subjects or sessions
- Does not call backend engines
