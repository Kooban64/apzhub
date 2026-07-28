# Product Business Standard

> **Programme:** APZHUB-PRODUCTS-003

## Purpose

Ensure every product Definition includes a complete commercial and business case before Architecture.

## Mandatory business content

| Area                               | Requirement                                           |
| ---------------------------------- | ----------------------------------------------------- |
| Vision / Mission                   | Clear, non-technical user value                       |
| Strategic objectives               | Measurable; aligned to APZHUB portfolio               |
| Business value                     | Who benefits and how                                  |
| Success criteria                   | Objective acceptance metrics for MVP and later phases |
| Target market / users              | Segments and primary personas                         |
| Competitive positioning            | Differentiation without engine brand claims           |
| Revenue / subscription / licensing | Explicit model or explicit “internal / suite-bundled” |
| Pricing philosophy                 | Principles even if prices TBD                         |
| Marketplace / partners             | In or out of scope with rationale                     |
| Future monetisation                | Options listed; not authorised by Definition alone    |

## Business Approval record

Create `docs/products/{id}/definition/BUSINESS-APPROVAL.md` with:

| Field                       | Value                                   |
| --------------------------- | --------------------------------------- |
| Decision                    | APPROVED / REJECTED / REVISE            |
| Date                        |                                         |
| Authority                   | Owner (or delegated business authority) |
| Conditions                  |                                         |
| Definition version approved |                                         |

## Rules

1. Definition without Business Approval **cannot** enter Architecture.
2. Business Approval does **not** authorise Implementation.
3. Commercial claims must not contradict Platform freezes (e.g. Email SoR, SMTP) without a named later Approval path.
4. Suite vs standalone packaging must be stated.
