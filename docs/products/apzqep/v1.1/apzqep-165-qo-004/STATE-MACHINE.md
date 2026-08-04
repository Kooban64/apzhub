# STATE-MACHINE — QO-004

Table-driven declarative transition rules in `flows/state-machine.ts`.

This is **not** BPMN, Temporal, Camunda, n8n, or a generic workflow engine. It is the Enterprise Quality Flow lifecycle machine only.

## Rule kinds

| Kind        | Purpose                                      |
| ----------- | -------------------------------------------- |
| progression | Happy-path stage advances                    |
| terminal    | Cancel / fail / timeout / reject / supersede |
| recovery    | Retry from failed; restart to ready          |

Allowed transitions are looked up from the rule table. Invalid transitions throw `INVALID_QUALITY_FLOW_TRANSITION`. No hidden transitions.
