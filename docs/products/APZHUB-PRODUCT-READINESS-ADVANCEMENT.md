# APZHUB Product Readiness Advancement

> **Programme:** APZHUB-PRODUCTS-003  
> **Classification:** Documentation only  
> **Prerequisite:** [APZHUB-PRODUCTS-002](./APZHUB-PRODUCT-PORTFOLIO-READINESS-SUMMARY.md) **ACCEPTED**  
> **Status:** Complete — awaiting Owner review  
> **Rule:** Does not authorise implementation. Does not invent programme IDs. Does not invent functionality.

---

## 1. Purpose

Select **one** portfolio product with the highest combination of business value, technical readiness, platform readiness, user impact, and lowest implementation risk — using repository documentation only — and advance that product to **Implementation Ready**.

---

## 2. Product Evaluation Matrix

Scores: **1** (lowest) … **5** (highest).  
**Risk** is inverted for selection: **5** = lowest implementation risk.

| Product          | Business value | Technical readiness | Platform readiness | User impact | Lowest impl. risk | **Composite** | Current maturity   | Eligible for IR advancement? |
| ---------------- | -------------: | ------------------: | -----------------: | ----------: | ----------------: | ------------: | ------------------ | ---------------------------- |
| **APZ Projects** |              5 |                   5 |                  5 |           5 |                 5 |        **25** | Architecture Ready | **Yes**                      |
| Law Platform     |              5 |                   4 |                  5 |           5 |                 3 |        **22** | In Development     | No — already past IR         |
| APZ Support      |              4 |                   5 |                  5 |           5 |                 4 |        **23** | Production         | No — already past IR         |
| APZ Documents    |              4 |                   5 |                  5 |           4 |                 4 |        **22** | Production         | No — already past IR         |
| APZ Workflow     |              4 |                   5 |                  5 |           4 |                 3 |        **21** | Production         | No — already past IR         |
| APZ Time         |              4 |                   5 |                  5 |           4 |                 4 |        **22** | **Production**     | **1.0.0** ACCEPTED / CLOSED  |
| APZ Analytics    |              3 |                   1 |                  2 |           3 |                 1 |        **10** | Concept            | No — concept only            |

### Scoring notes (repository evidence)

| Product                            | Evidence basis                                                                                                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **APZ Projects**                   | Plane adapter **0.6.0** certified (OSS-101 Wave 1); `project-service` + HTTP + search provider on disk; Workbench/IAM/Gateway/Events available; only deferred item is product UI |
| Law Platform                       | Highest commercial value; LAW milestones closed; already **In Development** — not a candidate to _advance into_ IR                                                               |
| APZ Support / Documents / Workflow | Certified Production slices (with limitations) — already past IR                                                                                                                 |
| APZ Time                           | Kimai **0.2.0** + services **0.26.1** + HTTP **1.10.0** + Workbench **1.0.0** Phase 1 — **Production** (**ACCEPTED / CLOSED**)                                                   |
| APZ Analytics                      | Metabase + Analytics service **absent**                                                                                                                                          |

### Dimension checklist (all products)

| Dimension                        | Projects                    | Time                                      | Support               | Documents          | Analytics       | Workflow           | Law                        |
| -------------------------------- | --------------------------- | ----------------------------------------- | --------------------- | ------------------ | --------------- | ------------------ | -------------------------- |
| Business justification           | Strong                      | Strong                                    | Strong                | Strong             | Moderate        | Strong             | Strongest                  |
| Product completeness             | Adapter+service; UI open    | Stack ready; Workbench open               | Certified PRWL        | Certified PRWL     | Absent          | Certified PRWL     | Deep vertical; polish open |
| Architecture completeness        | Frozen Wave 1               | Pack + Kimai domain ACCEPTED              | Closed Wave 2         | Frozen             | Absent          | Frozen             | Reference + LAW            |
| Dependency readiness             | Available                   | Available (Kimai 0.2.0 + services + HTTP) | Available             | Available          | Missing         | Available          | Available                  |
| Platform capability availability | Ready                       | Ready; Workbench open                     | Ready                 | Ready              | Partial         | Ready              | Ready                      |
| Integration maturity             | Certified Plane             | Kimai CERTIFIED_DOMAIN                    | Certified Zammad      | Platform Documents | Metabase absent | Engine frozen      | Native SoR                 |
| Operational readiness            | Partial (needs UI/ops)      | Partial (needs Workbench)                 | Partial (limitations) | Partial            | Fail            | Partial            | Partial                    |
| Testing readiness                | Adapter suites; UI deferred | Layer pass; product Playwright open       | Pass                  | Pass               | Fail            | Pass               | Pass (placeholders)        |
| Certification readiness          | Adapter certified; UI open  | Layer certs; product cert open            | Pass (limitations)    | Pass (limitations) | Fail            | Pass (limitations) | Partial (validation)       |
| Delivery complexity              | **Low** (UI on ready stack) | **Low–Medium** (Workbench on ready stack) | N/A (Production)      | N/A                | **Highest**     | N/A                | Ongoing validation         |

