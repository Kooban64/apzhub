# APZHUB Administration Developer Guide

**Milestone:** APZADMIN-001

## Packages

| Package | Role |
| --- | --- |
| `@apzhub/admin-contracts` | Types, enums, permissions, canonical registrations, service interface |
| `@apzhub/admin-core` | Ports, lifecycle, validation, registration/capability helpers, foundation factory |
| `@apzhub/admin-persistence` | In-memory + PostgreSQL repositories and factories |

## Dependency rules

- Contracts have **no** package dependencies.
- Core depends only on contracts.
- Persistence depends on `@apzhub/config`, contracts, core, and `drizzle-orm`.
- Do **not** import `@apzhub/platform-services` from these packages.

## Persistence factories

```ts
createAdministrationPersistence({ mode: "memory" | "postgres", db? })
createProductionAdministrationPersistence({ db }) // postgres required
createAdministrationPersistenceForTest({ allowInMemoryPersistence: true })
```

## Schema / migrations

- Drizzle: `packages/config/src/db/platform-admin-schema.ts`
- SQL: `0050_apz_platform_admin.sql`, `0051_apz_platform_admin_rls.sql`

## Audit

```bash
pnpm audit:admin-foundation
```
