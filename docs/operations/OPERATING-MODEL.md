# APZHUB Operating Model

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20

---

## 1. Model overview

```text
Users / Operators
      ↓
Workbench / Law Platform / Admin surfaces
      ↓
API Gateway → AuthN → AuthZ → Platform Services
      ↓
Integration Adapters → Backend Engines
      ↓
Event Bus / Outbox → Search | Audit | Activity | Attention | Automation
      ↓
Operations control plane (this framework)
```

## 2. Operational domains

| Domain                | Owner focus                     | Primary docs                                     |
| --------------------- | ------------------------------- | ------------------------------------------------ |
| Service operations    | Availability, health, capacity  | SERVICE-HEALTH · CAPACITY · PERFORMANCE          |
| Support operations    | Incidents, problems, users      | SUPPORT-MODEL · INCIDENT · PROBLEM               |
| Change & release      | Controlled change to Production | CHANGE · RELEASE · DEPLOYMENT                    |
| Resilience            | Backup, DR, BCP                 | BACKUP · DISASTER-RECOVERY · BUSINESS-CONTINUITY |
| Security & compliance | SecOps, audit, compliance       | SECURITY · COMPLIANCE · AUDIT                    |
| Observability         | Metrics, logs, traces, alerts   | MONITORING · DASHBOARDS · Document 014           |

## 3. Environments

| Environment | Purpose                     | Change posture                              |
| ----------- | --------------------------- | ------------------------------------------- |
| Development | Local / shared-dev          | Fast iteration; no Production data          |
| Testing     | Automated + exploratory QA  | CI green required for promotion             |
| Staging     | Pre-Production validation   | Production-like config; Owner-gated cutover |
| Production  | Platform **1.1.0** baseline | Change Management mandatory                 |

Host coexistence details: [ENVIRONMENT.md](../../ENVIRONMENT.md).

## 4. Roles (summary)

| Role                                          | Responsibility                              |
| --------------------------------------------- | ------------------------------------------- |
| Platform Owner                                | Baseline Acceptance; STOP exceptions        |
| Platform Operations Lead                      | Ops framework adherence; escalation L3      |
| Service Owner (per capability/product)        | Health, runbooks, OLA contribution          |
| On-call / Production Support                  | Incident response L1/L2                     |
| Security Operations                           | SecOps incidents, secrets, least privilege  |
| Release Manager                               | Release calendar, gates, rollback authority |
| Engineering (via Engineering Operating Model) | Approved programme delivery                 |

Detail: [SUPPORT-MODEL.md](./SUPPORT-MODEL.md).

## 5. Relationship to Engineering Operating Model

Engineering delivery (programmes, DoR/DoD, PRs) follows [ENGINEERING-OPERATING-MODEL.md](./ENGINEERING-OPERATING-MODEL.md).  
Production operation follows **this** Platform Operations Framework.  
Hotfixes bridge both via [HOTFIX-POLICY.md](./HOTFIX-POLICY.md) + Change Management.
