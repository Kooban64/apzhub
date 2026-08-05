# APZHUB Portfolio Adoption Statement

| Field     | Value                                                          |
| --------- | -------------------------------------------------------------- |
| Status    | **GOVERNING**                                                  |
| Timestamp | 20260805T074500Z                                               |
| Authority | Owner direction post REFERENCE IMPLEMENTATION #001, #002, #003 |

## Formal portfolio statement

> **The APZHUB Product Native Adoption Standard has been validated across multiple independent products and is now the authoritative portfolio adoption methodology. Future product adoption shall focus on business priority rather than methodological refinement.**

Companion maturity declaration: [APZHUB-NATIVE-ADOPTION-METHODOLOGY-MATURITY.md](./APZHUB-NATIVE-ADOPTION-METHODOLOGY-MATURITY.md)

Founding statement (still true):

> **APZ Time is REFERENCE IMPLEMENTATION #001. APZ Support is REFERENCE IMPLEMENTATION #002. APZ Projects is REFERENCE IMPLEMENTATION #003. Future products shall follow the Native Adoption Standard and APZQEP Enterprise Quality Baseline, with sequencing determined by portfolio priority, the Portfolio Capability Map, and operational evidence.**

## Gear change (in force)

| Was                                        | Is                                            |
| ------------------------------------------ | --------------------------------------------- |
| APZQEP is the project                      | **APZHUB is the project**                     |
| Programme → Slice → Certification → Freeze | **Portfolio → Product → Business Value**      |
| Create / prove standards                   | **Stop** — methodology mature; reuse Playbook |
| Build products to refine process           | **Choose products by operational value**      |

APZQEP is **infrastructure**. Discuss it only on release learning, justified provider work, or operational evidence.

### Three layers

| Layer                   | Focus                                                       | Status             |
| ----------------------- | ----------------------------------------------------------- | ------------------ |
| 1 — Platform Foundation | Identity, SDK, standards, APZQEP, Native Adoption, Playbook | **Mature**         |
| 2 — Product Experience  | Indistinguishable APZHUB products (not wrappers)            | **Active focus**   |
| 3 — Business Capability | What users buy into                                         | **Value delivery** |

## Portfolio operating categories

| Category                      | Meaning                                                         | Products (current)                           |
| ----------------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| **Reference Implementations** | Native + APZQEP complete; Playbook validated                    | APZ Time · APZ Support · APZ Projects        |
| **Portfolio Candidates**      | Production capability exists; next adoption is a value decision | APZ Documents · APZ Workflow · APZ Analytics |
| **Future Products**           | Not next Native Adoption by default                             | APZ Law Platform and others                  |

## Product maturity lifecycle

```text
Concept
        │
        ▼
Production (Existing Capability)
        │
        ▼
Native Adoption (N-01…N-04 — Playbook)
        │
        ▼
APZQEP Adoption (N-04 ops pack in force)
        │
        ▼
Reference Implementation (earned)
        │
        ▼
RI Retrospective
        │
        ▼
Operational Learning
        │
        ▼
Capability Expansion (separate Owner Auth)
```

## Reference Implementations are earned, not designated

