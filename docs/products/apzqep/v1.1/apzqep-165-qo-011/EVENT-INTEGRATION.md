# Event Integration

All publications go through the QO-010 Event Backbone — never bypassed.

| Event Type                        | Meaning                                          |
| --------------------------------- | ------------------------------------------------ |
| automation.intent.identified      | A logical intent was identified                  |
| automation.coordination.created   | Coordination package created                     |
| automation.coordination.updated   | New package supersedes a prior package           |
| automation.coordination.completed | Coordination finished (not automation execution) |

Past-tense facts only. No command events (`run-tests`, etc.).
