# Owner Decision — APZ Knowledge Version 1.0

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| Date           | 2026-08-08                                   |
| Document       | **OWNER-RELEASE-DECISION**                   |
| Decision       | **Release Candidate 1 APPROVED**             |
| Release status | **PRODUCTION READY** · **CLOSED**            |
| Engineering    | **COMPLETE**                                 |
| Product phase  | **OPERATIONAL LEARNING**                     |
| Target         | APZ Knowledge Version 1.0 – Production Ready |

---

## Summary

Owner reviewed RC1 together with supporting engineering evidence against the accepted APZKNW-002 inventory, Production Readiness requirements, and Hardening Plan under **APZHUB Delivery Standard v1.0**. Acceptance criteria for Version 1.0 are satisfied.

Noted dispositions (overlays deferred, AI/RAG out, Postgres fail-closed, `requireKnowledgePermission`, diagnostics operator-only, store unhealthy runbook) are accepted product characteristics for Production Ready v1.0 — not release blockers.

---

## Owner acceptance

| Area                     | Status                        |
| ------------------------ | ----------------------------- |
| Product Functionality    | **COMPLETE** (KNW-P1-01…04)   |
| Production Readiness     | **COMPLETE** (KNW-PR-01…06)   |
| H1 Functional Regression | **COMPLETE** (4/4 Playwright) |
| H2 Accessibility         | **COMPLETE**                  |
| H3 Performance           | **COMPLETE**                  |
| H4 Security              | **COMPLETE**                  |
| H5 Operational Readiness | **COMPLETE**                  |

---

## Release disposition

Deferred by design (Knowledge 2.0 / Product Board only):

- Consumer overlays in other products
- AI / RAG / chat productisation
- Native N-05 or programme reopen
- Architecture change without ADR

Version 1.0 shall not expand except:

- Production defects
- Security vulnerabilities
- Critical operational hotfixes

---

## Authorised release actions

- Record this Owner Decision
- Create Version 1.0 production tag (`apz-knowledge-1.0`)
- Freeze Version 1.0 release branch (`release/apz-knowledge-1.0`)
- Publish Release Notes · Administrator · User · Operations guides
- Publish Engineering Evidence Pack
- Update APZHUB Portfolio Status
- Transition to **Operational Learning**

---

## Product lifecycle

APZ Knowledge enters **Operational Learning**.

Future investment driven by operational evidence, product learning, and approved Product Board investment. Version 1.0 is the production baseline.

---

## Owner direction

APZ Knowledge Version 1.0 is hereby declared **PRODUCTION READY** and **CLOSED**.

Engineering is authorised to transition to the next approved APZHUB product per portfolio execution order (**APZ Time**).

The APZHUB Delivery Standard remains the governing delivery methodology — no amendments required. Six Production Ready products confirm the standard as the stable engineering model for the portfolio.

After APZ Time reaches Production Ready: formal **Portfolio Completion** close-out and freeze — only then **APZHUB Platform Evolution**.
