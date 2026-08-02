# Data Integrity Validation

API: `auditCoreQeDataIntegrity(db)` in `@apzhub/config`.

Checks (read-only):

- orphaned suite parents
- plans referencing missing suites (warning)
- sessions referencing missing plans (warning)
- duplicate handoff_id on sessions (error)

No unrestricted repair tooling.
