# Priority Matrices — Top 10 Lists

> **Programme:** APZHUB-BACKLOG-001  
> **Date:** 2026-07-20  
> **Scope:** Open / residual items unless noted; Implemented P0 listed only where residual value remains  
> **Does not approve** any item

---

## Top 10 Engineering Candidates

_(Ready = YES only — full detail in [ENGINEERING-CANDIDATES.md](./ENGINEERING-CANDIDATES.md))_

| #   | ID             | Title                                                                                      |
| --- | -------------- | ------------------------------------------------------------------------------------------ |
| 1   | R12-PERSIST-01 | Automation journal → Postgres SoR                                                          |
| 2   | R12-PERSIST-02 | Law session stores → Postgres SoR                                                          |
| 3   | R12-SUP-01     | Support webhook ingress (CE) — **ACCEPTED** (ENG-0003)                                     |
| 4   | R12-SUP-02     | Support binary attachments (CE) — **ACCEPTED** (ENG-0004)                                  |
| 5   | R12-QA-01      | Portfolio Playwright/Docker re-cert path — **ACCEPTED** (ENG-0005); analysis QA-RECERT-001 |
| 6   | R12-COMP-01    | Audit trail completeness for 1.2 surfaces                                                  |
| 7   | R12-LAW-01     | Law UX polish                                                                              |
| 8   | R12-TIME-01    | Time approvals/reporting adjacency                                                         |
| 9   | R12-PROJ-01    | Projects sprint CRUD / My Work depth                                                       |
| 10  | R12-SEMVER-01  | Root SemVer alignment plan                                                                 |

---

## Top 10 Customer Value

| #   | ID                   | Title                      | Notes                               |
| --- | -------------------- | -------------------------- | ----------------------------------- |
| 1   | R12-SUP-01           | Support webhook ingress    | CB-03 · high ICP ticket ingest      |
| 2   | R12-SUP-02           | Support binary attachments | CB-04                               |
| 3   | R12-LAW-01           | Law UX polish              | CB-06 · commercial Law              |
| 4   | R12-TIME-01          | Time approvals/reporting   | CB-07                               |
| 5   | R12-PERSIST-01       | Durable automation history | CB-05                               |
| 6   | R12-PROJ-01          | Projects sprint / My Work  | CB-08                               |
| 7   | R12-PERSIST-02       | Law session Postgres       | Law durability honesty              |
| 8   | R12-SUP-03           | Support realtime WS/SSE    | High value — **not ready** (deps)   |
| 9   | PL12-KL-01 successor | Search live drain          | High — **not ready** (needs new AC) |
| 10  | R12-DOC-01           | Documents binary           | High — **deferred / not ready**     |

---

## Top 10 Operational Value

| #   | ID                   | Title                       | Notes                         |
| --- | -------------------- | --------------------------- | ----------------------------- |
| 1   | R12-PERSIST-01       | Automation journal Postgres | Ops durability · Theme D      |
| 2   | R12-PERSIST-02       | Law session Postgres        | Ops durability · Theme D      |
| 3   | R12-QA-01            | Portfolio re-cert path      | Cert honesty · PL12-KL-06     |
| 4   | R12-COMP-01          | Audit trail completeness    | Compliance ops                |
| 5   | PL12-KL-02 successor | Observe live alerts         | High — **not ready**          |
| 6   | R12-SEC-01           | Zero Trust hardening        | High — **needs scoped slice** |
| 7   | R12-SUP-01           | Webhook ingress             | Ops ticket automation         |
| 8   | R12-PERF-01          | Hot-path review             | **measure first**             |
| 9   | R12-SEMVER-01        | Root SemVer alignment       | DX / release clarity          |
| 10  | R12-AUTO-01          | Selective AU-* intents      | After PERSIST-01              |

---

## Top 10 Security

| #   | ID                       | Title                          | Notes                               |
| --- | ------------------------ | ------------------------------ | ----------------------------------- |
| 1   | R12-SEC-01               | Continuous Zero Trust (scoped) | **Refine before ENG**               |
| 2   | R12-COMP-01              | Audit trail completeness       | Authz/audit honesty                 |
| 3   | R12-PERSIST-01           | Journal SoR                    | Integrity of automation history     |
| 4   | R12-PERSIST-02           | Law session SoR                | Session integrity                   |
| 5   | R12-SUP-01               | Webhook ingress                | Must include authn/authz/validation |
| 6   | R12-QA-01                | Portfolio re-cert              | Security regression surfacing       |
| 7   | PL12-KL-02 successor     | Observe live alerts            | Detection ops                       |
| 8   | STOP-04                  | Platform redesign              | **Forbidden** without ADR+Owner     |
| 9   | Integration SDK unfreeze | STOP-05                        | **Forbidden**                       |
| 10  | R12-EMAIL-01             | Email SoR                      | **STOP** — not a candidate          |

---

## Top 10 Technical Debt

| #   | ID                        | Title                           | Notes                 |
| --- | ------------------------- | ------------------------------- | --------------------- |
| 1   | R12-PERSIST-01 / TD-12-01 | Automation journal not Postgres | P1 honesty            |
| 2   | R12-PERSIST-02 / TD-12-02 | Law session not Postgres        | P1 honesty            |
| 3   | R12-SEMVER-01 / TD-12-04  | Root vs platform SemVer         | DX                    |
| 4   | R12-QA-02 / TD-12-05      | Intentional stubs               | P3                    |
| 5   | TD-12-08 / R12-AN-01      | Analytics registry SoR          | Deferred              |
| 6   | TD-12-09 / R12-NOTIFY-01  | Notification delivery           | Deferred              |
| 7   | TD-12-06                  | Event Bus MVP 0.1.0             | Maintain              |
| 8   | TD-12-07                  | Provisioning MVP                | Future unless blocker |
| 9   | PL12-KL-01                | Search live drain residual      | Capability gap        |
| 10  | PL12-KL-13                | Inherited 1.1.0 PRWL residuals  | Portfolio             |

---

## Top 10 Quick Wins

| #   | ID             | Title                       | Why quick                                   |
| --- | -------------- | --------------------------- | ------------------------------------------- |
| 1   | R12-SEMVER-01  | Root SemVer alignment plan  | Docs/plan S; bump gated                     |
| 2   | R12-COMP-01    | Audit trail completeness    | L complexity · S size                       |
| 3   | R12-QA-02      | Safe stub reduction         | Opportunistic S                             |
| 4   | R12-LAW-01     | Law UX polish               | L–M · AuthZ closed                          |
| 5   | R12-QA-01      | Portfolio re-cert path      | Process/CI — no architecture change         |
| 6   | R12-PERSIST-01 | Automation journal Postgres | M but well-scoped Wave 3                    |
| 7   | R12-PERSIST-02 | Law session Postgres        | Parallel Theme D pattern                    |
| 8   | R12-SUP-01     | Webhook ingress             | Connector depth exists                      |
| 9   | R12-SUP-02     | Binary attachments          | Connector depth exists                      |
| 10  | R12-PROJ-01    | Projects My Work slice      | Capacity P2 — not true “quick” if full CRUD |

---

## Scoring notes

Scores inherit qualitative H/M/L from [1.2 PRIORITY-MATRIX](../../releases/1.2-planning/PRIORITY-MATRIX.md) and PIR recommendations. Continuous lifecycle does **not** reopen Release 1.3 mega-planning.
