# Search Publication Lifecycle Guide

> **Milestone:** APZSEARCH-016

## Journal statuses

| Status        | Meaning                                |
| ------------- | -------------------------------------- |
| `queued`      | Accepted, waiting claim                |
| `publishing`  | Claimed by orchestrator                |
| `published`   | Search Integration accepted            |
| `failed`      | Attempt failed (auditable)             |
| `retrying`    | Scheduled for another attempt          |
| `dead-letter` | Exhausted retries or permanent failure |

## Allowed transitions

```
queued → publishing | dead-letter
publishing → published | failed | retrying | dead-letter
failed → retrying | dead-letter
retrying → publishing | dead-letter
published / dead-letter → (terminal)
```

Every transition is validated (`assertPublicationTransition`).

## Product lifecycle hooks

Composition wrappers enqueue after successful product operations:

- create → `publish`
- update → `update`
- archive → `lifecycle(archived)`
- restore → `lifecycle(published)`
- delete → `remove`

Products remain the System of Record.
