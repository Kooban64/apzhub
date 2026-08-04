# Event Envelope

Every platform quality event uses one envelope:

| Field             | Description                            |
| ----------------- | -------------------------------------- |
| Event ID          | Stable unique id                       |
| Event Type        | Past-tense fact type                   |
| Event Version     | Immutable type version                 |
| Correlation ID    | End-to-end correlation                 |
| Causation ID      | Prior event that caused this fact      |
| Tenant ID         | Tenant context                         |
| Project ID        | Optional project context               |
| Timestamp         | ISO-8601 occurrence time               |
| Producer          | Publishing capability id               |
| Subject Reference | Opaque subject ref                     |
| Payload           | Fact data (plain object)               |
| Metadata          | String map (incl. audit / actor hints) |
| Sequence          | Ordering within correlation            |
| Replay            | Replay metadata only (no execution)    |

Events are never mutated after publish.
