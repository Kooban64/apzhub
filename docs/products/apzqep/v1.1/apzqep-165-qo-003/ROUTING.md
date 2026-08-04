# ROUTING — QO-003

`TriggerEngine.ingest(normalized)`:

1. Validate normalized contract
2. Emit `orchestration.trigger.received`
3. Match enabled bindings (type/source/tenant/project, priority)
4. Return `routed` with qualityFlowId + optional nextStage **or** `ignored`
5. Never start Quality Flow execution

`engineMode: "route-only"`.
