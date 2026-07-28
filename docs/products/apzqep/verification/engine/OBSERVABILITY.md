# Observability

Application service emits optional `onObservation` events:

| Signal     | Content                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| operation  | e.g. `verification.create`, `verification.complete`, `verification.list` |
| durationMs | Timing                                                                   |
| outcome    | `success` \| `error`                                                     |

Does not influence domain decisions. Does not log confidential subject artefact content or full rationale payloads.

Platform Service readiness reports `verificationEnabled` and `persistenceMode` (`postgres` \| `memory`).
