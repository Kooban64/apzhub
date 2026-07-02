# ADR-002 — Database Migration Framework

> **Status:** Accepted  
> **Date:** 2026-06-29  
> **Sprint:** SPR-001  
> **Decided by:** Project owner (SPR-001 approval)

## Context

SPR-001 requires PostgreSQL, a migration framework, seed framework, and Better Auth with a PostgreSQL adapter. The platform database stores only platform metadata per Document 011.

## Decision

Use **Drizzle ORM** with `drizzle-kit` for migrations.

Schema and client live in **`packages/config`** under `src/db/`.

## Consequences

- Migrations generated via `drizzle-kit` and applied via `pnpm db:migrate`.
- Better Auth uses the Drizzle adapter against the shared schema.
- Strict TypeScript types flow from schema to application code.
- Future Platform Services can import `@apzhub/config/db` for platform tables only.

## Alternatives considered

- **Prisma** — mature ecosystem; rejected in favour of owner-approved Drizzle and lighter runtime.
- **Raw SQL migrations** — rejected; lacks type-safe schema for a long-lived platform.
