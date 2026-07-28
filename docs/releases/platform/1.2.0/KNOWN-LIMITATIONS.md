# APZHUB Platform 1.2.0 — Known Limitations Register

> **Programme:** APZHUB-1.2-009  
> **Date:** 2026-07-20  
> **Authority:** [1.2 readiness KNOWN-LIMITATIONS](../../1.2/readiness/KNOWN-LIMITATIONS.md) · product KL · Platform 1.1.0 KL  
> **Honesty rule:** Do not market limited surfaces as complete.

---

## Closed under Platform 1.2.0 (packaged from P0 engineering)

| ID               | Limitation (was)                       | Closure                                                      |
| ---------------- | -------------------------------------- | ------------------------------------------------------------ |
| R12-OPS-01       | Backup restore never tested            | **Closed** — drill + evidence (keep ≤90d current)            |
| R12-OPS-02       | Alert strategy / runbook thin          | **Closed for catalogue + runbooks** (live delivery residual) |
| R12-OPS-03       | Host coexistence capacity uncontrolled | **Closed**                                                   |
| R12-SEARCH-01/02 | Time/Law Search publishers absent      | **Closed** — `search-time` / `search-law` **0.1.0**          |
| R12-TCMS-01      | GitLab CI adapter absent               | **Closed** — metadata Reference Adapter **0.1.0**            |

---

## Residual limitations (binding PRWL)

| ID         | Limitation                                                                                                                                                                                                                               | Severity                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| PL12-KL-01 | Search composition hooks / live Meilisearch drain not wired for Time/Law                                                                                                                                                                 | **CLOSED** — [Platform-1.3-ENG-001](../../engineering/platform-1.3-eng-001/README.md) |
| PL12-KL-02 | Observe live alert evaluation / delivery not automated                                                                                                                                                                                   | Medium                                                                                |
| PL12-KL-03 | GitLab CI dispatch / rerun / cancel / download unsupported                                                                                                                                                                               | Medium                                                                                |
| PL12-KL-04 | Theme D persistence: **Automation journal → Postgres SoR closed** (APZHUB-ENG-0001 **ACCEPTED**); **Law session stores → Postgres SoR closed** (APZHUB-ENG-0002 **ACCEPTED**). Client retains localStorage L1 cache with API dual-write. | Low                                                                                   |
| PL12-KL-05 | Theme E: **Support webhook ingress closed** (APZHUB-ENG-0003 **ACCEPTED**); **binary attachments closed** (APZHUB-ENG-0004 **ACCEPTED**); residual: attachment delete · realtime SUP-03                                                  | Low–Medium                                                                            |
| PL12-KL-06 | Portfolio re-cert path **ACCEPTED**; CERT-004 **ACCEPTED**; RELEASE-001 **ACCEPTED**. Operational cutover: [OPS-001](../../../operations/platform-1.2.0-operational-readiness/README.md) **PRODUCTION READY WITH ACTIONS**               | Medium → mitigated / cutover                                                          |
| PL12-KL-07 | No Email SoR                                                                                                                                                                                                                             | High                                                                                  |
| PL12-KL-08 | FIN-001 not extracted                                                                                                                                                                                                                    | Medium                                                                                |
| PL12-KL-09 | Workflow / n8n Execute gated                                                                                                                                                                                                             | High                                                                                  |
| PL12-KL-10 | Product AU-* / Support realtime / Analytics live embed / Documents binary                                                                                                                                                                | Medium                                                                                |
| PL12-KL-11 | Root `0.1.0-foundation` ≠ platform SemVer                                                                                                                                                                                                | Low                                                                                   |
| PL12-KL-12 | Commercial product SemVer not advanced by 1.2 packaging                                                                                                                                                                                  | Low                                                                                   |
| PL12-KL-13 | Inherited Platform 1.1.0 PRWL residuals not closed by Themes A–C                                                                                                                                                                         | Medium                                                                                |

---

## Marketing constraint

> Platform **1.2.0** is a platform enhancement release closing Production ops maturity gaps, adding Time and Law Search publication adapters, and delivering a GitLab CI metadata Reference Adapter — **Production Ready With Limitations**.

It must **not** be described as full multi-CI admin, live Search indexing GA, automated Observe alerting GA, Support 2.0, Workflow Execute, Email SoR, or FIN-001.
