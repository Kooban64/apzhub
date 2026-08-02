# APZHUB Enterprise Engineering Baseline

| Field             | Value                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Document          | APZHUB-ENTERPRISE-ENGINEERING-BASELINE                                                             |
| Programme         | APZHUB-ENG-002                                                                                     |
| Classification    | Enterprise Engineering Governance                                                                  |
| Status            | **ACTIVE** · Product Board **CERTIFIED**                                                           |
| Current version   | **1.1**                                                                                            |
| Certified (1.1)   | Product Board — 2026-08-02 (`20260802T115728Z`)                                                    |
| Authority         | [Portfolio Engineering Charter](./APZHUB-ENG-002/PORTFOLIO-ENGINEERING-CHARTER.md) (**CERTIFIED**) |
| Companion         | [APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md](./APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md)           |
| Technical content | **NONE** — adopted-set inventory only                                                              |
| Engineering       | NONE                                                                                               |

---

## Baseline Status

```text
Baseline Status

Current Version:
1.1

Current Authority:
Product Board

Effective Date:
2026-08-02

Current Standards:
ES-001
ES-002

Next Planned Version:
1.2 (Pending ES-003 Certification)

ES-003 Catalogue Status:
UNDER REVIEW (does not change this Baseline)
```

| Field                | Value                                  |
| -------------------- | -------------------------------------- |
| Current version      | **1.1**                                |
| Current authority    | Product Board                          |
| Effective date       | 2026-08-02                             |
| Current standards    | ES-001, ES-002                         |
| Next planned version | **1.2** (Pending ES-003 Certification) |
| ES-003 status        | **UNDER REVIEW** (Baseline unchanged)  |

---

## 1. Purpose

This Baseline records which enterprise engineering standards **currently define** APZHUB.

It answers:

> **What engineering standards are currently mandatory across the enterprise?**

| Artefact                 | Answers                                                                     |
| ------------------------ | --------------------------------------------------------------------------- |
| **Standards Catalogue**  | _What engineering standards exist?_                                         |
| **Engineering Baseline** | _What engineering standards are currently mandatory across the enterprise?_ |

The Baseline is the governance equivalent of a software release for engineering standards.

**Strong rule:** Baseline changes **only** when a standard becomes **ACTIVE** (Dual Approval: Architecture Review PASS **and** Product Board CERTIFIED). Drafting or reviewing a standard does **not** change the Baseline.

---

## 2. Current Baseline

```text
Engineering Baseline

Version:
1.1

Status:
ACTIVE

Included Standards

ES-001
Enterprise Testing Standard

ES-002
Enterprise Certification Standard
```

| Field                 | Value                              |
| --------------------- | ---------------------------------- |
| Baseline version      | **1.1**                            |
| Status                | ACTIVE · CERTIFIED                 |
| Effective (UTC)       | 2026-08-02                         |
| Board CERTIFIED (1.1) | `20260802T115728Z` (ES-002 Active) |
| Included standards    | ES-001, ES-002                     |
| Supersedes            | Baseline **1.0** (ES-001 only)     |

---

## 3. Included standards (Baseline 1.1)

### ES-001 — Enterprise Testing Standard

```text
Enterprise Engineering Standard

ID: ES-001
Title: APZHUB Enterprise Testing Standard
Version: 1.0
Status: ACTIVE
Authority: APZHUB Engineering Governance
Origin: APZQEP Engineering Framework v1.0
Promotion Method: ABSTRACTION
Reference Implementation: APZQEP
Scope: Enterprise
Implementation: Mandatory for all APZHUB products
Review: Annual
```

| Field          | Value                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| Normative path | [`APZHUB-TESTING-STANDARD.md`](./APZHUB-TESTING-STANDARD.md)            |
| Promotion date | 2026-08-02                                                              |
| Board decision | [`ES-001-PROMOTION-PACK.md`](./APZHUB-ENG-002/ES-001-PROMOTION-PACK.md) |

### ES-002 — Enterprise Certification Standard

```text
Enterprise Engineering Standard

ID: ES-002
Title: APZHUB Enterprise Certification Standard
Version: 1.0
Status: ACTIVE
Authority: APZHUB Engineering Governance
Origin: APZQEP Engineering Framework v1.0
Promotion Method: ABSTRACTION
Architecture Review: PASS
Product Board: CERTIFIED
Reference Implementation: APZQEP
Scope: Enterprise
Implementation: Mandatory for all APZHUB products
Review: Annual
Superseded By: None
```

