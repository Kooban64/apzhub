# Runbook — Automation deferred / fail-soft flood

> **Service:** Automation Foundation (`automation`) · **Owner:** Portfolio Automation Owner · **Priority:** INFO · **Policy:** `alert.automation.deferred-flood`

## 1. Title / service / owner

Cross-product Automation Foundation (registration/intents). Owner: Portfolio Automation Owner.

## 2. Symptoms

High deferred intent counts; fail-soft automation noise; ops dashboard INFO flood.

## 3. Severity guidance

**INFO** by default. Escalate to P2 only if customer-facing workflow expectations break — still **not** Execute unlock.

## 4. Preconditions

- Automation Foundation ≠ Workflow Execute.
- Do not “fix” by unlocking n8n execute.
- Journal may not be Postgres SoR yet (PRWL).

## 5. Diagnosis steps

1. Inspect deferred/fail-soft counters.
2. Identify noisy intent sources.
3. Confirm operators are not misreading as execute failures.
4. Check recent AU-* registration Changes.

## 6. Containment

- Suppress noisy informational alerts manually.
- Pause registering new intents if flooding.
- Clarify customer expectations (no GA execute).

## 7. Resolution / rollback

- Tune registration/noise.
- Document deferred backlog for future programmes (AUTO-01 / PERSIST-01).
- Rollback bad intent registration if needed.

## 8. Verification

- Deferred flood rate declines.
- No mistaken Execute marketing/support claims.

## 9. Escalation

Portfolio Automation Owner → Platform Ops Lead (if customer impact).

## 10. Related KL / ADRs

APZHUB-1.1-004 · PL11-KL-05/06 · OPS-R-09.
