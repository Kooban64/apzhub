# Work Lifecycle — Unified Work Experience

| Field     | Value                 |
| --------- | --------------------- |
| Programme | APZHUB-CAPABILITY-001 |
| Status    | **COMPLETE**          |
| Timestamp | 20260805T083000Z      |
| Kind      | Capability definition |

## Purpose

Describe how **work** progresses — not how products progress.

Products may have richer internal states. The platform lifecycle is the common language for My Work.

## Canonical lifecycle

```text
Identified
     ↓
Ready
     ↓
Active
     ↓
Waiting
     ↓
Blocked          (optional side-state)
     ↓
In review / Approval
     ↓
Done
     ↓
Closed
```

| State                    | Meaning                                     |
| ------------------------ | ------------------------------------------- |
| **Identified**           | Known but not yet actionable for an actor   |
| **Ready**                | Can be started; waiting to be picked up     |
| **Active**               | Someone is working it                       |
| **Waiting**              | Parked awaiting another person or event     |
| **Blocked**              | Cannot proceed; dependency or constraint    |
| **In review / Approval** | Needs judgement before continuing           |
| **Done**                 | Actor finished; may still need formal close |
| **Closed**               | No further action expected                  |

## Transitions (capability level)

| From → To                  | Typical trigger                        |
| -------------------------- | -------------------------------------- |
| Identified → Ready         | Enough context to act                  |
| Ready → Active             | Actor starts                           |
| Active → Waiting           | Hand-off or external dependency        |
| Active / Waiting → Blocked | Hard stop                              |
| * → In review / Approval   | Gate required                          |
| In review → Active / Done  | Approved / rejected with next step     |
| Active → Done              | Actor completes                        |
| Done → Closed              | Confirmed complete; no residual action |
| Any open → Closed          | Cancelled / withdrawn (with reason)    |

## Lifecycle rules

1. My Work queues map to lifecycle states (e.g. Assigned/Active, Waiting, Blocked, Needs approval, Recently completed ≈ Done/Closed).
2. Product-specific statuses **project into** this lifecycle; they do not replace it in the unified queue.
3. Quality actions and approvals are first-class states — not side channels.
4. Closed work remains queryable for learning; it leaves the active obligation set.

## What this lifecycle is not

- Not a replacement for APZQEP’s quality flow stages (those govern engineering changes)
- Not a new workflow engine
- Not a mandate to rewrite product status models overnight

Future engineering must **map** product statuses into this lifecycle without changing product ownership.
