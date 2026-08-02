# APZHUB Portfolio Engineering Charter

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| Document       | PORTFOLIO-ENGINEERING-CHARTER              |
| Programme      | APZHUB-ENG-002                             |
| Phase          | 0                                          |
| Classification | Enterprise Engineering Governance          |
| Status         | **CERTIFIED**                              |
| Certified      | Product Board — APZHUB-ENG-002 Phase 0     |
| Version        | 1.0                                        |
| Engineering    | NONE                                       |
| Authority      | Owner · Product Board                      |
| Supersedes     | None (first portfolio engineering charter) |

---

## 1. Vision

APZHUB engineering SHALL be governed so that every product can deliver securely, consistently, and certifiably—without each product inventing its own methodology.

Enterprise standards exist to **multiply proven practice** across the portfolio, not to theorise practice in advance of use.

---

## 2. Mission

This Charter establishes the governance model under which:

- engineering standards may be **promoted** from products into the APZHUB enterprise baseline;
- products **consume** enterprise standards by reference;
- product-specific engineering remains free to innovate within constitutional bounds;
- change, supersession, and retirement of enterprise standards are controlled and auditable.

**Phase 0 does not write engineering standards.** It defines who owns what, why, and under what authority.

---

## 3. Scope

### 3.1 Inside enterprise engineering (APZHUB)

| Concern                                      | Examples                                                 |
| -------------------------------------------- | -------------------------------------------------------- |
| Slice process                                | Engineering Slice Standard (APZHUB-ENG-001)              |
| Portfolio testing / certification vocabulary | After promotion under this programme                     |
| Portfolio engineering conventions            | Naming, commits, evidence, ADR, Markdown (when promoted) |
| Specification contract structure             | Engineering Specification Template (when promoted)       |
| Workflow and checklist alignment             | When promoted                                            |
| Named Framework _pattern_                    | Citation model for product frameworks                    |

### 3.2 Outside enterprise engineering (remains product)

| Concern                                        | Examples                                                    |
| ---------------------------------------------- | ----------------------------------------------------------- |
| Product constitutions and handbooks            | APZQEP Engineering Constitution / Handbook                  |
| Product-domain conventions                     | Evidence lifecycle, catalogue, integrity, storage naming    |
| Product specialised standards (initially)      | API, Database, Domain Events until portfolio need is proven |
| Product business capabilities and architecture | Roadmaps, solution architecture, feature slices             |

### 3.3 Immutable baselines (reference only)

APZQEP-ENG-001 is **ARCHIVED / IMMUTABLE** (closure `b9626ada`). Its Engineering Framework v1.0 is the **reference implementation**, not an automatic enterprise standard.

---

## 4. Principles

Engineering across APZHUB SHALL be:

| Principle                              | Meaning                                              |
| -------------------------------------- | ---------------------------------------------------- |
| **Repeatable**                         | Same process produces comparable outcomes            |
| **Auditable**                          | Evidence and decisions are reconstructable           |
| **Certifiable**                        | PASS / FAIL / STOP (or Board CERTIFIED) is decidable |
| **Modular**                            | Standards and products compose without coupling      |
| **Maintainable**                       | Change is versioned; dual authorities are forbidden  |
| **Technology-neutral where practical** | Prefer durable rules over vendor snapshots           |
| **Product-driven**                     | Enterprise law comes from proven product use         |
| **Governance-led**                     | Promotion and change require explicit authority      |

---

## 5. Engineering hierarchy

```text
Enterprise Governance
        │
        ▼
Enterprise Engineering Standards
        │
        ▼
Product Engineering Frameworks
        │
        ▼
Product Standards
        │
        ▼
Engineering Specifications
        │
        ▼
Implementation
```

On conflict within APZHUB engineering practice:

1. Document 000 / Foundation 001–029
2. APZHUB Lifecycle / Engineering / AI Operational Framework (governance)
3. APZHUB-ENG-001 (slice process, frozen)
4. **This Charter** and certified enterprise standards under APZHUB-ENG-002
5. Product Engineering Frameworks (e.g. APZQEP Framework v1.0)
6. Product standards and slice specifications

Detail: [PORTFOLIO-GOVERNANCE-MODEL.md](./PORTFOLIO-GOVERNANCE-MODEL.md)

---

## 6. Ownership

| Role                   | Owns                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| **Owner**              | Programme authorisation; constitutional exceptions; release/deploy authority outside this Charter |
| **Product Board**      | Charter certification; enterprise standard adoption; promotion decisions                          |
| **Architecture Board** | Architectural fitness of promoted standards; conflict with Foundation                             |
| **Engineering**        | Drafting, implementation evidence, technical review                                               |
| **QA**                 | Verification of testing/certification claims in promotion packs                                   |
| **Release**            | Ensures promotion does not imply release/GA authority                                             |
| **AI Engineering**     | Compliance with AI Operational Framework when agents execute slices                               |

