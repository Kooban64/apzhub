# EXPLAINABILITY-MODEL — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Hard rule

Every recommendation, score and prediction published by Quality Intelligence **must** carry an `Explanation` record. Unpublished drafts may omit narrative but must still retain provider/run metadata if a provider was invoked.

## Mandatory explanation fields

| Field            | Description                                      |
| ---------------- | ------------------------------------------------ |
| Reason           | Short human-readable why                         |
| Evidence refs    | Stable evidence / artefact references            |
| Supporting facts | Structured facts used in the decision            |
| Data sources     | Upstream systems / entities consulted            |
| Provider         | Provider id + kind + version                     |
| Confidence       | Platform-normalised confidence                   |
| Timestamp        | When produced                                    |
| Decision path    | Ordered steps (rules → stats → AI → composition) |
| Human override   | Whether override is allowed / applied            |

## Decision path model

```text
signals → filters/policies → domain algorithm(s)
        → provider contributions (tagged)
        → composition / caps
        → explanation assembly
        → publish
```

Each step is recorded so Product Board can ask:

> Was this produced by OpenAI, Claude, rules, historical analytics, statistics, or risk engine?

## Confidence

| Band      | Meaning (conceptual)                           |
| --------- | ---------------------------------------------- |
| High      | Strong multi-source agreement                  |
| Medium    | Partial agreement / limited history            |
| Low       | Sparse data or single weak provider            |
| Cap rules | Critical open blockers may force low/not-ready |

AI narrative confidence cannot exceed the weakest critical evidential fact.

## Human override

- Accept / Reject / Override with reason (audited).
- Override never deletes the original recommendation — it supersedes with linkage.
- Certification and release GO/NO-GO remain human/Product Board decisions.
