# Security and Tenancy

All baseline queries and commands are scoped by `ctx.tenantId`; the PostgreSQL
adapter additionally relies on row-level security policies from the `0075`
migration. Create/update DTOs are narrow, explicit input types
(`CreateQepBaselineInput`, `UpdateQepBaselineDraftInput`,
`AddQepBaselineItemInput`) — there is no generic object merge, so mass-assignment
of server-owned fields (`id`, `status`, `integrityFingerprint`,
`integrityVerificationStatus`, audit fields) is rejected by construction. There
is no unlock, restore, delete, or clone route, removing an entire class of
tenant-boundary and irreversible-mutation risk. Zero Trust checks (identity,
permission, state) apply on every command per Document 013.