Detail: [OWNERSHIP-MODEL.md](./OWNERSHIP-MODEL.md)

---

## 7. Promotion model

Promotion moves a **proven product practice** into an **enterprise standard**.

Mandatory Promotion Principle: [PROMOTION-PRINCIPLES.md](./PROMOTION-PRINCIPLES.md)

No standard becomes enterprise law unless it has:

1. Been implemented successfully in a production-grade product
2. Completed engineering certification
3. Completed Product Board certification (of the practice / source programme)
4. Demonstrated operational value
5. Been reviewed for removal or clear separation of product-specific content
6. Been approved for enterprise adoption

APZQEP is the initial **reference implementation**. Reference ≠ automatic promotion.

---

## 8. Product model

| Term                         | Definition                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------ |
| **Reference Product**        | Product whose proven practices are candidates for promotion (initially APZQEP) |
| **Enterprise Product**       | Product that must consume enterprise standards by citation                     |
| **Shared Capability**        | Cross-product platform capability (Foundation / services)                      |
| **Portfolio Service**        | Platform-owned service consumed by products                                    |
| **Reference Implementation** | Concrete product expression of a practice; not itself the enterprise standard  |

---

## 9. Lifecycle of enterprise standards

```text
Draft → Review → Approved → Active → Superseded → Retired → Archived
```

Detail: [PORTFOLIO-LIFECYCLE.md](./PORTFOLIO-LIFECYCLE.md)

---

## 10. Versioning

- Enterprise standards use explicit versions (e.g. v1.0).
- Normative change REQUIRES a version bump and Product Board visibility (or delegated change control under this Charter).
- Products cite versions (`Inherits APZHUB Testing Standard vX`).
- Breaking changes REQUIRE migration notes and a supersession record.

---

## 11. Governance of change

| Action                                       | Authority                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Adopt / promote new enterprise standard      | Product Board                                                                              |
| Normative revision                           | Product Board (or Owner-delegated change control)                                          |
| Deprecate / supersede                        | Product Board                                                                              |
| Retire / archive                             | Product Board                                                                              |
| Product specialisation (addenda)             | Product Board if it weakens enterprise rules; else product Owner within KEEP PRODUCT scope |
| Framework maintenance on archived programmes | Maintenance change control only — not programme reopen                                     |

Products inherit enterprise changes by citation update in their next authorised engineering work—not by silent drift.

---

## 12. Enterprise Standards Dual Approval Rule (permanent)

```text
No Enterprise Engineering Standard shall become ACTIVE unless:

1. Architecture Review — PASS
AND
2. Product Board Certification — CERTIFIED

Both approvals are mandatory.
Neither approval may substitute for the other.
```

This rule is **permanent Charter law**. It separates **technical suitability** (Architecture Review) from **governance authority** (Product Board). Detail and operating procedure: [PROMOTION-PRINCIPLES.md](./PROMOTION-PRINCIPLES.md) §2.

Formally adopted by Product Board with ES-002 certification (`20260802T115728Z`).

---

## 13. Stable Baseline Policy (permanent)

```text
Once an Enterprise Engineering Baseline is declared STABLE:

• New Enterprise Standards shall be treated as enhancements.

• Existing Enterprise Standards shall not be modified except through
  approved maintenance or supersession.

• Enterprise Baseline major versions shall only be created by
  Product Board decision.

• Minor versions shall continue to represent the activation of
  additional Enterprise Standards.

• Stability reviews shall occur only when requested by the Product Board
  or after major baseline revisions.
```

This policy is **permanent Charter law**. It separates **maintenance**, **enhancement**, and **re-baselining**.

Operating detail: [STABLE-BASELINE-POLICY.md](./STABLE-BASELINE-POLICY.md).

Formally adopted by Product Board with Phase 1A CERTIFIED and Baseline **1.x STABLE** (`20260802T121525Z`).

---

## 14. Governance Process Freeze (permanent)

```text
Governance Process Freeze

The Enterprise Engineering Promotion Lifecycle,
Standards Catalogue,
Enterprise Engineering Baseline,
Dual Approval Rule,
and Stable Baseline Policy

are themselves governed artefacts.

They shall not be modified during ordinary Enterprise Standard promotions.

Changes to the governance process itself require:

• a dedicated Governance Programme,
• Architecture Review,
• Product Board approval,
• and an explicit governance version increment.
```

This policy is **permanent Charter law**. It keeps the **process** as stable as the **standards**.

Operating detail: [GOVERNANCE-PROCESS-FREEZE.md](./GOVERNANCE-PROCESS-FREEZE.md).

Governance Version face: [APZHUB-ENGINEERING-GOVERNANCE.md](../APZHUB-ENGINEERING-GOVERNANCE.md) (**1.0 STABLE**).

