# Engineering Candidates

> **Programme:** APZHUB-BACKLOG-001  
> **Date:** 2026-07-20  
> **Rule:** Only items assessed **Ready for Engineering = YES**  
> **Does not approve** any item

---

## Eligibility

An item is an engineering candidate when:

1. Stable backlog ID exists in repository planning/registers
2. Not STOP / not Future without Acceptance
3. Hard dependencies met (or explicitly parallelisable)
4. Acceptance criteria can be derived from existing plan + KL honesty
5. Fits continuous delivery (single named programme) under Platform Delivery Standard

---

## Ranked engineering-ready list (all Ready = YES)

| Rank | ID                 | Title                                   | Priority | Size | Primary value      | Notes                                                                      |
| ---- | ------------------ | --------------------------------------- | -------- | ---- | ------------------ | -------------------------------------------------------------------------- |
| 1    | **R12-PERSIST-01** | Automation journal → Postgres SoR       | P1       | M    | Ops + debt honesty | **ACCEPTED** (ENG-0001) · PL12-KL-04                                       |
| 2    | **R12-PERSIST-02** | Law session stores → Postgres SoR       | P1       | M    | Ops + Law SoR      | **ACCEPTED** (ENG-0002) · PL12-KL-04                                       |
| 3    | **R12-SUP-01**     | Support webhook ingress (CE)            | P1       | M    | Customer           | **ACCEPTED** (ENG-0003) · Theme E · CB-03 · PL12-KL-05                     |
| 4    | **R12-SUP-02**     | Support binary attachments (CE)         | P1       | M    | Customer           | **ACCEPTED** (ENG-0004) · Theme E · CB-04 · PL12-KL-05                     |
| 5    | **R12-QA-01**      | Portfolio Playwright/Docker re-cert     | P1       | M    | Ops / compliance   | **ACCEPTED** (ENG-0005) · residual suite FAIL → QA-RECERT-001 · PL12-KL-06 |
| 6    | **R12-COMP-01**    | Audit trail completeness (1.2 surfaces) | P1       | S    | Compliance         | Bounded to Accepted surfaces                                               |
| 7    | **R12-LAW-01**     | Law UX polish                           | P2       | S–M  | Customer           | Capacity · CB-06                                                           |
| 8    | **R12-TIME-01**    | Time approvals/reporting adjacency      | P2       | M    | Customer           | No billing SoR · CB-07                                                     |
| 9    | **R12-PROJ-01**    | Projects sprint / My Work depth         | P2       | M    | Customer           | Capacity · CB-08                                                           |
| 10   | **R12-SEMVER-01**  | Root SemVer alignment plan              | P2       | S    | DX / debt          | PL12-KL-11 · plan-first                                                    |
| 11   | **R12-QA-02**      | Intentional stub reduction (safe)       | P3       | S    | Debt               | Opportunistic                                                              |

---

## Explicitly excluded from engineering-ready pool

| ID                                                                  | Reason                    |
| ------------------------------------------------------------------- | ------------------------- |
| R12-AUTO-01                                                         | Prefer PERSIST-01 first   |
| R12-SEC-01                                                          | Needs bounded Owner slice |
| R12-PERF-01                                                         | Measure-first             |
| R12-SUP-03 · R12-AN-01 · R12-WF-01                                  | Deferred                  |
| R12-EMAIL-01 · R12-FIN-01 · R12-WF-EXEC-01                          | STOP                      |
| R12-DOC-01 · R12-NOTIFY-01 · R12-SUP20-01 · R12-AI-01 · R12-COMM-01 | Future / deferred         |
| All P0 R12-OPS/SEARCH/TCMS                                          | Already Implemented       |

---

## Recommended single candidate

See [RECOMMENDED-NEXT-WORK.md](./RECOMMENDED-NEXT-WORK.md) — **R12-PERSIST-01**.
