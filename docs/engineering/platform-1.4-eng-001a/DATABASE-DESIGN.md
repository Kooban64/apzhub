# Database Design

## Logical entity diagram

```
platform_notification_intent (1)
        │
        │ 1:N
        ▼
platform_notification_delivery_record (N)
        │
        ├── 1:N → platform_notification_delivery_try
        └── 0..1 → platform_notification_in_app_item
```

## Existing tables (0065) — retain

### `platform_notification_intent`

PK `id` · `tenant_id` · `organisation_id?` · source fields · `idempotency_key` · `status` · timestamps  
**Unique:** `(tenant_id, idempotency_key)`

### `platform_notification_delivery_record`

PK `id` · `intent_id` · `tenant_id` · `organisation_id?` · `user_id` · `channel` · `provider_id` · `status` · `receipt_level` · `idempotency_key` · `correlation_id` · `attempt_count` · `max_attempts` · `next_attempt_at` · failure fields · `in_app_notification_id?` · `terminal_at?` · `dead_letter` · timestamps  
**Unique:** `(tenant_id, idempotency_key)`  
**Index:** `(status, next_attempt_at)` queue

### `platform_notification_delivery_try`

PK `id` · `delivery_id` · `attempt_number` · `provider_id` · `started_at` · `finished_at?` · `receipt_level` · failure fields · `note?`

### `platform_notification_in_app_item`

PK `id` · links to delivery/intent · user/tenant · content · `read_at?`

## Additive migration **0066** (design only — no SQL in ENG-001A)

Logical name: `0066_apz_platform_notification_delivery_leases.sql`

### Columns on `platform_notification_delivery_record`

| Column             | Type (logical)   | Purpose                       |
| ------------------ | ---------------- | ----------------------------- |
| `claimed_by`       | text null        | Worker identity               |
| `claimed_at`       | timestamptz null | Claim start                   |
| `lease_expires_at` | timestamptz null | Lease fencing                 |
| `requeue_reason`   | text null        | Optional reclaim/admin reason |

### Columns on `platform_notification_delivery_try`

| Column               | Type (logical) | Purpose                                      |
| -------------------- | -------------- | -------------------------------------------- |
| `provider_reference` | text null      | Future external provider / duplicate control |
| `worker_id`          | text null      | Which worker performed attempt               |

### Indexes (additive)

- `(status, lease_expires_at)` WHERE status = `processing` — reclaim scans
- Optional `(tenant_id, status, next_attempt_at)` for admin filters
- Unique `(delivery_id, attempt_number)` if not already enforced

### Constraints

- Retain existing PKs/uniques
- No destructive drops
- FK from try→delivery and delivery→intent recommended if not present (additive only; ENG-001B evaluates existing 0065 FK absence — currently no FK in 0065; **do not add blocking FKs that break Phase A data** without migration plan; prefer soft referential integrity in service if historical rows exist)

## Migration order

1. Ensure **0065** applied in target env
2. Apply **0066** additive columns/indexes
3. Deploy code that can read null leases
4. Enable durable claim flag
5. Never reorder 0065/0066

## Rollback approach (schema)

Additive columns remain; code flag reverts to prior behaviour only if ENG-001B retains Phase A path behind flag during rollout window. No DROP in rollback of 0066 without separate Owner-approved destructive programme (not authorised).
