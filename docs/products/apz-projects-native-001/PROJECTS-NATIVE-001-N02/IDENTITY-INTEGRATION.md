# Identity Integration — APZ-PROJECTS-NATIVE-001-N02

| Field     | Value                       |
| --------- | --------------------------- |
| Slice     | APZ-PROJECTS-NATIVE-001-N02 |
| Status    | **COMPLETE**                |
| Timestamp | 20260805T071500Z            |

## Model

| Concern        | Owner                                                 |
| -------------- | ----------------------------------------------------- |
| Authentication | APZHUB Identity (Better Auth session)                 |
| Session        | APZHUB only — hydrated server-side in platform layout |
| Authorisation  | APZHUB PermissionService / platform-authorization     |
| Product UI     | APZ Projects consumes grants — never owns identity    |
| Engine         | Adapter-internal only — never user-visible            |

## Flow

```text
Validated APZHUB session
        ↓
resolveSessionAuthorization (platform-authorization)
        ↓
AuthSessionPermissionInput
        ↓
SessionAuthorizationProvider + WorkbenchProvider(authPermissionContext)
        ↓
useProjectsPermissions() → Projects UI controls
```

## Rules enforced

1. No second login
2. No engine identities exposed
3. No engine roles exposed
4. No engine permissions exposed
5. APZ Projects consumes platform identity

## Code anchors

- `apps/web/app/(platform)/layout.tsx` — hydrates auth context
- `apps/web/components/session-authorization-provider.tsx`
- `apps/web/lib/projects/use-projects-permissions.ts`
- `apps/web/components/projects/projects-workspace-router.tsx`
