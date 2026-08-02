# APZHUB Enterprise Engineering Baseline

| Field              | Value                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Document           | APZHUB-ENTERPRISE-ENGINEERING-BASELINE                                                             |
| Programme          | APZHUB-ENG-002                                                                                     |
| Classification     | **Enterprise Engineering System**                                                                  |
| Series status      | **STABLE** (Baseline **1.x**)                                                                      |
| Current version    | **1.2**                                                                                            |
| Status             | **ACTIVE** · **STABLE**                                                                            |
| Certified (1.2)    | Product Board — 2026-08-02 (`20260802T120716Z`)                                                    |
| Series STABLE      | Product Board — 2026-08-02 (`20260802T121525Z`) · Phase 1A **CERTIFIED**                           |
| Governance Version | [APZHUB-ENGINEERING-GOVERNANCE.md](./APZHUB-ENGINEERING-GOVERNANCE.md) **1.0 STABLE**              |
| Authority          | [Portfolio Engineering Charter](./APZHUB-ENG-002/PORTFOLIO-ENGINEERING-CHARTER.md) (**CERTIFIED**) |
| Companion          | [APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md](./APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md)           |
| Policy             | [STABLE-BASELINE-POLICY.md](./APZHUB-ENG-002/STABLE-BASELINE-POLICY.md)                            |
| Process freeze     | [GOVERNANCE-PROCESS-FREEZE.md](./APZHUB-ENG-002/GOVERNANCE-PROCESS-FREEZE.md) · Charter §14        |
| Declaration        | [BASELINE-1.x-STABLE.md](./APZHUB-ENG-002/BASELINE-1.x-STABLE.md)                                  |
| Technical content  | **NONE** — adopted-set inventory only                                                              |
| Engineering        | NONE                                                                                               |
| Governance era     | Era 1 **COMPLETE** · Phase **C — Evolve the Enterprise**                                           |
| Next enhancement   | ES-004 — first enhancement candidate (**NOT AUTHORISED** until Owner instruction)                  |

---

## Baseline Status

```text
Baseline Status

Series:
1.x STABLE

Current Version:
1.2

Current Authority:
Product Board

Effective Date:
2026-08-02

Status:
ACTIVE · STABLE

Classification:
Enterprise Engineering System

Current Standards:
ES-001
ES-002
ES-003

Capability:
Specify → Test → Certify

Phase 1A:
CERTIFIED

Next Planned Version:
1.3 (enhancement — Pending ES-004 Dual Approval)

Stability evaluation:
CLOSED (no longer under evaluation)
```

| Field                 | Value                                        |
| --------------------- | -------------------------------------------- |
| Series                | **1.x STABLE**                               |
| Current version       | **1.2**                                      |
| Current authority     | Product Board                                |
| Effective date        | 2026-08-02                                   |
| Current standards     | ES-001, ES-002, ES-003                       |
| Milestone             | ESTABLISHED → **STABLE**                     |
| Phase 1A              | **CERTIFIED**                                |
| Next planned version  | **1.3** (enhancement; ES-004 not authorised) |
| ES-004 classification | **Enhancement** to Stable Baseline 1.x       |

---

## 1. Purpose

This Baseline records which enterprise engineering standards **currently define** APZHUB.

It answers:

> **What engineering standards are currently mandatory across the enterprise?**

| Artefact                 | Answers                                                                     |
| ------------------------ | --------------------------------------------------------------------------- |
| **Standards Catalogue**  | _What engineering standards exist?_                                         |
| **Engineering Baseline** | _What engineering standards are currently mandatory across the enterprise?_ |

**Strong rule:** Baseline minor version changes **only** when a standard becomes **ACTIVE** (Dual Approval).

**Stable rule:** Series **1.x** is **STABLE**. Future Active standards are **enhancements**. Stability is not re-evaluated per enhancement ([Charter §13](./APZHUB-ENG-002/PORTFOLIO-ENGINEERING-CHARTER.md)).

---

## 2. Current Baseline

