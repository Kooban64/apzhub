# Identity Integration — APZ-WORKFLOW-NATIVE-001-N02

| Field     | Value                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------- |
| Slice     | APZ-WORKFLOW-NATIVE-001-N02                                                                    |
| Status    | **COMPLETE**                                                                                   |
| Timestamp | 20260805T164500Z                                                                               |
| Board     | [../PRODUCT-BOARD-BUSINESS-PROCESS-LANGUAGE.md](../PRODUCT-BOARD-BUSINESS-PROCESS-LANGUAGE.md) |

## Model

| Concern        | Owner                                                 |
| -------------- | ----------------------------------------------------- |
| Authentication | APZHUB Identity (Better Auth session)                 |
| Session        | APZHUB only — hydrated server-side in platform layout |
| Authorisation  | APZHUB PermissionService / platform-authorization     |
| Product UI     | APZ Workflow consumes grants — never owns identity    |
| Engine         | Below product boundary — operator identity only       |

## Flow

```text
Validated APZHUB session
        ↓
resolveSessionAuthorization (platform-authorization)
        ↓
SessionAuthorizationProvider + WorkbenchProvider
        ↓
useWorkflowPermissions() → Workflow / Workflows / Engine routers
```

## Rules enforced

1. No second login
2. No engine identities exposed as product identity
3. No engine roles exposed
4. Default identity uses **business-process** grants only
5. Execution / engine surfaces require `workflow.admin` (or explicit engine/run/schedule grants)
6. Identity decisions reinforce: users design business processes; platform determines execution

## Code anchors

- `apps/web/lib/workflow/use-workflow-permissions.ts`
- `apps/web/lib/workflow/permissions.ts`
- `apps/web/components/workflow/workflow-workspace-router.tsx`
- `apps/web/components/workflows/workflows-workspace-router.tsx`
- `apps/web/components/workflow-engine/workflow-engine-workspace-router.tsx`
