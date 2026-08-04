# LIFECYCLE — QO-004

## Active path

```text
Registered → Ready → Triggered → Impact Analysed → Selection Complete
  → Capability Coordination → Awaiting Gates → Awaiting Approval
  → Recommendation Ready → Completed
```

Code states (snake_case): `registered`, `ready`, `triggered`, `impact_analysed`, `selection_complete`, `capability_coordination`, `awaiting_gates`, `awaiting_approval`, `recommendation_ready`, `completed`.

## Terminal states

`cancelled`, `failed`, `rejected`, `superseded`, `timed_out` (plus successful `completed`).

No additional states without architecture approval.
