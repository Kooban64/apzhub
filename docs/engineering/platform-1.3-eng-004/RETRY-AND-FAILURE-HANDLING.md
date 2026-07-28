# Retry and Failure Handling

Failure classes per ADR-0071. Transient/rate_limit retry with exponential backoff + jitter. Bounded by `APZHUB_NOTIFICATION_MAX_ATTEMPTS`. Permanent failures terminate.
