# Identity HTTP Consumer Guide (APZIDENTITY-003)

## Preferred consumption

```typescript
import { createHttpIdentityClient, identityQueryKeys } from "@/lib/identity";

const client = createHttpIdentityClient();
const users = await client.listUsers();
const assignment = await client.createServiceAssignment({
  subjectKind: "user",
  subjectId: users.items[0]!.id,
  serviceCapability: "workflow-engine",
});
```

## Service assignments

Metadata only — Projects, Support, Testing, Reporting, Documents, Search, Workflow, Workflow Engine, Notifications, Configuration, Administration. No provisioning.

## Diagnostics

`getHealth` / `getReadiness` / `getCapabilities` / `getManagementCapabilities` return metadata readiness flags (`authenticationManaged: false`, `provisioningEnabled: false`, etc.). No live IdP probes.

## Audit

```bash
pnpm openapi:validate:platform
pnpm audit:identity-http-client
```

## Next

Do not implement Identity Workbench until **APZIDENTITY-004** is approved.
