# Runbook — Time adapter unhealthy

> **Service:** Time (`time`) · **Owner:** Time Product Owner · **Priority:** P2 · **Policy:** `alert.time.adapter-unhealthy`

## 1. Title / service / owner

Time Platform Services + certified time adapter. Owner: Time Product Owner.

## 2. Symptoms

Time API errors; timesheets not loading; 503 on `/api/v1/time/*`; health/diagnostics unhealthy.

## 3. Severity guidance

**P2** Tier B product path. Elevate to P1 only if multi-product or security impact.

## 4. Preconditions

- Mask engine brand in user communications.
- Approvals / reporting UI / analytics remain out of scope (PRWL).
- No Time 2.0 scope under this runbook.

## 5. Diagnosis steps

1. Platform Time health + readiness (`/api/v1/time/health`, `/readiness`).
2. Flags: `APZHUB_TIME_ENABLED`, `KIMAI_INTEGRATION_ENABLED`, `APZHUB_TIME_DOMAIN_MODE`.
3. Confirm production is not using `APZHUB_TIME_DOMAIN_MODE=in_memory` (forbidden).
4. Correlate failing requests by `correlationId`.

## 6. Containment

- Fail closed: unavailable adapter → 503 / honest user messaging.
- Freeze Time connector Changes.
- Do not enable in-memory domain in production.

## 7. Resolution / rollback

- Restore adapter connectivity / config / credentials refs.
- Rollback last Time change if regression.
- Re-validate Overview → Timesheets → create path.

## 8. Verification

- Timesheets load for permissioned users.
- No elevated 5xx on Time routes.
- Health green for operators.

## 9. Escalation

Time Product Owner → Platform Ops Lead.

## 10. Related

APZ Time Known Limitations · Delivery Standard evidence TIME-PR-01 / TIME-PR-06.
