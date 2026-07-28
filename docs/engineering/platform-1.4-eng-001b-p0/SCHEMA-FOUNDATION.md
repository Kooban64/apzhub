# Schema Foundation — Migration 0066

## File

`packages/config/drizzle/0066_apz_platform_notification_delivery_leases.sql`

## Additive columns

### `platform_notification_delivery_record`

| Column             | Type             | Notes                |
| ------------------ | ---------------- | -------------------- |
| `claimed_by`       | text null        | Worker identity      |
| `claimed_at`       | timestamptz null | Claim start          |
| `lease_expires_at` | timestamptz null | Lease fencing        |
| `requeue_reason`   | text null        | Reclaim/admin reason |

### `platform_notification_delivery_try`

| Column               | Type      | Notes                             |
| -------------------- | --------- | --------------------------------- |
| `provider_reference` | text null | Future provider duplicate control |
| `worker_id`          | text null | Attempt worker attribution        |

## Indexes

- Partial `(status, lease_expires_at) WHERE status = 'processing'`
- `(tenant_id, status, next_attempt_at)` admin/queue filter
- Unique `(delivery_id, attempt_number)` on tries

## Constraints

- **No DROP** · **No column removal** · **No data migration**
- Journal also registers historical **0065** (was present as SQL file; missing from journal)

## Rollback

Application: leave columns in place; keep `APZHUB_NOTIFICATION_DURABLE_RUNTIME` OFF.  
Schema DROP requires a separate Owner-approved destructive programme (not authorised here).
