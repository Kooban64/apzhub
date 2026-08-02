# APZHUB Enterprise Engineering Standards Catalogue

| Field             | Value                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Document          | APZHUB-ENGINEERING-STANDARDS-CATALOGUE                                                             |
| Programme         | APZHUB-ENG-002                                                                                     |
| Classification    | Enterprise Engineering Governance                                                                  |
| Status            | **ACTIVE** (inventory)                                                                             |
| Authority         | [Portfolio Engineering Charter](./APZHUB-ENG-002/PORTFOLIO-ENGINEERING-CHARTER.md) (**CERTIFIED**) |
| Technical content | **NONE** — inventory and status only                                                               |
| Engineering       | NONE                                                                                               |

---

## 1. Purpose

This catalogue is the **authoritative inventory** of APZHUB enterprise engineering standards.

It contains **no technical standard text**.

It answers:

- which enterprise standards exist or are proposed;
- their lifecycle status;
- which product proved them;
- which version is current;
- where the normative document will live (or lives).

Promotions under APZHUB-ENG-002 SHALL update this catalogue. Isolated standard documents without a catalogue row are governance defects.

---

## 2. Catalogue status vocabulary

| Status                 | Meaning                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| **Proposed**           | Candidate registered; promotion not complete                     |
| **Under Review**       | Promotion pack in Architecture / Engineering / QA / Board review |
| **Approved**           | Board accepted; not yet Active (if staged)                       |
| **Active**             | In force as enterprise law                                       |
| **Superseded**         | Replaced by a newer Active version                               |
| **Retired**            | No longer recommended                                            |
| **Deferred**           | Explicitly not in current promotion wave                         |
| **Already Enterprise** | Pre-existing portfolio standard (not a new promotion)            |

Aligned with [PORTFOLIO-LIFECYCLE.md](./APZHUB-ENG-002/PORTFOLIO-LIFECYCLE.md).

---

## 3. Enterprise standards inventory

### 3.1 Already enterprise (pre-ENG-002)

| ID     | Standard                   | Status             | Source         | Version           | Normative home                                   |
| ------ | -------------------------- | ------------------ | -------------- | ----------------- | ------------------------------------------------ |
| ES-000 | Engineering Slice Standard | Already Enterprise | APZHUB-ENG-001 | Frozen (ADR-0092) | `docs/engineering/ENGINEERING-SLICE-STANDARD.md` |

### 3.2 Promotion wave candidates (registered)

| ID     | Standard                                               | Status       | Source product               | Source version | Planned enterprise home                                               | Promotion order |
| ------ | ------------------------------------------------------ | ------------ | ---------------------------- | -------------- | --------------------------------------------------------------------- | --------------- |
| ES-001 | Testing Standard                                       | **Proposed** | APZQEP                       | 1.0            | `docs/engineering/APZHUB-TESTING-STANDARD.md` (TBD)                   | **1**           |
| ES-002 | Certification Standard                                 | **Proposed** | APZQEP                       | 1.0            | `docs/engineering/APZHUB-CERTIFICATION-STANDARD.md` (TBD)             | **2**           |
| ES-003 | Engineering Specification Template                     | **Proposed** | APZQEP                       | 1.0            | `docs/engineering/APZHUB-ENGINEERING-SPECIFICATION-TEMPLATE.md` (TBD) | **3**           |
| ES-004 | Engineering Workflow                                   | **Proposed** | APZQEP / APZHUB-ENG-001 pack | —              | Align `AI-ENGINEERING-WORKFLOW.md` + checklists                       | **4**           |
| ES-005 | Enterprise Engineering Standards (generic conventions) | **Proposed** | APZQEP (SPLIT)               | 1.0            | `docs/engineering/APZHUB-ENGINEERING-STANDARDS.md` (TBD)              | **5**           |

### 3.3 Deferred (not in current wave)

| ID     | Standard                              | Status   | Source                   | Notes                                         |
| ------ | ------------------------------------- | -------- | ------------------------ | --------------------------------------------- |
| ES-010 | API Standard                          | Deferred | APZQEP (planned)         | KEEP PRODUCT initially                        |
| ES-011 | Database Standard                     | Deferred | APZQEP (planned)         | KEEP PRODUCT initially; Foundation 011 exists |
| ES-012 | Domain Event Standard                 | Deferred | APZQEP (planned)         | KEEP PRODUCT initially                        |
| ES-013 | Documentation Standard                | Deferred | APZQEP (planned)         | Promote later if generic                      |
| ES-014 | Product Engineering Framework Pattern | Deferred | APZQEP Framework concept | Concept promotion after wave 1–5              |

---

## 4. Recommended promotion sequence

1. **ES-001** Testing Standard — lowest risk; product-independent; proven
2. **ES-002** Certification Standard
3. **ES-003** Engineering Specification Template
4. **ES-004** Engineering Workflow
5. **ES-005** Enterprise Engineering Standards (generic portion only)

API / Database / Domain Event remain **Deferred** until Board revisits.

---

## 5. Catalogue change rules

1. Register a row **before** drafting the enterprise standard body.
2. Status moves only with evidence (review pack, Board decision).
3. On Active: record `Adopted` date, Board decision ID/timestamp, and normative path.
4. Never delete historical rows; use Superseded / Retired.
5. Product-specific standards do **not** appear here unless proposed for enterprise adoption.

---

## 6. Provenance (source paths)

| ID     | Source artefact                                                                           |
| ------ | ----------------------------------------------------------------------------------------- |
| ES-001 | `docs/products/apzqep/engineering/APZQEP-TESTING-STANDARD.md`                             |
| ES-002 | `docs/products/apzqep/engineering/APZQEP-CERTIFICATION-STANDARD.md`                       |
| ES-003 | `docs/products/apzqep/engineering/APZQEP-SLICE-TEMPLATE.md`                               |
| ES-004 | `docs/engineering/AI-ENGINEERING-WORKFLOW.md` · `ENGINEERING-CHECKLIST.md`                |
| ES-005 | `docs/products/apzqep/engineering/APZQEP-ENGINEERING-STANDARDS.md` (generic extract only) |

Reference baseline: APZQEP Engineering Framework v1.0.  
Promotion Principle: [PROMOTION-PRINCIPLES.md](./APZHUB-ENG-002/PROMOTION-PRINCIPLES.md).

---

## 7. Audit fields (to complete on promotion)

When a standard becomes Active, append to §8 Promotion log:

| Field                     | Required |
| ------------------------- | -------- |
| ID / Version              | YES      |
| Adopted (UTC)             | YES      |
| Board decision evidence   | YES      |
| Proving product           | YES      |
| Genericisation notes path | YES      |
| Normative document path   | YES      |

---

## 8. Promotion log

| When (UTC) | ID      | Event                                                       | Evidence                       |
| ---------- | ------- | ----------------------------------------------------------- | ------------------------------ |
| 2026-08-02 | —       | Catalogue established; ES-001…ES-005 registered as Proposed | APZHUB-ENG-002 Phase 1 opening |
| —          | ES-001… | _(future promotions)_                                       | —                              |

---

_End of APZHUB Enterprise Engineering Standards Catalogue_
