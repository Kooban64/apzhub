# API — Quality Decision Engine

Provider-neutral surface on `orchestration.decisions` (DI: `orchestration.decision.engine`).

| Operation               | Purpose                               |
| ----------------------- | ------------------------------------- |
| Create Decision Package | Compose snapshots → immutable package |
| Read Decision Package   | Fetch by id                           |
| Read Decision Outcome   | Platform conclusion                   |
| Read Residual Risk      | Composed residual risk                |
| Read Confidence Summary | Composed confidence                   |
| Read Explainability     | Mandatory rationale                   |
| Read History            | Audit trail                           |
| Diagnostics             | Counts, distributions, health         |

No release APIs. No deployment APIs. No evaluate-policy / evaluate-gate APIs.
