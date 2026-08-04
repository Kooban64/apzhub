# Adoption Metrics — APZQEP-ADOPT-001

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-ADOPT-001 |
| Status    | **LIVING**       |
| Timestamp | 20260804T185900Z |

Aligned with [ADOPTION-AND-OPERATIONS.md](../v1.1/apzqep-version-1.1-architecture-freeze/ADOPTION-AND-OPERATIONS.md).

## Primary metric (above everything else)

> **Engineering Friction**

Every time someone says “This feels awkward,” write it down — observe, do not
fix immediately. After ~ten releases, real problems will be obvious.

Not coverage. Not pass rates. Not release count. **Friction first.**

| Metric                                  | Target                                    | Current            | Notes                                                                  |
| --------------------------------------- | ----------------------------------------- | ------------------ | ---------------------------------------------------------------------- |
| **Engineering Friction events**         | Logged whenever felt                      | 0                  | Primary — [FRICTION-LOG.md](./FRICTION-LOG.md)                         |
| Products onboarded                      | Increasing                                | 0 (programme open) | Start: APZHUB                                                          |
| Releases through APZQEP (Release 0001+) | Increasing; 100% of in-scope new releases | 0                  | Label real work as releases                                            |
| Step timings captured                   | Per release                               | —                  | See WEEK-1-EXERCISE timings table                                      |
| Evidence completeness                   | 100%                                      | —                  |                                                                        |
| Automated quality activities            | Increasing as providers mature            | —                  |                                                                        |
| Manual release effort                   | Decreasing over time                      | —                  | From timings                                                           |
| Release confidence                      | Increasing over time                      | —                  | Via Quality Stories                                                    |
| Post-release defects                    | Trending downward                         | —                  | Track after C3                                                         |
| Operational learnings                   | Growing from releases                     | 0                  | [OPERATIONAL-LEARNING-REGISTER.md](./OPERATIONAL-LEARNING-REGISTER.md) |
| Improvement backlog ready for Auth      | From patterns only                        | 0 ready            | Not imagination                                                        |

## Emergent (do not create yet)

`TOP-20-FRICTIONS.md` — expected to emerge after enough releases. Not authored
up-front.
