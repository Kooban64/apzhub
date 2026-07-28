# APZHUB Platform Release 1.2 — Authoritative Plan

> **Programme:** APZHUB-1.2-001  
> **Date:** 2026-07-20  
> **Target SemVer (platform):** **1.2.0** (after delivery programmes + certification)  
> **This document defines WHAT 1.2 contains — not HOW to code it.**

---

## Scope themes

### Theme A — Operational maturity (P0)

Close Production ops gaps from [OPERATIONAL-RISK-REGISTER](../../operations/OPERATIONAL-RISK-REGISTER.md): backup restore verification, alert strategy depth, host coexistence capacity controls, runbook completeness. No monitoring-stack redesign UI.

### Theme B — Unified Search completeness (P0)

Additive Search Providers / publishers for **Time** and **Law** (`search-time`, `search-law`) without unfreezing Search architecture. Permission-filtered at query time per foundation docs.

### Theme C — Testing / CI adjacency (P0–P1)

**TCMS GitLab CI Reference Adapter** — metadata/read path analogous to existing GHA metadata posture. No AI Assist. No auto-certification.

### Theme D — Persistence honesty (P1)

Migrate Automation Foundation journal and Law session stores from non-Postgres / browser paths toward **platform PostgreSQL SoR** (closes PL11-KL-07 honesty gap).

### Theme E — Support CE depth (P1)

Bounded Support programme: **webhook ingress** and/or **binary attachments** (CE Zammad). Explicitly **not** Support 2.0; **not** realtime WS/SSE unless separately prioritised as P2 with Owner confirmation.

### Theme F — Automation intents (P1–P2)

Selective product **AU-*** registration/intent delivery on Automation Foundation — **not** Workflow Execute unlock. Must not claim orchestration GA.

### Theme G — Product maturity slices (P2)

Law UX polish (PL11-KL-01); selective Time reporting/approvals adjacency if Owner ranks; Projects My Work / sprint gaps only if evidence-backed and CE-safe; Analytics embed path gated.

### Theme H — Engineering hygiene (P2–P3)

Root SemVer alignment planning (PL11-KL-09); intentional QA stub reduction where safe (PL11-KL-10).

## Explicit non-goals (Release 1.2)

| Non-goal                                              | Disposition                                  |
| ----------------------------------------------------- | -------------------------------------------- |
| Email System of Record                                | **STOP** → Deferred / 2.0                    |
| FIN-001 Financial Engine                              | **STOP** → Deferred / 2.0                    |
| Workflow Execute unlock                               | **STOP** → Deferred / Owner unlock programme |
| Platform redesign / SDK unfreeze                      | **STOP**                                     |
| Support 2.0 Major                                     | Deferred → 2.0 planning                      |
| Marketing assets / customer portals / billing engines | Not engineering 1.2                          |
| AI Assist / predictive Analytics                      | Innovation / later                           |

## Exit criteria for Platform 1.2.0 (planning definition)

1. Named 1.2 delivery programmes Accepted per PDS.
2. Themes A–C complete (minimum bar).
3. Themes D–E complete or Owner-waived with KL update.
4. Portfolio certification pack for **1.2.0** (future programme) with updated KL.
5. No STOP theme implemented without separate Owner Approval.
