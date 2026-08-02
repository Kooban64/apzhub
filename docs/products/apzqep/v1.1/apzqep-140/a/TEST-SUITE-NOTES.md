# Test Suite Notes — APZQEP-140-A

## Persistence

First delivery uses process-local in-memory SoR (`suite-runtime` / `createInMemorySuiteRepository`) for LIMITED_AVAILABILITY. PostgreSQL adapter is a follow-on and must not change Application Service contracts.

## Security

Authenticated users receive suite permission grants in the HTTP handler for LIMITED_AVAILABILITY. Production RBAC must map roles via PermissionService without redesigning security.

## Naming

Stakeholder language: **Enterprise Test Suite Management** (not “Suite Management” alone, not “140-A complete” in user-facing copy).

## Follow-ons

- Postgres repository
- Favourite / pin HTTP endpoints (domain already supports)
- Bulk lifecycle operations in UX
- Full library catalogue (kinds reserved)
