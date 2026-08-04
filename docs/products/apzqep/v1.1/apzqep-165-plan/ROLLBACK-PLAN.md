# ROLLBACK-PLAN — APZQEP-165-PLAN

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-PLAN  |
| Timestamp | 20260804T060307Z |

## Principles

- Prefer **slice-scoped** rollback (revert slice commit range / feature flags) over whole-wave wipe.
- Durable run state migrations must be forward-compatible or paired with down-migration.
- Never rollback by deleting immutable audit/decision records — compensate with new records.

## Per-slice guidance

| Slice   | Rollback trigger                            | Scope                                           | Evidence                | Recovery validation                          |
| ------- | ------------------------------------------- | ----------------------------------------------- | ----------------------- | -------------------------------------------- |
| S01     | Kernel breaks consumers / CI red on package | Revert package scaffold                         | git revert + CI         | Package build/tests green; no orphan exports |
| S02     | Registry corrupts discovery                 | Revert registry module; keep audit              | evidence/rollback note  | Discovery empty-safe; old runs readable      |
| S03     | Trigger storm / bad routing                 | Disable bindings; revert router                 | trigger.ignored metrics | No unintended flow starts                    |
| S04     | State machine deadlock / data loss risk     | Feature-flag flows off; revert engine           | run inventory           | No mid-run corruption; resume or fail-closed |
| S05–S06 | Bad selection mass-triggers automation      | Policy kill-switch; revert policy pack          | selection audit         | Automation start rate normal                 |
| S07     | False gate passes                           | Fail-closed default; revert gate policy         | gate audit              | Blocking gates fail-closed                   |
| S08     | Approval bypass bug                         | Disable approvals→fail-closed; revert           | security evidence       | SoD enforced; no silent GO                   |
| S09     | Bad decisions recorded                      | Compensating SUPERSEDED decisions; revert code  | decision audit          | Search shows supersession                    |
| S10     | Event poison                                | DLQ; pause consumers; revert handlers           | DLQ evidence            | Replay clean                                 |
| S11–S14 | Peer contract misuse                        | Disable capability registration; revert adapter | health                  | Peer platforms unaffected                    |
| S15–S17 | UX/authz leak                               | Unregister views/commands; revert UI            | a11y/security           | No GO from UI; permissions hold              |
| S18     | Cert failures                               | Do not Board-certify; open remediation slices   | S18 report              | Re-run matrix                                |

## Programme abort

If architecture boundary violation detected → **STOP engineering**, Board escalation; do not “fix forward” by redesigning frozen architecture under 165.
