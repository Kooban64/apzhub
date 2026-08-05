# Emerging Portfolio Patterns

| Field     | Value                                                  |
| --------- | ------------------------------------------------------ |
| Status    | **LIVING**                                             |
| Timestamp | 20260805T044500Z                                       |
| Kind      | Governance register — **not** an engineering programme |

## Purpose

Record cross-product patterns observed during Native Adoption and operation — **as evidence**, not as backlog.

> Patterns are promoted into platform capabilities only after they have been repeatedly observed across the portfolio and shown to reduce duplicated engineering effort — not because they were anticipated.

## Rules

1. **No engineering action** from a pattern entry alone.
2. **No backlog item** until promotion criteria are met and Owner Auth is given.
3. Status stays observational until evidence justifies change.
4. Prefer product-local solutions while a pattern is still emerging.

## Promotion threshold (default)

A pattern may be considered for platform promotion only when **all** apply:

| Criterion                                               | Required |
| ------------------------------------------------------- | -------- |
| Observed across at least **three independent products** | Yes      |
| Shown to reduce duplicated engineering effort (or risk) | Yes      |
| Recorded with concrete evidence anchors                 | Yes      |
| Owner / Product Board authorisation for platform work   | Yes      |

Two products = enough to **note** a pattern. Not enough to **build** a platform abstraction.

## Status values

| Status              | Meaning                                    |
| ------------------- | ------------------------------------------ |
| Observation         | Seen; monitoring                           |
| Pattern emerging    | Seen more than once — still no engineering |
| Promotion candidate | Threshold met; awaiting Owner Auth         |
| Promoted            | Linked platform / backlog work authorised  |
| Deferred            | Explicitly wait                            |
| Closed — accepted   | Reality accepted; no platform change       |

## Register

| ID      | Pattern                                                                                                                  | Status           | Evidence              | Action              | Promotion threshold                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------- | --------------------- | ------------------- | ------------------------------------ |
| EPP-001 | Permission abstraction and session propagation consistently arise during Native Adoption as product integration concerns | Pattern emerging | APZ Time; APZ Support | Continue monitoring | ≥3 products + effort reduction shown |
| —       | —                                                                                                                        | —                | —                     | —                   | —                                    |

## Relationship to other registers

| Register                                                                                     | Role                                     |
| -------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [OPERATIONAL-LEARNING-REGISTER](../apzqep/apzqep-adopt-001/OPERATIONAL-LEARNING-REGISTER.md) | Release / ops learning (may seed an EPP) |
| [IMPROVEMENT-BACKLOG](../apzqep/apzqep-adopt-001/IMPROVEMENT-BACKLOG.md)                     | Candidates after promotion authorisation |
| This register                                                                                | Cross-product pattern evidence only      |

## Discipline

- Do **not** optimise the platform because you can.
- Optimise it because **operational evidence** justifies it.
- Two Reference Implementations increase confidence in the **process** — they do not by themselves justify new platform components.
