# Event Registry

Immutable catalogue of event type definitions.

| Field                   | Description                |
| ----------------------- | -------------------------- |
| Event Type              | Past-tense type key        |
| Version                 | Semantic version           |
| Description             | Human description          |
| Producer                | Declared producer          |
| Consumers               | Declared consumer hints    |
| Schema Reference        | Opaque schema ref          |
| Documentation Reference | Opaque doc ref             |
| Routing Default         | Transport routing mode     |
| Replay Eligible Default | Default replay eligibility |

Built-ins cover QO-001…QO-009 publication contracts (`orchestration.*` past-tense types). Registry entries are never updated in place — new versions are new registrations.
