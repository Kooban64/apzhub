# APZSUP-002 — APZ Support Finite Product Inventory

| Field       | Value                                                                              |
| ----------- | ---------------------------------------------------------------------------------- |
| Document    | **APZSUP-002**                                                                     |
| Kind        | Finite closeout inventory — **ACCEPTED**                                           |
| Timestamp   | 20260808T172500Z                                                                   |
| Assessment  | [APZSUP-001-PRODUCT-ASSESSMENT.md](./APZSUP-001-PRODUCT-ASSESSMENT.md)             |
| Authority   | [OWNER-DECISION-APZSUP-002-INVENTORY.md](./OWNER-DECISION-APZSUP-002-INVENTORY.md) |
| Workstreams | [APZSUP-003-ENGINEERING-WORKSTREAMS.md](./APZSUP-003-ENGINEERING-WORKSTREAMS.md)   |
| Method      | APZHUB Delivery Standard v1.0 — same as Projects · APZQEP · Workflow               |
| Success     | **APZ Support Version 1.0 – Production Ready**                                     |
| Engineering | **COMPLETE** — Production Ready · CLOSED · Operational Learning                    |

**Delivery standard:** [../../APZHUB-DELIVERY-STANDARD.md](../../APZHUB-DELIVERY-STANDARD.md)  
**Product face:** [../PRODUCT-STATUS.md](../PRODUCT-STATUS.md)  
**Known limitations (input):** [../../support/KNOWN-LIMITATIONS.md](../../support/KNOWN-LIMITATIONS.md)

---

## Assessment summary

```text
APZ Support

Classification:
A – Mostly Complete

Production Ready Definition:
Permissioned users can raise, follow, communicate on, and close support requests
via APZHUB Workbench on a durable fail-closed path, with honest limitation disclosure,
H1–H5 hardening, Owner release decision, and tag apz-support-1.0.

Remaining Inventory
  Phase 1 — Remaining Product Functionality
  Phase 2 — Production Readiness
  Phase 3 — Hardening
  Phase 4 — Release

Recommendation:
Accepted — Begin Engineering → Production Ready v1.0.
```

**Owner decision:** [OWNER-DECISION-APZSUP-002-INVENTORY.md](./OWNER-DECISION-APZSUP-002-INVENTORY.md) — **ACCEPTED** · Engineering **AUTHORISED**.

---

## Explicitly out of scope (do not invent)

- Support 2.0 planning / Phase-1 recommendations
- Native N-05 or programme reopen
- New support engines or CRM/billing expansion
- Architecture redesign
- Removing intentional PRWL items without Owner disposition (prefer honest disclosure over feature build)
- Other portfolio products

---

## Phase 1 — Remaining Product Functionality

