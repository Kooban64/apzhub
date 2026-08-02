# Security Review (Persistence Scope)

- Tenant RLS on Cap tables (0096)
- Repository queries scoped by tenant_id
- Parameterised Drizzle queries
- Secrets not logged; DATABASE_URL from env
- Production memory fallback forbidden
- RB-002 (HTTP RBAC elevation) **not** addressed — remains OPEN
