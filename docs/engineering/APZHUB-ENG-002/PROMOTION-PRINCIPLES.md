# APZHUB Portfolio Engineering — Promotion Principles

| Field     | Value                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Document  | PROMOTION-PRINCIPLES                                                   |
| Programme | APZHUB-ENG-002                                                         |
| Phase     | 0                                                                      |
| Status    | **NORMATIVE** (with Charter)                                           |
| Parent    | [PORTFOLIO-ENGINEERING-CHARTER.md](./PORTFOLIO-ENGINEERING-CHARTER.md) |

---

## 1. Mandatory Promotion Principle

No engineering standard SHALL become an APZHUB enterprise standard unless it has:

1. **Been implemented successfully** within a production-grade product.
2. **Completed engineering certification.**
3. **Completed Product Board certification** (of the source practice / programme outcome).
4. **Demonstrated operational value** through real engineering use.
5. **Been reviewed** for removal of product-specific content, or clear separation into product addenda.
6. **Been approved** for enterprise adoption by Product Board (and Architecture Board where architecture is affected).

This principle is **mandatory**. It cannot be waived by informal agreement.

---

## 2. Dual Approval Principle (permanent)

```text
No enterprise standard may become ACTIVE without two independent approvals:

1. Architecture Review — confirms the standard is technically generic
   and free of product-specific assumptions.
2. Product Board Certification — confirms the standard is appropriate
   for enterprise adoption.
```

This principle is **mandatory** and permanent.

| Approval                        | Confirms                                                               | Cannot substitute for   |
| ------------------------------- | ---------------------------------------------------------------------- | ----------------------- |
| **Architecture Review**         | Technical suitability; genericity; Foundation / Document 000 alignment | Product Board authority |
| **Product Board Certification** | Governance authority for enterprise adoption                           | Architecture Review     |

Drafting, Under Review catalogue status, and authorship packs are **not** Active. Only both approvals + catalogue **Active** + Baseline bump make the standard mandatory enterprise law.

---

## 3. Additional promotion requirements

| Requirement          | Meaning                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Product independence | Enterprise text MUST NOT require a single product’s package names, paths, or domain jargon |
| Architectural review | Dual Approval item 1 — recorded before or with Board submission                            |
| Portfolio approval   | Dual Approval item 2 — Product Board CERTIFIED decision recorded                           |
| Evidence pack        | Implementation proof, certification records, genericisation notes                          |
| Dual-authority check | Concern does not already have a competing Active enterprise standard                       |

---

## 4. Abstraction Principle (permanent)

```text
Enterprise standards shall never be derived by duplication.
They shall be derived by abstraction.
```

This principle is **mandatory** and permanent.

### 4.1 Required promotion method

```text
Review product standard (reference implementation)
  → Extract generic content
  → Remove product-specific material
  → Architecture Review
  → Product Board Review
  → Publish APZHUB enterprise standard
  → Update Standards Catalogue status
  → Update Enterprise Engineering Baseline (only after ACTIVE)
```

### 4.2 Forbidden

- Copy/paste of product standard text into an enterprise document as the promotion method
- Treating a product framework as automatic enterprise law
- Retaining product package names, paths, or domain jargon as normative enterprise requirements (except as non-normative reference notes)

### 4.3 Ownership distinction

| Role                | Actor                          |
| ------------------- | ------------------------------ |
| Proven source       | Product (e.g. APZQEP)          |
| Enterprise owner    | APZHUB                         |
| Enterprise standard | Abstraction under catalogue ID |

Instruction wording for authorship SHALL prefer:

> Author the APZHUB Enterprise \<Standard\>, using the product standard as the **reference implementation**.

Not:

> Promote / copy the product standard.

---

## 5. What promotion is not

Promotion is **not**:

- copying a product handbook verbatim;
- elevating Draft product ideas;
- implying release, GA, or deployment authority;
- reopening archived programmes (e.g. APZQEP-ENG-001);
- updating the Enterprise Engineering Baseline before Product Board Certification to Active.

---

## 6. Reference implementation rule

A **reference implementation** (initially APZQEP Engineering Framework v1.0) demonstrates fitness. It does **not** auto-promote.

Each candidate standard MUST pass this document’s criteria independently.

---

## 7. Working dispositions

Candidate list and SPLIT/KEEP/PROMOTE dispositions: [PROMOTION-MATRIX.md](./PROMOTION-MATRIX.md).

The matrix is design guidance. Binding promotion requires Charter certification (satisfied) and catalogue registration before body authorship.

---

## 8. Enhancement promotions (after Baseline STABLE)

When the Enterprise Engineering Baseline series is declared **STABLE** ([STABLE-BASELINE-POLICY.md](./STABLE-BASELINE-POLICY.md)):

1. New Active standards are **enhancements** to the stable series — not foundational establishment work.
2. Promotion packs SHALL state: `Classification: Enhancement to Stable Baseline 1.x`.
3. Dual Approval + Abstraction rules still apply in full.
4. Stability is **not** re-opened by each enhancement; major re-baselining requires Product Board decision.

ES-004 (when authorised) is the **first enhancement** candidate under Baseline **1.x STABLE**.

---

## 9. Phase constraints

- **Phase 0:** No standards promoted (satisfied — CERTIFIED).
- **Phase 1 Opening:** Catalogue only (CERTIFIED).
- **Phase 1 body promotions ES-001…ES-003:** Foundational (COMPLETE).
- **Phase 1A:** System review — CERTIFIED; Baseline **1.x STABLE**.
- **Post-STABLE enhancements:** Catalogue row first; abstraction; Dual Approval; minor Baseline bump; enhancement classification mandatory.
