# Emerging Portfolio Patterns

| Field     | Value                                                  |
| --------- | ------------------------------------------------------ |
| Status    | **LIVING**                                             |
| Timestamp | 20260805T072500Z                                       |
| Kind      | Governance register — **not** an engineering programme |

## Purpose

Record cross-product patterns observed during Native Adoption and operation — **as evidence**, not as backlog.

> Patterns are promoted into platform capabilities only after they have been repeatedly observed across the portfolio and shown to reduce duplicated engineering effort — not because they were anticipated.

## Rules

1. **No engineering action** from a pattern entry alone.
2. **No backlog item** until promotion criteria are met and Owner Auth is given.
3. Status advances through the governance lifecycle on evidence — not on engineering urgency.
4. Prefer product-local solutions while a pattern is Observed or Emerging.
5. **Validated Pattern** means the portfolio has enough evidence of recurrence — it does **not** authorise platform engineering.

## Pattern lifecycle (governance)

```text
Observed
      ↓
Emerging Pattern
      ↓
Validated Pattern
      ↓
Candidate Platform Capability
      ↓
Approved Platform Programme
```

| Status                        | Meaning                                                                     | Engineering? |
| ----------------------------- | --------------------------------------------------------------------------- | ------------ |
| Observed                      | Seen once; monitoring                                                       | None         |
| Emerging Pattern              | Seen more than once — still no engineering                                  | None         |
| Validated Pattern             | Recurring across independent products; concern is real                      | **None**     |
| Candidate Platform Capability | Validation + measurable reduction in duplicated effort; awaiting Owner Auth | None yet     |
| Approved Platform Programme   | Owner Auth for platform / backlog work                                      | Authorised   |
| Deferred                      | Explicitly wait                                                             | None         |
| Closed — accepted             | Reality accepted; no platform change                                        | None         |

Legacy aliases: `Observation` → Observed; `Promotion candidate` → Candidate Platform Capability; `Promoted` → Approved Platform Programme.

## Promotion threshold (default)

A pattern may become a **Candidate Platform Capability** only when **all** apply:

| Criterion                                               | Required |
| ------------------------------------------------------- | -------- |
| Observed across at least **three independent products** | Yes      |
| Classified at least **Validated Pattern**               | Yes      |
| Shown to reduce duplicated engineering effort (or risk) | Yes      |
| Recorded with concrete evidence anchors                 | Yes      |
| Owner / Product Board authorisation for platform work   | Yes      |

Three products validate recurrence. They do **not** by themselves justify centralisation. Hold for further product evidence (e.g. Documents) **and** measurable value before Candidate status.

## Register

| ID      | Pattern                                                                                                                  | Status                | Evidence                                                                                   | Action   | Next gate                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| EPP-001 | Permission abstraction and session propagation consistently arise during Native Adoption as product integration concerns | **Validated Pattern** | APZ Time; APZ Support; APZ Projects (N-01→N-02 closed via Playbook; no shared abstraction) | **None** | One more product (e.g. Documents) and measurable effort reduction before Candidate Platform Capability; Owner Auth required to build |

> **EPP-001 — Validated Pattern.** Three consecutive products completed Identity Convergence with the Playbook unchanged. This confirms a recurring engineering concern. Engineering decision remains: **do nothing until measurable value justifies centralising it.** Do not build a shared identity/permission service. Do not redesign the Playbook.

## Relationship to other registers

| Register                                                                                     | Role                                     |
| -------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [OPERATIONAL-LEARNING-REGISTER](../apzqep/apzqep-adopt-001/OPERATIONAL-LEARNING-REGISTER.md) | Release / ops learning (may seed an EPP) |
| [IMPROVEMENT-BACKLOG](../apzqep/apzqep-adopt-001/IMPROVEMENT-BACKLOG.md)                     | Candidates after promotion authorisation |
| This register                                                                                | Cross-product pattern evidence only      |

## Portfolio Capability Map

Introduced after RI #003: [APZHUB-PORTFOLIO-CAPABILITY-MAP.md](./APZHUB-PORTFOLIO-CAPABILITY-MAP.md) — executive planning artefact; governance only; not an engineering programme.

## Discipline

- Do **not** optimise the platform because you can.
- Optimise it because **operational evidence** justifies it.
- Validated Patterns increase confidence in **where** effort concentrates — they do not by themselves justify new platform components.
