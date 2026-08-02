# ES-002 — Genericisation Notes

| Field            | Value                                    |
| ---------------- | ---------------------------------------- |
| Catalogue ID     | ES-002                                   |
| Candidate        | APZHUB Enterprise Certification Standard |
| Programme        | APZHUB-ENG-002                           |
| Method           | **Abstraction** (not duplication)        |
| Reference source | APZQEP Certification Standard v1.0       |
| Status           | COMPLETE for authorship pack             |

---

## 1. Promotion method applied

```text
Review APZQEP Certification Standard
  → Extract generic content
  → Remove product-specific material
  → Architecture Review
  → Product Board review (pending)
  → Catalogue: Proposed → Under Review
  → Baseline: UNCHANGED (1.0) until Active
```

Governing rules:

> Enterprise standards shall never be derived by duplication.  
> They shall be derived by abstraction.

> No enterprise standard may become ACTIVE without Architecture Review  
> and Product Board Certification (Dual Approval).

---

## 2. Retained (enterprise-durable)

| Concern                               | Rationale                        |
| ------------------------------------- | -------------------------------- |
| PASS / FAIL / STOP primary vocabulary | Decidable completion             |
| CONDITIONAL PASS with waiver          | Controlled residual risk         |
| Board CERTIFIED / REJECTED / DEFERRED | Governance layer separation      |
| Engineering ≠ Release ≠ GA            | Prevent authority collapse       |
| Gate matrix (authority → regression)  | Auditable structure              |
| Evidence minimum + CERTIFICATION JSON | Portfolio audit trail            |
| Remediation without history rewrite   | Integrity                        |
| STOP triggers                         | Safety / Constitution protection |
| Levels of certification               | Clear ownership of outcomes      |

---

## 3. Removed or generalised (product-specific)

| APZQEP-specific                                                     | Enterprise treatment                          |
| ------------------------------------------------------------------- | --------------------------------------------- |
| Authority = APZQEP Constitution / Handbook / Framework              | Portfolio Charter + catalogue + Baseline      |
| Scope = “All APZQEP engineering certification”                      | All APZHUB portfolio engineering              |
| Evidence root `evidence/apzqep/`                                    | `evidence/<product-or-programme>/`            |
| Framework citation “APZQEP Engineering Framework v1.0” as mandatory | Applicable Framework / Baseline citations     |
| Testing gate → APZQEP Testing Standard                              | ES-001 when Active; interim operable practice |
| “project isolation” as product domain term                          | workspace / project isolation where used      |
| Historical slices APZQEP-120-S01…S06 named                          | Generic “historically certified units”        |
| Framework extension / APZQEP-ENG-001 language                       | Catalogue ID ES-002 under ENG-002             |
| Package / product jargon as normative                               | None retained                                 |

---

## 4. Explicitly not promoted

- APZQEP product lifecycle programme details
- Product Engineering Framework core as enterprise law
- Copy of APZQEP handbook Part XI
- Automatic Baseline bump (forbidden until Board CERT → Active)

---

## 5. Residual product relationship

After ES-002 becomes **Active**:

- APZQEP Certification Standard MAY remain as product specialisation / citation bridge.
- Product SHOULD declare conformance to ES-002 and MAY add stricter local rules.
- APZQEP-ENG-001 remains ARCHIVED.

---

## 6. Dual-authority check

| Concern                                 | Existing enterprise artefact         | Conflict?                                          |
| --------------------------------------- | ------------------------------------ | -------------------------------------------------- |
| Slice outcomes                          | APZHUB-ENG-001 / SLICE-CERTIFICATION | No — complementary; ES-002 elevates enterprise law |
| Testing gate content                    | ES-001 ACTIVE                        | No — ES-002 references ES-001                      |
| Competing Active Certification Standard | None                                 | Clear                                              |
| Baseline                                | Remains 1.0 until Active             | Correct                                            |

---

## 7. Architecture Review checklist

- [x] No Document 000 contradiction identified in authorship
- [x] No product package names as normative requirements
- [x] PASS ≠ Release ≠ GA preserved
- [x] Dual Approval principle reflected
- [x] Baseline not modified
- [x] Architecture Review recorded (see ES-002-ARCHITECTURE-REVIEW.md)
- [x] Product Board Certification of ES-002 body — **CERTIFIED** 20260802T115728Z → ACTIVE · Baseline 1.1

---

_End of ES-002 Genericisation Notes_
