# Domain Events

Lifecycle transitions emit typed domain events via `buildRequirementLifecycleDomainEvent`:

| Action           | Event type                    |
| ---------------- | ----------------------------- |
| submit           | qep.requirement.submitted     |
| approve          | qep.requirement.approved      |
| reject           | qep.requirement.rejected      |
| mark_implemented | qep.requirement.implemented   |
| mark_verified    | qep.requirement.verified      |
| deprecate        | qep.requirement.deprecated    |
| archive          | qep.requirement.archived      |
| other            | qep.requirement.state_changed |

All transitions also append audit entries using the event type as the audit action.

Optional `onDomainEvent` callback on the application service allows platform wiring without bus consumers in this programme.

## RequirementStateChanged

Generic fallback including `from`, `to`, `action`, optional `reason`.