Formally adopted by Product Board with Phase 1A **FINAL CERTIFIED** and Engineering Governance Era 1 **COMPLETE** (`20260802T121905Z`).

---

## 15. Change control

1. No silent enterprise standards.
2. No dual competing authorities for one concern.
3. No promotion without the Promotion Principle.
4. No Phase 1+ standards **body** promotion under APZHUB-ENG-002 until this Charter is Product Board **CERTIFIED** _(satisfied — Phase 0 CERTIFIED)_.
5. No enterprise standard body without a prior row in the [Enterprise Engineering Standards Catalogue](../APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md).
6. Enterprise standards shall never be derived by duplication; they shall be derived by **abstraction** ([PROMOTION-PRINCIPLES.md](./PROMOTION-PRINCIPLES.md)).
7. When a standard becomes Active, the [Enterprise Engineering Baseline](../APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md) SHALL be updated to a new version listing the full adopted set.
8. Dual Approval Rule (§12) MUST be satisfied before catalogue **Active**.
9. When the Baseline series is **STABLE**, new Active standards are **enhancements** (§13); they do not reopen stability evaluation.
10. Governance process artefacts SHALL NOT change during ordinary promotions (§14); process change requires Governance Version increment.
11. Documentation-only programmes remain documentation-only unless Owner expands authority.

---

## 16. Success criteria

The Charter succeeds when Product Board can answer:

> “What governs engineering standards across APZHUB?”

using **only** this Charter and its linked Phase 0 satellites.

Measurable criteria: [SUCCESS-CRITERIA.md](./SUCCESS-CRITERIA.md)

---

## 17. Exit criteria (Phase 0)

| Criterion                                   | Required                  |
| ------------------------------------------- | ------------------------- |
| Portfolio Engineering Charter complete      | YES                       |
| Promotion Principles adopted                | YES                       |
| Ownership Model complete                    | YES                       |
| Governance Model complete                   | YES                       |
| Lifecycle + versioning defined              | YES                       |
| Success criteria defined                    | YES                       |
| Product Board Certification of this Charter | **SATISFIED — CERTIFIED** |

**Phase 0 exit:** CERTIFIED. Phase 1 opens with the Standards Catalogue; each standard body promotion requires a dedicated Owner instruction.

---

## 18. Related documents

| Document                                                                                  | Role                                    |
| ----------------------------------------------------------------------------------------- | --------------------------------------- |
| [PROGRAMME-CHARTER.md](./PROGRAMME-CHARTER.md)                                            | APZHUB-ENG-002 programme charter        |
| [APZHUB-ENGINEERING-GOVERNANCE.md](../APZHUB-ENGINEERING-GOVERNANCE.md)                   | Governance Version **1.0 STABLE**       |
| [APZHUB-ENGINEERING-GOVERNANCE-HISTORY.md](../APZHUB-ENGINEERING-GOVERNANCE-HISTORY.md)   | Non-normative history                   |
| [APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md](../APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md) | Enterprise standards inventory          |
| [APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md](../APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md) | Adopted enterprise standards set        |
| [BASELINE-1.x-STABLE.md](./BASELINE-1.x-STABLE.md)                                        | Baseline 1.x STABLE declaration         |
| [STABLE-BASELINE-POLICY.md](./STABLE-BASELINE-POLICY.md)                                  | Stable Baseline Policy                  |
| [GOVERNANCE-PROCESS-FREEZE.md](./GOVERNANCE-PROCESS-FREEZE.md)                            | Governance Process Freeze               |
| [ENGINEERING-GOVERNANCE-ERA-1.md](./ENGINEERING-GOVERNANCE-ERA-1.md)                      | Era 1 COMPLETE milestone                |
| [PORTFOLIO-GOVERNANCE-MODEL.md](./PORTFOLIO-GOVERNANCE-MODEL.md)                          | Decision rights and conflict resolution |
| [PORTFOLIO-LIFECYCLE.md](./PORTFOLIO-LIFECYCLE.md)                                        | Standard lifecycle states               |
| [PROMOTION-PRINCIPLES.md](./PROMOTION-PRINCIPLES.md)                                      | Mandatory promotion rules               |
| [OWNERSHIP-MODEL.md](./OWNERSHIP-MODEL.md)                                                | RACI-style ownership                    |
| [SUCCESS-CRITERIA.md](./SUCCESS-CRITERIA.md)                                              | Measurable Phase 0 / programme outcomes |
| [DOCUMENT-MAP.md](./DOCUMENT-MAP.md)                                                      | Pack index                              |
| [PROMOTION-MATRIX.md](./PROMOTION-MATRIX.md)                                              | Working promotion dispositions (design) |

---

_End of APZHUB Portfolio Engineering Charter_
