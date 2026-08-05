# Identity Integration — APZ-SUPPORT-NATIVE-001-N02

| Field     | Value                      |
| --------- | -------------------------- |
| Slice     | APZ-SUPPORT-NATIVE-001-N02 |
| Status    | **COMPLETE**               |
| Timestamp | 20260805T043000Z           |

## Model

| Concern        | Owner                                                 |
| -------------- | ----------------------------------------------------- |
| Authentication | APZHUB Identity (Better Auth session)                 |
| Session        | APZHUB only — hydrated server-side in platform layout |
| Authorisation  | APZHUB PermissionService / platform-authorization     |
| Product UI     | APZ Support consumes grants — never owns identity     |
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
useSupportPermissions() → Support UI controls
```

## Rules enforced

1. No second login
2. No engine identities exposed
3. No engine roles exposed
4. No engine permissions exposed
5. APZ Support consumes platform identity

## Code anchors

- `apps/web/app/(platform)/layout.tsx` — hydrates auth context
- `apps/web/components/session-authorization-provider.tsx`
- `apps/web/lib/support/use-support-permissions.ts`
- `apps/web/components/support/support-workspace-router.tsx`
