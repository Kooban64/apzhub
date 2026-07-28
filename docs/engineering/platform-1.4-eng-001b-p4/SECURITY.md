# Security — Platform-1.4-ENG-001B-P4

## Model

- **Default deny**
- Read/admin surfaces require `notifications.admin` (or `notifications.manage` / `notification.*`)
- Manual replay additionally requires `notifications.replay`
- Manual retry additionally requires `notifications.retry`
- Health/diagnostics require `notifications.health` / `notifications.diagnostics` (diagnostics may read health)
- HTTP routes use existing `withPlatformApiAuth`

## Isolation

- Tenant id must match request context
- Organisation id enforced when present on both sides
- Cross-tenant / cross-org operations denied and auditable

## Explicit non-goals

- No security bypass for superadmin without explicit permission catalogue entries
- No elevation via `notification.delivery` alone for admin/replay
- Durable flag OFF does not weaken authz
