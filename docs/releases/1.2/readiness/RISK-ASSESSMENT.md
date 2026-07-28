# APZHUB Release 1.2 — Risk Assessment

> **Programme:** APZHUB-1.2-008  
> **Date:** 2026-07-20  
> **Baselines:** [Platform 1.1.0 RISK-REGISTER](../../platform/1.1.0/RISK-REGISTER.md) · [OPERATIONAL-RISK-REGISTER](../../../operations/OPERATIONAL-RISK-REGISTER.md)  
> **Note:** This assessment covers Release 1.2 certification entry after P0 Themes A–C.

---

## Inherited / operational risks (updated posture)

| ID       | Risk                                              | 1.2 posture                                                                                      |
| -------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| OPS-R-01 | Shared-host contention with legacy `apz-stack`    | **Mitigated** — R12-OPS-03 controls + audit                                                      |
| OPS-R-04 | Backup restore never tested                       | **Mitigated** — R12-OPS-01 drill + evidence (keep ≤90d current)                                  |
| OPS-R-05 | Alert fatigue / no live Observe stack             | **Partially mitigated** — R12-OPS-02 catalogue + runbooks; live evaluation/delivery still future |
| OPS-R-02 | Over-claiming Email / Workflow execute / realtime | **Active** — STOP honesty required in cert marketing                                             |
| R11-R-01 | Overclaiming release completeness                 | **Active** — PRWL class mandatory                                                                |
| R11-R-04 | Starting unauthorised themes / STOP               | **Held** — engineering paused; cert = packaging                                                  |

---

## Release 1.2–specific risks

| ID       | Risk                                                               | Likelihood | Impact | Mitigation                                                                           |
| -------- | ------------------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------ |
| R12-R-01 | Marketing 1.2 as full multi-CI / Search GA / live alerting         | Medium     | High   | KL register · PRWL · SCOPE honesty · unsupported ops catalogues                      |
| R12-R-02 | Treating deferred P1 (Themes D–E, QA-01) as certification blockers | Medium     | Medium | Owner Decision: approved P0 complete; D–E waived for cert entry with KL              |
| R12-R-03 | Search publishers assumed live-indexed without composition/drain   | Medium     | Medium | KL — publisher packages present; live drain / hooks residual                         |
| R12-R-04 | GitLab adapter assumed to dispatch/rerun/download                  | Medium     | High   | Unsupported ops + TCMS INTEGRATIONS honesty                                          |
| R12-R-05 | Certification opens P1 / STOP under “packaging”                    | Medium     | High   | Certification programme = packaging/docs/SemVer; no scope expansion without Approval |
| R12-R-06 | Restore drill evidence becomes stale (>90 days)                    | Low        | Medium | Ops calendar · OPS-R-04 currency note                                                |
| R12-R-07 | Doc lag contradicts ACCEPTED status                                | Low        | Low    | This pack + AI-MANIFEST authoritative; cert hygiene                                  |

---

## Risk conclusion for certification entry

Residual risks are **manageable under PRWL** with documented Known Limitations. None require **additional Release 1.2 P0 engineering** before entering certification packaging.

---

## Recommendation impact

Supports: **READY FOR RELEASE 1.2 CERTIFICATION**
