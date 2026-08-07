# Identity Integration — APZ-LAW-NATIVE-001-N02

| Field     | Value                                                                                |
| --------- | ------------------------------------------------------------------------------------ |
| Slice     | APZ-LAW-NATIVE-001-N02                                                               |
| Status    | **COMPLETE**                                                                         |
| Timestamp | 20260805T192000Z                                                                     |
| Board     | [../PRODUCT-BOARD-GOVERNANCE-COMPANION.md](../PRODUCT-BOARD-GOVERNANCE-COMPANION.md) |

## Model

| Concern        | Owner                                                        |
| -------------- | ------------------------------------------------------------ |
| Authentication | APZHUB Identity (Better Auth session)                        |
| Session        | APZHUB only — hydrated in Law Platform layout                |
| Authorisation  | APZHUB PermissionService / platform-authorization            |
| Product UI     | APZ Law consumes grants — never owns identity                |
| Practice ops   | Below product boundary — `law.admin` / Law Practice Operator |

## Critical fix

Tenant Member **no longer inherits** Law Practice Operator (`legal.*` / `trust.*`). That inheritance previously collapsed governance identity for every member.

## Flow

```text
Validated APZHUB session
        ↓
resolveSessionAuthorization (productKey: law-platform)
        ↓
Workbench / Action registry permission filter
        ↓
Activity Bar: APZ Law (law.view)
Practice sidebar: law.admin
```

## Rules enforced

1. No second login
2. No practice identity as default product identity
3. Default identity uses **governance-entry** grant (`law.view`)
4. Practice surfaces require `law.admin` (or Law Practice Operator wildcards)
5. Identity reinforces: governance supporting work — not a practice management system

## Code anchors

- `apps/law-platform/lib/law/permissions.ts`
- `apps/law-platform/lib/session-permission-context.ts`
- `apps/law-platform/lib/workbench-hydration.ts`
- `packages/platform-authorization/src/authorization-seed.ts`
- `packages/platform-authorization/src/postgres-authorization-store.ts`
- `services/legal-platform/manifests/*/module.yaml`
