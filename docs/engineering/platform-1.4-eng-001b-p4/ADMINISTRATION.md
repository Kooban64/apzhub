# Administration — Platform-1.4-ENG-001B-P4

Read-only administration for durable delivery records via `NotificationDeliveryAdminService`.

## Capabilities

| Surface      | Behaviour                                                                   |
| ------------ | --------------------------------------------------------------------------- |
| Deliveries   | Filter by status, search, pagination, sort; tenant + organisation isolation |
| Attempts     | List tries for a delivery after ownership check                             |
| Leases       | Processing-lease rows (`processingLeasesOnly`)                              |
| Retries      | `retry_scheduled` rows sorted by `nextAttemptAt`                            |
| Dead letters | `deadLetterOnly` listings                                                   |
| Audit        | List immutable admin audit rows                                             |

## Implementation

- Contracts: `packages/notification-contracts/src/delivery/admin.ts` (0.3.5)
- Service: `packages/platform-services/.../durable-delivery-admin-service.ts` (0.32.0)
- Store ports: `listDeliveriesAdmin` / `countDeliveriesAdmin` / audit append+list
- Persistence: in-memory + Postgres (`@apzhub/notification-delivery-persistence` 0.4.0)
- HTTP: `/api/v1/notifications/delivery-admin/*` (presentation only)

## Constraints

- No destructive list/delete APIs
- Safe summaries only (no raw provider/backend payloads beyond delivery records)
- Works when `APZHUB_NOTIFICATION_DURABLE_RUNTIME` is OFF
