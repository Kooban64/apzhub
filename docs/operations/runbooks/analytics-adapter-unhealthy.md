# Runbook — Analytics adapter unhealthy

> **Service:** Analytics (`analytics`) · **Owner:** Analytics Product Owner · **Priority:** P2 · **Policy:** `alert.analytics.adapter-unhealthy`

## 1. Title / service / owner

Analytics Platform Service + Metabase CE adapter. Owner: Analytics Product Owner.

## 2. Symptoms

Analytics API errors; adapter health red; Decision Companion questions/insights not loading.

## 3. Severity guidance

**P2** Tier B product path. Elevate to P1 only if multi-product or security impact.

## 4. Preconditions

- Mask engine brand (Metabase) in user communications.
- Live embed and AI analytics are not product features in v1.0 — do not claim them.
- No Analytics 2.0 scope under this runbook.

## 5. Diagnosis steps

1. Platform health/readiness + `APZHUB_ANALYTICS_ENABLED` / `METABASE_INTEGRATION_ENABLED`.
2. Analytics HTTP health (`/api/v1/analytics/health`) for operators with `analytics.admin`.
3. Engine connectivity (without exposing credentials).
4. Correlate failing requests by `correlationId`.

## 6. Containment

- Fail closed: unavailable adapter → 503 / honest user messaging (never empty success).
- Decision intelligence must not silently fall back to memory in production.
- Freeze Analytics connector Changes.

## 7. Resolution / rollback

- Restore adapter connectivity / config.
- Rollback last Analytics change if regression.
- Re-validate Home → Questions → Insight path.

## 8. Verification

- Decision Companion loads questions/insights.
- Adapter health green.
- No elevated 5xx on Analytics routes.

## 9. Escalation

Analytics Product Owner → Platform Ops Lead.

## 10. Related KL / ADRs

APZ Analytics Known Limitations · Integration boundary (008) · Delivery Standard closeout evidence ANA-PR-01 / ANA-PR-06.
