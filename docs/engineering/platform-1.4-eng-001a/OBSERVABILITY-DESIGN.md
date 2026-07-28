# Observability Design

## Metrics (Prometheus-style names illustrative)

| Metric                                               | Labels            |
| ---------------------------------------------------- | ----------------- |
| `notification_delivery_intents_total`                | tenant?, result   |
| `notification_delivery_claimed_total`                | worker_id         |
| `notification_delivery_delivered_total`              | channel, provider |
| `notification_delivery_retry_total`                  | failure_class     |
| `notification_delivery_dead_letter_total`            | failure_class     |
| `notification_delivery_queue_depth`                  | status            |
| `notification_delivery_lease_age_seconds`            | —                 |
| `notification_delivery_claim_latency_seconds`        | —                 |
| `notification_delivery_dispatch_latency_seconds`     | provider          |
| `notification_delivery_worker_in_flight`             | worker_id         |
| `notification_delivery_stale_leases_reclaimed_total` | —                 |
| `notification_delivery_idempotency_dedupe_total`     | kind              |

## Health / readiness

- Liveness: process up
- Readiness: DB ping + (worker) claiming enabled flag loaded
- Delivery health endpoint: extend ENG-004 diagnostics with durable queue depths from SQL

## Logging

Structured JSON: correlation_id, tenant_id, delivery_id, worker_id, attempt_number. Redact payload/PII.

## Diagnostics API

Extend existing diagnostics to include: queue depth by status, oldest eligible age, stale processing count, worker heartbeats (last claim time per worker_id).

## Alerts (ops)

- Queue depth > threshold
- Lease reclaim rate spike
- Dead-letter rate spike
- Worker heartbeat missing
- Dispatch failure ratio

## Dashboards

Single Notification Delivery dashboard: intake, depth, success, retry, DLQ, workers, DB.

## Tracing

Optional spans: claim, dispatch, complete — if platform OTel present; not a blocker.
