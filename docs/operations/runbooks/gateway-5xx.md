# Runbook — API Gateway elevated 5xx

> **Service:** API Gateway (`gateway`) · **Owner:** Platform Engineering Lead · **Priority:** P1 · **Policy:** `alert.gateway.5xx`

## 1. Title / service / owner

APZHUB API Gateway / route handlers. Owner: Platform Engineering Lead.

## 2. Symptoms

Spike in HTTP 5xx; client API failures; readiness degraded; Workbench errors.

## 3. Severity guidance

**P1** if Tier A paths affected broadly; else **P2** if single product path.

## 4. Preconditions

- Read-only log/metrics access first.
- Do not expose raw backend/engine errors to users.
- No gateway business-logic redesign under incident.

## 5. Diagnosis steps

1. Check `/api/v1/health` and readiness.
2. Slice 5xx by route and `correlationId`.
3. Confirm Postgres/Redis/dependency health.
4. Identify last Change in release window.
5. Distinguish platform fault vs adapter/engine fault.

## 6. Containment

- Rate-limit or disable failing route if feature-flagged.
- Rollback last gateway-related deploy if clear regression.
- Keep Status communication brand-masked.

## 7. Resolution / rollback

- Fix or rollback failing handler/service.
- Restore dependency connectivity.
- Clear Incident when error rate normalises.

## 8. Verification

- 5xx rate back to baseline.
- Critical journeys (auth, home shell) pass.
- Correlation samples show resolved root cause.

## 9. Escalation

On-call → Platform Engineering Lead → Platform Ops Lead.

## 10. Related KL / ADRs

Document 010 gateway standards · Platform 1.1.0 · OPS-R-05.
