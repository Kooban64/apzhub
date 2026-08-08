# APZTIM-002 — APZ Time Finite Product Inventory

| Field       | Value                                                                  |
| ----------- | ---------------------------------------------------------------------- |
| Document    | **APZTIM-002**                                                         |
| Kind        | Finite closeout inventory — **PROPOSED · awaiting Owner acceptance**   |
| Timestamp   | 20260808T195500Z                                                       |
| Assessment  | [APZTIM-001-PRODUCT-ASSESSMENT.md](./APZTIM-001-PRODUCT-ASSESSMENT.md) |
| Method      | APZHUB Delivery Standard v1.0 — same as six Production Ready products  |
| Success     | **APZ Time Version 1.0 – Production Ready**                            |
| Engineering | **NOT authorised** until Owner Accept                                  |

**Delivery standard:** [../../APZHUB-DELIVERY-STANDARD.md](../../APZHUB-DELIVERY-STANDARD.md)  
**Product face:** [../PRODUCT-STATUS.md](../PRODUCT-STATUS.md)  
**Known limitations (input):** [../../time/KNOWN-LIMITATIONS.md](../../time/KNOWN-LIMITATIONS.md)

---

## Assessment summary

```text
APZ Time

Classification:
A – Mostly Complete

Production Ready Definition:
Permissioned users can capture/manage timesheets and related records in
/workspace/time on a durable fail-closed Kimai-backed path, with honest
limitation disclosure, H1–H5 hardening, Owner release decision, and tag
apz-time-1.0 — without Time 2.0.

Remaining Inventory → this document

Recommendation:
Accept — Begin Engineering → Production Ready v1.0
→ Portfolio Completion (before Platform Evolution).
```

---

## Explicitly out of scope (do not invent)

- Time 2.0 / approvals / reporting UI / analytics / leave / scheduling / AI
- Native programme reopen
- Architecture redesign without ADR
- Platform Evolution before Portfolio Completion freeze
- Other portfolio products

---

## Phase 1 — Remaining Product Functionality

| ID             | Description                                                                                                                             | Status | Complexity | Acceptance                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------- | ------------------------------------------------------------------------ |
| **TIME-P1-01** | Single authoritative Production Ready status face (reconcile Operational / Production ACCEPTED / RI #001 / SemVer faces)                | Open   | S          | `PRODUCT-STATUS.md` states closeout posture; conflicts marked superseded |
| **TIME-P1-02** | Honest limitation disclosure in product UI/help (PRWL: no approvals/reporting UI; partial search; no false “later” without disposition) | Open   | S          | User-visible honesty; no pretend-complete surfaces                       |
| **TIME-P1-03** | Core daily path — list → create → detail → stop/archive (fix residuals only)                                                            | Open   | M          | Documented happy path; smoke evidence; no redesign                       |
| **TIME-P1-04** | Operator surfaces honesty — settings prefs; health/diagnostics admin framing; engine branding redaction                                 | Open   | S          | Documented + UI match                                                    |

**Phase 1 exit:** TIME-P1-01…04 Closed or Owner-deferred in writing.

---

## Phase 2 — Production Readiness

| ID             | Description                                                                                                                       | Status | Complexity | Acceptance                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------- | --------------------------------------- |
| **TIME-PR-01** | Fail-closed production bootstrap — Kimai required; in-memory forbidden in production                                              | Open   | M          | Clear unavailable; evidence recorded    |
| **TIME-PR-02** | SoR durability disposition — Kimai owns business data; platform never authoritative for timesheets                                | Open   | S          | Written disposition + matching runtime  |
| **TIME-PR-03** | Partial capability disposition — reporting foundation-only, tags/search partial (honest, no half-enabled UI)                      | Open   | S          | Disposition + matching behaviour        |
| **TIME-PR-04** | Migration / schema verification — confirm no required platform Time business migrations **or** verify any connector/config tables | Open   | S          | Apply/verify PASS or N/A evidenced      |
| **TIME-PR-05** | API authz sweep on `/api/v1/time*` — catalogue vs seed vs pipeline vs nav                                                         | Open   | M          | Automated tests; unauthorised → 401/403 |
| **TIME-PR-06** | Ops readiness pack — Kimai unhealthy runbook, feature flags, backup notes for engine SoR                                          | Open   | S          | Runbook matches runtime                 |

**Phase 2 exit:** TIME-PR-01…06 Closed or Owner-waived.

---

## Phase 3 — Hardening

| ID          | Description                                                  | Status | Complexity | Acceptance                    |
| ----------- | ------------------------------------------------------------ | ------ | ---------- | ----------------------------- |
| **TIME-H1** | Playwright product journeys (happy path + denied path)       | Open   | M          | Specs green                   |
| **TIME-H2** | Accessibility (axe Critical/Serious = 0 on primary surfaces) | Open   | M          | Evidence recorded             |
| **TIME-H3** | Performance smoke (warm-shell budgets)                       | Open   | S          | Budgets met or documented     |
| **TIME-H4** | Security residual — authz + tenant binding evidence          | Open   | M          | Complements TIME-PR-05        |
| **TIME-H5** | Operational hardening — runbook exercised                    | Open   | S          | Ops can diagnose from runbook |

**Phase 3 exit:** TIME-H1…H5 Closed → Release Candidate.

---

## Phase 4 — Release

| ID             | Description                                                                                    | Status | Complexity | Acceptance                                 |
| -------------- | ---------------------------------------------------------------------------------------------- | ------ | ---------- | ------------------------------------------ |
| **TIME-RL-01** | Release notes + Admin/User/Ops guides (thin pack)                                              | Open   | S          | Under `docs/products/apztime/release-1.0/` |
| **TIME-RL-02** | Engineering evidence index (Phase 1–3)                                                         | Open   | S          | One index                                  |
| **TIME-RL-03** | Owner Release Decision — Production Ready                                                      | Open   | S          | Signed Owner decision                      |
| **TIME-RL-04** | Git tag `apz-time-1.0` + freeze branch `release/apz-time-1.0`                                  | Open   | S          | Remote backup                              |
| **TIME-RL-05** | Portfolio scoreboard → Production Ready; Operational Learning; unlock **Portfolio Completion** | Open   | S          | Scoreboard updated                         |

**Phase 4 exit:** Owner decision + tag + scoreboard → **Production Ready · CLOSED** → Portfolio Completion programme.

---

## Reporting cadence (during Engineering Execution)

Report only: **Closed / In Progress / Remaining** against TIME-\* IDs.

---

## Owner decision required

| Decision                | Recommendation                                              |
| ----------------------- | ----------------------------------------------------------- |
| Accept this inventory   | **Accept** → Begin Engineering                              |
| Defer / amend inventory | Return with written changes — no engineering until accepted |

**No APZ Time coding until Owner Accept.**
