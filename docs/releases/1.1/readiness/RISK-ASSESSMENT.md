# APZHUB Release 1.1 — Risk Assessment

> **Programme:** APZHUB-1.1-005  
> **Date:** 2026-07-20  
> **Baseline risks:** [Platform 1.0.0 RISK-REGISTER](../../platform/1.0.0/RISK-REGISTER.md)  
> **Note:** No dedicated `docs/releases/1.1-planning/` risk register existed; this assessment covers Release 1.1 certification entry.

---

## Inherited Platform 1.0.0 risks (still relevant)

| ID   | Risk                                 | 1.1 posture                                                                                              |
| ---- | ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| R-01 | Stale docs contradict disk           | **Elevated briefly** — some planning docs lag ACCEPTED status; this pack + AI-MANIFEST are authoritative |
| R-02 | Cross-product coupling / bypass      | **Mitigated** — Event Bus + Automation Foundation stay platform-owned                                    |
| R-03 | Secret leakage                       | Unchanged — Zero Trust held                                                                              |
| R-04 | Over-claiming polish (Law UX, stubs) | **Active** — Law UX polish not delivered; must certify as PRWL                                           |
| R-05 | Premature FIN-001 extraction         | **Held** — STOP retained                                                                                 |
| R-06 | Engine brand leakage                 | Unchanged                                                                                                |
| R-07 | Host coexistence disruption          | Unchanged — ENVIRONMENT.md                                                                               |
| R-08 | Programme ID confusion               | Reduced by 1.1 named programmes; keep disambiguation in cert pack                                        |
| R-09 | Unauthorised SemVer bump             | **Active gate** — Platform remains 1.0.0 until 1.1.0 certification accepted                              |

---

## Release 1.1–specific risks

| ID       | Risk                                                                     | Likelihood | Impact | Mitigation                                                                           |
| -------- | ------------------------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------ |
| R11-R-01 | Marketing 1.1 as “full automation / Workflow execute”                    | Medium     | High   | KL register · Architecture Notes · PRWL class · STOP honesty                         |
| R11-R-02 | Treating deferred roadmap themes as certification blockers               | Medium     | Medium | Owner Decision: planned engineering complete; see SCOPE-SUMMARY                      |
| R11-R-03 | In-memory automation / browser session stores overstated as Postgres SoR | Medium     | Medium | OPERATIONAL-READINESS honesty · KL entries                                           |
| R11-R-04 | Support realtime/webhook assumed closed with Event Bus                   | Low        | Medium | Support KL — only publish + in-app ENF closed                                        |
| R11-R-05 | Certification starts without consolidating ops matrix                    | Low        | Low    | Include ops consolidation in Platform 1.1.0 pack                                     |
| R11-R-06 | Additional engineering opened under “certification”                      | Medium     | High   | Certification programme = packaging/docs/SemVer; no scope expansion without Approval |

---

## Risk conclusion for certification entry

Residual risks are **manageable under PRWL** with documented Known Limitations. None require **additional Release 1.1 engineering** of the authorised 001–004 scope before entering certification packaging.

---

## Recommendation impact

Supports: **READY FOR RELEASE 1.1 CERTIFICATION**
