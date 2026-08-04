# QUALITY-FLOW-INSTANCES — QO-004

Instances are **mutable** runtime state referencing an immutable definition version.

## Fields

| Field                                 | Notes                                       |
| ------------------------------------- | ------------------------------------------- |
| instanceId                            | Runtime identity                            |
| flowDefinitionId + definitionVersion  | Pinned definition                           |
| triggerId, correlationId, causationId | From normalized trigger / routing           |
| qualityFlowId                         | Distinct flow-run identity                  |
| tenantId, projectId                   | Security context (no permission evaluation) |
| currentState / previousState          | Lifecycle                                   |
| paused, recoveryPoint                 | Recovery coordination                       |
| history                               | Append-only transition records              |
| metadata                              | Provider-neutral; product names rejected    |

## Trigger integration

`createInstanceFromRouting` accepts only QO-003 `disposition: routed` results. Stores Trigger ID — never GitHub/provider payloads.
