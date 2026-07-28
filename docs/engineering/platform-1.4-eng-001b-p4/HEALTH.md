# Health — Platform-1.4-ENG-001B-P4

## Runtime health

`getRuntimeHealth` returns structured diagnostics:

- durable flag enabled / selected
- worker enabled / running
- store kind (`postgresql_durable` | `memory_durable`)
- queue depth, processing count, retry scheduled, dead-letter count
- oldest queued / retry / dead-letter timestamps
- abandoned lease count
- status: healthy | degraded | unhealthy | disabled | unknown

## Diagnostics

`getAdminDiagnostics` adds lease/retry/DLQ/queue statistics and a processing-rate hint (admin counters — not a Prometheus redesign).

## HTTP

- `GET /api/v1/notifications/delivery-admin/health`
- `GET /api/v1/notifications/delivery-admin/diagnostics`

Works with durable flag **OFF**.
