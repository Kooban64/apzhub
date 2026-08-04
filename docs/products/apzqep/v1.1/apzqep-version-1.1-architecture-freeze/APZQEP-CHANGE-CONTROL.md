# APZQEP Change Control — Version 1.1 Baseline

| Field     | Value                                                              |
| --------- | ------------------------------------------------------------------ |
| Product   | APZQEP                                                             |
| Version   | **1.1**                                                            |
| Status    | **GOVERNING**                                                      |
| Timestamp | 20260804T184800Z                                                   |
| Authority | Product Board / Owner                                              |
| Baseline  | [ENTERPRISE-QUALITY-BASELINE.md](./ENTERPRISE-QUALITY-BASELINE.md) |

This document sits **above all future APZQEP programmes**. It answers one question:

> What kinds of changes are allowed against the frozen Version 1.1 baseline?

Source of this classification: closing programme assessment (ChatGPT coaching close,
2026-08-04) — recorded as governance, not as engineering instruction.

## Portfolio lifecycle (current stage)

| Stage            | Meaning                                                | Status      |
| ---------------- | ------------------------------------------------------ | ----------- |
| 1. Concept       | Vision and architecture                                | Complete    |
| 2. Construction  | Wave 1–5 engineering                                   | Complete    |
| 3. Certification | Enterprise release certification (QO-018)              | Complete    |
| 4. Baseline      | Architecture freeze and Version 1.1 declaration        | Complete    |
| 5. Operations    | Internal production adoption                           | **Current** |
| 6. Evolution     | Provider, integration, and operational programmes only | Future      |

## Change classification

| Change Type                  | Default Action                               |
| ---------------------------- | -------------------------------------------- |
| Provider                     | Allowed via authorised provider programme    |
| Integration                  | Allowed via authorised integration programme |
| Operational improvement      | Allowed                                      |
| Documentation                | Allowed                                      |
| Bug fix                      | Allowed if architecture unchanged            |
| Performance optimisation     | Allowed if contracts unchanged               |
| Contract/API breaking change | Requires architecture review                 |
| New platform capability      | Requires Board approval before engineering   |
| Architecture change          | Exceptional; requires formal baseline review |

## Decision path (before engineering)

1. Classify the request using the table above.
2. Prefer provider / integration / operational improvement over baseline change.
3. If the work would reopen foundations, **stop** — obtain Owner / Board Authorisation and a formal baseline review.
4. Only then open a programme (manifest, evidence, certification) and engineer.

Companion operating model: [ADOPTION-AND-OPERATIONS.md](./ADOPTION-AND-OPERATIONS.md).

## Standing principles (must not be diluted)

- Business responsibilities remain clearly separated.
- Systems of record remain explicit.
- Composition happens through references.
- Communication happens through immutable past-tense events.
- Providers remain interchangeable.
- Governance precedes engineering.
- Certification precedes release.

## Default posture

APZQEP Version 1.1 is the **reference implementation** for engineering quality across APZHUB.

Future work proves that reference in day-to-day operations and extends it through
governed provider and integration programmes — **not** by revisiting the foundations.
