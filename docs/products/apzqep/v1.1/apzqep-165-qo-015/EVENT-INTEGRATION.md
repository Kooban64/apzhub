# Event Integration — QO-015

All publications route through the Enterprise Quality Event Backbone (QO-010).

| Event                          | Meaning                                 |
| ------------------------------ | --------------------------------------- |
| `executive.experience.created` | Executive Experience Package created    |
| `executive.package.completed`  | Package projection completed            |
| `executive.persona.applied`    | Persona applied to projection           |
| `executive.projection.updated` | New package supersedes prior projection |

Producer: `orchestration.executive_experience`. Past-tense facts only. No command events.
