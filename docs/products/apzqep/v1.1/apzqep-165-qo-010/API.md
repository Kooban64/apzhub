# API — Quality Event Backbone

Surface: `orchestration.events` (DI: `orchestration.event.backbone`).

| Operation               | Purpose                             |
| ----------------------- | ----------------------------------- |
| Publish Event           | Validate + route + append history   |
| Subscribe / Unsubscribe | Register transport handlers         |
| Read Event              | Fetch envelope by id                |
| Query Events            | Filter envelopes                    |
| Read Event History      | Append-only history records         |
| Read Event Types        | Registered type keys                |
| Read Event Versions     | Versions for a type                 |
| Read Event Metadata     | Registry definition                 |
| Diagnostics             | Counts, routing, validation, health |

Legacy engines publish via `publishFromLegacy` / `createLegacyPublisher` — contracts only, no implementation coupling.

No execution, orchestration, policy, governance, or deployment APIs.
