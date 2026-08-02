# APZHUB Enterprise Engineering Standards Catalogue

| Field             | Value                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| Document          | APZHUB-ENGINEERING-STANDARDS-CATALOGUE                                                                 |
| Programme         | APZHUB-ENG-002                                                                                         |
| Classification    | Enterprise Engineering Governance                                                                      |
| Status            | **CERTIFIED** (Product Board — Phase 1 Opening)                                                        |
| Authority         | [Portfolio Engineering Charter](./APZHUB-ENG-002/PORTFOLIO-ENGINEERING-CHARTER.md) (**CERTIFIED**)     |
| Technical content | **NONE** — inventory and status only                                                                   |
| Role              | Inventory of every enterprise standard (all lifecycle states)                                          |
| Companion         | [APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md](./APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md) — adopted set |
| Engineering       | NONE                                                                                                   |

---

## 1. Purpose

This catalogue is the **authoritative inventory** of APZHUB enterprise engineering standards.

It contains **no technical standard text**.

It answers:

- which enterprise standards exist or are proposed;
- their lifecycle status;
- current approved version;
- which product / framework proved them;
- Product Board decision references;
- ownership, review cadence, and supersession;
- where the normative document lives.

| Artefact                                                                | Role                                                |
| ----------------------------------------------------------------------- | --------------------------------------------------- |
| **This Catalogue**                                                      | Everything that exists                              |
| **[Engineering Baseline](./APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md)** | What currently defines the enterprise (adopted set) |

Promotions under APZHUB-ENG-002 SHALL update this catalogue **and**, when a standard becomes Active, the Baseline version. Isolated standard documents without a catalogue row are governance defects.

**Rows are never removed.** Lifecycle changes update status (and related audit fields) only.

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

## 3. Register columns

| Field                  | Purpose                              |
| ---------------------- | ------------------------------------ |
| ID                     | Permanent catalogue identifier       |
| Title                  | Enterprise standard name             |
| Status                 | Lifecycle state                      |
| Current Version        | Current approved / candidate version |
| Source Framework       | Proving framework citation           |
| Source Product         | Product that proved the practice     |
| Product Board Decision | Decision reference / evidence        |
| Promotion Date         | Date status entered Active (UTC)     |
| Owner                  | Governance owner                     |
| Review Frequency       | Cadence for reaffirmation            |
| Superseded By          | Successor ID/version when applicable |
| Normative Home         | Path to enterprise standard body     |

---

## 4. Enterprise standards register

### 4.1 Already enterprise (pre-ENG-002)

| ID     | Title                      | Status             | Current Version   | Source Framework | Source Product | Product Board Decision | Promotion Date | Owner         | Review Frequency             | Superseded By | Normative Home                                   |
| ------ | -------------------------- | ------------------ | ----------------- | ---------------- | -------------- | ---------------------- | -------------- | ------------- | ---------------------------- | ------------- | ------------------------------------------------ |
| ES-000 | Engineering Slice Standard | Already Enterprise | Frozen (ADR-0092) | APZHUB-ENG-001   | APZHUB         | ADR-0092               | —              | Product Board | Major release / Owner change | —             | `docs/engineering/ENGINEERING-SLICE-STANDARD.md` |

### 4.2 Promotion wave

