# APZHUB-ENG-002 — Promotion Matrix

| Field           | Value                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| Programme       | APZHUB-ENG-002                                                         |
| Status          | **ACCEPTED** — Product Board (Promotion Review CERTIFIED)              |
| Date            | 2026-08-02                                                             |
| Source baseline | APZQEP Engineering Framework v1.0 + Testing + Certification extensions |

---

## Disposition legend

| Disposition            | Meaning                                                                         |
| ---------------------- | ------------------------------------------------------------------------------- |
| **ALREADY APZHUB**     | Portfolio-owned today; do not re-promote; keep APZQEP citing it                 |
| **PROMOTE**            | Create / upgrade an APZHUB portfolio standard from proven content (genericised) |
| **PROMOTE CONCEPT**    | Adopt the abstraction without lifting product text wholesale                    |
| **KEEP PRODUCT**       | Remains APZQEP-owned; other products MAY later adopt patterns by choice         |
| **SPLIT**              | Current artefact becomes two authorities — portfolio + product                  |
| **SHARE BY REFERENCE** | Products cite the APZHUB or APZQEP artefact; do not fork copies                 |
| **NEVER DUPLICATE**    | Forbidden to maintain a second competing standard for the same concern          |

---

## Master matrix

| Artefact                                     | Current home                                     | Disposition                  | Target                                            | Rationale                                 |
| -------------------------------------------- | ------------------------------------------------ | ---------------------------- | ------------------------------------------------- | ----------------------------------------- |
| Engineering Slice Standard                   | `docs/engineering/ENGINEERING-SLICE-STANDARD.md` | **ALREADY APZHUB**           | APZHUB-ENG-001 (frozen)                           | Already portfolio                         |
| Slice Certification (ENG-001)                | `docs/engineering/SLICE-CERTIFICATION.md`        | **ALREADY APZHUB**           | ENG-001 pack; enhance via Certification promotion | Already portfolio                         |
| AI Engineering Workflow                      | `docs/engineering/AI-ENGINEERING-WORKFLOW.md`    | **PROMOTE** (align)          | APZHUB engineering workflow                       | Portfolio workflow                        |
| Engineering Checklist (ENG-001)              | `docs/engineering/ENGINEERING-CHECKLIST.md`      | **PROMOTE** (align)          | Portfolio checklists                              | Reusable gates                            |
| Engineering Slice Template (ENG-001)         | `docs/engineering/ENGINEERING-SLICE-TEMPLATE.md` | **PROMOTE** (align)          | Portfolio Engineering Specification Template      | Contract structure                        |
| APZQEP Engineering Specification Template    | `…/APZQEP-SLICE-TEMPLATE.md`                     | **PROMOTE** (source)         | Portfolio template                                | Same contract for every product           |
| APZQEP Testing Standard                      | `…/APZQEP-TESTING-STANDARD.md`                   | **PROMOTE**                  | APZHUB Testing Standard                           | Universal                                 |
| APZQEP Certification Standard                | `…/APZQEP-CERTIFICATION-STANDARD.md`             | **PROMOTE**                  | APZHUB Certification Standard                     | Portfolio acceptance                      |
| **Engineering Standards (current monolith)** | `…/APZQEP-ENGINEERING-STANDARDS.md`              | **SPLIT**                    | See § Standards split below                       | Avoid “partial” extraction from one doc   |
| Named Engineering Framework product          | `…/APZQEP-ENGINEERING-FRAMEWORK.md`              | **PROMOTE CONCEPT**          | Product Framework pattern                         | Citation model                            |
| Framework Changelog pattern                  | `…/APZQEP-ENGINEERING-FRAMEWORK-CHANGELOG.md`    | **PROMOTE CONCEPT**          | Per-framework changelog convention                | Governance evolution                      |
| APZQEP Engineering Constitution              | `…/APZQEP-ENGINEERING-CONSTITUTION.md`           | **KEEP PRODUCT**             | —                                                 | Product philosophy                        |
| APZQEP Engineering Handbook                  | `…/APZQEP-ENGINEERING-HANDBOOK.md`               | **KEEP PRODUCT**             | —                                                 | Product architecture / exemplar narrative |
| Product-specific architecture                | APZQEP solution architecture + S01–S06           | **KEEP PRODUCT**             | —                                                 | Exemplar, not portfolio law               |
| Domain Event Standard (planned)              | APZQEP skeleton                                  | **KEEP PRODUCT** (initially) | Revisit later                                     | Premature portfolio law                   |
| API Standard (planned)                       | APZQEP skeleton                                  | **KEEP PRODUCT** (initially) | Revisit later                                     | Avoid dual API law                        |
| Database Standard (planned)                  | APZQEP skeleton                                  | **KEEP PRODUCT** (initially) | Revisit later                                     | Foundation 011 already portfolio          |
| Documentation Standard (planned)             | APZQEP skeleton                                  | **PROMOTE** (likely later)   | Portfolio doc craft                               | Mostly generic                            |
| Engineering Checklists (planned APZQEP)      | APZQEP skeleton                                  | **PROMOTE** (merge)          | Portfolio checklists                              | No dual checklists                        |
| Document 000 / Foundation 001–029            | `docs/`                                          | **ALREADY APZHUB**           | Foundation                                        | Supreme                                   |

