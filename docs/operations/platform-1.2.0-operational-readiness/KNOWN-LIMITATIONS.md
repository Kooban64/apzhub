# Known Limitations — Operational Readiness View

> **Programme:** APZHUB-OPS-001  
> **Date:** 2026-07-22  
> **Authority:** [platform-1.2.0 KNOWN-LIMITATIONS](../../releases/platform-1.2.0/KNOWN-LIMITATIONS.md)

| ID          | Limitation                                           | Ops impact                                                          |
| ----------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| PL12-KL-01  | Search live drain not wired for Time/Law             | **CLOSED** — ENG-001 · enable `APZHUB_SEARCH_ORCHESTRATION_ENABLED` |
| PL12-KL-02  | Observe live alert evaluation/delivery not automated | Manual triage on-call required                                      |
| PL12-KL-03  | GitLab CI dispatch/rerun/cancel unsupported          | Metadata adapter only                                               |
| PL12-KL-05  | Support attachment delete · realtime SUP-03          | Support ops residual                                                |
| PL12-KL-07  | No Email SoR                                         | High — communications plane incomplete                              |
| PL12-KL-08  | FIN-001 not extracted                                | Medium                                                              |
| PL12-KL-09  | Workflow Execute gated                               | Must remain gated                                                   |
| PL12-KL-11  | Root SemVer ≠ platform SemVer                        | Inventory honesty                                                   |
| OPS-cutover | Prod compose scaffold / no Dockerfile                | Blocks unqualified deploy                                           |
| OPS-host    | Shared EC2 with legacy stack                         | Capacity/Change gate                                                |

## Marketing constraint

Platform **1.2.0** remains **Production Ready With Limitations** and, for cutover, **Production Ready With Actions**.
