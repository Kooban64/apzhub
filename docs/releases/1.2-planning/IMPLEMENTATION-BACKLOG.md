# Release 1.2 — Implementation Backlog (Classified)

> **Programme:** APZHUB-1.2-001  
> **Date:** 2026-07-20  
> **Rule:** Every remaining item classified. Priority detail in [PRIORITY-MATRIX.md](./PRIORITY-MATRIX.md).

---

## Classification legend

Production Defect · Security Improvement · Compliance Improvement · Operational Improvement · Performance Improvement · Scalability Improvement · Developer Experience · Technical Debt · Customer Enhancement · Platform Capability · Commercial Capability · Integration · Automation · AI Capability · Future Product · Future Platform · Research · Deferred Item

---

## Register (authoritative planning list)

| ID             | Item                                           | Classification                             | Priority | Est. release | Owner (role)                                                                                        |
| -------------- | ---------------------------------------------- | ------------------------------------------ | -------- | ------------ | --------------------------------------------------------------------------------------------------- |
| R12-OPS-01     | Backup restore drill + recovery evidence       | Operational Improvement                    | P0       | 1.2          | Platform Ops Owner — **IMPLEMENTED** (APZHUB-1.2-002)                                               |
| R12-OPS-02     | Alert strategy / Observe runbook depth         | Operational Improvement                    | P0       | 1.2          | Observability Owner — **IMPLEMENTED** (APZHUB-1.2-003)                                              |
| R12-OPS-03     | Host coexistence capacity controls             | Operational Improvement / Scalability      | P0       | 1.2          | Environment Owner — **IMPLEMENTED** (APZHUB-1.2-004)                                                |
| R12-SEARCH-01  | `search-time` publication adapter              | Platform Capability / Integration          | P0       | 1.2          | Search + Time PO — **IMPLEMENTED** (APZHUB-1.2-005)                                                 |
| R12-SEARCH-02  | `search-law` publication adapter               | Platform Capability / Integration          | P0       | 1.2          | Search + Law PO — **IMPLEMENTED** (APZHUB-1.2-006)                                                  |
| R12-TCMS-01    | GitLab CI Reference Adapter (metadata)         | Integration / Platform Capability          | P0       | 1.2          | TCMS PO — **IMPLEMENTED** (APZHUB-1.2-007)                                                          |
| R12-PERSIST-01 | Automation journal → Postgres SoR              | Technical Debt / Platform Capability       | P1       | 1.2          | Workflow/Automation PO — **IMPLEMENTED** (APZHUB-ENG-0001 · **ACCEPTED**)                           |
| R12-PERSIST-02 | Law session stores → Postgres SoR              | Technical Debt / Platform Capability       | P1       | 1.2          | Law PO — **IMPLEMENTED** (APZHUB-ENG-0002 · **ACCEPTED**)                                           |
| R12-SUP-01     | Support webhook ingress (CE)                   | Integration / Customer Enhancement         | P1       | 1.2          | Support PO — **IMPLEMENTED** (APZHUB-ENG-0003 · **ACCEPTED**)                                       |
| R12-SUP-02     | Support binary attachments (CE)                | Integration / Customer Enhancement         | P1       | 1.2          | Support PO — **IMPLEMENTED** (APZHUB-ENG-0004 · **ACCEPTED**)                                       |
| R12-QA-01      | 1.2 portfolio Playwright/Docker re-cert path   | Compliance / Operational Improvement       | P1       | 1.2          | QA Owner — **IMPLEMENTED** (APZHUB-ENG-0005 · **ACCEPTED**); residual analysis APZHUB-QA-RECERT-001 |
| R12-AUTO-01    | Selective AU-* intents (Support/Projects/Law)  | Automation                                 | P1       | 1.2          | Portfolio Automation PO                                                                             |
| R12-LAW-01     | Law UX polish (placeholder reduction)          | Customer Enhancement                       | P2       | 1.2          | Law PO                                                                                              |
| R12-SUP-03     | Support realtime WS/SSE                        | Customer Enhancement / Platform Capability | P2       | 1.3*         | Support PO                                                                                          |
| R12-TIME-01    | Time approvals/reporting adjacency             | Customer Enhancement                       | P2       | 1.2/1.3      | Time PO                                                                                             |
| R12-PROJ-01    | Projects sprint CRUD / My Work depth           | Customer Enhancement                       | P2       | 1.2/1.3      | Projects PO                                                                                         |
| R12-AN-01      | Analytics live embed / registry SoR path       | Platform Capability                        | P2       | 1.3          | Analytics PO                                                                                        |
| R12-WF-01      | Workflow designer adjacency (no execute)       | Platform Capability                        | P2       | 1.3          | Workflow PO                                                                                         |
| R12-DOC-01     | Documents binary / upload path                 | Future Platform / Customer Enhancement     | P3       | 2.0*         | Documents PO                                                                                        |
| R12-SEMVER-01  | Root SemVer alignment plan                     | Developer Experience / Technical Debt      | P2       | 1.2          | Engineering Lead                                                                                    |
| R12-QA-02      | Intentional stub reduction (safe)              | Technical Debt                             | P3       | 1.2/1.3      | QA Owner                                                                                            |
| R12-NOTIFY-01  | APZNOTIFY delivery providers                   | Deferred Item / Future Platform            | —        | 1.3/2.0      | Notification PO                                                                                     |
| R12-EMAIL-01   | Email System of Record                         | Deferred Item                              | —        | 2.0          | Owner STOP                                                                                          |
| R12-FIN-01     | FIN-001 Financial Engine                       | Deferred Item                              | —        | 2.0          | Owner STOP                                                                                          |
| R12-WF-EXEC-01 | Workflow / n8n Execute unlock                  | Deferred Item                              | —        | Owner unlock | Owner STOP                                                                                          |
| R12-SUP20-01   | Support 2.0 Major                              | Future Product                             | —        | 2.0          | Support PO                                                                                          |
| R12-AI-01      | TCMS / Search / Analytics AI Assist            | AI Capability / Research                   | —        | Innovation   | Owner gated                                                                                         |
| R12-COMM-01    | Entitlement / billing engines                  | Commercial Capability                      | —        | Future       | Commercial + Eng                                                                                    |
| R12-SEC-01     | Continuous Zero Trust hardening (non-redesign) | Security Improvement                       | P1       | 1.2          | Security Owner                                                                                      |
| R12-COMP-01    | Audit trail completeness for new 1.2 surfaces  | Compliance Improvement                     | P1       | 1.2          | Compliance Owner                                                                                    |
| R12-PERF-01    | Hot-path query/index review (gateway/search)   | Performance Improvement                    | P2       | 1.2/1.3      | Platform Services                                                                                   |

\*Default lane; Owner may elevate within 1.2 only via named Approval amending this plan.

## Defect stance

No open Production Defect is asserted as blocking 1.1.0 baseline. Defects discovered in Production follow Hotfix / Incident standards and may enter 1.2 as P0 if Severity warrants — without expanding STOP themes.
