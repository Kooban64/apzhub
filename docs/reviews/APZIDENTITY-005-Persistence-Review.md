# APZIDENTITY-005 — Persistence Review

**Date:** 2026-07-17  
**Result:** PASS

## Schema

| Migration                       | Purpose                                      |
| ------------------------------- | -------------------------------------------- |
| `0052_apz_platform_iam.sql`     | `platform_iam_*` Identity Administration SoR |
| `0053_apz_platform_iam_rls.sql` | Row-level security / tenant scoping          |

## Guarantees

- Repository port boundaries (`@apzhub/identity-persistence`)
- Production requires explicit PostgreSQL (`createProductionIdentityPersistence` / ForProduction factory)
- No silent in-memory production fallback (`allowInMemoryPersistence` required for tests)
- No credential columns in Identity schema
- Audit/history append-only ports (create/get/list only)
- Tenant isolation verified in persistence tests + Journey 2
- Separation from authentication scaffolding

## CI note

Unit CI uses in-memory repository parity; live PostgreSQL is the production path. This is documented, not a silent fallback.
