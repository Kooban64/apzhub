# APZHUB Enterprise Engineering Baseline

| Field             | Value                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Document          | APZHUB-ENTERPRISE-ENGINEERING-BASELINE                                                             |
| Programme         | APZHUB-ENG-002                                                                                     |
| Classification    | Enterprise Engineering Governance                                                                  |
| Status            | **ACTIVE** · **ESTABLISHED** (Governance Milestone)                                                |
| Current version   | **1.2**                                                                                            |
| Certified (1.2)   | Product Board — 2026-08-02 (`20260802T120716Z`)                                                    |
| Authority         | [Portfolio Engineering Charter](./APZHUB-ENG-002/PORTFOLIO-ENGINEERING-CHARTER.md) (**CERTIFIED**) |
| Companion         | [APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md](./APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md)           |
| Technical content | **NONE** — adopted-set inventory only                                                              |
| Engineering       | NONE                                                                                               |
| Next wave         | **PAUSED** — Phase 1A Baseline 1.2 Review before ES-004                                            |

---

## Baseline Status

```text
Baseline Status

Current Version:
1.2

Current Authority:
Product Board

Effective Date:
2026-08-02

Status:
ACTIVE · ESTABLISHED

Current Standards:
ES-001
ES-002
ES-003

Capability:
Specify → Test → Certify

Next Planned Version:
1.3 (Paused — after Phase 1A; Pending ES-004)
```

| Field                | Value                                                               |
| -------------------- | ------------------------------------------------------------------- |
| Current version      | **1.2**                                                             |
| Current authority    | Product Board                                                       |
| Effective date       | 2026-08-02                                                          |
| Current standards    | ES-001, ES-002, ES-003                                              |
| Milestone            | **ESTABLISHED** — first operational enterprise engineering baseline |
| Next planned version | **1.3** (PAUSED — Phase 1A review before ES-004)                    |
| ES-004 status        | **NOT AUTHORISED**                                                  |

---

## 1. Purpose

This Baseline records which enterprise engineering standards **currently define** APZHUB.

It answers:

> **What engineering standards are currently mandatory across the enterprise?**

| Artefact                 | Answers                                                                     |
| ------------------------ | --------------------------------------------------------------------------- |
| **Standards Catalogue**  | _What engineering standards exist?_                                         |
| **Engineering Baseline** | _What engineering standards are currently mandatory across the enterprise?_ |

**Strong rule:** Baseline changes **only** when a standard becomes **ACTIVE** (Dual Approval).

---

## 2. Current Baseline

```text
Engineering Baseline

Version:
1.2

Status:
ACTIVE · ESTABLISHED

Enterprise Standards

ES-001
Enterprise Testing Standard

ES-002
Enterprise Certification Standard

ES-003
Enterprise Engineering Specification Template
```

| Field                 | Value                              |
| --------------------- | ---------------------------------- |
| Baseline version      | **1.2**                            |
| Status                | ACTIVE · ESTABLISHED               |
| Effective (UTC)       | 2026-08-02                         |
| Board CERTIFIED (1.2) | `20260802T120716Z` (ES-003 Active) |
| Included standards    | ES-001, ES-002, ES-003             |
| Supersedes            | Baseline **1.1**                   |

### Delivery lifecycle (Baseline 1.2)

```text
Engineering Governance Milestone

Enterprise Engineering Baseline

Version:
1.2

Status:
ESTABLISHED

Capability:

Specify   (ES-003)
    ↓
Test      (ES-001)
    ↓
Certify   (ES-002)

Enterprise-wide.
```

---

## 3. Included standards (Baseline 1.2)

### ES-001 — Enterprise Testing Standard

| Field          | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| Status         | ACTIVE v1.0                                                  |
| Normative path | [`APZHUB-TESTING-STANDARD.md`](./APZHUB-TESTING-STANDARD.md) |
| Role           | How engineering work is **tested**                           |
| Promotion date | 2026-08-02                                                   |

### ES-002 — Enterprise Certification Standard

| Field          | Value                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| Status         | ACTIVE v1.0                                                              |
| Normative path | [`APZHUB-CERTIFICATION-STANDARD.md`](./APZHUB-CERTIFICATION-STANDARD.md) |
| Role           | How engineering work is **certified / accepted**                         |
| Promotion date | 2026-08-02                                                               |

