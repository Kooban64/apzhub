# APZHUB Support Model

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **Related:** [PRODUCTION-SUPPORT-STANDARD.md](./PRODUCTION-SUPPORT-STANDARD.md) (engineering bridge)

---

## Channels

| Channel                  | Use                               | Not for                                  |
| ------------------------ | --------------------------------- | ---------------------------------------- |
| In-app Attention / inbox | User-visible notifications (ENF)  | Email delivery (unavailable)             |
| APZ Support product      | End-user tickets (Zammad-backed)  | Platform infra P1 (use incident process) |
| Ops ticket / on-call     | Production incidents              | Feature requests (programme path)        |
| Owner / Platform Lead    | STOP exceptions, baseline changes | Routine L1                               |

## Support levels

| Level           | Who                                    | Scope                                                  |
| --------------- | -------------------------------------- | ------------------------------------------------------ |
| L1              | Production Support / helpdesk          | Triage, known errors, runbook execute, user guidance   |
| L2              | Service Owner / platform engineer      | Service diagnosis, adapter/config, restore from backup |
| L3              | Architecture / Owner-gated specialists | Freeze exceptions, security, multi-service outages     |
| Vendor / engine | Engine maintainers (behind adapter)    | Only after APZHUB translation; mask branding           |

## Operational roles

| Role                       | Duties                                                 |
| -------------------------- | ------------------------------------------------------ |
| Production Support Analyst | L1 triage, ticket hygiene, communication               |
| On-call Engineer           | P1/P2 response, incident commander when assigned       |
| Service Owner              | OLA, runbooks, post-incident actions for their service |
| Platform Operations Lead   | Cross-service coordination, escalation, ops KPIs       |
| Security Operations        | SecOps incidents, secret exposure, AuthZ anomalies     |
| Release Manager            | Change windows, release communication                  |

## Escalation procedures

| Trigger                          | Escalate to                             | Time target (OLA)    |
| -------------------------------- | --------------------------------------- | -------------------- |
| P1 Production outage             | On-call → Platform Ops Lead             | Immediate            |
| Suspected security breach        | Security Operations + Platform Ops Lead | Immediate            |
| Data loss / restore needed       | L2 Service Owner + Ops Lead             | < 30 min acknowledge |
| Freeze / architecture exception  | Owner Approval path                     | Not emergency-bypass |
| Product SemVer / baseline change | Owner                                   | Planned              |

## Production support hours

Define organizational hours locally. Default recommendation: business hours for P3/P4; 24×7 on-call for P1/P2 on Tier A services.
