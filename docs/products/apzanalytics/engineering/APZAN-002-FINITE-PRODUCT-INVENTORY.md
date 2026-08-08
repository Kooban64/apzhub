# APZAN-002 — APZ Analytics Finite Product Inventory

| Field       | Value                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Document    | **APZAN-002**                                                                    |
| Kind        | Finite closeout inventory — **ACCEPTED**                                         |
| Timestamp   | 20260808T185000Z                                                                 |
| Assessment  | [APZAN-001-PRODUCT-ASSESSMENT.md](./APZAN-001-PRODUCT-ASSESSMENT.md)             |
| Authority   | [OWNER-DECISION-APZAN-002-INVENTORY.md](./OWNER-DECISION-APZAN-002-INVENTORY.md) |
| Workstreams | [APZAN-003-ENGINEERING-WORKSTREAMS.md](./APZAN-003-ENGINEERING-WORKSTREAMS.md)   |
| Method      | APZHUB Delivery Standard v1.0 — same as Projects · APZQEP · Workflow · Support   |
| Success     | **APZ Analytics Version 1.0 – Production Ready**                                 |
| Engineering | **COMPLETE** — Production Ready · CLOSED · Operational Learning                  |

**Delivery standard:** [../../APZHUB-DELIVERY-STANDARD.md](../../APZHUB-DELIVERY-STANDARD.md)  
**Product face:** [../PRODUCT-STATUS.md](../PRODUCT-STATUS.md)  
**Known limitations (input):** [../../apz-analytics/KNOWN-LIMITATIONS.md](../../apz-analytics/KNOWN-LIMITATIONS.md)

---

## Assessment summary

```text
APZ Analytics

Classification:
A – Mostly Complete

Production Ready Definition:
Permissioned users can enter APZ Analytics as Decision Companion, answer curated
enterprise questions via Workbench on a durable fail-closed path, with honest
limitation disclosure, H1–H5 hardening, Owner release decision, and tag
apz-analytics-1.0.

Remaining Inventory → this document

Recommendation:
Accepted — Begin Engineering → Production Ready v1.0.
```

**Owner decision:** [OWNER-DECISION-APZAN-002-INVENTORY.md](./OWNER-DECISION-APZAN-002-INVENTORY.md) — **ACCEPTED** · Engineering **AUTHORISED**.

---

## Explicitly out of scope (do not invent)

- Analytics 2.0 / AI / predictive / ML
- SQL builder / external BI as primary
- Live embed programmes beyond disposition (prefer honest “metadata only”)
- Native N-05 or programme reopen
- Architecture redesign without ADR
- Other portfolio products

---

## Phase 1 — Remaining Product Functionality

