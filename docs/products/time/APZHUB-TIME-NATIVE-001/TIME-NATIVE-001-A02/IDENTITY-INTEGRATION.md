# Identity Integration — TIME-NATIVE-001-A02

| Field     | Value               |
| --------- | ------------------- |
| Slice     | TIME-NATIVE-001-A02 |
| Status    | **COMPLETE**        |
| Timestamp | 20260804T194500Z    |

## Model

| Concern        | Owner                                                 |
| -------------- | ----------------------------------------------------- |
| Authentication | APZHUB Identity (Better Auth session)                 |
| Session        | APZHUB only — hydrated server-side in platform layout |
| Authorisation  | APZHUB PermissionService / platform-authorization     |
| Product UI     | APZ Time consumes grants — never owns identity        |
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
useTimePermissions() → Time UI controls
```

## Rules enforced

1. No second login
2. No engine identities exposed
3. No engine roles exposed
4. No engine permissions exposed
5. APZ Time consumes platform identity

## Code anchors

- `apps/web/app/(platform)/layout.tsx` — hydrates auth context
- `apps/web/components/session-authorization-provider.tsx`
- `apps/web/lib/time/use-time-permissions.ts`
- `apps/web/components/time/time-workspace-router.tsx`
