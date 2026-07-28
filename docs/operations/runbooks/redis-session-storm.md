# Runbook — Redis session storm / session store pressure

> **Service:** Redis (sessions) · **Owner:** Platform Ops Owner · **Priority:** P1 · **Policy:** `alert.redis.session-storm`

## 1. Title / service / owner

Platform Redis session store. Owner: Platform Ops Owner (Identity adjacency).

## 2. Symptoms

Login loops; session create failures; Redis unhealthy; connection storms.

## 3. Severity guidance

**P1** when sign-in broadly impacted; otherwise P2.

## 4. Preconditions

- Redis is ephemeral for sessions — data loss may force re-auth.
- Do not store secrets in Redis dumps shared in tickets.
- Host coexistence: check port/resource contention.

## 5. Diagnosis steps

1. Redis health / memory / connected clients.
2. Correlate with Identity errors via `correlationId`.
3. Check for runaway clients or misconfigured retries.
4. Review recent deploy/config Changes.

## 6. Containment

- Shed load / restart Redis only with Change awareness.
- Temporarily reduce aggressive client retries if configurable.
- Communicate re-login expectation.

## 7. Resolution / rollback

- Restore Redis health; rebuild sessions via AuthN.
- Rollback bad config.
- Confirm Identity path stable.

## 8. Verification

- Sign-in + session persistence works.
- Redis health green for 15 minutes.
- Error rates normalised.

## 9. Escalation

On-call → Platform Ops Owner → Identity Service Owner.

## 10. Related KL / ADRs

BACKUP honesty (sessions ephemeral) · ENVIRONMENT.md · OPS-R-01/05.
