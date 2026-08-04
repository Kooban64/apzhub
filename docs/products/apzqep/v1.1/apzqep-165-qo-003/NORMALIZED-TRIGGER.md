# NORMALIZED-TRIGGER — QO-003

```text
Provider Event → Provider Adapter → Normalized Trigger → Trigger Engine → Quality Flow Selection
```

`NormalizedTrigger` fields: triggerId, triggerType, triggerSource (generic class), tenantId, projectId?, correlationId, causationId?, payloadRef, context?, occurredAt.

`triggerSource` values: scm | api | schedule | cli | automation | notification | command | external | manual | unknown.

Provider product names (GitHub, GitLab, …) are rejected.
