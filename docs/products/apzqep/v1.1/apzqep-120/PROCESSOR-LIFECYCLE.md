# Processor Lifecycle — APZQEP-120-S10

## Processor responsibilities

1. Receive event (`ProcessingContext`)
2. Validate event (catalogue + payload)
3. Execute business action (`EvidenceBusinessActionPort`)
4. Return `ProcessingResult` (success / retry / terminal)

## Processor MUST NOT

- Manage retries, leases, reservations, or acknowledgements
- Contain platform delivery / outbox logic
- Hard-code routing for other products

## Engine responsibilities (unchanged)

Reserve → Lease → Execute → Ack / Retry / Dead Letter → Metrics