---

## Standards split (Board refinement)

Do **not** promote “Engineering Standards (partial).”

Publish **two** documents instead.

### APZHUB Engineering Standards (portfolio — PROMOTE / create)

Enterprise-wide conventions common across the portfolio:

- package naming (portfolio rules; product prefixes via profiles)
- repository naming
- documentation naming
- commit conventions
- evidence conventions
- certification naming
- release naming
- folder structure
- ADR conventions
- Markdown conventions
- engineering workflow conventions

Proposed home: `docs/engineering/APZHUB-ENGINEERING-STANDARDS.md` (name TBD in ENG-002 execution).

### APZQEP Engineering Standards (product — KEEP / reshape)

Product-specific conventions remain under APZQEP:

- evidence domain naming
- lifecycle conventions
- catalogue conventions
- integrity conventions
- storage conventions
- event naming specific to APZQEP
- API naming specific to APZQEP

Proposed home: retain `docs/products/apzqep/engineering/APZQEP-ENGINEERING-STANDARDS.md` as the product standard (reshaped during ENG-002 to inherit portfolio standards by reference).

### Transition rule

```text
Today:     one APZQEP Engineering Standards monolith (v1.0)
ENG-002:   publish APZHUB Engineering Standards
           reshape APZQEP Engineering Standards → product-only + "inherits APZHUB …"
```

This avoids trying to extract fragments from a single document while leaving product law ambiguous.

---

## Never duplicate

| Concern                                                                     | Single authority rule             |
| --------------------------------------------------------------------------- | --------------------------------- |
| Slice lifecycle process                                                     | APZHUB-ENG-001 only               |
| Portfolio PASS/FAIL/STOP (after promotion)                                  | One APZHUB Certification Standard |
| Portfolio test levels (after promotion)                                     | One APZHUB Testing Standard       |
| Engineering Specification contract (after promotion)                        | One portfolio template            |
| Portfolio naming/commit/evidence/ADR/Markdown conventions (after promotion) | One APZHUB Engineering Standards  |
| Product domain conventions (evidence/lifecycle/catalogue/…)                 | One APZQEP Engineering Standards  |
| Platform architecture / Zero Trust / data SoR                               | Foundation docs                   |
| Package promotion / release / GA                                            | Lifecycle Standard                |

**SHARE BY REFERENCE** is mandatory.

---

## Promotion shape

```text
APZQEP artefact (proven)
        │
        ▼
Genericise OR split (Standards case)
        │
        ▼
Publish APZHUB standard(s)
        │
        ▼
APZQEP becomes specialisation / product profile / exemplar
```

After promotion, APZQEP cites:

```text
Conforms to APZQEP Engineering Framework v1.0
Inherits APZHUB Testing Standard vX
Inherits APZHUB Certification Standard vX
Inherits APZHUB Engineering Standards vX
```

---

## Product Board recommendations (CERTIFIED)

| Recommendation                                               | Disposition |
| ------------------------------------------------------------ | ----------- |
| Testing / Certification / Spec Template / Workflow → promote | Affirmed    |
| Framework concept → promote concept                          | Affirmed    |
| Engineering Standards → **SPLIT** (not partial)              | Affirmed    |
| Constitution / Handbook / product architecture → keep APZQEP | Affirmed    |
| API / Database / Domain Event → keep APZQEP initially        | Affirmed    |
| Pause APZQEP specialised expansion                           | Affirmed    |
| Do not execute APZHUB-ENG-002 in this session                | Affirmed    |

---

## Open questions for ENG-002 execution session

1. Exact filenames for APZHUB Testing / Certification / Engineering Standards.
2. Whether APZQEP Testing/Certification become thin wrappers or retain product gate addenda.
3. Whether every APZHUB product must adopt the named Framework pattern.
4. Sequencing remains: Testing → Certification → Template → Workflow → **Standards split** → Framework pattern → close.

---

## Related

- [PROGRAMME-DESIGN.md](./PROGRAMME-DESIGN.md)
- [README.md](./README.md)
