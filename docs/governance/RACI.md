# APZOR RACI Model (APZHUB)

> **Programme:** APZHUB-GOVERNANCE-001  
> **Date:** 2026-07-20  
> **Legend:** R = Responsible · A = Accountable · C = Consulted · I = Informed

---

| Decision / activity                               | Owner | Platform Owner | Product Owner | Eng Lead | Ops Lead | Sec Lead | Release Mgr |
| ------------------------------------------------- | ----- | -------------- | ------------- | -------- | -------- | -------- | ----------- |
| Platform SemVer Acceptance                        | A     | R              | C             | C        | C        | C        | C           |
| Product SemVer Acceptance                         | A     | C              | R             | C        | C        | I        | C           |
| Named engineering programme Approval              | A     | C              | C             | R        | I        | C        | I           |
| Architecture freeze exception (ADR)               | A     | R              | C             | C        | I        | C        | I           |
| Production Normal Change                          | I     | C              | C             | C        | R        | C        | A           |
| Emergency Hotfix                                  | I     | C              | C             | R        | R        | C        | A           |
| P1 Incident command                               | I     | C              | C             | C        | A/R      | C        | I           |
| Security incident                                 | I     | C              | I             | C        | C        | A/R      | I           |
| STOP reopen (Email SoR / FIN-001 / execute / 1.2) | A     | C              | C             | C        | C        | C        | I           |
| Commercial roadmap publish                        | A     | C              | R             | I        | I        | I        | I           |
| Ops KPI review                                    | I     | C              | I             | I        | A/R      | C        | C           |
| AI agent programme scope                          | A     | C              | C             | R        | I        | C        | I           |
| Documentation / KF honesty                        | I     | C              | C             | R        | C        | I        | I           |

Detailed committee authority: [GOVERNANCE-COMMITTEES.md](./GOVERNANCE-COMMITTEES.md) · [DECISION-MAKING.md](./DECISION-MAKING.md).
