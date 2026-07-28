# Naming

| Term                           | Meaning                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `RequirementBaseline`          | New aggregate for a named set of pinned requirement content versions                                                     |
| `RequirementBaselineReference` | Existing lightweight `baselineId` + `label` field on Requirement content; it remains unchanged and is not this aggregate |
| `RequirementContentVersion`    | Immutable, append-only snapshot of a Requirement's governed content                                                      |
| Concurrency revision           | Mutable persistence concurrency metadata; it is not a content version and not a baseline number                          |

`RequirementBaselineNumber` identifies a baseline sequence and is independent of
both content-version numbers and concurrency revisions.
