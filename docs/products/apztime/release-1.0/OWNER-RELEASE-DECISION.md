# Owner Decision — APZ Time Version 1.0

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| Date           | 2026-08-08                              |
| Document       | **OWNER-RELEASE-DECISION**              |
| Decision       | **Release Candidate 1 APPROVED**        |
| Release status | **PRODUCTION READY** · **CLOSED**       |
| Engineering    | **COMPLETE**                            |
| Product phase  | **OPERATIONAL LEARNING**                |
| Target         | APZ Time Version 1.0 – Production Ready |

---

## Summary

Owner reviewed RC1 together with supporting engineering evidence against the accepted APZTIM-002 inventory, Production Readiness requirements, and Hardening Plan under **APZHUB Delivery Standard v1.0**. Acceptance criteria for Version 1.0 are satisfied.

Noted dispositions (PRWL exclusions, production in-memory forbidden, `requireTimePermission`, workbench/product ready flags, keyboard-accessible table, adapter unhealthy runbook) are accepted product characteristics for Production Ready v1.0 — not release blockers.

---

## Owner acceptance

| Area                     | Status                        |
| ------------------------ | ----------------------------- |
| Product Functionality    | **COMPLETE** (TIME-P1-01…04)  |
| Production Readiness     | **COMPLETE** (TIME-PR-01…06)  |
| H1 Functional Regression | **COMPLETE** (4/4 Playwright) |
| H2 Accessibility         | **COMPLETE**                  |
| H3 Performance           | **COMPLETE**                  |
| H4 Security              | **COMPLETE**                  |
| H5 Operational Readiness | **COMPLETE**                  |

---

## Release disposition

Deferred by design (Time 2.0 / Product Board only):

- Approvals · reporting UI · analytics · dashboards · leave · scheduling · AI
- Native programme reopen
- Architecture change without ADR

Version 1.0 shall not expand except:

- Production defects
- Security vulnerabilities
- Critical operational hotfixes

---

## Authorised release actions

- Record this Owner Decision
- Create Version 1.0 production tag (`apz-time-1.0`)
- Freeze Version 1.0 release branch (`release/apz-time-1.0`)
- Publish Release Notes · Administrator · User · Operations guides
- Publish Engineering Evidence Pack
- Update APZHUB Portfolio Status (7/7 Production Ready)
- Transition to **Operational Learning**
- Open **Portfolio Completion** (PORT-001…005) — Platform Evolution remains out of scope until PORT-005

---

## Product lifecycle

APZ Time enters **Operational Learning**.

Future investment driven by operational evidence, product learning, and approved Product Board investment. Version 1.0 is the production baseline.

---

## Owner direction

APZ Time Version 1.0 is hereby declared **PRODUCTION READY** and **CLOSED**.

With this approval, the original APZHUB product portfolio is functionally complete (seven of seven). Engineering is authorised to open **Portfolio Completion** — not Platform Evolution — until PORT-005 is closed.

The APZHUB Delivery Standard remains the governing delivery methodology — no amendments required.
