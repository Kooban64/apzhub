# Runbook — Identity unavailable

> **Service:** Identity / AuthN (`identity`) · **Owner:** Identity Service Owner · **Priority:** P1 · **Policy:** `alert.identity.unavailable`

## 1. Title / service / owner

Identity / BetterAuth sign-in path. Owner: Identity Service Owner.

## 2. Symptoms

User sign-in failures; session create errors; identity health red; Workbench redirect loops.

## 3. Severity guidance

**P1** — Tier A. Page on-call; declare Incident if widespread.

## 4. Preconditions

- Access to health endpoints and structured logs (no secrets in chat).
- Observe plane is metadata-only — do not expect automated pages from Observe.
- Architecture freeze: do not redesign Identity.

## 5. Diagnosis steps

1. Check platform health / identity readiness.
2. Confirm PostgreSQL and Redis health (session deps).
3. Inspect recent Identity-related errors with `correlationId`.
4. Verify BetterAuth env present without printing secret values.
5. Confirm host coexistence did not bind conflicting ports ([ENVIRONMENT.md](../../../ENVIRONMENT.md)).

## 6. Containment

- Freeze Identity config Changes.
- If credential suspicion: rotate and invalidate sessions per SECURITY-OPERATIONS.
- Communicate outage without engine/vendor detail.

## 7. Resolution / rollback

- Restore healthy Identity config/deployment.
- Rollback last Identity Change if correlated.
- Re-enable traffic after verification.

## 8. Verification

- Sign-in succeeds for test user.
- Identity health green.
- No elevated session errors for 15 minutes.

## 9. Escalation

On-call → Identity Service Owner → Platform Ops Lead → Owner (security path if needed).

## 10. Related KL / ADRs

Platform 1.1.0 PRWL · Zero Trust (013) · Identity docs · OPS-R-05 alert posture.
