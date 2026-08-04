# Event Routing

Transport-only routing modes:

| Mode            | Behaviour                                                |
| --------------- | -------------------------------------------------------- |
| broadcast       | Deliver to all matching subscribers                      |
| directed        | Deliver only to listed subscriber ids                    |
| filtered        | Deliver to subscribers with type filters / filtered mode |
| tenant_scoped   | Respect tenant scope on publish and subscription         |
| project_scoped  | Respect project scope                                    |
| provider_future | Reserved for future provider subscriptions               |

Routing never interprets business meaning and never invokes providers.
