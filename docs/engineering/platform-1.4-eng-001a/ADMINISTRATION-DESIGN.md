# Administration Design

## Surfaces

| Capability           | Design                                                  |
| -------------------- | ------------------------------------------------------- |
| Queue inspection     | List deliveries by status/tenant/org; show lease fields |
| Lease browser        | `processing` rows with claim age / expiry               |
| Retry browser        | `retry_scheduled` sorted by `next_attempt_at`           |
| Dead-letter browser  | `permanent_failure` AND `dead_letter=true`              |
| Manual replay        | Create new delivery (STATE-MACHINE); audit              |
| Force retry now      | Set `next_attempt_at=now()` on retry_scheduled          |
| Cancel               | Transition to `cancelled` if allowed; release lease     |
| Worker diagnostics   | Last claim, in-flight, reclaim stats                    |
| Tenant/org filtering | Mandatory on all list APIs                              |

## Permissions

Reuse/extend notification delivery admin permissions via ProductionAuthorizationProvider (e.g. `notification.delivery.admin`, `notification.delivery.replay`). Deny-by-default.

## Audit

Every privileged action: actor, tenant, delivery ids, action, timestamp, correlation_id — durable audit event.

## Workbench

Optional admin views bound to APIs; no direct DB. No redesign of product Workbench beyond admin module surfaces if already present.
