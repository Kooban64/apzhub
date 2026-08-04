# Approval Templates

Immutable versioned templates declare required authorities, decision rules, escalation rules, and lifecycle state.

| Field                   | Description                              |
| ----------------------- | ---------------------------------------- |
| Template ID             | Stable identifier                        |
| Name / Version          | Human label + immutable version          |
| Required Authorities    | Ordered authority IDs                    |
| Decision Rules          | Declarative SoD / coverage rules         |
| Escalation Rules        | Authority → escalate-to mapping          |
| Lifecycle State         | draft \| active \| deprecated \| retired |
| Documentation Reference | Opaque doc ref                           |
| Metadata                | Free-form                                |

Templates are registered once; updates require a new version. Runtime never mutates a registered template.
