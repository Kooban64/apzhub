# APZHUB Operations Roadmap

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **Classification:** DOCUMENTATION ONLY — items below need separate Owner Approval to implement

---

## Operational maturity model

| Level | Name         | Characteristics                                  |
| ----- | ------------ | ------------------------------------------------ |
| M1    | Documented   | Framework exists (this programme)                |
| M2    | Practiced    | Roles staffed; incidents/changes follow docs     |
| M3    | Measured     | KPIs/SLAs reviewed monthly                       |
| M4    | Instrumented | Monitoring/dashboards implemented under Approval |
| M5    | Continuous   | Automated evidence, capacity forecasting         |

**Current target after Acceptance:** **M1 → M2** (practice the framework on Platform **1.1.0**).

## Near-term (ops practice — no engineering required)

| Item                              | Outcome                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| Appoint Ops Lead / on-call roster | Escalation works                                                                   |
| Adopt incident/change templates   | Consistent records                                                                 |
| Quarterly backup restore drill    | Resilience evidence — **R12-OPS-01** implemented (`pnpm ops:backup-restore-drill`) |
| Product Service Owners named      | OLA ownership                                                                      |

## Medium-term (require Owner-approved programmes)

| Item                                               | Notes                                           |
| -------------------------------------------------- | ----------------------------------------------- |
| Production monitoring/alerting implementation      | Observe/metrics connectors — not this programme |
| Ops dashboards in Administration Workspace         | Permission-gated                                |
| Durable automation / activity Postgres projections | Beyond browser/in-memory MVP                    |
| Runbook pack automation                            | Still docs-first                                |

## Explicitly out (STOP until Owner)

Email SoR · FIN-001 · Workflow execute unlock · Release 1.2 · platform redesign
