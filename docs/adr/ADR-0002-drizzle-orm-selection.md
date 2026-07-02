# ADR-0002 — Drizzle ORM Selection

> **Status:** Accepted  
> **Date:** 2026-06-29  
> **Sprint:** SPR-001 closeout

## Problem

SPR-001 requires PostgreSQL, versioned migrations, seed data, and a type-safe schema for Better Auth platform tables. The platform database must store only platform metadata per Document 011.

## Decision

Use **Drizzle ORM** with `drizzle-kit` for schema definition and migrations.

- Schema and client live in `packages/config/src/db/`
- Migrations generated to `packages/config/drizzle/`
- Applied via `pnpm db:migrate`
- Better Auth uses the Drizzle PostgreSQL adapter

## Alternatives

| Alternative        | Why rejected                                       |
| ------------------ | -------------------------------------------------- |
| Prisma             | Heavier runtime; owner approved Drizzle in SPR-001 |
| Raw SQL migrations | No type-safe schema for long-lived platform        |
| Kysely only        | Lacks integrated migration generation workflow     |

## Consequences

- Type-safe queries flow from schema to application code.
- Better Auth session/user tables share the Drizzle schema.
- Future Platform Services import `@apzhub/config` for platform tables only.
- Schema growth may warrant extracting `@apzhub/db` (see ADR review backlog).
