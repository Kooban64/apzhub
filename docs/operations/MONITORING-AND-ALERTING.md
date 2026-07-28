# APZHUB Monitoring and Alerting Strategy

> **Programme:** APZHUB-OPERATIONS-001 · deepened by **APZHUB-1.2-003** (R12-OPS-02)  
> **Date:** 2026-07-20  
> **Authority:** Document **014** · Observe PRWL (metadata SoR; live providers limited)  
> **STOP:** No monitoring-stack redesign · No Email SoR · No alert delivery engine under this programme.

---

## Four pillars (target ops model)

| Pillar  | Platform expectation                                                                      |
| ------- | ----------------------------------------------------------------------------------------- |
| Metrics | Service/connector self-report; Prometheus-class tooling behind connectors when authorised |
| Logs    | Structured logs with correlation IDs                                                      |
| Traces  | Gateway → service → adapter spans where instrumented                                      |
| Health  | Hierarchy: platform → workspace → module → service → connector → engine → infra           |

## Alert strategy (authoritative ops catalogue)

Executable policy catalogue: `@apzhub/platform-operations` → `PLATFORM_ALERT_POLICIES` (R12-OPS-02).

| Priority | Condition                                            | Response                | Delivery posture  |
| -------- | ---------------------------------------------------- | ----------------------- | ----------------- |
| P1       | Tier A health red / identity-gateway-db-redis impact | On-call + Incident      | **Manual triage** |
| P2       | Tier B product path / Observe SoR unavailable        | Service Owner + on-call | **Manual triage** |
| P3       | Elevated error rates / latency                       | Service Owner           | Manual triage     |
| Info     | Automation deferred / fail-soft flood                | Ops review              | Manual triage     |

### Ownership & escalation

Every P1/P2 policy in the catalogue defines: `ownerRole`, `escalation`, `runbookPath`, `opsKey`, and `correlationRequired`.

Audit:

```bash
pnpm ops:alert-strategy-audit
```

### Noise / fatigue controls (OPS-R-05)

1. Prefer health + error-rate thresholds over chatty INFO.
2. Automation deferred floods are **INFO** — do not page.
3. Observe unavailable is P2 visibility — not automatic paging engine.
4. Deduplicate by service + symptom window during Incident.
5. No Email/SMS/push delivery from Observe metadata plane.

### Correlation

All request-scoped alerts should carry or link `correlationId` (Documents **010**, **014**).

## Runbook depth

Minimum Production runbooks: [runbooks/README.md](./runbooks/README.md)  
Standards: [RUNBOOK-STANDARDS.md](./RUNBOOK-STANDARDS.md)

## Honest current state

- Observability **metadata** SoR exists (APZOBSERVE-*); live Grafana/Prometheus/Loki **product integration is limited/frozen**.
- Host may already run Grafana in legacy stack ([ENVIRONMENT.md](../../ENVIRONMENT.md)) — infrastructure, not APZHUB product UI.
- Implementation of live evaluation/delivery requires a **separate Owner-approved programme** (not R12-OPS-02).

## Evidence

[evidence/alert-strategy/](./evidence/alert-strategy/README.md)
