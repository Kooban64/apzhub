# Authorisation

| Operation                             | Permission            |
| ------------------------------------- | --------------------- |
| Alert CRUD / ack / resolve / suppress | `observe.alerts`      |
| evaluateBatch                         | `observe.manage`      |
| getDiagnostics                        | `observe.diagnostics` |
| getHealth                             | `observe.health`      |

Deny-by-default via ProductionAuthorizationProvider + operation map. Tenant isolation via Observe repos / RLS.
