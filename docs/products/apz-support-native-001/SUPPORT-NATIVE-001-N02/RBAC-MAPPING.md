# RBAC Mapping — APZ-SUPPORT-NATIVE-001-N02

| Field     | Value                      |
| --------- | -------------------------- |
| Slice     | APZ-SUPPORT-NATIVE-001-N02 |
| Status    | **COMPLETE**               |
| Timestamp | 20260805T043000Z           |

## Catalog

APZHUB registers Support permission keys (wildcard + granular) in:

- `packages/platform-authorization/src/authorization-seed.ts`
- `packages/platform-authorization/src/postgres-authorization-store.ts`

| Key (examples)              | UI use                                       |
| --------------------------- | -------------------------------------------- |
| `support.*`                 | Full Support product surface (tenant member) |
| `support.requests.*` family | Inbox / create / detail actions              |
| `support.articles.*` family | Conversation compose / list                  |
| `support.organizations.*`   | Organisation directory                       |
| `support.groups.*`          | Group directory                              |
| `support.users.list`        | Users directory                              |
| `support.search.execute`    | Search                                       |
| `support.analytics.read`    | Analytics                                    |

## Role grants (seed)

| Role           | Grant       |
| -------------- | ----------- |
| Platform Admin | `*`         |
| Tenant Member  | `support.*` |

## Mapping rules

- Platform permissions → Support UI helpers (`lib/support/permissions.ts`).
- Never expose backend/engine role names in UI.
- Never invent product-local roles.
