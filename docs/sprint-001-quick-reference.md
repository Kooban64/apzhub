# APZHUB Sprint 001 quick reference

Derived lookup for [SPR-001](./SPR-001-monorepo-foundation-development-environment.md).

> **Sprint 001 · P0 · Approved for Implementation · 1–2 weeks**  
> Depends on docs [001–029](./001-project-vision-and-guiding-principles.md). Document 000 (Engineering Constitution) pending.

## Objective

Engineering foundation only — **no business functionality**. Clone → start → test → **Desktop Shell + auth** working.

## In scope

Monorepo · pnpm · TS strict · Next.js App Router · Better Auth · PostgreSQL · Redis · Docker Compose · Caddy · Storybook · Vitest · Playwright · shared packages · CI · minimal shell · `GET /api/health`

## Explicitly excluded

All business modules (Projects, Documents, Support, etc.) · all OSS engine integrations (Plane, Kimai, Zammad, Paperless, Metabase, n8n, Kiwi) · no `module.yaml` / business services / integrations implementations

## Stack

**Frontend:** Next.js · React · TS · Tailwind · shadcn · TanStack Query/Table · RHF · Zod (004, 006)

**Backend:** Next.js API routes (initial) · Better Auth · PostgreSQL · Redis — services extraction later (009, 027)

**Infra:** Docker Compose · Caddy · Postgres · Redis — future: MinIO · OpenSearch · Prometheus · Grafana · Loki

## Repo layout

```
docs/ apps/ packages/ services/ integrations/ events/ infrastructure/ testing/ scripts/ .github/
```

Align with SDK docs 024–029; reconcile `integrations/` vs `/adapters` (004 vs 026) in sprint setup

## Packages (`packages/`)

ui · sdk · types · auth · theme · workspace · events · search · notifications · shared · config — independently buildable

## Dev standards

Strict TS · ESLint · Prettier · EditorConfig · Husky · lint-staged · Commitlint — **zero CI warnings** (015)

## Auth (007)

Better Auth: email/password · session cookies · PostgreSQL adapter · email verify scaffold · password reset scaffold · roles · session mgmt — **no OAuth in SPR-001**

## Database (011)

Platform DB · migrations · seeds · dev user · test DB — **no business tables**

## Redis

Sessions · rate limit · cache · future queues (012 deferred)

## Caddy

HTTPS · local certs · compression · static · API routing · future WebSockets

## Desktop shell (016 — minimal)

Header · Activity Bar · Sidebar · Workspace · Status Bar · blank Home — **no** context panel · command palette · search · notifications · sessions/tabs (later sprints)

## Theme (022, 023)

Dark · light · design tokens · switch · persist — no white-label yet

## Storybook (028)

Button · Input · Card · Sidebar · Header · Status Bar · Layout stories

## Testing (015)

Vitest · RTL · Playwright · a11y · coverage · sample tests

## Health (`GET /api/health`)

Platform version · DB · Redis · environment · build number · status (014)

## Env & Docker

`.env.example` only — no secrets (013) · dev + prod compose scaffold · named volumes · **non-conflicting ports** with legacy stack (ENVIRONMENT.md)

## GitHub

Issue/PR templates · CODEOWNERS · Dependabot · Actions · branch protection docs

## Playwright acceptance

App loads · login · shell · theme switch · auth scaffold · health · no console errors

## Out of scope (21)

Modules · integrations · provisioning · search · command palette · dashboards · notifications · AI · Event Bus (beyond package scaffold)

## Cursor rules

Execute **sequentially** · each task compiles + lints + tests + docs + changelog · **stop after SPR-001** · no future sprint work

## Definition of done

Build OK · all tests pass · Storybook runs · Docker OK · Better Auth works · Postgres/Redis healthy · shell renders · CI green · docs updated · no critical defects