| ID            | Description                                                                                                                          | Status     | Complexity | Acceptance                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | -------------------------------------------------------------------------------------------- |
| **SUP-P1-01** | Single authoritative Production Ready status face (reconcile Operational / Production PRWL / RI #002)                                | **Closed** | S          | [evidence/SUP-P1-01-PRODUCT-STATUS-FACE.md](./evidence/SUP-P1-01-PRODUCT-STATUS-FACE.md)     |
| **SUP-P1-02** | Honest limitation disclosure in product UI/help for open residuals (realtime, attachment max/delete, any false complete affordances) | **Closed** | S          | [evidence/SUP-P1-02-LIMITATION-DISCLOSURE.md](./evidence/SUP-P1-02-LIMITATION-DISCLOSURE.md) |
| **SUP-P1-03** | Core request daily path — list → open → article/communicate → status/close for permissioned user (fix residual defects only)         | **Closed** | M          | [evidence/SUP-P1-03-DAILY-PATH.md](./evidence/SUP-P1-03-DAILY-PATH.md)                       |
| **SUP-P1-04** | Attachment surface honesty — 1 MiB limit + no delete exposed (or close ENG-0004 disposition in writing)                              | **Closed** | S          | [evidence/SUP-P1-04-ATTACHMENT-HONESTY.md](./evidence/SUP-P1-04-ATTACHMENT-HONESTY.md)       |

**Phase 1 exit:** SUP-P1-01…04 Closed or Owner-deferred in writing.

---

## Phase 2 — Production Readiness

| ID            | Description                                                                                                                    | Status     | Complexity | Acceptance                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | ---------------------------------------------------------------------------------------------- |
| **SUP-PR-01** | Production bootstrap / adapter path fail-closed — no silent degrade when Zammad/DB unavailable                                 | **Closed** | M          | [evidence/SUP-PR-01-FAIL-CLOSED.md](./evidence/SUP-PR-01-FAIL-CLOSED.md)                       |
| **SUP-PR-02** | Idempotency / mapping durability disposition — Postgres in production **or** documented PRWL with fail-closed test/prod split  | **Closed** | M          | [evidence/SUP-PR-02-MAPPING-DURABILITY.md](./evidence/SUP-PR-02-MAPPING-DURABILITY.md)         |
| **SUP-PR-03** | Realtime (WS/SSE) disposition — ship minimal operable path **or** formally keep “no realtime” with honest UI (no half-enabled) | **Closed** | S          | [evidence/SUP-PR-03-REALTIME-DISPOSITION.md](./evidence/SUP-PR-03-REALTIME-DISPOSITION.md)     |
| **SUP-PR-04** | Migration / schema verification for Support-related platform tables on supported Postgres targets                              | **Closed** | M          | [evidence/SUP-PR-04-MIGRATION-VERIFICATION.md](./evidence/SUP-PR-04-MIGRATION-VERIFICATION.md) |
| **SUP-PR-05** | API authz sweep on `/api/v1/support*` — fail-closed session permissions                                                        | **Closed** | M          | [evidence/SUP-PR-05-API-AUTHZ.md](./evidence/SUP-PR-05-API-AUTHZ.md)                           |
| **SUP-PR-06** | Ops readiness pack — health, adapter unhealthy runbook, feature flags, backup notes                                            | **Closed** | S          | [evidence/SUP-PR-06-OPS-READINESS.md](./evidence/SUP-PR-06-OPS-READINESS.md)                   |

**Phase 2 exit:** SUP-PR-01…06 Closed or Owner-waived.

---

## Phase 3 — Hardening

| ID         | Description                                                  | Status     | Complexity | Acceptance                                                                   |
| ---------- | ------------------------------------------------------------ | ---------- | ---------- | ---------------------------------------------------------------------------- |
| **SUP-H1** | Playwright product journeys (happy path + denied path)       | **Closed** | M          | [evidence/SUP-H1-PRODUCT-JOURNEYS.md](./evidence/SUP-H1-PRODUCT-JOURNEYS.md) |
| **SUP-H2** | Accessibility (axe Critical/Serious = 0 on primary surfaces) | **Closed** | M          | [evidence/SUP-H2-ACCESSIBILITY.md](./evidence/SUP-H2-ACCESSIBILITY.md)       |
| **SUP-H3** | Performance smoke (warm-shell budgets)                       | **Closed** | S          | [evidence/SUP-H3-PERFORMANCE.md](./evidence/SUP-H3-PERFORMANCE.md)           |
| **SUP-H4** | Security residual — authz + tenant binding evidence          | **Closed** | M          | [evidence/SUP-H4-SECURITY.md](./evidence/SUP-H4-SECURITY.md)                 |
| **SUP-H5** | Operational hardening — runbook exercised                    | **Closed** | S          | [evidence/SUP-H5-OPERATIONAL.md](./evidence/SUP-H5-OPERATIONAL.md)           |

**Phase 3 exit:** SUP-H1…H5 Closed → Release Candidate.

---

## Phase 4 — Release

| ID            | Description                                                         | Status     | Complexity | Acceptance                                                                                          |
| ------------- | ------------------------------------------------------------------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------- |
| **SUP-RL-01** | Release notes + Admin/User/Ops guides (thin pack)                   | **Closed** | S          | [../release-1.0/](../release-1.0/)                                                                  |
| **SUP-RL-02** | Engineering evidence index (Phase 1–3)                              | **Closed** | S          | [../release-1.0/ENGINEERING-EVIDENCE-PACK.md](../release-1.0/ENGINEERING-EVIDENCE-PACK.md)          |
| **SUP-RL-03** | Owner Release Decision — Production Ready                           | **Closed** | S          | [../release-1.0/OWNER-RELEASE-DECISION.md](../release-1.0/OWNER-RELEASE-DECISION.md) — RC1 APPROVED |
| **SUP-RL-04** | Git tag `apz-support-1.0` + freeze branch `release/apz-support-1.0` | **Closed** | S          | Tag + freeze branch published                                                                       |
| **SUP-RL-05** | Portfolio scoreboard → Production Ready; Operational Learning       | **Closed** | S          | [../../APZHUB-PORTFOLIO-STATUS.md](../../APZHUB-PORTFOLIO-STATUS.md)                                |

**Phase 4 exit:** Owner decision + tag + scoreboard → **Production Ready · CLOSED**.

---

## Reporting cadence (during Engineering Execution)

Report only: **Closed / In Progress / Remaining** against SUP-\* IDs.

---

## Owner decision required

| Decision                       | Recommendation                                    |
| ------------------------------ | ------------------------------------------------- |
| Accept this inventory          | **Accept** → Begin Engineering                    |
| Production Ready target        | **v1.0** elevate (not Support 2.0)                |
| Realtime / durable idempotency | Prefer **honest disposition** over new programmes |

**Accepted.** Engineering Execution is authorised. Work inventory items only.
