# RECOVERY — QO-004

Recovery coordinates **lifecycle state only**. No capability re-execution.

| Operation | Behaviour                                         |
| --------- | ------------------------------------------------- |
| Pause     | Sets `paused`; blocks progression transitions     |
| Resume    | Clears `paused`; resumes from current state       |
| Fail      | → `failed`; preserves `recoveryPoint`             |
| Retry     | `failed` → last `recoveryPoint`                   |
| Restart   | recoverable terminal → `ready`                    |
| Cancel    | → `cancelled` (allowed while paused)              |
| Timeout   | → `timed_out`                                     |
| Reject    | from `awaiting_approval` / `recommendation_ready` |
| Supersede | from any active state → `superseded`              |

Recovery always resumes from the last valid recovery point after failure.
