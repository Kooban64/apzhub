# Owner Decision — APZ Support Version 1.0

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| Date           | 2026-08-08                                 |
| Document       | **OWNER-RELEASE-DECISION**                 |
| Decision       | **Release Candidate 1 APPROVED**           |
| Release status | **PRODUCTION READY** · **CLOSED**          |
| Engineering    | **COMPLETE**                               |
| Product phase  | **OPERATIONAL LEARNING**                   |
| Target         | APZ Support Version 1.0 – Production Ready |

---

## Summary

Owner reviewed RC1 together with supporting engineering evidence against the accepted APZSUP-002 inventory, Production Readiness requirements, and Hardening Plan under **APZHUB Delivery Standard v1.0**. Acceptance criteria for Version 1.0 are satisfied.

Noted dispositions (realtime feature-gated, Support mapping CHECK, `requireSupportPermission`, attachment 1 MiB / no delete) are accepted product characteristics for Production Ready v1.0 — not release blockers.

---

## Owner acceptance

| Area                     | Status                      |
| ------------------------ | --------------------------- |
| Product Functionality    | **COMPLETE** (SUP-P1-01…04) |
| Production Readiness     | **COMPLETE** (SUP-PR-01…06) |
| H1 Functional Regression | **COMPLETE**                |
| H2 Accessibility         | **COMPLETE**                |
| H3 Performance           | **COMPLETE**                |
| H4 Security              | **COMPLETE**                |
| H5 Operational Readiness | **COMPLETE**                |

---

## Release disposition

Deferred by design (Support 2.0 / Product Board only):

- Product realtime enablement (flags remain deny-by-default)
- Attachment delete / >1 MiB
- Native N-05 or programme reopen
- New engines or redesign
- Architecture change without ADR

Version 1.0 shall not expand except:

- Production defects
- Security vulnerabilities
- Critical operational hotfixes

---

## Authorised release actions

- Record this Owner Decision
- Create Version 1.0 production tag (`apz-support-1.0`)
- Freeze Version 1.0 release branch (`release/apz-support-1.0`)
- Publish Release Notes · Administrator · User · Operations guides
- Publish Engineering Evidence Pack
- Update APZHUB Portfolio Status
- Transition to **Operational Learning**

---

## Product lifecycle

APZ Support enters **Operational Learning**.

Future investment driven by operational evidence, product learning, and approved Product Board investment. Version 1.0 is the production baseline.

---

## Owner direction

APZ Support Version 1.0 is hereby declared **PRODUCTION READY** and **CLOSED**.

Engineering is authorised to transition to the next approved APZHUB product per portfolio execution order (APZ Analytics → Knowledge → Time).

The APZHUB Delivery Standard remains the governing delivery methodology — no amendments required. With four Production Ready products, remaining portfolio work is routine execution of the established standard.
