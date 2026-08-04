# COMPOSITION-MODEL — QO-007

Declarative modes (no procedural trees):

| Mode        | Meaning                                     |
| ----------- | ------------------------------------------- |
| ALL         | Every referenced gate satisfied/waived/N/A  |
| ANY         | At least one satisfied                      |
| MINIMUM     | At least N satisfied                        |
| WEIGHTED    | Weighted sum ≥ threshold                    |
| SEQUENTIAL  | All satisfied in order; stop on first unmet |
| CONDITIONAL | Branch on `ifGateId` then/else sets         |

Satisfied statuses for composition: `satisfied`, `waived`, `not_applicable`.
