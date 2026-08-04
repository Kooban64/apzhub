# CONFIDENCE-MODEL — QO-005

Deterministic, explainable scoring — **no AI providers**.

## Factors

| Factor                 | Weight role                       |
| ---------------------- | --------------------------------- |
| Direct relationship    | Near-change vs multi-hop          |
| Historical correlation | Prior co-occurrence of edge pairs |
| Dependency distance    | Depth decay                       |
| Evidence quality       | Asset hint                        |
| Change magnitude       | Declared/inferred size            |
| Known regressions      | Asset marker                      |

Each factor records weight, score, contribution, and explanation. Graph confidence aggregates mean and minimum node scores.
