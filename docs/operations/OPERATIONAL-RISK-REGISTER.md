# APZHUB Operational Risk Register

> **Programme:** APZHUB-OPERATIONS-001 · updated under **APZHUB-OPS-001**  
> **Date:** 2026-07-22  
> **Related:** [Platform 1.1.0 RISK-REGISTER](../releases/platform/1.1.0/RISK-REGISTER.md) · [OPS-001 RISK-REGISTER](./platform-1.2.0-operational-readiness/RISK-REGISTER.md)

---

| ID       | Risk                                                                      | L      | I      | Mitigation                                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OPS-R-01 | Shared-host resource contention with legacy `apz-stack`                   | High   | High   | **R12-OPS-03** reserved-port catalogue + coexistence audit ([HOST-COEXISTENCE-CONTROLS](./HOST-COEXISTENCE-CONTROLS.md)) · ENVIRONMENT.md · Owner gate for host changes                              |
| OPS-R-02 | Over-claiming Email / Workflow execute / realtime in ops SLAs             | Medium | High   | SUPPORTED-SERVICES · SERVICE-LEVELS honesty                                                                                                                                                          |
| OPS-R-03 | Secret leakage via tickets/logs                                           | Low    | High   | SECURITY-OPERATIONS · never paste secrets                                                                                                                                                            |
| OPS-R-04 | Backup restore never tested                                               | Medium | High   | Quarterly restore drills — **R12-OPS-01** drill runner + evidence ([BACKUP-RESTORE-DRILL-RUNBOOK](./BACKUP-RESTORE-DRILL-RUNBOOK.md)); keep live PASS evidence current (≤ 90 days)                   |
| OPS-R-05 | Alert fatigue / no live Observe stack                                     | Medium | Medium | **R12-OPS-02** alert policy catalogue + runbook depth ([MONITORING-AND-ALERTING](./MONITORING-AND-ALERTING.md) · [runbooks/](./runbooks/README.md)); live evaluation/delivery still future programme |
| OPS-R-06 | Engine outage mislabeled as APZHUB core failure                           | Medium | Medium | Health hierarchy · adapter translation                                                                                                                                                               |
| OPS-R-07 | Unauthorised Production change                                            | Medium | High   | CHANGE-MANAGEMENT · Owner gates                                                                                                                                                                      |
| OPS-R-08 | Law browser session store treated as durable SoR                          | Medium | Medium | BACKUP honesty · KL                                                                                                                                                                                  |
| OPS-R-09 | Automation deferred intents mistaken for execute                          | Medium | Medium | Training · runbooks                                                                                                                                                                                  |
| OPS-R-10 | Doc lag vs Production Baseline                                            | Medium | Low    | AI-MANIFEST · this framework · align remaining 1.1.0 citations to **1.2.0**                                                                                                                          |
| OPS-R-11 | Prod deploy path incomplete (no Dockerfile · compose scaffold · TLS gaps) | High   | High   | **Mitigated under OPS-002** — Dockerfile + compose + TLS configs · [OPS-002](./platform-1.2.0-production-readiness/README.md)                                                                        |
| OPS-R-12 | Cutover without scheduled PG backup / Change-window restore               | Medium | High   | **Mitigated under OPS-002** — `ops:backup:postgres` + cron docs · host Change still required to install cron                                                                                         |

No residual operational risk authorises engineering under APZHUB-OPS-001.
