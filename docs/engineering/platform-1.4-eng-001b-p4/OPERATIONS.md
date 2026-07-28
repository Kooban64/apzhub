# Operations — Platform-1.4-ENG-001B-P4

Secured administrative mutations for durable deliveries. Every operation validates permissions, tenant, organisation, state transitions, and writes immutable audit.

## Operations

| Operation             | Effect                                                                |
| --------------------- | --------------------------------------------------------------------- |
| Manual retry          | Eligible delivery → retry path (`retry_scheduled` / queued per rules) |
| Manual replay         | Creates a **new** delivery; source history unchanged                  |
| Cancel pending        | Pending → `cancelled` when transition allowed                         |
| Suppress pending      | `requested` → `suppressed` only                                       |
| Clear abandoned lease | Releases abandoned lease → requeue-eligible                           |
| Force lease expiry    | Forces lease expiry for recovery                                      |
| Requeue eligible      | Eligible row → `queued`                                               |

## HTTP (examples)

- `POST .../delivery-admin/deliveries/{id}/retry`
- `POST .../delivery-admin/deliveries/{id}/replay`
- `POST .../delivery-admin/deliveries/{id}/cancel`
- `POST .../delivery-admin/deliveries/{id}/suppress`
- `POST .../delivery-admin/deliveries/{id}/clear-lease`
- `POST .../delivery-admin/deliveries/{id}/force-lease-expiry`
- `POST .../delivery-admin/deliveries/{id}/requeue`

Optional JSON body: `{ "reason": "..." }`.

## Guarantees

- Invalid transitions rejected
- Permission failures → deny
- Tenant / organisation isolation enforced
- No mutation of terminal immutable history except via new replay delivery
