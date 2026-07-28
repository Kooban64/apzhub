# Persistence

Baselines and their membership items persist in the QEP PostgreSQL schema
(`0074`–`0076` migrations) with tenant scoping, a positive baseline number unique
per tenant, name/description, status, membership rows referencing content
version identifiers, audit fields, and (Part 3) integrity metadata
(`integrity_fingerprint`, `integrity_algorithm`, `integrity_schema_version`,
`integrity_verification_status`, `integrity_verified_at`). An in-memory
repository backs unit and contract tests; both adapters implement the same
`RequirementBaselineRepository` port. `lockBaseline` rejects an empty membership
set at the repository layer as a defense-in-depth check in addition to the
domain and application checks.