| ID            | Description                                                                                                                 | Status     | Complexity | Acceptance                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | -------------------------------------------------------------------------------------------- |
| **ANA-P1-01** | Single authoritative Production Ready status face (reconcile Operational / SemVer PRWL / RI #006)                           | **Closed** | S          | [evidence/ANA-P1-01-PRODUCT-STATUS-FACE.md](./evidence/ANA-P1-01-PRODUCT-STATUS-FACE.md)     |
| **ANA-P1-02** | Honest limitation disclosure in product UI/help (embed, registry, search, Metabase foundation, alerting)                    | **Closed** | S          | [evidence/ANA-P1-02-LIMITATION-DISCLOSURE.md](./evidence/ANA-P1-02-LIMITATION-DISCLOSURE.md) |
| **ANA-P1-03** | Core Decision Companion daily path — Home → Question/Insight → decision surfaces for permissioned user (fix residuals only) | **Closed** | M          | [evidence/ANA-P1-03-DAILY-PATH.md](./evidence/ANA-P1-03-DAILY-PATH.md)                       |
| **ANA-P1-04** | Operator surfaces honesty — datasets/reports/health/diagnostics admin-gated; no false complete embed affordances            | **Closed** | S          | [evidence/ANA-P1-04-OPERATOR-SURFACES.md](./evidence/ANA-P1-04-OPERATOR-SURFACES.md)         |

**Phase 1 exit:** ANA-P1-01…04 Closed or Owner-deferred in writing.

---

## Phase 2 — Production Readiness

| ID            | Description                                                                                                      | Status     | Complexity | Acceptance                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ---------------------------------------------------------------------------------------------- |
| **ANA-PR-01** | Fail-closed when Metabase/DB unavailable — no silent degrade                                                     | **Closed** | M          | [evidence/ANA-PR-01-FAIL-CLOSED.md](./evidence/ANA-PR-01-FAIL-CLOSED.md)                       |
| **ANA-PR-02** | Registry durability disposition — Postgres in production **or** documented PRWL with fail-closed test/prod split | **Closed** | M          | [evidence/ANA-PR-02-REGISTRY-DURABILITY.md](./evidence/ANA-PR-02-REGISTRY-DURABILITY.md)       |
| **ANA-PR-03** | Live embed disposition — ship minimal operable path **or** formally keep “metadata only” with honest UI          | **Closed** | S          | [evidence/ANA-PR-03-EMBED-DISPOSITION.md](./evidence/ANA-PR-03-EMBED-DISPOSITION.md)           |
| **ANA-PR-04** | Migration / schema verification for Analytics-related platform tables                                            | **Closed** | M          | [evidence/ANA-PR-04-MIGRATION-VERIFICATION.md](./evidence/ANA-PR-04-MIGRATION-VERIFICATION.md) |
| **ANA-PR-05** | API authz sweep on `/api/v1/analytics*` — fail-closed session permissions                                        | **Closed** | M          | [evidence/ANA-PR-05-API-AUTHZ.md](./evidence/ANA-PR-05-API-AUTHZ.md)                           |
| **ANA-PR-06** | Ops readiness pack — health, adapter unhealthy runbook, feature flags, backup notes                              | **Closed** | S          | [evidence/ANA-PR-06-OPS-READINESS.md](./evidence/ANA-PR-06-OPS-READINESS.md)                   |

**Phase 2 exit:** ANA-PR-01…06 Closed or Owner-waived.

---

## Phase 3 — Hardening

| ID         | Description                                                  | Status     | Complexity | Acceptance                                                                   |
| ---------- | ------------------------------------------------------------ | ---------- | ---------- | ---------------------------------------------------------------------------- |
| **ANA-H1** | Playwright product journeys (happy path + denied path)       | **Closed** | M          | [evidence/ANA-H1-PRODUCT-JOURNEYS.md](./evidence/ANA-H1-PRODUCT-JOURNEYS.md) |
| **ANA-H2** | Accessibility (axe Critical/Serious = 0 on primary surfaces) | **Closed** | M          | [evidence/ANA-H2-ACCESSIBILITY.md](./evidence/ANA-H2-ACCESSIBILITY.md)       |
| **ANA-H3** | Performance smoke (warm-shell budgets)                       | **Closed** | S          | [evidence/ANA-H3-PERFORMANCE.md](./evidence/ANA-H3-PERFORMANCE.md)           |
| **ANA-H4** | Security residual — authz + tenant binding evidence          | **Closed** | M          | [evidence/ANA-H4-SECURITY.md](./evidence/ANA-H4-SECURITY.md)                 |
| **ANA-H5** | Operational hardening — runbook exercised                    | **Closed** | S          | [evidence/ANA-H5-OPERATIONAL.md](./evidence/ANA-H5-OPERATIONAL.md)           |

**Phase 3 exit:** ANA-H1…H5 Closed → Release Candidate.

---

## Phase 4 — Release

| ID            | Description                                                             | Status     | Complexity | Acceptance                                                                                          |
| ------------- | ----------------------------------------------------------------------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------- |
| **ANA-RL-01** | Release notes + Admin/User/Ops guides (thin pack)                       | **Closed** | S          | [../release-1.0/](../release-1.0/)                                                                  |
| **ANA-RL-02** | Engineering evidence index (Phase 1–3)                                  | **Closed** | S          | [../release-1.0/ENGINEERING-EVIDENCE-PACK.md](../release-1.0/ENGINEERING-EVIDENCE-PACK.md)          |
| **ANA-RL-03** | Owner Release Decision — Production Ready                               | **Closed** | S          | [../release-1.0/OWNER-RELEASE-DECISION.md](../release-1.0/OWNER-RELEASE-DECISION.md) — RC1 APPROVED |
| **ANA-RL-04** | Git tag `apz-analytics-1.0` + freeze branch `release/apz-analytics-1.0` | **Closed** | S          | Tag + freeze branch published                                                                       |
| **ANA-RL-05** | Portfolio scoreboard → Production Ready; Operational Learning           | **Closed** | S          | [../../APZHUB-PORTFOLIO-STATUS.md](../../APZHUB-PORTFOLIO-STATUS.md)                                |

**Phase 4 exit:** Owner decision + tag + scoreboard → **Production Ready · CLOSED**.

---

## Reporting cadence (during Engineering Execution)

Report only: **Closed / In Progress / Remaining** against ANA-\* IDs.

---

## Owner decision required

| Decision                    | Recommendation                                    |
| --------------------------- | ------------------------------------------------- |
| Accept this inventory       | **Accept** → Begin Engineering                    |
| Production Ready target     | **v1.0** elevate (not Analytics 2.0)              |
| Embed / registry durability | Prefer **honest disposition** over new programmes |

**Accepted.** Engineering Execution is authorised. Work inventory items only.
