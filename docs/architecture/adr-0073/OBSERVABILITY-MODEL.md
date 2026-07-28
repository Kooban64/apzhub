# Observability Model

## Metrics (minimum)

intake · delivery throughput · queue depth · claim age · retry count · dead-letter count · success/failure rates · provider latency · worker utilisation · stale claims · idempotency dedupe count · duplicate indicators

## Logs

Structured JSON; redact PII/contact payloads; correlation IDs end-to-end.

## Health / readiness

DB reachable · worker heartbeats/leases progressing · deny-by-default flags reflected.

## Traces

Optional where platform tracing exists; not mandatory to invent new stack.