```text
Engineering Baseline

Series: 1.x STABLE
Version: 1.2
Status: ACTIVE

Enterprise Standards

ES-001  Enterprise Testing Standard          (Test)
ES-002  Enterprise Certification Standard    (Certify)
ES-003  Enterprise Engineering Spec Template (Specify)
```

### Delivery lifecycle

```text
Specify (ES-003) → Test (ES-001) → Certify (ES-002)
Enterprise-wide.
```

---

## 3. Included standards (Baseline 1.2)

| ID     | Title                                         | Role    | Status      | Path                                           |
| ------ | --------------------------------------------- | ------- | ----------- | ---------------------------------------------- |
| ES-001 | Enterprise Testing Standard                   | Test    | ACTIVE v1.0 | `APZHUB-TESTING-STANDARD.md`                   |
| ES-002 | Enterprise Certification Standard             | Certify | ACTIVE v1.0 | `APZHUB-CERTIFICATION-STANDARD.md`             |
| ES-003 | Enterprise Engineering Specification Template | Specify | ACTIVE v1.0 | `APZHUB-ENGINEERING-SPECIFICATION-TEMPLATE.md` |

**Product obligation:** All APZHUB products SHALL conform to Active Baseline **1.2**. Specialisations MAY tighten, never weaken.

---

## 4. Baseline version history

| Baseline Version | Included Standards     | Effective  | Notes                                         |
| ---------------- | ---------------------- | ---------- | --------------------------------------------- |
| 1.0              | ES-001                 | 2026-08-02 | Foundational                                  |
| 1.1              | ES-001, ES-002         | 2026-08-02 | Foundational                                  |
| **1.2**          | ES-001, ES-002, ES-003 | 2026-08-02 | Foundational · ESTABLISHED                    |
| **1.x STABLE**   | (series)               | 2026-08-02 | Phase 1A CERTIFIED — evolving era begins      |
| 1.3 _(planned)_  | + ES-004               | —          | **Enhancement** (when Dual Approval complete) |

---

## 5. Versioning policy (STABLE series)

| Change type     | Example         | Meaning                                          |
| --------------- | --------------- | ------------------------------------------------ |
| **Minor**       | 1.2 → 1.3       | Enhancement — additional standard becomes ACTIVE |
| **Major**       | 1.x → 2.0       | Re-baselining — Product Board only               |
| **Maintenance** | no version bump | Editorial; obligations unchanged                 |

See [STABLE-BASELINE-POLICY.md](./APZHUB-ENG-002/STABLE-BASELINE-POLICY.md).

---

## 6. Related artefacts

| Artefact                           | Notes                                           |
| ---------------------------------- | ----------------------------------------------- |
| ES-000 / ENG-001 Slice Standard    | Frozen ADR-0092 — outside 1.x series membership |
| Charter §12 Dual Approval          | Required for every Active standard              |
| Charter §13 Stable Baseline Policy | Permanent                                       |
| Phase 1A                           | CERTIFIED                                       |

---

## 7. Change control

1. Dual Approval → Catalogue Active.
2. Publish normative body.
3. Minor Baseline bump (enhancement) listing full adopted set.
4. Do not reopen series stability evaluation.
5. Major version only by Product Board.

---

## 8. Product Board records

### Baseline 1.2 ESTABLISHED

ES-003 CERTIFIED · Specify → Test → Certify complete.

### Phase 1A CERTIFIED · Series 1.x STABLE

```text
Decision (UTC): 20260802T121525Z
Board question: Can every product adopt Baseline 1.2 without ambiguity? YES
Series status: STABLE
Era: Evolving (foundation complete)
```

---

## 9. Document history

| Event      | Notes                                                   |
| ---------- | ------------------------------------------------------- |
| 1.0–1.2    | Foundational promotions                                 |
| Phase 1A   | System review COMPLETE → CERTIFIED                      |
| 1.x STABLE | Governance foundation complete; enhancements thereafter |

---

_End of APZHUB Enterprise Engineering Baseline_
