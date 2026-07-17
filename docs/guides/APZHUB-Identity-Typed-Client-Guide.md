# APZHUB Identity Typed Client Guide

**Milestone:** APZIDENTITY-003  
**Package path:** `apps/web/lib/identity`

## Create client

```typescript
import { createHttpIdentityClient } from "@/lib/identity";

const client = createHttpIdentityClient();
const { items } = await client.listUsers();
```

## Runtime accessor

```typescript
import {
  getIdentityClient,
  setIdentityClient,
  resetIdentityClient,
  createMockIdentityClient,
} from "@/lib/identity";
```

In `NODE_ENV=test`, the accessor defaults to the mock client.

## Constraints

- Calls **only** `/api/v1/identity/*`
- No imports of PlatformServiceGateway, platform-services, identity-core, or identity-persistence
- Forbidden path segments include login, password, oauth, scim, provisioning, workbench, etc.

## Query keys

Use `identityQueryKeys` for TanStack Query (users, groups, roles, organisations, tenants, departments, positions, memberships, serviceAssignments, invitations, activation, deactivation, policies, audit, history, references, diagnostics).