| ID     | Title                                         | Status       | Current Version | Source Framework                          | Source Product  | Product Board Decision                                            | Promotion Date | Owner                                             | Review Frequency                   | Superseded By | Normative Home                                                  |
| ------ | --------------------------------------------- | ------------ | --------------- | ----------------------------------------- | --------------- | ----------------------------------------------------------------- | -------------- | ------------------------------------------------- | ---------------------------------- | ------------- | --------------------------------------------------------------- |
| ES-001 | Enterprise Testing Standard                   | **Active**   | **1.0**         | APZQEP Engineering Framework v1.0         | APZQEP          | CERTIFIED 20260802T113408Z · APPROVED → ACTIVE                    | 2026-08-02     | APZHUB Engineering Governance                     | Annual or major framework revision | —             | `docs/engineering/APZHUB-TESTING-STANDARD.md`                   |
| ES-002 | Enterprise Certification Standard             | **Active**   | **1.0**         | APZQEP Engineering Framework v1.0         | APZQEP          | CERTIFIED 20260802T115728Z · Arch Review PASS · APPROVED → ACTIVE | 2026-08-02     | APZHUB Engineering Governance                     | Annual                             | —             | `docs/engineering/APZHUB-CERTIFICATION-STANDARD.md`             |
| ES-003 | Enterprise Engineering Specification Template | **Active**   | **1.0**         | APZQEP Engineering Framework v1.0         | APZQEP          | CERTIFIED 20260802T120716Z · Arch Review PASS · APPROVED → ACTIVE | 2026-08-02     | APZHUB Engineering Governance                     | Annual                             | —             | `docs/engineering/APZHUB-ENGINEERING-SPECIFICATION-TEMPLATE.md` |
| ES-004 | Enterprise Engineering Workflow               | **Proposed** | —               | APZQEP / APZHUB-ENG-001 pack              | APZQEP / APZHUB | —                                                                 | —              | Product Board / Enterprise Engineering Governance | Annual / Major release             | —             | Align `AI-ENGINEERING-WORKFLOW.md` + checklists (TBD)           |
| ES-005 | Enterprise Engineering Standards              | **Proposed** | —               | APZQEP Engineering Framework v1.0 (SPLIT) | APZQEP          | —                                                                 | —              | Product Board / Enterprise Engineering Governance | Annual / Major release             | —             | `docs/engineering/APZHUB-ENGINEERING-STANDARDS.md` (TBD)        |

### 4.3 Deferred (not in current wave)

| ID     | Title                                 | Status   | Current Version | Source Framework         | Source Product | Product Board Decision | Promotion Date | Owner         | Review Frequency       | Superseded By | Normative Home |
| ------ | ------------------------------------- | -------- | --------------- | ------------------------ | -------------- | ---------------------- | -------------- | ------------- | ---------------------- | ------------- | -------------- |
| ES-010 | Enterprise API Standard               | Deferred | —               | APZQEP (planned)         | APZQEP         | —                      | —              | Product Board | Annual / Major release | —             | TBD            |
| ES-011 | Enterprise Database Standard          | Deferred | —               | APZQEP (planned)         | APZQEP         | —                      | —              | Product Board | Annual / Major release | —             | TBD            |
| ES-012 | Enterprise Domain Event Standard      | Deferred | —               | APZQEP (planned)         | APZQEP         | —                      | —              | Product Board | Annual / Major release | —             | TBD            |
| ES-013 | Enterprise Documentation Standard     | Deferred | —               | APZQEP (planned)         | APZQEP         | —                      | —              | Product Board | Annual / Major release | —             | TBD            |
| ES-014 | Product Engineering Framework Pattern | Deferred | —               | APZQEP Framework concept | APZQEP         | —                      | —              | Product Board | Annual / Major release | —             | TBD            |

---

## 5. Recommended promotion sequence

1. **ES-001** Enterprise Testing Standard — **ACTIVE** (first APZHUB-owned enterprise engineering standard)
2. **ES-002** Enterprise Certification Standard — **ACTIVE**
3. **ES-003** Enterprise Engineering Specification Template — **ACTIVE** (Baseline **1.2 ESTABLISHED**)
4. **ES-004** Enterprise Engineering Workflow — **PAUSED** (Phase 1A before authorisation)
5. **ES-005** Enterprise Engineering Standards (generic portion only)

API / Database / Domain Event remain **Deferred** until Board revisits.

---

## 6. Catalogue change rules

1. Register a row **before** drafting the enterprise standard body.
2. Status moves only with evidence (review pack, Board decision).
3. On Active: set Current Version, Promotion Date, Product Board Decision, and Normative Home; then publish a new [Engineering Baseline](./APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md) version.
4. **Never delete rows**; use Superseded / Retired and fill Superseded By.
5. Product-specific standards do **not** appear here unless proposed for enterprise adoption.
6. Enterprise standards SHALL be derived by **abstraction**, never by duplication ([PROMOTION-PRINCIPLES.md](./APZHUB-ENG-002/PROMOTION-PRINCIPLES.md)).

