# ADR-0092 — Engineering Slice Standard Freeze

| Item      | Value                                                 |
| --------- | ----------------------------------------------------- |
| ADR       | **ADR-0092**                                          |
| Title     | Engineering Slice Standard Freeze                     |
| Status    | **Accepted**                                          |
| Date      | 2026-08-01                                            |
| Product   | APZHUB (portfolio)                                    |
| Programme | APZHUB-ENG-001 (decision record; not a new programme) |
| Deciders  | Owner / APZOR Engineering                             |

> **Numbering note:** Owner guidance referred to this decision as “ADR-0090”. Numbers **ADR-0090** and **ADR-0091** are already allocated to Evidence Management (APZQEP-ARCH-016). This decision is therefore recorded as **ADR-0092**.

---

## Context

APZHUB-ENG-001 established the Engineering Slice Standard, template, checklist, slice certification, AI engineering workflow, and S01 reference pattern. APZQEP-120-S01 proved the model in production engineering.

Without a freeze, slice instructions risk redefining process, causing AI drift and inconsistent delivery.

## Decision

1. **[APZHUB-ENG-001 Engineering Slice Standard](../engineering/ENGINEERING-SLICE-STANDARD.md)** is the authoritative engineering operating standard for day-to-day slice execution.
2. All future engineering slices **SHALL** reference APZHUB-ENG-001 (and companions: template, checklist, certification, AI workflow).
3. The engineering workflow **SHALL NOT** be redefined inside individual slice instructions.
4. Slice Owner prompts **SHALL** supply only slice-specific content (identifier, objective, scope, acceptance criteria, dependencies, special constraints).
5. Changes to APZHUB-ENG-001 require **explicit Owner approval** (amend this ADR or supersede it).

## Rationale

- Maintain consistency across products
- Reduce AI drift
- Improve repeatability and auditability
- Simplify engineering instructions
- Keep energy on product delivery, not process rewriting

## Alternatives considered

| Alternative                            | Why rejected                              |
| -------------------------------------- | ----------------------------------------- |
| Redefine process in every slice prompt | Causes drift; high prompt cost            |
| Treat ENG-001 as advisory only         | Insufficient for portfolio consistency    |
| New programme to “freeze” process      | Unnecessary — ADR is the correct artefact |

## Consequences

- Future slices inherit process automatically.
- Process changes are deliberate Owner decisions, not local improvisation.
- Portfolio governance (Lifecycle, Engineering Standard, AI Operational Framework) remains authoritative for freeze/release/GA and roles; ENG-001 specialises slice execution only.
- S01 remains the reference pattern until Owner names a successor.

## Related

- [ENGINEERING-SLICE-STANDARD.md](../engineering/ENGINEERING-SLICE-STANDARD.md)
- [ENGINEERING-SLICE-TEMPLATE.md](../engineering/ENGINEERING-SLICE-TEMPLATE.md)
- [AI-ENGINEERING-WORKFLOW.md](../engineering/AI-ENGINEERING-WORKFLOW.md)
- [S01-REFERENCE-PATTERN.md](../engineering/S01-REFERENCE-PATTERN.md)
- [APZHUB Engineering Standard](../governance/APZHUB-ENGINEERING-STANDARD.md)
- [APZHUB AI Operational Framework](../governance/APZHUB-AI-OPERATIONAL-FRAMEWORK.md)
