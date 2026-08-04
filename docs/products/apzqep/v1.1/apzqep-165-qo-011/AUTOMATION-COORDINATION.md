# Automation Coordination

Coordinates automation **intent** from Decision Packages.

| Owns                                                 | Does not own                        |
| ---------------------------------------------------- | ----------------------------------- |
| Map Decision Package → logical intents               | Run tests / browsers / load tools   |
| Produce Automation Coordination Package              | Provider-specific logic             |
| Logical provider eligibility via Capability Registry | Invoke capabilities                 |
| Publish past-tense events via Event Backbone         | Policy / governance / decision eval |

Execution belongs to the Automation Platform (APZQEP-161+).
