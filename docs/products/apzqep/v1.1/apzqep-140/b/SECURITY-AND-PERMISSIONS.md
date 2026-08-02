# Security and Permissions

Permissions: `qep.execution_plans.{read,create,update,lifecycle,handoff,admin}`. Tenant isolation on all ops. Cross-tenant suite refs forbidden. Cross-project suite refs rejected when both project ids present and differ. Default deny via permission checks.
