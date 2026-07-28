# Baseline States

| State      | Meaning                           | Mutation                           |
| ---------- | --------------------------------- | ---------------------------------- |
| `draft`    | Baseline is being assembled       | Metadata and membership may change |
| `locked`   | Configuration is frozen           | Immutable                          |
| `archived` | Retained historical configuration | Immutable                          |

Allowed transitions are:

```text
draft → locked → archived
```

There is no unlock, reverse transition, restore, merge, or delete state or
route — this remains true through Part 3. Locking additionally requires at
least one content-version member and a computed integrity fingerprint (see
[INTEGRITY.md](./INTEGRITY.md)); an empty draft cannot be locked.
