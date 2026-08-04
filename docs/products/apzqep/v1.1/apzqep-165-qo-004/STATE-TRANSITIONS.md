# STATE-TRANSITIONS — QO-004

Every state change records an append-only history entry:

| Field               | Required                            |
| ------------------- | ----------------------------------- |
| fromState / toState | Yes                                 |
| timestamp           | Yes                                 |
| actor               | Yes                                 |
| reason              | Yes                                 |
| correlationId       | Yes                                 |
| metadata            | Optional (includes transition kind) |

History records are never overwritten or edited. Pause/resume append recovery records with `fromState === toState` and `operation` metadata while preserving lifecycle state.
