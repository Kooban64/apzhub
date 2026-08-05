# Identity Integration — APZ-DOCUMENTS-NATIVE-001-N02

| Field     | Value                                                                                    |
| --------- | ---------------------------------------------------------------------------------------- |
| Slice     | APZ-DOCUMENTS-NATIVE-001-N02                                                             |
| Status    | **COMPLETE**                                                                             |
| Timestamp | 20260805T142500Z                                                                         |
| Board     | [../PRODUCT-BOARD-WORK-CONTEXT-PRINCIPLE.md](../PRODUCT-BOARD-WORK-CONTEXT-PRINCIPLE.md) |

## Model

| Concern        | Owner                                                 |
| -------------- | ----------------------------------------------------- |
| Authentication | APZHUB Identity (Better Auth session)                 |
| Session        | APZHUB only — hydrated server-side in platform layout |
| Authorisation  | APZHUB PermissionService / platform-authorization     |
| Product UI     | APZ Documents consumes grants — never owns identity   |
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
useDocumentsPermissions() → Documents UI controls
```

## Rules enforced

1. No second login
2. No engine identities exposed
3. No engine roles exposed
4. No engine permissions exposed
5. APZ Documents consumes platform identity
6. Identity decisions reinforce work-first (Documents supports work; work is not organised for Documents)

## Code anchors

- `apps/web/lib/documents/use-documents-permissions.ts`
- `apps/web/lib/documents/permissions.ts`
- `apps/web/components/documents/documents-workspace-router.tsx`
