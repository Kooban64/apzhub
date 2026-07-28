# Observability

Application service emits optional `onObservation` events:

| Signal     | Content                                                            |
| ---------- | ------------------------------------------------------------------ |
| operation  | e.g. `trace_link.create`, `trace_link.validate`, `trace_link.list` |
| durationMs | Timing                                                             |
| outcome    | `success` \| `error`                                               |

Does not influence domain decisions. Does not log confidential artefact content or full rationale payloads.
