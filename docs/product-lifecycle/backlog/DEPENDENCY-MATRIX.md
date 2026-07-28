# Dependency Matrix — Continuous Backlog

> **Programme:** APZHUB-BACKLOG-001  
> **Date:** 2026-07-20  
> **Inherits:** [1.2-planning/DEPENDENCY-MATRIX.md](../../releases/1.2-planning/DEPENDENCY-MATRIX.md) · [IMPLEMENTATION-SEQUENCE.md](../../releases/1.2-planning/IMPLEMENTATION-SEQUENCE.md)  
> **Baseline:** Platform **1.2.0** (Themes A–C **done**)

---

## Hard dependencies (open items)

| Item                      | Depends on                                        | Dependency status    | Engineering implication                             |
| ------------------------- | ------------------------------------------------- | -------------------- | --------------------------------------------------- |
| R12-PERSIST-01            | Automation Foundation (1.1-004)                   | **Met**              | Ready                                               |
| R12-PERSIST-02            | Law session model (1.1-002) / Law 1.0.0           | **Met**              | Ready                                               |
| R12-SUP-01                | Zammad CE + Support services                      | **Met**              | ACCEPTED (ENG-0003)                                 |
| R12-SUP-02                | Zammad CE + Support services                      | **Met**              | ACCEPTED (ENG-0004)                                 |
| R12-QA-01                 | Themes A–C                                        | **Met**              | ACCEPTED (ENG-0005); remediation plan QA-RECERT-001 |
| R12-COMP-01               | Accepted 1.2 surfaces                             | **Met**              | Ready                                               |
| R12-AUTO-01               | Event Bus + Automation + **PERSIST-01 preferred** | Partial              | **Block until PERSIST-01**                          |
| R12-SUP-03                | SUP-01/02                                         | **Not met**          | Deferred                                            |
| R12-LAW-01                | Law AuthZ closed                                  | **Met**              | Ready                                               |
| R12-TIME-01               | Time 1.0.0                                        | **Met**              | Ready (adjacency only)                              |
| R12-PROJ-01               | Projects 1.1.0                                    | **Met**              | Ready                                               |
| R12-AN-01                 | Metabase + embed design                           | Incomplete for train | Not ready                                           |
| R12-WF-01                 | No-execute boundary                               | Design risk          | Not ready                                           |
| R12-NOTIFY-01             | Delivery design (≠ Email SoR)                     | Deferred             | Not ready                                           |
| R12-WF-EXEC-01            | Owner unlock                                      | STOP                 | Forbidden                                           |
| R12-EMAIL-01 / R12-FIN-01 | Dedicated Owner programmes                        | STOP                 | Forbidden                                           |
| R12-SEC-01                | Scoped threat/AC slice                            | **Missing**          | Refine first                                        |
| R12-PERF-01               | Measurement baseline                              | **Missing**          | Refine first                                        |

---

## Sequence after Platform 1.2.0

```text
Themes A–C (OPS / SEARCH / TCMS) ── DONE ──► Platform 1.2.0 ACCEPTED

Recommended continuous path (advisory):

  Wave D   R12-PERSIST-01  ──►  R12-PERSIST-02 (parallel OK)
              │
              └─► R12-AUTO-01 (after journal SoR)

  Wave E   R12-SUP-01 ∥ R12-SUP-02   (independent of Wave D)

  Hygiene  R12-COMP-01 · R12-QA-01 · R12-SEMVER-01  (can interleave)

  Capacity R12-LAW-01 · R12-TIME-01 · R12-PROJ-01

  STOP     EMAIL · FIN · WF-EXEC · SDK unfreeze · redesign
```

---

## Parallelisation sets (still valid)

| Set     | Items                       | Constraint                                 |
| ------- | --------------------------- | ------------------------------------------ |
| β       | PERSIST-01 ∥ PERSIST-02     | Prefer single-item programmes (PIR lesson) |
| γ       | SUP-01 ∥ SUP-02             | Prefer single-item; may sequence           |
| δ       | Product polish              | After AuthZ/persist as needed              |
| Hygiene | QA-01 · COMP-01 · SEMVER-01 | Low architecture risk                      |

---

## External / host

| Dependency                  | Constraint                                                                        |
| --------------------------- | --------------------------------------------------------------------------------- |
| Legacy `apz-stack`          | No disruptive change without Approval ([ENVIRONMENT.md](../../../ENVIRONMENT.md)) |
| Integration SDK **1.0.0**   | Frozen — adapters extend; core does not rewrite                                   |
| Platform **1.2.0** baseline | Do not mutate packaging without named Approval                                    |

---

## Recommendation linkage

**R12-PERSIST-01** has all hard dependencies **met**, sits at the head of Wave D, and unblocks **R12-AUTO-01** — see [RECOMMENDED-NEXT-WORK.md](./RECOMMENDED-NEXT-WORK.md).
