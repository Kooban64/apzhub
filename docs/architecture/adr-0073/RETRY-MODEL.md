# Retry Model

## Eligibility

Transient failure classes (`isTransientFailureClass`) → `retry_scheduled` if `attempt_count < max_attempts`.  
Permanent classes → `permanent_failure` (+ dead-letter as policy).

## Schedule

Platform policy owns backoff principles (exponential with jitter as Phase A). Exact production constants are configuration — not hard-coded by ADR.

## Controls

- Automated retry by worker when `next_attempt_at <= now`
- Manual retry / replay is privileged admin action (see Administration)
- Retry cancellation → `cancelled`
- Provider-specific hints may inform classification but **platform policy remains authoritative**

## Audit

Every retry schedule and manual replay emits audit/domain events after durable write.
