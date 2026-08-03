# QUALITY-INTELLIGENCE-VISUALIZATION — APZQEP-164-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-164-000   |
| Timestamp | 20260803T191002Z |

## Principle

Quality Intelligence Platform owns observations, signals, recommendations, confidence, explainability and scores. Wave 4 **visualises** them.

**No AI implementation in Wave 4.**

## Surfaces

| Surface                | Visualisation                                              |
| ---------------------- | ---------------------------------------------------------- |
| Observations           | Immutable fact log / filters by source                     |
| Signals                | Signal cards + trend sparkline + contributing observations |
| Recommendations        | Priority board + accept/reject (calls QI APIs)             |
| Confidence             | Level + numeric + factor breakdown                         |
| Explainability         | Decision path, inputs, evidence refs (mandatory)           |
| Quality scores         | Dimensional radar/bars + overall                           |
| Historical trends      | Score/signal history charts                                |
| Recommendation history | Lifecycle timeline                                         |
| Provider comparison    | Active vs placeholder; contribution weights (ops)          |

## Interaction rules

- Accept/Reject recommendation → Platform QI APIs only.
- Every recommendation panel links to explanation; opaque cards forbidden.
- Provider placeholders shown as not implemented — never fake AI readiness.
