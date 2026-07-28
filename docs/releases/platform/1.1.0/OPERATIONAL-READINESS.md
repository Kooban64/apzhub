# APZHUB Platform 1.1.0 — Operational Readiness

> **Programme:** APZHUB-1.1-006  
> **Date:** 2026-07-20  
> **Supplements:** [Platform 1.0.0 OPERATIONAL-READINESS](../1.0.0/OPERATIONAL-READINESS.md) · programme ops notes for 1.1-003/004

---

## Operate 1.1.0 enhancements

| Capability                           | Operator expectation                                             | Evidence                             |
| ------------------------------------ | ---------------------------------------------------------------- | ------------------------------------ |
| Law AuthZ (OBS-LAW-01)               | Law shell/API use session AuthZ; no allow-all grants             | APZHUB-1.1-001                       |
| Law session persistence (OBS-LAW-02) | Activity/notification UX survives reload (browser-scoped stores) | APZHUB-1.1-002 · product Law ops     |
| Support Event Bus publish            | Mutations publish catalogue events (fail-soft)                   | APZHUB-1.1-003 OPERATIONAL-READINESS |
| Support in-app Attention             | ENF Attention path for Support events                            | APZHUB-1.1-003                       |
| Automation Foundation                | Event Bus → journal/handlers; workflow.trigger deferred          | APZHUB-1.1-004 OPERATIONAL-READINESS |

## Unchanged operational planes (1.0 held)

Identity · Gateway · Search · Documents · Analytics (metadata) · Workflow (metadata / execute gated) · APZNOTIFY delivery freeze · Integration adapters · Host coexistence ([ENVIRONMENT.md](../../../../ENVIRONMENT.md))

## Do not configure / claim

| Item                                       | Reason                          |
| ------------------------------------------ | ------------------------------- |
| SMTP / SMS / push delivery                 | APZNOTIFY providers unavailable |
| n8n execute / schedule firing as certified | Execute gated                   |
| Support webhook HTTP ingress               | Not delivered                   |
| Email SoR / FIN-001                        | STOP                            |

## Verification pointers

- Programme regressions cited in [QUALITY-EVIDENCE.md](./QUALITY-EVIDENCE.md)
- QA-002 repository certification **HELD**
- Full Playwright / Docker not re-run under this packaging programme

## Operational readiness verdict

**READY** for Production Baseline operation under **PRODUCTION_READY_WITH_LIMITATIONS**.
