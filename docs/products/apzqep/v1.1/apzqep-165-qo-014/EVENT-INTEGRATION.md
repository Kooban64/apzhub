# Event Integration — QO-014

All publications route through the Enterprise Quality Event Backbone (QO-010).

| Event                          | Meaning                                      |
| ------------------------------ | -------------------------------------------- |
| `evidence.integration.created` | Evidence Integration Package created         |
| `evidence.package.completed`   | Package binding completed (refs only)        |
| `report.generated`             | Derived report view generated (not evidence) |
| `report.profile.applied`       | Report profile applied during assembly       |

Producer: `orchestration.evidence_integration`. Past-tense facts only. No command events.
