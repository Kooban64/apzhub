# Audit — Platform-1.4-ENG-001B-P4

## Immutable admin audit

Every manual operation appends a durable audit row (migration **0067** — `platform_notification_delivery_admin_audit`).

## Fields

| Field        | Content                                                   |
| ------------ | --------------------------------------------------------- |
| who          | `actorUserId`                                             |
| when         | `createdAt`                                               |
| tenant       | `tenantId`                                                |
| organisation | `organisationId`                                          |
| operation    | e.g. `manual_retry`, `manual_replay`, `cancel_pending`, … |
| delivery id  | `deliveryId`                                              |
| reason       | optional operator reason                                  |
| result       | `success` \| `denied` \| `failed` \| `rejected`           |
| correlation  | `correlationId`                                           |

## Guarantees

- Append-only via store port (`appendAdminAudit` / `listAdminAudits`)
- No update/delete APIs in Phase 4
- Listed under admin permission after tenant isolation
