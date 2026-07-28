# APZHUB Release 1.1 — Scope Summary

> **Programme:** APZHUB-1.1-005  
> **Date:** 2026-07-20  
> **Authority:** Owner-authorised programmes APZHUB-1.1-001…004 · [RELEASE-1.1-ROADMAP](../../1.1-planning/RELEASE-1.1-ROADMAP.md)

---

## 1. Authorised engineering scope (complete)

| Theme                                                        | Programme      | Status                |
| ------------------------------------------------------------ | -------------- | --------------------- |
| R11-LAW-02 / P0-1 — OBS-LAW-01 AuthZ wiring                  | APZHUB-1.1-001 | **ACCEPTED / CLOSED** |
| R11-LAW-03 / P0-2 (persistence) — OBS-LAW-02                 | APZHUB-1.1-002 | **ACCEPTED / CLOSED** |
| R11-SUP-01 / P0-3 — Support Event Bus + in-app notifications | APZHUB-1.1-003 | **ACCEPTED / CLOSED** |
| R11-XPR-01 / P0-4 — Cross-product automation foundation      | APZHUB-1.1-004 | **ACCEPTED / CLOSED** |

Owner Decision (APZHUB-1.1-005): _“The planned Release 1.1 engineering programmes are complete.”_

---

## 2. Delivered capability summary

1. **Law security honesty** — pattern-aware permissions; no allow-all / `*` injection on Law AuthZ path.
2. **Law operational durability** — platform-owned persisted ENF/ATF session stores (browser-scoped; Postgres projections remain future).
3. **Platform Event Bus + Notification Attention** — Support catalogue publish + ENF Attention wire; reusable for products.
4. **Cross-Product Automation Foundation** — platform registration, event-driven handlers, workflow-trigger intents deferred while execute gated.

---

## 3. Explicitly out of Release 1.1 engineering (retained)

| Item                                                              | Lane                              |
| ----------------------------------------------------------------- | --------------------------------- |
| FIN-001 Financial Engine extraction                               | 2.0 / Innovation                  |
| Email System of Record                                            | 2.0 / Innovation                  |
| Workflow / n8n provider execute unlock                            | Future Owner + ADR                |
| Support webhook ingress · binary attachments · realtime WS/SSE    | Future named programme            |
| Product AU-* automations (e.g. Support→Projects task create)      | Future Owner Approval             |
| Law placeholder UX polish (R11-LAW-01)                            | Optional enhance — not authorised |
| Time / Analytics / TCMS / Documents / Projects selective enhances | Not authorised as 1.1 programmes  |
| Release 1.2 features                                              | STOP                              |

---

## 4. Certification packaging scope (next — not this programme)

This readiness programme does **not** create `docs/releases/platform/1.1.0/`.  
A subsequent Owner-approved certification programme shall:

- Package Platform **1.1.0** (and any approved product SemVer alignments)
- Carry the Known Limitations register
- Confirm PRWL class
- Update PORTFOLIO-RELEASE-REGISTER
- Not reopen STOP items without new Approval
