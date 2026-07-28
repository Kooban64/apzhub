# Lifecycle

Authoritative state machine for Requirement Baselines.

## States

| State    | Mutability                                     |
| -------- | ---------------------------------------------- |
| Draft    | Metadata and membership may change             |
| Locked   | Immutable; integrity fingerprint stored        |
| Archived | Immutable; retained for history and comparison |

## Transitions

```
Draft → Locked → Archived
```

No reverse transitions exist. No unlock, reopen, or restore operation is
authorised in this programme.

## Lock eligibility

A baseline must contain **at least one** valid Requirement Content Version
before it can be locked. Empty baselines are rejected at domain, application,
and repository layers.

Detailed policy notes remain in [LIFECYCLE-POLICY.md](./LIFECYCLE-POLICY.md).
