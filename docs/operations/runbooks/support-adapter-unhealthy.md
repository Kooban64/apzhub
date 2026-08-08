# Runbook — Support adapter unhealthy

> **Service:** Support (`support`) · **Owner:** Support Product Owner · **Priority:** P2 · **Policy:** `alert.support.adapter-unhealthy`

## 1. Title / service / owner

Support Platform Service + Zammad CE adapter. Owner: Support Product Owner.

## 2. Symptoms

Support API errors; adapter health red; tickets not loading in Workbench.

## 3. Severity guidance

**P2** Tier B product path. Elevate to P1 only if multi-product or security impact.

## 4. Preconditions

- Mask engine brand in user communications.
- Webhook/realtime may be limited (PRWL) — do not claim unsupported features.
- No Support 2.0 scope under this runbook.

## 5. Diagnosis steps

1. Support service health + adapter health.
2. Engine connectivity (without exposing credentials).
3. Recent Support/connector Changes.
4. Correlate failing requests by `correlationId`.

## 6. Containment

- Disable failing Support UI entry points if feature-flagged.
- Fail closed: unavailable adapter → 503 / honest user messaging (never empty success).
- Freeze Support connector Changes.
- Confirm readiness: production + Zammad enabled must show providers registered.

## 7. Resolution / rollback

- Restore adapter connectivity / config.
- Rollback last Support change if regression.
- Re-validate ticket list/detail paths.

## 8. Verification

- Support Workbench loads tickets.
- Adapter health green.
- No elevated 5xx on Support routes.

## 9. Escalation

Support Product Owner → Platform Ops Lead.

## 10. Related KL / ADRs

Support Known Limitations · Platform 1.1.0 · Integration boundary (008).
