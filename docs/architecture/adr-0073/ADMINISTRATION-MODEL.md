# Administration Model

Required controls (extend Phase A admin surfaces):

- Queue inspection (eligible/claimed counts, ages)
- Delivery / attempt / retry / dead-letter inspection
- Manual replay & cancellation & suppression
- Provider health (adapter readiness)
- Tenant / organisation filters
- Privileged access via ProductionAuthorizationProvider permissions
- Immutable audit trail for privileged actions

Administration **reads/writes Postgres SoR** — not process memory.
