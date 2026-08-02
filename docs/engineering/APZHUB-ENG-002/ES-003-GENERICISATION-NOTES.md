# ES-003 — Genericisation Notes

| Field            | Value                                                |
| ---------------- | ---------------------------------------------------- |
| Catalogue ID     | ES-003                                               |
| Candidate        | APZHUB Enterprise Engineering Specification Template |
| Programme        | APZHUB-ENG-002                                       |
| Method           | **Abstraction** (not duplication)                    |
| Reference source | APZQEP Engineering Specification Template v1.0       |
| Status           | COMPLETE for authorship pack                         |

---

## 1. Promotion method applied

```text
Review APZQEP Specification Template
  → Extract generic contract structure
  → Remove product-specific material
  → Architecture Review
  → Product Board review (pending)
  → Catalogue: Proposed → Under Review
  → Baseline: UNCHANGED (1.1) until Active
```

---

## 2. Retained (enterprise-durable)

| Concern                                                        | Rationale                            |
| -------------------------------------------------------------- | ------------------------------------ |
| Contract between Owner/Board and Engineering                   | Portfolio-wide                       |
| Mandatory section presence (`NONE` / `N/A` + reason)           | Completeness                         |
| Dependencies graph (Depends On / Delivers / Blocks / Deferred) | Sequencing integrity                 |
| Architecture confirmation gate                                 | Prevent layer violations             |
| Acceptance criteria must be testable                           | Certification readiness              |
| Stop conditions including dependency/security                  | Safety                               |
| Final Report block                                             | Auditable close                      |
| Release/Deployment default NONE                                | Authority hygiene                    |
| Short Owner cover pointing at full spec                        | Usability without weakening contract |

---

## 3. Removed or generalised

| APZQEP-specific                                        | Enterprise treatment                         |
| ------------------------------------------------------ | -------------------------------------------- |
| Authority = APZQEP Constitution / Handbook / Standards | Charter + Baseline + ES-001/ES-002           |
| Product field fixed to APZQEP                          | `{{PRODUCT}}`                                |
| Slice ID pattern `APZQEP-<PROGRAMME>-S<nn>`            | Stable unique Work ID per product convention |
| Evidence root `evidence/apzqep/`                       | `evidence/<product-or-programme>/`           |
| Testing/Certification “when COMPLETE” product refs     | ES-001 / ES-002 when Active                  |
| Hierarchy under APZQEP Framework                       | Hierarchy under Baseline / Charter           |
| Suggested path under `docs/products/apzqep/`           | Product-neutral path patterns                |
| “project isolation” only                               | workspace / project isolation                |
| Framework extension language                           | Catalogue ID ES-003                          |

---

## 4. Explicitly not promoted

- APZQEP Handbook / Standards body text
- Product Engineering Framework as enterprise law
- Replacement of ENG-001 short slice template (complementary — see §5 of candidate)

---

## 5. Dual-authority check

| Concern                         | Existing artefact                    | Conflict?                |
| ------------------------------- | ------------------------------------ | ------------------------ |
| Short Owner template            | ENGINEERING-SLICE-TEMPLATE (ENG-001) | No — complementary       |
| Testing / Certification content | ES-001 / ES-002 Active               | No — template cites them |
| Competing Active Spec Template  | None                                 | Clear                    |
| Baseline                        | Remains 1.1                          | Correct                  |

---

## 6. Architecture Review checklist

- [x] Product-neutral contract structure
- [x] Mandatory Dependencies retained
- [x] ES-001 / ES-002 cited, not redefined
- [x] Baseline not modified
- [x] Architecture Review recorded
- [x] Product Board Certification — **CERTIFIED** 20260802T120716Z → ACTIVE · Baseline 1.2

---

_End of ES-003 Genericisation Notes_
