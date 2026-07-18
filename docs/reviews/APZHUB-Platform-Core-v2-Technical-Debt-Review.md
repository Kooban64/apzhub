# APZHUB Platform Core v2 — Technical Debt Review

**Milestone:** PRH-011  
**Date:** 2026-07-09  
**Register:** [Platform Technical Debt Register](../architecture/APZHUB-Platform-Technical-Debt-Register.md)

---

## Summary

PRH-001–PRH-010 closed critical bootstrap, security, tenant isolation, operations, lifecycle, and reliability gaps. Remaining debt is **documented and prioritised** — none block Platform Core v2 certification.

---

## Closed in PCv2-01 (PRH-001–PRH-010)

| ID         | Item                              | Closed by |
| ---------- | --------------------------------- | --------- |
| TD-M16-C01 | App bootstrap duplicated          | PRH-001   |
| TD-P09     | ALS session wiring gaps           | PRH-007   |
| TD-P10     | RLS cross-tenant denial tests     | PRH-007   |
| DEP-001    | Lifecycle/operations circular dep | PRH-011   |

---

## Open — platform-critical

| ID         | Priority | Item                           | Blocks certification?           |
| ---------- | -------- | ------------------------------ | ------------------------------- |
| TD-P18     | High     | Outbox workers not implemented | No — async processing           |
| TD-P19     | High     | Event replay not implemented   | No                              |
| TD-M16-M02 | Medium   | No GitHub Actions CI           | No — quality gates pass locally |
| TD-M16-M01 | Medium   | Law schema in `@apzhub/config` | No — documented coupling        |

---

## Open — product / commercial

| ID         | Priority | Item                           |
| ---------- | -------- | ------------------------------ |
| TD-T06     | High     | No bank feeds / reconciliation |
| TD-T04     | Medium   | Playwright E2E not green in CI |
| TD-L011-02 | High     | Mark Paid status-only          |

---

## Open — API / security hardening

| ID          | Source  | Item                                                 |
| ----------- | ------- | ---------------------------------------------------- |
| OBS-PCv2-01 | PRH-011 | Incomplete permission guards on some platform routes |

---

## Operations visibility

Open items surfaced in control plane technical debt panel (`packages/platform-operations/src/technical-debt-ops.ts`) — 8 curated entries linked to full register.

---

## Recommendation

No new critical debt introduced by PRH-008–PRH-011. Prioritise TD-P18/TD-M16-M02 before OSS integration wave.

---

## Related

- [Platform Core v2 Certification](./APZHUB-Platform-Core-v2-Certification.md)
- [Commercial Readiness Update](./APZHUB-Platform-Core-v2-Commercial-Readiness-Update.md)
