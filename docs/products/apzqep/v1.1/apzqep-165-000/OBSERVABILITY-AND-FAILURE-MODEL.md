# OBSERVABILITY-AND-FAILURE-MODEL — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Four pillars

Metrics, logs, traces, health — correlated by correlation IDs (014).

## Metrics (architecture)

- Flow starts / completions / failures / cancels / timeouts
- Step latency by capability
- Gate fail counts by gateId
- Approval latency / expiry rate
- Waiver rate
- DLQ depth / replay counts
- Trigger ignore rate

## Logs & traces

Structured logs on every transition. Trace spans: trigger → flow → steps → gates → approval → decision.

## Health hierarchy

Platform → orchestration service → capability dependencies → processing/outbox → infrastructure.

Orchestration **self-reports**; degraded peer capabilities surface as dependency health, not silent success.

## Latency / async

- API responds after validation + run acceptance
- Long work is async (012)
- Operator SLAs (targets for engineering/ops): approval notify near-real-time; step progress visible within processing latency budgets — exact numbers in 165R

## Failure / DLQ / replay

| Failure                       | Posture                                             |
| ----------------------------- | --------------------------------------------------- |
| Transient capability error    | Retry/backoff per policy                            |
| Permanent capability error    | Fail step / flow; alert                             |
| Poison message                | DLQ with replay tooling (reuse processing platform) |
| Approval expiry               | Flow policy: fail / escalate / re-request           |
| Partial parallel step failure | Join policy: fail-all or continue-with-degrade      |

Replay is permissioned and audited. Idempotent subscribers mandatory.
