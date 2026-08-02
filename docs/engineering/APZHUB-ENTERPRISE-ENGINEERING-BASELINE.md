# APZHUB Enterprise Engineering Baseline

| Field             | Value                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Document          | APZHUB-ENTERPRISE-ENGINEERING-BASELINE                                                             |
| Programme         | APZHUB-ENG-002                                                                                     |
| Classification    | Enterprise Engineering Governance                                                                  |
| Status            | **ACTIVE**                                                                                         |
| Current version   | **1.0**                                                                                            |
| Authority         | [Portfolio Engineering Charter](./APZHUB-ENG-002/PORTFOLIO-ENGINEERING-CHARTER.md) (**CERTIFIED**) |
| Companion         | [APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md](./APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md)           |
| Technical content | **NONE** — adopted-set inventory only                                                              |
| Engineering       | NONE                                                                                               |

---

## 1. Purpose

This Baseline records which enterprise engineering standards **currently define** APZHUB.

It answers:

> **What engineering standards currently define APZHUB?**

| Artefact                 | Answers                                             |
| ------------------------ | --------------------------------------------------- |
| **Standards Catalogue**  | Everything that exists (Proposed → Retired)         |
| **Engineering Baseline** | What is currently **adopted** as the enterprise set |

The Baseline is the governance equivalent of a software release for engineering standards.

---

## 2. Current Baseline

```text
Engineering Baseline

1.0

ES-001
```

| Field                   | Value                                                               |
| ----------------------- | ------------------------------------------------------------------- |
| Baseline version        | **1.0**                                                             |
| Effective (UTC)         | 2026-08-02 (`20260802T113952Z`)                                     |
| Included standards      | ES-001                                                              |
| Product Board authority | ES-001 CERTIFIED `20260802T113408Z`; Baseline established this date |
| Supersedes              | None (first Baseline)                                               |

---

## 3. Included standards (Baseline 1.0)

### ES-001 — formal register entry

```text
Enterprise Engineering Standard

ID:
ES-001

Title:
APZHUB Enterprise Testing Standard

Version:
1.0

Status:
ACTIVE

Authority:
APZHUB Engineering Governance

Origin:
APZQEP Engineering Framework v1.0

Promotion Method:
ABSTRACTION

Reference Implementation:
APZQEP

Scope:
Enterprise

Implementation:
Mandatory for all APZHUB products

Review:
Annual
```

| Field          | Value                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| Normative path | [`APZHUB-TESTING-STANDARD.md`](./APZHUB-TESTING-STANDARD.md)            |
| Catalogue row  | ES-001 **Active**                                                       |
| Board decision | [`ES-001-PROMOTION-PACK.md`](./APZHUB-ENG-002/ES-001-PROMOTION-PACK.md) |
| Promotion date | 2026-08-02                                                              |

**Product obligation:** Future and current products (including APZ Projects, Support, Time, Documents, Law Platform, APZQEP, and successors) SHALL reference **ES-001** for enterprise testing obligations. Products MUST NOT invent conflicting testing philosophies; product specialisations MAY tighten, never weaken, Active Baseline standards.

---

## 4. Baseline version history

| Baseline Version | Included Standards     | Effective (UTC) | Board / evidence                       |
| ---------------- | ---------------------- | --------------- | -------------------------------------- |
| **1.0**          | ES-001                 | 2026-08-02      | ES-001 CERTIFIED; Baseline established |
| 1.1 _(planned)_  | ES-001, ES-002         | —               | After ES-002 ACTIVE                    |
| 1.2 _(planned)_  | ES-001, ES-002, ES-003 | —               | After ES-003 ACTIVE                    |

Planned rows are forward guidance only. They do not authorise promotion.

---

## 5. Versioning policy

1. Baseline **1.0** = first adopted ENG-002 enterprise standard set (ES-001).
2. Each new **Active** enterprise standard from the promotion wave increments the Baseline minor version (**1.0 → 1.1 → 1.2 …**) and lists the full adopted set.
3. A **major** Baseline bump (e.g. 2.0) requires Product Board decision (breaking change to the adopted set, mass supersession, or Board-declared reset).
4. Removing or superseding a standard from the adopted set requires Board decision and a new Baseline version.
5. Catalogue rows for Proposed / Under Review / Deferred standards are **not** in the Baseline until Active.
6. Baseline versions are never rewritten in place for adoption history; append a new version row.

---

## 6. Related enterprise artefacts (outside this Baseline series)

These remain in force but are **not** versioned inside Baseline 1.x (pre-ENG-002 or parallel authority):

| Artefact                      | Path / ID                                | Notes                  |
| ----------------------------- | ---------------------------------------- | ---------------------- |
| Engineering Slice Standard    | ES-000 · `ENGINEERING-SLICE-STANDARD.md` | Frozen ADR-0092        |
| Portfolio Engineering Charter | APZHUB-ENG-002                           | Governs promotion      |
| Document 000 / Foundation     | `docs/000-…` · Foundation pack           | Supreme / architecture |

When Board later decides to fold additional artefacts into the Baseline series, do so by new Baseline version + catalogue alignment.

---

## 7. Change control

1. Promote standard to Active in the **Catalogue** first.
2. Publish or amend the normative standard body.
3. Publish a new **Baseline** version listing the full adopted set.
4. Record Board decision reference and effective date here.
5. Do not claim Baseline membership for standards that are only Proposed or Under Review.

---

## 8. Document history

| Baseline | Event       | Notes                                                   |
| -------- | ----------- | ------------------------------------------------------- |
| 1.0      | Established | First Baseline; ES-001 only; promotion lifecycle proven |

---

_End of APZHUB Enterprise Engineering Baseline_
