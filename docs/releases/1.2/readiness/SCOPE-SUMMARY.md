# APZHUB Release 1.2 — Scope Summary

> **Programme:** APZHUB-1.2-008  
> **Date:** 2026-07-20  
> **Authority:** Owner-authorised programmes APZHUB-1.2-001…007 · [RELEASE-1.2-PLAN](../../1.2-planning/RELEASE-1.2-PLAN.md) · [IMPLEMENTATION-BACKLOG](../../1.2-planning/IMPLEMENTATION-BACKLOG.md)

---

## 1. Authorised P0 engineering scope (complete)

| Theme                   | Programme      | Backlog       | Status                |
| ----------------------- | -------------- | ------------- | --------------------- |
| Planning                | APZHUB-1.2-001 | —             | **ACCEPTED / CLOSED** |
| A — Ops maturity        | APZHUB-1.2-002 | R12-OPS-01    | **ACCEPTED / CLOSED** |
| A — Ops maturity        | APZHUB-1.2-003 | R12-OPS-02    | **ACCEPTED / CLOSED** |
| A — Ops maturity        | APZHUB-1.2-004 | R12-OPS-03    | **ACCEPTED / CLOSED** |
| B — Search completeness | APZHUB-1.2-005 | R12-SEARCH-01 | **ACCEPTED / CLOSED** |
| B — Search completeness | APZHUB-1.2-006 | R12-SEARCH-02 | **ACCEPTED / CLOSED** |
| C — TCMS CI adjacency   | APZHUB-1.2-007 | R12-TCMS-01   | **ACCEPTED / CLOSED** |

Owner Decision (APZHUB-1.2-008): _“All approved Release 1.2 P0 engineering work has been completed. Engineering is now paused.”_

Remaining approved P0 backlog count: **0**.

---

## 2. Delivered capability summary

1. **Operational maturity** — backup restore drill + evidence; alert policy catalogue + runbook depth; host coexistence capacity controls (ports / thresholds / audit).
2. **Unified Search completeness (additive)** — `@apzhub/search-time` and `@apzhub/search-law` publication adapters; additive Search product ids `time` and `law`; Search Architecture Freeze retained.
3. **TCMS CI adjacency** — `@apzhub/integration-gitlab-ci` metadata/read-only Reference Adapter + platform providers / composition factory; mirrors GHA posture; mutations unsupported.

---

## 3. Explicitly out of approved P0 engineering (retained / deferred)

| Item                                                                              | Lane                                 |
| --------------------------------------------------------------------------------- | ------------------------------------ |
| Theme D — Automation journal / Law session → Postgres SoR (R12-PERSIST-01/02)     | P1 — **waived for 1.2.0 cert entry** |
| Theme E — Support webhook ingress / binary attachments (R12-SUP-01/02)            | P1 — **waived for 1.2.0 cert entry** |
| R12-QA-01 Playwright/Docker portfolio re-cert path                                | P1                                   |
| R12-AUTO-01 selective AU-* intents                                                | P1                                   |
| R12-SEC-01 / R12-COMP-01                                                          | P1                                   |
| Product P2 slices (Law UX, Time adjacency, Projects depth, Analytics embed, etc.) | P2 / later                           |
| Email System of Record                                                            | **STOP** → 2.0                       |
| FIN-001 Financial Engine                                                          | **STOP** → 2.0                       |
| Workflow / n8n Execute unlock                                                     | **STOP** → Owner unlock              |
| Platform redesign / Integration SDK unfreeze                                      | **STOP**                             |
| Support 2.0 Major · AI Assist                                                     | Deferred / gated                     |

---

## 4. Certification packaging scope (next — not this programme)

This readiness programme does **not** create `docs/releases/platform/1.2.0/`.  
A subsequent Owner-approved certification programme shall:

- Package Platform **1.2.0** (and any approved product SemVer alignments)
- Carry the Known Limitations register (PRWL)
- Confirm certification class
- Update PORTFOLIO-RELEASE-REGISTER
- Not reopen STOP items or implement P1 without new Approval
