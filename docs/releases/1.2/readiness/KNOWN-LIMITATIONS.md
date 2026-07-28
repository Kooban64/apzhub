# APZHUB Release 1.2 — Known Limitations Register

> **Programme:** APZHUB-1.2-008  
> **Date:** 2026-07-20  
> **Authority:** [1.2-planning KNOWN-LIMITATIONS-REVIEW](../../1.2-planning/KNOWN-LIMITATIONS-REVIEW.md) · programme packs · product KL  
> **Honesty rule:** Do not market limited surfaces as complete. Product KL docs win on product-specific detail.

---

## Closed under Release 1.2 P0 engineering

| ID                            | Limitation (was)                       | Closure                                                                          |
| ----------------------------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| OPS-R-04 / R12-OPS-01         | Backup restore never tested            | **Closed** — APZHUB-1.2-002 (keep evidence current)                              |
| OPS-R-05 (depth) / R12-OPS-02 | Alert strategy / runbook thin          | **Closed for catalogue + runbooks** — APZHUB-1.2-003 (live delivery residual)    |
| OPS-R-01 / R12-OPS-03         | Host coexistence capacity uncontrolled | **Closed** — APZHUB-1.2-004                                                      |
| Search Time publisher absent  | No `search-time`                       | **Closed** — APZHUB-1.2-005 (`@apzhub/search-time` **0.1.0**)                    |
| Search Law publisher absent   | No `search-law`                        | **Closed** — APZHUB-1.2-006 (`@apzhub/search-law` **0.1.0**)                     |
| GitLab CI adapter absent      | No GitLab metadata path                | **Closed** — APZHUB-1.2-007 (`@apzhub/integration-gitlab-ci` **0.1.0** metadata) |

---

## Residual limitations entering certification (PRWL)

| ID        | Limitation                                                                | Severity           | Notes                                              |
| --------- | ------------------------------------------------------------------------- | ------------------ | -------------------------------------------------- |
| R12-KL-01 | Search composition hooks / live Meilisearch drain not wired for Time/Law  | Medium             | Publishers present; product live indexing residual |
| R12-KL-02 | Observe live alert evaluation / delivery not automated                    | Medium             | OPS-R-05 residual after R12-OPS-02                 |
| R12-KL-03 | GitLab CI dispatch / rerun / cancel / download unsupported                | Medium             | Metadata/read-only Reference Adapter               |
| R12-KL-04 | Theme D — Automation journal / Law session not Postgres SoR               | Medium             | P1 R12-PERSIST-*; **waived for 1.2.0 cert entry**  |
| R12-KL-05 | Theme E — Support webhook ingress / binary attachments                    | Medium             | P1 R12-SUP-*; **waived for 1.2.0 cert entry**      |
| R12-KL-06 | R12-QA-01 Playwright / Docker portfolio re-cert path not executed         | Low–Medium         | P1; QA-002 held                                    |
| R12-KL-07 | No Email SoR                                                              | High (product gap) | Explicit STOP · 2.0                                |
| R12-KL-08 | FIN-001 not extracted                                                     | Medium             | Explicit STOP                                      |
| R12-KL-09 | Workflow / n8n Execute gated                                              | High (capability)  | Explicit STOP                                      |
| R12-KL-10 | Product AU-* / Support realtime / Analytics live embed / Documents binary | Medium             | Deferred backlog / STOP adjacency                  |
| R12-KL-11 | Root `0.1.0-foundation` ≠ platform SemVer                                 | Low                | R12-SEMVER-01 hygiene                              |
| R12-KL-12 | Historical docs may lag ACCEPTED status                                   | Low                | Cert pack hygiene                                  |
| R12-KL-13 | TCMS / Search commercial SemVer not bumped by 1.2 engineering             | Low                | Certification decides SemVer packaging             |

---

## Certification marketing constraint

Release **1.2** must be described as:

> Platform enhancement release closing Production ops maturity gaps (backup restore verification, alert runbook depth, host coexistence controls), adding Time and Law Search publication adapters, and delivering a GitLab CI metadata Reference Adapter — **Production Ready With Limitations**.

It must **not** be described as full multi-CI admin, live Search indexing GA, automated Observe alerting GA, Support 2.0, Workflow Execute, Email SoR, or FIN-001.
