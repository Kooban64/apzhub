# Operational Learning Register — APZQEP-ADOPT-001

| Field     | Value                                                          |
| --------- | -------------------------------------------------------------- |
| Programme | APZQEP-ADOPT-001                                               |
| Status    | **LIVING**                                                     |
| Timestamp | 20260804T185600Z                                               |
| Source    | ChatGPT closing assessment (2026-08-04) — ADOPT-001 refinement |

This is **not** a bug list and **not** an enhancement backlog.

| Artefact                                           | Says                                    |
| -------------------------------------------------- | --------------------------------------- |
| [FRICTION-LOG.md](./FRICTION-LOG.md)               | Something hurt in the moment            |
| **This register**                                  | Reality taught us **Y**                 |
| [IMPROVEMENT-BACKLOG.md](./IMPROVEMENT-BACKLOG.md) | Build **X** (candidate; not authorised) |

An Operational Learning entry captures insight before reaction. Patterns here —
not single annoyances — drive the backlog and future Owner Auth.

## Entry template

```text
Observation

APZHUB release required five manual approval steps.

Evidence

Quality Flow 00027

Learning

Approval Bundle should allow grouped authority requests.

Action

Candidate APZQEP-17x enhancement.

Priority

Medium

Status

Deferred until provider planning.
```

## Register

| ID     | Date       | Product / Flow         | Observation                                                                                                                                         | Evidence                                                                                               | Learning                                                                          | Action                                      | Priority  | Status           |
| ------ | ---------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------- | --------- | ---------------- |
| OL-001 | 2026-08-05 | APZ Time + APZ Support | Permission abstraction and session propagation consistently arise during Native Adoption. Formalised as **EPP-001** in Emerging Portfolio Patterns. | Time A01/A02; Support N-01/N-02; [EPP register](../../framework/APZHUB-EMERGING-PORTFOLIO-PATTERNS.md) | Process confidence increased (two RIs). Platform abstraction still not justified. | No engineering action. Track under EPP-001. | Strategic | Pattern emerging |

### Status values

| Status              | Meaning                                        |
| ------------------- | ---------------------------------------------- |
| Open                | Learning recorded; no promotion yet            |
| Pattern emerging    | Seen more than once — watch                    |
| Promoted to backlog | Linked improvement backlog ID                  |
| Deferred            | Explicitly wait (e.g. until provider planning) |
| Closed — accepted   | Reality accepted; no change intended           |

### Priority values

Low · Medium · High · Strategic

### Discipline

- Do **not** open engineering from a single observation.
- Every release ends with: **Would I release this again the same way?**  
  If “No, because…”, write an observation here — not an immediate code change.
- After ~five releases, review this register for patterns before any 170+ Auth.