---

## 3. Recommended product

# APZ Projects

**Only product advanced by this programme.**

---

## 4. Why it was selected

1. **Highest composite score (25/25)** among products eligible to advance into Implementation Ready.
2. **Technical + platform readiness:** certified Plane reference adapter, platform project service, gateway path, search provider, and closed Platform Foundation — no greenfield integration programme required first.
3. **Business value + user impact:** core delivery spine (projects/tasks/sprints) for PMs and engineers; feeds Search, Notifications, Activity.
4. **Lowest implementation risk:** remaining work is product Workbench UI productisation on an already-certified adapter/service path — not a new engine, not a new SDK break, not a new SoR.
5. **Maturity fit:** sole portfolio product at **Architecture Ready**; Production / In Development products are already past Implementation Ready; Time and Analytics cannot reach IR without substantial platform/integration delivery.

Law Platform ranks high on commercial value but is already **In Development** — PRODUCTS-003 advances readiness _into_ Implementation Ready, not sideways from a later stage.

---

## 5. Remaining gaps preventing implementation

These gaps **do not block Implementation Ready**. They are the scope of a future **Owner-approved** product implementation programme. **No programme ID is invented here.**

| Gap                                              | Evidence                                          | Blocks                                                       |
| ------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------ |
| Projects Workbench UI not delivered              | Portfolio · pack KNOWN-LIMITATIONS · ARCHITECTURE | Starting code without Owner Approval of a named programme    |
| Product UI test / certification suites           | IMPLEMENTATION-READINESS (was PARTIAL)            | Product **Production** certification of UI                   |
| Ops runbooks for deployed Plane + product UI     | Operational PARTIAL notes                         | Full operational Production posture                          |
| Optional Plane capabilities (analytics/webhooks) | Outside Wave 1 certification                      | Expansion beyond certified adapter scope (needs ADR + Owner) |
| Explicit Owner Approval of a named programme     | Phase 3 / lifecycle rule                          | **Any** production code for Projects UI                      |

**Not gaps for IR:** Platform Foundation, Integration SDK freeze, Plane adapter certification, project-service, gateway/authz path, Definition Pack completeness (PRODUCTS-002 **ACCEPTED**).

---

## 6. Exact actions required to reach Implementation Ready

### Actions completed by APZHUB-PRODUCTS-003 (documentation only)

| #   | Action                                                                                      | Result                                                               |
| --- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | Evaluate all seven Product Definition Packs against selection criteria                      | Evaluation Matrix (§2)                                               |
| 2   | Select single eligible product (APZ Projects)                                               | Recommendation locked                                                |
| 3   | Confirm PRODUCTS-002 pack + Wave 1 architecture as Owner-accepted baseline                  | Architecture approval satisfied for IR                               |
| 4   | Confirm platform/integration dependencies available on disk                                 | Plane **0.6.0**, project-service, Search, Gateway, IAM, provisioning |
| 5   | Reclassify UI testing/certification/ops as **implementation deliverables**, not IR blockers | Dimensions updated in pack                                           |
| 6   | Mark APZ Projects **Implementation Ready** in pack + portfolio + readiness matrix           | Status advanced Architecture Ready → Implementation Ready            |
| 7   | Record remaining implementation-scope gaps without inventing IDs                            | §5                                                                   |

### Entry criteria checklist (APZ Projects)

| Criterion                        | Status after PRODUCTS-003                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| Product Definition Pack complete | **Met** (PRODUCTS-002 **ACCEPTED**)                                                          |
| Architecture approved            | **Met** (Wave 1 frozen + pack ACCEPTED)                                                      |
| Dependencies available           | **Met** (adapter + platform services on disk)                                                |
| Marked **Implementation Ready**  | **Met** — see [projects/IMPLEMENTATION-READINESS.md](./projects/IMPLEMENTATION-READINESS.md) |

---

## 7. Authorisation boundary

**Implementation Ready ≠ authorised to implement.**

No production code, package changes, platform changes, or feature implementation are authorised by this document. Await **explicit Owner Approval** of a named product implementation programme.

---

## See also

- [APZ Projects — IMPLEMENTATION-READINESS](./projects/IMPLEMENTATION-READINESS.md)
- [Implementation Readiness Matrix](./APZHUB-PRODUCT-IMPLEMENTATION-READINESS-MATRIX.md)
- [Portfolio Readiness Summary](./APZHUB-PRODUCT-PORTFOLIO-READINESS-SUMMARY.md)
- [APZHUB-PRODUCT-PORTFOLIO](./APZHUB-PRODUCT-PORTFOLIO.md)
- [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md)
