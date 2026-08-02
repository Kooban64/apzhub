# ES-001 — Genericisation Notes

| Field            | Value                              |
| ---------------- | ---------------------------------- |
| Catalogue ID     | ES-001                             |
| Candidate        | APZHUB Enterprise Testing Standard |
| Programme        | APZHUB-ENG-002                     |
| Method           | **Abstraction** (not duplication)  |
| Reference source | APZQEP Testing Standard v1.0       |
| Status           | COMPLETE for authorship pack       |

---

## 1. Promotion method applied

```text
Review APZQEP Testing Standard
  → Extract generic content
  → Remove product-specific material
  → Architecture alignment (Foundation / ENG-001 / Document 000)
  → Product Board review (pending)
  → Publish APZHUB standard (candidate authored)
  → Catalogue: Proposed → Under Review
```

Governing rule:

> Enterprise standards shall never be derived by duplication.  
> They shall be derived by abstraction.

---

## 2. Retained (enterprise-durable)

| Concern                                        | Rationale                        |
| ---------------------------------------------- | -------------------------------- |
| Property-based testing over coverage theatre   | Portfolio-wide quality principle |
| Mandatory pyramid levels + applicability rules | Product-independent              |
| Default deny + tenant isolation + grant edges  | Aligns with Zero Trust / IAM     |
| Migration / regression / boundary gates        | Monorepo-safe                    |
| Evidence fields without product lock-in        | Auditability                     |
| Flaky-as-defect; no secret-in-fixture          | Universal                        |
| Spec ↔ test mapping obligation                 | Engineering contract             |
| Tooling non-freeze + CI determinism            | Avoid vendor lock as law         |

---

## 3. Removed or generalised (product-specific)

| APZQEP-specific                                            | Enterprise treatment                                  |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| Authority = APZQEP Constitution / Handbook / Framework     | Authority = Portfolio Engineering Charter + catalogue |
| Scope = “All APZQEP engineering”                           | Scope = all APZHUB portfolio engineering              |
| Evidence root `evidence/apzqep/`                           | `evidence/<product-or-programme>/`                    |
| “project isolation” as APZQEP domain term                  | “workspace / project isolation where used”            |
| Naming “per APZQEP Engineering Standards §10”              | Enterprise default naming; products MAY specialise    |
| Vitest/Playwright as implied APZQEP toolchain              | Reference implementation note only                    |
| Certification Standard “when COMPLETE” (product programme) | ES-002 when Active; ENG-001 interim                   |
| Framework extension language (APZQEP-ENG-001)              | Catalogue ID ES-001 under ENG-002                     |
| Package path / product jargon                              | None retained as normative                            |

---

## 4. Explicitly not promoted

- APZQEP product architecture assumptions
- Quality Intelligence / evidence-catalogue domain rules
- Product Engineering Framework text as enterprise law
- Copy of APZQEP handbook Part IX

---

## 5. Residual product relationship

After ES-001 becomes **Active**:

- APZQEP Testing Standard MAY remain as product specialisation / citation bridge.
- Product SHOULD declare conformance to ES-001 and MAY add stricter local rules.
- APZQEP-ENG-001 remains ARCHIVED; no programme reopen required for citation maintenance.

---

## 6. Dual-authority check

| Concern                           | Existing enterprise artefact | Conflict?                                 |
| --------------------------------- | ---------------------------- | ----------------------------------------- |
| Slice lifecycle / certify gates   | APZHUB-ENG-001 / ADR-0092    | No — complementary                        |
| Quality pyramid (Foundation)      | Foundation quality docs      | No — ES-001 sharpens operable obligations |
| Competing Active Testing Standard | None                         | Clear                                     |

---

## 7. Architecture review checklist

- [x] No Document 000 contradiction identified in authorship
- [x] No mandatory Enterprise Edition / SaaS vendor dependency
- [x] No product package names as normative requirements
- [x] Secrets / Zero Trust posture preserved
- [x] Product Board Certification of ES-001 body — **CERTIFIED** 20260802T113408Z → ACTIVE

---

_End of ES-001 Genericisation Notes_
