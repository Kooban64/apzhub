# Execution Plan Domain

Aggregate: `ExecutionPlanNode` + history. Owns suite binding (`suiteId`+`suiteVersion`+display name at bind time), scope, schedule, assignments, environment/configuration references, prerequisites, readiness snapshot, handoff reference.

Compatibility model: `bind-at-plan-time` — approved plans do not silently mutate when Cap A Suite changes; drift surfaces as readiness warning.
