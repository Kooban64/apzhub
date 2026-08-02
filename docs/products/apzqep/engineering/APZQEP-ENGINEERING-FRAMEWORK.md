# APZQEP Engineering Framework

| Field               | Value                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Product             | **APZQEP Engineering Framework**                                                         |
| Version             | **1.0**                                                                                  |
| Status              | **BASELINED** · **MAINTENANCE**                                                          |
| Changelog           | [APZQEP-ENGINEERING-FRAMEWORK-CHANGELOG.md](./APZQEP-ENGINEERING-FRAMEWORK-CHANGELOG.md) |
| Programme           | APZQEP-ENG-001 **COMPLETE**                                                              |
| Classification      | Product Engineering Framework                                                            |
| Baseline date (UTC) | 2026-08-02                                                                               |
| Engineering         | NONE — documentation product                                                             |
| Git release tag     | **NONE** — documentation milestone only                                                  |

---

## What this is

The APZQEP Engineering Framework is **not** a sixth methodology document.

It is the **named product** formed by the core engineering documents that define how APZQEP engineering is performed and certified.

Future programmes and slices SHOULD cite:

```text
Conforms to APZQEP Engineering Framework v1.0
```

rather than listing each core document individually—unless a specific clause must be cited.

---

## Framework v1.0 composition (core)

| Component              | Document                                                                   | Role                                 |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------------------ |
| Entry / product face   | [README.md](./README.md)                                                   | Purpose, use, hierarchy              |
| Constitution           | [APZQEP-ENGINEERING-CONSTITUTION.md](./APZQEP-ENGINEERING-CONSTITUTION.md) | Immutable principles                 |
| Handbook               | [APZQEP-ENGINEERING-HANDBOOK.md](./APZQEP-ENGINEERING-HANDBOOK.md)         | How engineering is performed         |
| Standards              | [APZQEP-ENGINEERING-STANDARDS.md](./APZQEP-ENGINEERING-STANDARDS.md)       | Normative look-and-shape             |
| Specification Template | [APZQEP-SLICE-TEMPLATE.md](./APZQEP-SLICE-TEMPLATE.md)                     | Product Board ↔ Engineering contract |

These five artefacts collectively **are** Engineering Framework v1.0.

---

## Inheritance hierarchy

```text
APZHUB Engineering Standard
        │
        ▼
APZQEP Engineering Constitution
        │
        ▼
APZQEP Engineering Framework v1.0   ← this product (core set above)
        │
        ├── Engineering Handbook
        ├── Engineering Standards
        └── Engineering Specification Template
                │
                ▼
        Engineering Specifications (per slice)
                │
                ▼
        Specialised Standards (extensions — evolve after baseline)
```

Specialised standards (Testing, Certification, API, Domain Events, Database, Documentation, Checklists) are **extensions** to the Framework. They do not reopen Framework v1.0 unless Product Board issues a new framework version.

---

## Baseline rules

1. Framework v1.0 is a **stable citation target** for APZQEP engineering slices.
2. Normative changes to core components REQUIRE a Framework version bump (for example 1.0 → 1.1) or an approved ADR that records the exception.
3. Additive specialised standards MAY be published without bumping Framework v1.0 when they do not change the core five.
4. This baseline is **not** a package release, Git product tag, or deployment authority.

---

## Strategic note (non-normative)

Product Board anticipates that portions of Engineering Standards, Testing Standard, and Certification Standard MAY later be promoted into APZHUB-wide standards, with APZQEP remaining the reference implementation. The APZQEP Engineering Constitution is expected to remain product-specific.

---

## Related evidence

- Phase 4 Product Board CERTIFIED — `docs/operations/evidence/apzqep/20260802T075610Z-APZQEP-ENG-001-PHASE4-PRODUCT-BOARD.json`
- Framework v1.0 BASELINED — `docs/operations/evidence/apzqep/20260802T075610Z-APZQEP-ENGINEERING-FRAMEWORK-v1.0-BASELINE.json`
- Baseline commit — `41741490e9de0caa33cca9383281b25d8541a0c8` (`20260802T075610Z-APZQEP-ENGINEERING-FRAMEWORK-v1.0-BASELINE-COMMIT.json`)
