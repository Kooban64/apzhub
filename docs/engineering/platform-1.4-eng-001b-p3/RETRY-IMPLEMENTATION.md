# Retry Implementation

- Eligibility: transient class AND `attemptNumber < maxAttempts`
- Backoff: exponential from `APZHUB_NOTIFICATION_RETRY_BASE_DELAY` (default 1000ms), cap 60s, jitter
- Persistence: `completeDeliveryRetry` clears lease, sets `next_attempt_at`
- Reclaim/claim makes due retries eligible (`retry_scheduled` with `next_attempt_at <= now`)
- Not process-memory dependent
