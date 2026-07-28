# Capacity Assessment

Shared-host: in-process worker, bounded queue (`MAX_QUEUE_DEPTH`), SSE fan-out via existing realtime limits. **No production capacity certification claimed.** Honest limit: process-local store until PostgreSQL wiring of migration 0065 is operationally enabled in deployment.