| Field               | Value                                                                             |
| ------------------- | --------------------------------------------------------------------------------- |
| Normative path      | [`APZHUB-CERTIFICATION-STANDARD.md`](./APZHUB-CERTIFICATION-STANDARD.md)          |
| Promotion date      | 2026-08-02 (`20260802T115728Z`)                                                   |
| Board decision      | [`ES-002-PROMOTION-PACK.md`](./APZHUB-ENG-002/ES-002-PROMOTION-PACK.md)           |
| Architecture Review | [`ES-002-ARCHITECTURE-REVIEW.md`](./APZHUB-ENG-002/ES-002-ARCHITECTURE-REVIEW.md) |

**Product obligation:** All APZHUB products SHALL conform to Active Baseline standards (ES-001 and ES-002). Product specialisations MAY tighten, never weaken, Active Baseline obligations.

---

## 4. Baseline version history

| Baseline Version | Included Standards     | Effective (UTC) | Board / evidence                                             |
| ---------------- | ---------------------- | --------------- | ------------------------------------------------------------ |
| 1.0              | ES-001                 | 2026-08-02      | Established `20260802T113952Z`; CERTIFIED `20260802T114211Z` |
| **1.1**          | ES-001, ES-002         | 2026-08-02      | ES-002 CERTIFIED `20260802T115728Z`                          |
| 1.2 _(planned)_  | ES-001, ES-002, ES-003 | —               | After ES-003 ACTIVE                                          |

Planned rows are forward guidance only. They do not authorise promotion.

---

## 5. Versioning policy

### 5.1 When the Baseline changes

| Event                                        | Baseline impact                   |
| -------------------------------------------- | --------------------------------- |
| Standard drafted                             | **No change**                     |
| Standard Under Review                        | **No change**                     |
| Architecture Review only                     | **No change**                     |
| Dual Approval complete → standard **ACTIVE** | **New Baseline version required** |

### 5.2 Version numbers

| Change type | Example         | Meaning                                                                                                         |
| ----------- | --------------- | --------------------------------------------------------------------------------------------------------------- |
| **Minor**   | 1.0 → 1.1 → 1.2 | One or more standards become **ACTIVE**                                                                         |
| **Major**   | 1.x → 2.0       | Significant governance change — e.g. restructuring the engineering framework, or superseding multiple standards |

### 5.3 Additional rules

1. Each minor bump lists the **full** adopted set (not deltas only).
2. Major bumps require explicit Product Board decision.
3. Removing or superseding a standard from the adopted set requires Board decision and a new Baseline version.
4. Catalogue rows for Proposed / Under Review / Deferred standards are **not** in the Baseline until Active.
5. Baseline versions are never rewritten in place for adoption history; append a new version row.
6. Future promotions SHALL increment the Baseline version in accordance with Product Board approval.

---

## 6. Related enterprise artefacts (outside this Baseline series)

| Artefact                      | Path / ID                                | Notes                                |
| ----------------------------- | ---------------------------------------- | ------------------------------------ |
| Engineering Slice Standard    | ES-000 · `ENGINEERING-SLICE-STANDARD.md` | Frozen ADR-0092                      |
| Portfolio Engineering Charter | APZHUB-ENG-002                           | Governs promotion; Dual Approval §12 |
| Document 000 / Foundation     | `docs/000-…` · Foundation pack           | Supreme / architecture               |

---

## 7. Change control

1. Promote standard to Active in the **Catalogue** first (after Dual Approval).
2. Publish or amend the normative standard body.
3. Publish a new **Baseline** version listing the full adopted set.
4. Record Board decision reference and effective date here.
5. Do not claim Baseline membership for standards that are only Proposed or Under Review.

---

## 8. Product Board records

### Baseline 1.0

```text
Version: 1.0 · CERTIFIED · Initial set: ES-001
```

### Baseline 1.1

```text
Programme: APZHUB-ENG-002
Phase: 1
Artefact: APZHUB Enterprise Engineering Baseline
Version: 1.1
Status: ACTIVE
Included: ES-001, ES-002
Trigger: ES-002 Product Board CERTIFIED
Decision (UTC): 20260802T115728Z
Engineering: NONE
Repository: CLEAN
```

---

## 9. Document history

| Baseline | Event                   | Notes                                            |
| -------- | ----------------------- | ------------------------------------------------ |
| 1.0      | Established + CERTIFIED | First Baseline; ES-001 only                      |
| 1.1      | Active                  | ES-002 added; Dual Approval exercised end-to-end |

---

_End of APZHUB Enterprise Engineering Baseline_
