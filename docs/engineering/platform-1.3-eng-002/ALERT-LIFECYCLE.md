# Alert Lifecycle

Transitions enforced by `assertObserveAlertStateTransition`.

| Action   | Effect                                     |
| -------- | ------------------------------------------ |
| Match    | create/update pending/firing; preserve ack |
| Ack      | metadata only; state stays firing/pending  |
| Suppress | → silenced (not healthy)                   |
| Resolve  | → resolved (manual or clear evaluation)    |
| Unknown  | preserve prior state                       |

Invalid transitions → canonical domain / platform errors.
