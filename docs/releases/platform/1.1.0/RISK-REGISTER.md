# APZHUB Platform 1.1.0 — Risk Register

> **Programme:** APZHUB-1.1-006  
> **Date:** 2026-07-20  
> **Inherits:** [Platform 1.0.0 RISK-REGISTER](../1.0.0/RISK-REGISTER.md) · [1.1 readiness RISK-ASSESSMENT](../../1.1/readiness/RISK-ASSESSMENT.md)

---

## Inherited (still applicable)

| ID   | Risk                            | Mitigation                                                 |
| ---- | ------------------------------- | ---------------------------------------------------------- |
| R-01 | Stale docs contradict disk      | This pack + AI-MANIFEST authoritative for 1.1.0            |
| R-02 | Cross-product coupling / bypass | Architecture gates · platform-owned Event Bus / Automation |
| R-03 | Secret leakage                  | Zero Trust · secrets never in repo                         |
| R-04 | Over-claiming polish            | PRWL class · KL register                                   |
| R-05 | Premature FIN-001               | STOP held                                                  |
| R-06 | Engine brand leakage            | Naming standards                                           |
| R-07 | Host coexistence disruption     | ENVIRONMENT.md                                             |
| R-08 | Programme ID confusion          | Named 1.1 programmes · this pack ID APZHUB-1.1-006         |
| R-09 | Unauthorised SemVer             | Owner Acceptance gates baseline change                     |

## Release 1.1 packaging risks

| ID       | Risk                                                              | Likelihood | Impact | Mitigation                                 |
| -------- | ----------------------------------------------------------------- | ---------- | ------ | ------------------------------------------ |
| R11-R-01 | Marketing 1.1.0 as Workflow execute / full automation             | Medium     | High   | KL · Executive notes · PRWL recommendation |
| R11-R-02 | Treating deferred roadmap themes as defects                       | Medium     | Medium | SCOPE from readiness · Owner Decision      |
| R11-R-03 | Overstating in-memory automation / browser stores as Postgres SoR | Medium     | Medium | Ops readiness honesty                      |
| R11-R-04 | Starting 1.2 / STOP items under “post-cert” without Approval      | Medium     | High   | STOP section · Owner gates                 |

No new residual risk authorises engineering under this documentation programme.