| Criterion                            | Required                            |
| ------------------------------------ | ----------------------------------- |
| Native Adoption complete (N-01…N-03) | Yes                                 |
| APZQEP Adoption complete (N-04)      | Yes                                 |
| Operational use demonstrated         | Yes                                 |
| Operational learning collected       | Yes (for subsequent RIs after #001) |
| Stable production operation          | Yes                                 |
| Portfolio approval                   | Yes                                 |
| RI Retrospective completed           | Yes (practice in force)             |

| RI   | Product     | Path                                                                                           |
| ---- | ----------- | ---------------------------------------------------------------------------------------------- |
| #001 | APZ Time    | [../apztime/REFERENCE-IMPLEMENTATION-001.md](../apztime/REFERENCE-IMPLEMENTATION-001.md)       |
| #002 | APZ Support | [../apzsupport/REFERENCE-IMPLEMENTATION-002.md](../apzsupport/REFERENCE-IMPLEMENTATION-002.md) |

Retrospectives: [APZHUB-RI-RETROSPECTIVE.md](./APZHUB-RI-RETROSPECTIVE.md)

## Next product — business decision (QPR-001)

Ask each quarter:

> **Which product will create the greatest operational improvement for APZHUB over the next 3–6 months?**

**QPR-001 decision:** APZ Projects — **COMPLETE** as **REFERENCE IMPLEMENTATION #003**.

| Artefact         | Path                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Decision         | [APZHUB-PORTFOLIO-DECISION-PROJECTS-NEXT.md](./APZHUB-PORTFOLIO-DECISION-PROJECTS-NEXT.md) |
| Quarterly review | [APZHUB-QUARTERLY-PORTFOLIO-REVIEW.md](./APZHUB-QUARTERLY-PORTFOLIO-REVIEW.md)             |
| Capability map   | [APZHUB-PORTFOLIO-CAPABILITY-MAP.md](./APZHUB-PORTFOLIO-CAPABILITY-MAP.md)                 |
| Mission / ops    | [../apzprojects/](../apzprojects/) — **RI #003**                                           |
| Native Adoption  | [../apz-projects-native-001/](../apz-projects-native-001/) — **COMPLETE / FROZEN**         |

| Milestone               | Status                     |
| ----------------------- | -------------------------- |
| APZ Time (RI #001)      | ✅ Complete                |
| APZ Support (RI #002)   | ✅ Complete                |
| APZ Projects (RI #003)  | ✅ Complete                |
| APZ-PROJECTS-000        | ✅ CLOSED (Owner APPROVED) |
| APZ-PROJECTS-NATIVE-001 | ✅ COMPLETE / FROZEN       |

**Portfolio pause:** maintain the Capability Map before selecting the fourth product. Prerequisite remains: APPROVED Product Mission (**PRODUCT-000**) before Native Adoption opens. No parallel Native Adoption programmes.

APZQEP does not appear on product roadmaps — it is infrastructure.

## Native Adoption progress (portfolio view)

| Product       | Mission | Audit | Identity | Workspace | APZQEP | RI  |
| ------------- | ------- | :---: | :------: | :-------: | :----: | :-: |
| APZ Time      | ✅      |  ✅   |    ✅    |    ✅     |   ✅   | ✅  |
| APZ Support   | ✅      |  ✅   |    ✅    |    ✅     |   ✅   | ✅  |
| APZ Projects  | ✅      |  ✅   |    ✅    |    ✅     |   ✅   | ✅  |
| APZ Documents | –       |   –   |    –     |     –     |   –    |  –  |

## Standing constraints

- Do not open the next product programme solely because a prior Native Adoption finished
- Do not invent or redesign the Playbook without multi-product operational evidence
- Do not designate the next Reference Implementation by default
- Do not promote EPP entries to platform work before the promotion threshold
- Do not build shared identity abstractions from Validated Pattern evidence alone (EPP-001 Action: None)
- Select the fourth product via the Capability Map + portfolio priority — not engineering momentum

Emerging Portfolio Patterns: [APZHUB-EMERGING-PORTFOLIO-PATTERNS.md](./APZHUB-EMERGING-PORTFOLIO-PATTERNS.md) — **EPP-001 Validated Pattern · Action: None**

## Related

| Artefact                      | Path                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| Portfolio Capability Map      | [APZHUB-PORTFOLIO-CAPABILITY-MAP.md](./APZHUB-PORTFOLIO-CAPABILITY-MAP.md)                         |
| Methodology maturity          | [APZHUB-NATIVE-ADOPTION-METHODOLOGY-MATURITY.md](./APZHUB-NATIVE-ADOPTION-METHODOLOGY-MATURITY.md) |
| Native Adoption Standard      | [APZHUB-PRODUCT-NATIVE-ADOPTION-STANDARD.md](./APZHUB-PRODUCT-NATIVE-ADOPTION-STANDARD.md)         |
| Adoption Playbook             | [APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md](./APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md)                       |
| RI retrospective practice     | [APZHUB-RI-RETROSPECTIVE.md](./APZHUB-RI-RETROSPECTIVE.md)                                         |
| RI #001                       | [../apztime/REFERENCE-IMPLEMENTATION-001.md](../apztime/REFERENCE-IMPLEMENTATION-001.md)           |
| RI #002                       | [../apzsupport/REFERENCE-IMPLEMENTATION-002.md](../apzsupport/REFERENCE-IMPLEMENTATION-002.md)     |
| RI #003                       | [../apzprojects/REFERENCE-IMPLEMENTATION-003.md](../apzprojects/REFERENCE-IMPLEMENTATION-003.md)   |
| Working model                 | [APZHUB-WORKING-MODEL.md](./APZHUB-WORKING-MODEL.md)                                               |
| Existing portfolio governance | [../../governance/PORTFOLIO-GOVERNANCE.md](../../governance/PORTFOLIO-GOVERNANCE.md)               |
