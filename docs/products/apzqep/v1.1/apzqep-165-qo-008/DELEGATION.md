# Delegation

Delegation transfers decision authority for a named authority to another authority or actor context, subject to template and registry flags.

| Aspect         | Behaviour                                                           |
| -------------- | ------------------------------------------------------------------- |
| Support flag   | Authority must declare `delegationSupport`                          |
| Decision state | Recorded as `delegated` with delegate target                        |
| Time-limited   | Optional expiry; after expiry, delegation does not satisfy coverage |
| Escalation     | Separate path; recorded as `escalated` when template allows         |
| Coverage       | Delegated authority is removed from outstanding required set        |

Delegation is a **decision record**, not a workflow transition.
