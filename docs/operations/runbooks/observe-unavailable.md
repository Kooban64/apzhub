# Runbook — Observe metadata plane unavailable

> **Service:** Observability SoR (`observe`) · **Owner:** Observability Owner · **Priority:** P2 · **Policy:** `alert.observe.unavailable`

## 1. Title / service / owner

Platform Observability metadata SoR (alert definitions/states, Observe HTTP/Workbench). Owner: Observability Owner.

## 2. Symptoms

Observe HTTP/Workbench errors; alert definition/state SoR unavailable; Administration Observability views failing.

## 3. Severity guidance

**P2** — ops visibility degraded. Not automatically P1 unless coupled with Tier A outage.

## 4. Preconditions

- Observe is **metadata SoR** — no live telemetry evaluation, AlertManager, or notification delivery.
- Architecture freeze: do not redesign Observe under incident.
- Do **not** implement Email SoR / delivery providers here.

## 5. Diagnosis steps

1. Check Observe HTTP health (`/api/v1/observe/*`) and Workbench `/workspace/observability`.
2. Confirm Postgres persistence for observe tables.
3. AuthZ denials vs service errors.
4. Review recent Observe/config Changes.
5. Confirm operators are not expecting live Grafana-in-product alerts.

## 6. Containment

- Use host/legacy Grafana only as infrastructure (not APZHUB product UI) if already present.
- Manual triage via health hierarchy and logs.
- Freeze Observe schema/API Changes.

## 7. Resolution / rollback

- Restore Observe service/DB connectivity.
- Rollback regressing Observe deploy.
- Keep delivery posture manual.

## 8. Verification

- Alert definitions/states readable.
- Observability Workbench loads.
- No claim of live paging restored (still unsupported).

## 9. Escalation

Observability Owner → Platform Ops Lead.

## 10. Related KL / ADRs

APZOBSERVE-006 freeze · APZHUB-Observability-Alerts-Model · OPS-R-05 · MONITORING-AND-ALERTING.