### ES-003 — Enterprise Engineering Specification Template

```text
Enterprise Engineering Standard

ID: ES-003
Title: APZHUB Enterprise Engineering Specification Template
Version: 1.0
Status: ACTIVE
Authority: APZHUB Engineering Governance
Promotion Method: ABSTRACTION
Architecture Review: PASS
Product Board: CERTIFIED
Scope: Enterprise
Implementation: Mandatory for all APZHUB products
Review: Annual
Superseded By: None
```

| Field          | Value                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Normative path | [`APZHUB-ENGINEERING-SPECIFICATION-TEMPLATE.md`](./APZHUB-ENGINEERING-SPECIFICATION-TEMPLATE.md) |
| Role           | How engineering work is **specified**                                                            |
| Promotion date | 2026-08-02 (`20260802T120716Z`)                                                                  |
| Board decision | [`ES-003-PROMOTION-PACK.md`](./APZHUB-ENG-002/ES-003-PROMOTION-PACK.md)                          |

**Product obligation:** All APZHUB products SHALL conform to Active Baseline **1.2** standards. Specialisations MAY tighten, never weaken.

---

## 4. Baseline version history

| Baseline Version | Included Standards     | Effective (UTC) | Board / evidence                                      |
| ---------------- | ---------------------- | --------------- | ----------------------------------------------------- |
| 1.0              | ES-001                 | 2026-08-02      | CERTIFIED `20260802T114211Z`                          |
| 1.1              | ES-001, ES-002         | 2026-08-02      | ES-002 CERTIFIED `20260802T115728Z`                   |
| **1.2**          | ES-001, ES-002, ES-003 | 2026-08-02      | ES-003 CERTIFIED `20260802T120716Z` · **ESTABLISHED** |
| 1.3 _(paused)_   | + ES-004 (planned)     | —               | After Phase 1A + ES-004 Dual Approval                 |

---

## 5. Versioning policy

| Change type | Example         | Meaning                                                  |
| ----------- | --------------- | -------------------------------------------------------- |
| **Minor**   | 1.0 → 1.1 → 1.2 | One or more standards become **ACTIVE**                  |
| **Major**   | 1.x → 2.0       | Significant governance restructuring / mass supersession |

Baseline changes **only** on Dual Approval → Active. Drafting / Under Review do not change the Baseline.

---

## 6. Related enterprise artefacts (outside this Baseline series)

| Artefact                      | Path / ID                                                                             | Notes                 |
| ----------------------------- | ------------------------------------------------------------------------------------- | --------------------- |
| Engineering Slice Standard    | ES-000 · `ENGINEERING-SLICE-STANDARD.md`                                              | Frozen ADR-0092       |
| Portfolio Engineering Charter | APZHUB-ENG-002                                                                        | Dual Approval §12     |
| Phase 1A Review               | [`PHASE-1A-BASELINE-1.2-REVIEW.md`](./APZHUB-ENG-002/PHASE-1A-BASELINE-1.2-REVIEW.md) | Governance checkpoint |

---

## 7. Change control

1. Dual Approval → Catalogue Active.
2. Publish normative body.
3. New Baseline version with full adopted set.
4. Record Board decision and effective date.
5. No Baseline membership for Proposed / Under Review standards.

---

## 8. Product Board record (Baseline 1.2)

```text
Programme: APZHUB-ENG-002
Phase: 1
Artefact: APZHUB Enterprise Engineering Baseline
Version: 1.2
Status: ACTIVE · ESTABLISHED
Included: ES-001, ES-002, ES-003
Trigger: ES-003 Product Board CERTIFIED
Decision (UTC): 20260802T120716Z
Engineering: NONE
Repository: CLEAN
Next: Phase 1A Baseline 1.2 Review — pause before ES-004
```

---

## 9. Document history

| Baseline | Event                     | Notes                                             |
| -------- | ------------------------- | ------------------------------------------------- |
| 1.0      | ESTABLISHED / CERTIFIED   | ES-001 only                                       |
| 1.1      | Active                    | ES-002 added                                      |
| 1.2      | **ESTABLISHED** milestone | Specify → Test → Certify complete; Phase 1A pause |

---

_End of APZHUB Enterprise Engineering Baseline_
