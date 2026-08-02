# APZQEP Engineering Documentation Framework

| Field          | Value                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| Programme      | APZQEP-ENG-001                                                         |
| Title          | Engineering Documentation Framework                                    |
| Product        | [APZQEP Engineering Framework v1.0](./APZQEP-ENGINEERING-FRAMEWORK.md) |
| Classification | Product Engineering Documentation                                      |
| Path           | `docs/products/apzqep/engineering/`                                    |
| Engineering    | **NONE** — documentation only                                          |
| Status         | **Framework v1.0 BASELINED** — specialised standards continue          |

---

## Purpose

This folder hosts the **APZQEP Engineering Framework** and its specialised extensions.

The Framework exists to:

- eliminate duplication of methodology from future slice instructions;
- preserve engineering quality and consistency;
- give Product Board, engineers, and AI agents a single inheritance point;
- keep APZHUB Foundation, ADR-0092, and certified slices authoritative without rewriting them.

**Future engineering slices shall conform to APZQEP Engineering Framework v1.0** rather than redefining engineering methodology.

---

## APZQEP Engineering Framework v1.0 (product)

The Framework is the **named collection** of core documents—not a separate methodology essay.

| Component              | Document                                                                   | Status                     |
| ---------------------- | -------------------------------------------------------------------------- | -------------------------- |
| Product declaration    | [APZQEP-ENGINEERING-FRAMEWORK.md](./APZQEP-ENGINEERING-FRAMEWORK.md)       | **BASELINED**              |
| README (this file)     | [README.md](./README.md)                                                   | COMPLETE                   |
| Constitution           | [APZQEP-ENGINEERING-CONSTITUTION.md](./APZQEP-ENGINEERING-CONSTITUTION.md) | COMPLETE                   |
| Handbook               | [APZQEP-ENGINEERING-HANDBOOK.md](./APZQEP-ENGINEERING-HANDBOOK.md)         | COMPLETE / Board CERTIFIED |
| Standards              | [APZQEP-ENGINEERING-STANDARDS.md](./APZQEP-ENGINEERING-STANDARDS.md)       | COMPLETE / Board CERTIFIED |
| Specification Template | [APZQEP-SLICE-TEMPLATE.md](./APZQEP-SLICE-TEMPLATE.md)                     | COMPLETE / Board CERTIFIED |

Citation form:

```text
Conforms to APZQEP Engineering Framework v1.0
```

---

## Structure (all documents in this folder)

| Document                                                                   | Role                                           | Authoring status                      |
| -------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------- |
| [APZQEP-ENGINEERING-FRAMEWORK.md](./APZQEP-ENGINEERING-FRAMEWORK.md)       | Named Framework product / baseline declaration | **BASELINED** v1.0                    |
| [APZQEP-ENGINEERING-CONSTITUTION.md](./APZQEP-ENGINEERING-CONSTITUTION.md) | Immutable principles only                      | **COMPLETE**                          |
| [APZQEP-ENGINEERING-HANDBOOK.md](./APZQEP-ENGINEERING-HANDBOOK.md)         | Master how-to manual                           | **COMPLETE**                          |
| [APZQEP-ENGINEERING-STANDARDS.md](./APZQEP-ENGINEERING-STANDARDS.md)       | Normative coding & repository standard         | **COMPLETE** (v1.0)                   |
| [APZQEP-SLICE-TEMPLATE.md](./APZQEP-SLICE-TEMPLATE.md)                     | Engineering Specification Template             | **COMPLETE** (v1.0 Normative)         |
| [APZQEP-TESTING-STANDARD.md](./APZQEP-TESTING-STANDARD.md)                 | Test pyramid and evidence                      | **COMPLETE** v1.0 Normative (Phase 5) |
| [APZQEP-CERTIFICATION-STANDARD.md](./APZQEP-CERTIFICATION-STANDARD.md)     | PASS / FAIL / STOP and gates                   | SKELETON — **next**                   |
| [APZQEP-API-STANDARD.md](./APZQEP-API-STANDARD.md)                         | REST / command / query API rules               | SKELETON                              |
| [APZQEP-DOMAIN-EVENT-STANDARD.md](./APZQEP-DOMAIN-EVENT-STANDARD.md)       | Event naming, envelope, evolution              | SKELETON                              |
| [APZQEP-DATABASE-STANDARD.md](./APZQEP-DATABASE-STANDARD.md)               | Schema, migration, repository rules            | SKELETON                              |
| [APZQEP-DOCUMENTATION-STANDARD.md](./APZQEP-DOCUMENTATION-STANDARD.md)     | Doc structure and lifecycle                    | SKELETON                              |
| [APZQEP-CHECKLISTS.md](./APZQEP-CHECKLISTS.md)                             | Reusable review checklists                     | SKELETON                              |
| [APZQEP-ENG-001-COMPLETION.md](./APZQEP-ENG-001-COMPLETION.md)             | Programme completion report                    | DRAFT                                 |

