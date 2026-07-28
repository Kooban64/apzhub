# Requirements Engineering Standard

> **Programme:** APZHUB-PRODUCTS-004 · Baseline: Certified Platform 1.4

## Mandate

Every new APZHUB **product**, **module**, **enhancement**, or **major change** shall complete Requirements Engineering before Product Definition begins.

This is methodology — not implementation. It produces an approved Requirements Baseline that feeds Definition (PRODUCTS-003) and later Architecture.

## Objectives

1. Capture business intent from idea to measurable outcomes.
2. Elicit and reconcile stakeholder needs.
3. Specify functional, non-functional, regulatory, AI, and UX requirements.
4. Prioritise and risk-rate requirements.
5. Establish acceptance criteria, DoR/DoD, and traceability.
6. Obtain Requirements Approval before Definition.

## Requirements pack location

```text
docs/products/{product-id}/requirements/
  README.md
  REQUIREMENTS-BASELINE.md       # filled template (required)
  REQUIREMENTS-APPROVAL.md       # approval decision record
  CHECKLIST.md                   # completed checklist copy
  TRACEABILITY-MATRIX.md         # or embedded section
  EVIDENCE/                      # optional supporting artefacts
```

For module/enhancement scoped work under an existing product, use:

```text
docs/products/{product-id}/requirements/{change-id}/
```

## Completeness rule

A Requirements Baseline is **complete** only when:

- Business, stakeholder, functional, non-functional, regulatory, AI, and UX requirement sets are filled or explicitly **N/A** with rationale
- Each requirement has ID, priority, risk, and acceptance criteria
- Traceability links (Idea → Requirement → later Definition/Architecture/Test) are established for in-scope items
- [REQUIREMENTS-CHECKLIST.md](./REQUIREMENTS-CHECKLIST.md) is complete
- Requirements Approval is recorded

Incomplete baselines **block** Product Definition entry.

## Approval workflow

```text
DRAFT
  → READY FOR REVIEW
  → REVIEWED (PM / stakeholders)
  → READY FOR REQUIREMENTS APPROVAL
  → APPROVED | REJECTED | REVISE
```

| Field            | REQUIREMENTS-APPROVAL.md     |
| ---------------- | ---------------------------- |
| Decision         | APPROVED / REJECTED / REVISE |
| Date             |                              |
| Authority        | Owner (or delegated)         |
| Baseline version |                              |
| Conditions       |                              |

Approval does **not** authorise Definition, Architecture, or Implementation — those require their own programmes/gates.

## Priority model

| Priority | Meaning                             |
| -------- | ----------------------------------- |
| **P0**   | Must for MVP / regulatory hard stop |
| **P1**   | Should for first release            |
| **P2**   | Could / later phase                 |
| **P3**   | Won't for current horizon (parked)  |

## Risk rating

| Risk         | Meaning                               |
| ------------ | ------------------------------------- |
| **Critical** | Blocks release or compliance if unmet |
| **High**     | Major user/ops impact                 |
| **Medium**   | Manageable with mitigation            |
| **Low**      | Monitor                               |

## Alignment

| Concern                       | Reference                                      |
| ----------------------------- | ---------------------------------------------- |
| Product Definition            | [../definition/](../definition/README.md)      |
| Product Engineering Framework | [../framework/](../framework/README.md)        |
| Platform freezes              | Platform 1.4 CERT / AI-MANIFEST                |
| Layering                      | Module → Platform Service → Connector → Engine |

## Prohibitions during Requirements

- No Product Definition packs started as “implementation-ready” substitutes
- No architecture ADRs implying build
- No application code
- No Platform 1.4 changes
- No Platform 2.0