---

## 7. Provenance (source paths)

| ID     | Source artefact                                                                           |
| ------ | ----------------------------------------------------------------------------------------- |
| ES-001 | `docs/products/apzqep/engineering/APZQEP-TESTING-STANDARD.md`                             |
| ES-002 | `docs/products/apzqep/engineering/APZQEP-CERTIFICATION-STANDARD.md`                       |
| ES-003 | `docs/products/apzqep/engineering/APZQEP-SLICE-TEMPLATE.md`                               |
| ES-004 | `docs/engineering/AI-ENGINEERING-WORKFLOW.md` · `ENGINEERING-CHECKLIST.md`                |
| ES-005 | `docs/products/apzqep/engineering/APZQEP-ENGINEERING-STANDARDS.md` (generic extract only) |

---

## 8. Promotion log

| When (UTC)       | ID     | Event                                                                                                                    | Evidence                                                       |
| ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 2026-08-02       | —      | Catalogue established; ES-001…ES-005 registered as Proposed                                                              | Phase 1 opening                                                |
| 20260802T112512Z | —      | Catalogue ACTIVE (establishment)                                                                                         | `20260802T112512Z-APZHUB-ENG-002-PHASE1-CATALOGUE*`            |
| 20260802T113012Z | —      | Catalogue **CERTIFIED** (Product Board Phase 1 Opening)                                                                  | Board decision                                                 |
| 20260802T113012Z | ES-001 | Status → **Under Review**; candidate body authored by abstraction                                                        | `APZHUB-TESTING-STANDARD.md` · `ES-001-*`                      |
| 20260802T113408Z | ES-001 | Product Board **CERTIFIED**; Status → **APPROVED → ACTIVE** v1.0                                                         | `ES-001-PROMOTION-PACK.md` · evidence CERTIFIED                |
| 20260802T113952Z | —      | Enterprise Engineering Baseline **1.0** established (ES-001)                                                             | `APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md`                    |
| 20260802T114211Z | —      | Baseline **1.0** Product Board **CERTIFIED**                                                                             | `BASELINE-1.0-CERTIFICATION.md`                                |
| 20260802T114832Z | ES-002 | Authorised for Review; body authored by abstraction; Arch Review PASS; Status → **Under Review**; Baseline **unchanged** | `APZHUB-CERTIFICATION-STANDARD.md` · `ES-002-*`                |
| 20260802T115728Z | ES-002 | Dual Approval complete; Product Board **CERTIFIED**; Status → **APPROVED → ACTIVE** v1.0                                 | `ES-002-PROMOTION-PACK.md` · evidence CERTIFIED                |
| 20260802T115728Z | —      | Enterprise Engineering Baseline **1.0 → 1.1** (ES-001, ES-002)                                                           | `APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md` · `BASELINE-1.1-*` |
| 20260802T120151Z | ES-003 | Authorised for Review; body authored by abstraction; Arch Review PASS; Status → **Under Review**; Baseline **unchanged** | `APZHUB-ENGINEERING-SPECIFICATION-TEMPLATE.md` · `ES-003-*`    |
| 20260802T120716Z | ES-003 | Dual Approval complete; Product Board **CERTIFIED**; Status → **APPROVED → ACTIVE** v1.0                                 | `ES-003-PROMOTION-PACK.md` · evidence CERTIFIED                |
| 20260802T120716Z | —      | Enterprise Engineering Baseline **1.1 → 1.2** (ES-001, ES-002, ES-003) · **ESTABLISHED**                                 | `BASELINE-1.2-*` · `GOVERNANCE-MILESTONE-BASELINE-1.2.md`      |
| 20260802T120716Z | —      | Phase **1A** Baseline 1.2 Review **OPEN**; ES-004 not authorised                                                         | `PHASE-1A-BASELINE-1.2-REVIEW.md`                              |

---

_End of APZHUB Enterprise Engineering Standards Catalogue_
