# ADR-0001 — Monorepo Strategy

> **Status:** Accepted  
> **Date:** 2026-06-29  
> **Sprint:** SPR-001 closeout

## Problem

APZHUB must host multiple applications, shared libraries, integrations, services, and infrastructure tooling without coupling business modules to presentation or engine code. Contributors need a single repository with clear boundaries and reproducible builds.

## Decision

Adopt a **pnpm workspace monorepo** with top-level domains:

- `apps/` — deployable applications (`apps/web`)
- `packages/` — shared libraries (`@apzhub/*`)
- `services/` — Platform Services (future)
- `integrations/` — engine adapters (canonical path per ADR-001 legacy)
- `events/` — platform event definitions (future)
- `infrastructure/` — Docker, Caddy, database, Redis
- `testing/` — Playwright, fixtures, accessibility, performance
- `docs/` — foundation documents, ADRs, sprint guides

Workspace packages are consumed via TypeScript source exports and `transpilePackages` in Next.js.

## Alternatives

| Alternative                       | Why rejected                                            |
| --------------------------------- | ------------------------------------------------------- |
| Multi-repo (app + packages split) | Higher coordination cost; violates BUILD-001 bootstrap  |
| npm/yarn workspaces without pnpm  | Document 004 mandates pnpm; pnpm offers strict hoisting |
| Nx/Turborepo orchestration layer  | Deferred; foundation sprint prioritises simplicity      |

## Consequences

- Single `pnpm install` bootstraps the platform.
- Dependency direction is enforced by package boundaries and ESLint.
- CI runs root scripts across the workspace.
- Future modules and integrations register into the same repository without new repos.
