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

## 12. Change control

1. No silent enterprise standards.
2. No dual competing authorities for one concern.
3. No promotion without the Promotion Principle.
4. No Phase 1+ standards **body** promotion under APZHUB-ENG-002 until this Charter is Product Board **CERTIFIED** _(satisfied — Phase 0 CERTIFIED)_.
5. No enterprise standard body without a prior row in the [Enterprise Engineering Standards Catalogue](../APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md).
6. Enterprise standards shall never be derived by duplication; they shall be derived by **abstraction** ([PROMOTION-PRINCIPLES.md](./PROMOTION-PRINCIPLES.md)).
7. When a standard becomes Active, the [Enterprise Engineering Baseline](../APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md) SHALL be updated to a new version listing the full adopted set.
8. No enterprise standard may become Active without **Architecture Review** and **Product Board Certification** (Dual Approval — [PROMOTION-PRINCIPLES.md](./PROMOTION-PRINCIPLES.md)).
9. Documentation-only programmes remain documentation-only unless Owner expands authority.

---

## 13. Success criteria

The Charter succeeds when Product Board can answer:

> “What governs engineering standards across APZHUB?”

using **only** this Charter and its linked Phase 0 satellites.

Measurable criteria: [SUCCESS-CRITERIA.md](./SUCCESS-CRITERIA.md)

---

## 14. Exit criteria (Phase 0)

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

## 15. Related documents

| Document                                                                                  | Role                                    |
| ----------------------------------------------------------------------------------------- | --------------------------------------- |
| [PROGRAMME-CHARTER.md](./PROGRAMME-CHARTER.md)                                            | APZHUB-ENG-002 programme charter        |
| [APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md](../APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md) | Enterprise standards inventory          |
| [APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md](../APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md) | Adopted enterprise standards set        |
| [PORTFOLIO-GOVERNANCE-MODEL.md](./PORTFOLIO-GOVERNANCE-MODEL.md)                          | Decision rights and conflict resolution |
| [PORTFOLIO-LIFECYCLE.md](./PORTFOLIO-LIFECYCLE.md)                                        | Standard lifecycle states               |
| [PROMOTION-PRINCIPLES.md](./PROMOTION-PRINCIPLES.md)                                      | Mandatory promotion rules               |
| [OWNERSHIP-MODEL.md](./OWNERSHIP-MODEL.md)                                                | RACI-style ownership                    |
| [SUCCESS-CRITERIA.md](./SUCCESS-CRITERIA.md)                                              | Measurable Phase 0 / programme outcomes |
| [DOCUMENT-MAP.md](./DOCUMENT-MAP.md)                                                      | Pack index                              |
| [PROMOTION-MATRIX.md](./PROMOTION-MATRIX.md)                                              | Working promotion dispositions (design) |

---

_End of APZHUB Portfolio Engineering Charter_
