# Observability — Platform-1.4-ENG-001B-P4

## Approach

Expose admin metrics through existing Platform Service / HTTP surfaces. **No observability redesign.** No new broker. No new dashboard product.

## Metrics (`getAdminMetrics`)

| Metric                       | Meaning                             |
| ---------------------------- | ----------------------------------- |
| claimed_deliveries_total     | Claim counter (admin process scope) |
| completed_deliveries_total   | Completions observed                |
| failed_deliveries_total      | Failures observed                   |
| retry_count_total            | Retries (incl. manual)              |
| dead_letter_count_total      | DLQ (counter + store count)         |
| lease_conflicts_total        | Lease conflict rejections           |
| stale_worker_rejection_total | Stale worker fencing                |
| claim_latency_ms_last        | Last claim latency                  |
| dispatch_latency_ms_last     | Last dispatch latency               |
| retry_latency_ms_last        | Last retry latency                  |
| worker_uptime_ms             | Worker uptime when known            |
| queue_depth                  | Current queued depth                |
| admin_operations_total       | Manual admin ops                    |

## HTTP

`GET /api/v1/notifications/delivery-admin/metrics`
