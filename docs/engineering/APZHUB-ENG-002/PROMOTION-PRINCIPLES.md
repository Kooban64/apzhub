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

## 2. Additional promotion requirements

| Requirement          | Meaning                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Product independence | Enterprise text MUST NOT require a single product’s package names, paths, or domain jargon |
| Architectural review | No contradiction of Document 000 / Foundation without ADR                                  |
| Portfolio approval   | Product Board CERTIFIED decision recorded                                                  |
| Evidence pack        | Implementation proof, certification records, genericisation notes                          |
| Dual-authority check | Concern does not already have a competing Active enterprise standard                       |

---

## 3. Abstraction Principle (permanent)

```text
Enterprise standards shall never be derived by duplication.
They shall be derived by abstraction.
```

This principle is **mandatory** and permanent.

### 3.1 Required promotion method

```text
Review product standard (reference implementation)
  → Extract generic content
  → Remove product-specific material
  → Architecture Review
  → Product Board Review
  → Publish APZHUB enterprise standard
  → Update Standards Catalogue status
```

### 3.2 Forbidden

- Copy/paste of product standard text into an enterprise document as the promotion method
- Treating a product framework as automatic enterprise law
- Retaining product package names, paths, or domain jargon as normative enterprise requirements (except as non-normative reference notes)

### 3.3 Ownership distinction

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

## 4. What promotion is not

Promotion is **not**:

- copying a product handbook verbatim;
- elevating Draft product ideas;
- implying release, GA, or deployment authority;
- reopening archived programmes (e.g. APZQEP-ENG-001).

---

## 5. Reference implementation rule

A **reference implementation** (initially APZQEP Engineering Framework v1.0) demonstrates fitness. It does **not** auto-promote.

Each candidate standard MUST pass this document’s criteria independently.

---

## 6. Working dispositions

Candidate list and SPLIT/KEEP/PROMOTE dispositions: [PROMOTION-MATRIX.md](./PROMOTION-MATRIX.md).

The matrix is design guidance. Binding promotion requires Charter certification (satisfied) and catalogue registration before body authorship.

---

## 7. Phase constraints

- **Phase 0:** No standards promoted (satisfied — CERTIFIED).
- **Phase 1 Opening:** Catalogue only (CERTIFIED).
- **Phase 1+ body promotions:** Catalogue row first; abstraction method mandatory.