Specialised standards are **extensions** to Framework v1.0. They do not reopen the baseline unless Product Board versions the Framework.

---

## How to use this framework

### For a new engineering slice

1. State conformance: `Conforms to APZQEP Engineering Framework v1.0`.
2. Copy [APZQEP-SLICE-TEMPLATE.md](./APZQEP-SLICE-TEMPLATE.md) Section 2 into a new Engineering Specification.
3. Fill all placeholders (use `NONE` / `N/A` where empty—especially **Dependencies**).
4. **Reference** — do not copy — Constitution, Handbook, and applicable Standards.
5. Inherit process from APZHUB-ENG-001 / ADR-0092.
6. Certify using [APZQEP-CERTIFICATION-STANDARD.md](./APZQEP-CERTIFICATION-STANDARD.md) and [APZQEP-CHECKLISTS.md](./APZQEP-CHECKLISTS.md) when COMPLETE.

### For Cursor / AI agents

- Cite the Framework product; read the Constitution first on conflict.
- Do not invent a second engineering process in a slice instruction.
- Do not modify packages under a documentation-only programme.
- Prefer Handbook + Standards over restating methodology in chat.

### For Product Board

- Constitution = non-negotiable principles.
- Framework v1.0 = stable citation baseline.
- Handbook = how work is done.
- Certification Standard + Checklists = gate language (when COMPLETE).

---

## Relationship to APZHUB Engineering Standards

```text
APZHUB Engineering Standard
        │
        ▼
APZQEP Engineering Constitution
        │
        ▼
APZQEP Engineering Framework v1.0
        │
        ├── Engineering Handbook
        ├── Engineering Standards
        └── Engineering Specification Template
                │
                ▼
        Engineering Specifications (per slice)
                │
                ▼
        Specialised Standards (extensions)
```

| Layer                                                                                          | Authority                                              |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [docs/000-apzhub-engineering-constitution.md](../../../000-apzhub-engineering-constitution.md) | Platform-wide supreme engineering constitution         |
| APZHUB Engineering Standard / APZHUB-ENG-001 / ADR-0092                                        | Enterprise engineering model and slice process freeze  |
| Foundation docs 001–029                                                                        | Architecture and SDKs                                  |
| [APZQEP Engineering Constitution](./APZQEP-ENGINEERING-CONSTITUTION.md)                        | Immutable APZQEP principles                            |
| [Engineering Framework v1.0](./APZQEP-ENGINEERING-FRAMEWORK.md)                                | Named product / baseline citation                      |
| [Handbook](./APZQEP-ENGINEERING-HANDBOOK.md)                                                   | How engineering is performed (guidance)                |
| [Engineering Standards](./APZQEP-ENGINEERING-STANDARDS.md)                                     | Exactly how artefacts MUST look (**normative**)        |
| Slice specifications                                                                           | Scope and acceptance only — no methodology restatement |

On conflict:

1. APZHUB Document 000
2. ADR-0092 / APZHUB-ENG-001 slice process
3. APZQEP Engineering Constitution
4. Engineering Framework core (Handbook / Standards / Specification Template)
5. Specialised Standards
6. Individual slice specifications

---

## Relationship to APZQEP Engineering

- APZQEP-120-S01…S06 remain **certified** and must not be rewritten.
- Product roadmap, solution architecture, and execution plan remain authoritative.
- This Framework governs **how** future APZQEP slices are specified and certified; it does not reopen S01–S06.

---

## Phased authoring sequence (APZQEP-ENG-001)

1. README — COMPLETE
2. Engineering Constitution — COMPLETE
3. Engineering Handbook — COMPLETE / Board CERTIFIED
4. Engineering Standards — COMPLETE / Board CERTIFIED
5. Engineering Specification Template — COMPLETE / Board CERTIFIED (Phase 4)
6. **Engineering Framework v1.0 BASELINED** (commit `41741490`)
7. Testing Standard — **COMPLETE** / Product Board **CERTIFIED** (Phase 5)
8. Certification Standard — next
9. API Standard
10. Domain Event Standard
11. Database Standard
12. Documentation Standard
13. Engineering Checklists
14. Completion Report (final)

Until a specialised document’s status is **COMPLETE**, treat it as non-authoritative skeleton. Normative documents state `Status: Normative` in their header.

---

## Constraints (this programme)

- Documentation only
- No package, API, architecture, slice, release, or certification record rewrites of S01–S06
- No deployment

---

## Prior artefacts in this folder

Older guides (`ENGINEERING-FOUNDATION.md`, `DEVELOPMENT-GUIDE.md`, `TESTING-GUIDE.md`, `QUALITY-GATES.md`, `CI-CD.md`, `REPOSITORY-STRUCTURE.md`, etc.) remain preserved. They are **not** rewritten by APZQEP-ENG-001. New slices inherit the Engineering Framework; historical guides stay for reference.

---

## Evidence

Programme evidence is filed under `docs/operations/evidence/apzqep/` with prefix `APZQEP-ENG-001`.
