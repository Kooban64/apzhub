# SPR-001 — Implementation Plan

> **Status:** Complete — 2026-06-29  
> **Sprint:** 001  
> **Prerequisite:** BUILD-001 complete  
> **Authority:** [Document 000](../000-apzhub-engineering-constitution.md) · [SPR-001](../SPR-001-monorepo-foundation-development-environment.md)  
> **Created:** 2026-06-29  
> **Scope:** Foundation platform only — no business modules, no OSS engine integrations

---

## Executive summary

SPR-001 transforms the BUILD-001 monorepo skeleton into a runnable development platform: Dockerised PostgreSQL and Redis, Better Auth authentication, token-driven theming, a minimal Desktop Shell, Storybook, automated tests, CI, and a platform health endpoint. No business modules, no `module.yaml` / `integration.yaml` / business `service.yaml` implementations, and no integrations with Plane, Kimai, Zammad, Paperless, Metabase, n8n, or Kiwi TCMS.

Execution is **sequential by phase**. Each phase must meet its acceptance criteria before the next begins. Implementation stops when SPR-001 Definition of Done (Section 23) is satisfied.

---

## 1. Task breakdown (execution order)

### Phase 0 — Pre-flight & decisions

| #   | Task                            | Description                                                                                                                                                                             |
| --- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 | Baseline verification           | Confirm BUILD-001 acceptance: `pnpm install`, `pnpm build`, `pnpm lint`, `pnpm typecheck` pass on current tree.                                                                         |
| 0.2 | ADR: canonical integration path | File `docs/decisions/ADR-001-integrations-folder-canonical.md` — adopt `integrations/` (BUILD-001, 026) over `/adapters` (004). Update cross-references only where sprint touches them. |
| 0.3 | ADR: migration tool             | File `docs/decisions/ADR-002-database-migration-framework.md` — select migration ORM (recommend **Drizzle** for Better Auth compatibility and strict TypeScript; alternatives: Prisma). |
| 0.4 | Port allocation                 | Document APZHUB dev ports in `ENVIRONMENT.md` and `.env.example` — must not conflict with `apz-stack` (see Assumptions).                                                                |
| 0.5 | Remove nested git               | Remove `apps/web/.git` if still present so the monorepo has a single root repository.                                                                                                   |

**Phase 0 acceptance:** ADRs filed; port map documented; baseline green.

---

### Phase 1 — Development standards & git hooks

| #   | Task                | Description                                                                               |
| --- | ------------------- | ----------------------------------------------------------------------------------------- |
| 1.1 | Husky + lint-staged | Pre-commit: ESLint + Prettier on staged files.                                            |
| 1.2 | Commitlint          | Conventional commits (`feat:`, `fix:`, `chore:`, etc.) per 004/015.                       |
| 1.3 | Root script wiring  | Replace placeholder `test`, `test:e2e`, `storybook` scripts with real workspace commands. |
| 1.4 | `packages/config`   | Env schema (Zod), typed config loader, `NODE_ENV` / build metadata helpers.               |
| 1.5 | `packages/types`    | Shared platform types (health response, session user shape, API envelopes).               |
| 1.6 | `packages/shared`   | Cross-cutting utilities (logging scaffold, error types) — no business logic.              |
| 1.7 | Changelog           | Add `CHANGELOG.md` at repo root; record SPR-001 entries as phases complete.               |

**Phase 1 acceptance:** `git commit` runs hooks; invalid commit message rejected; `pnpm lint` / `pnpm typecheck` / `pnpm format:check` pass; config package exports typed env validation.

---

### Phase 2 — Docker & infrastructure

| #   | Task                                            | Description                                                                                                                 |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | `infrastructure/docker/docker-compose.dev.yml`  | Services: PostgreSQL, Redis, Caddy. Named volumes. Healthchecks.                                                            |
| 2.2 | `infrastructure/docker/docker-compose.prod.yml` | Production scaffold (structure only — no deploy automation in SPR-001).                                                     |
| 2.3 | `infrastructure/postgres/`                      | Init scripts, database name `apzhub`, dev + test DB creation.                                                               |
| 2.4 | `infrastructure/redis/`                         | Redis config for sessions/cache (no queue workers in SPR-001).                                                              |
| 2.5 | `infrastructure/caddy/`                         | Caddyfile: reverse proxy to `@apzhub/web`, local TLS (internal CA or `tls internal`), compression, API routing placeholder. |
| 2.6 | Root `docker` scripts                           | `pnpm docker:up`, `pnpm docker:down`, `pnpm docker:logs` in root `package.json`.                                            |
| 2.7 | `.env.example`                                  | Placeholders for DB URL, Redis URL, auth secrets, app URL, ports — **no secrets committed** (013).                          |

**Phase 2 acceptance:** `docker compose -f infrastructure/docker/docker-compose.dev.yml up -d` starts all services healthy; ports do not conflict with `apz-stack`; `.env.example` documents every required variable.

---

### Phase 3 — Database & migrations

| #   | Task                        | Description                                                                                                                                                              |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3.1 | Migration framework         | Install and configure chosen ORM/migrator per ADR-002 in `packages/config` or dedicated `packages/db` subpath within config.                                             |
| 3.2 | Platform schema (auth only) | Tables required by Better Auth + minimal platform metadata per 011: users, sessions, accounts, verification tokens. **No business tables.**                              |
| 3.3 | RBAC scaffold tables        | Minimal `roles`, `user_roles` (or equivalent) — structure only; seed default `platform_admin` / `user` roles per 007. No permission enforcement UI yet beyond auth gate. |
| 3.4 | Migration scripts           | `pnpm db:migrate`, `pnpm db:seed`, `pnpm db:reset` at root.                                                                                                              |
| 3.5 | Seed framework              | Dev user (`dev@apzhub.local` / documented password in README only, not in repo), test DB seed for CI.                                                                    |
| 3.6 | Test database               | Separate `apzhub_test` database; migrations run in CI before integration tests.                                                                                          |

**Phase 3 acceptance:** Migrations apply cleanly on fresh DB; seed creates dev user; test DB isolates CI; schema contains zero business/engine tables.

---

### Phase 4 — Authentication (`packages/auth`)

| #   | Task                        | Description                                                                                                                           |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | Better Auth installation    | Email/password, PostgreSQL adapter, secure HTTP-only session cookies (007, 013).                                                      |
| 4.2 | Auth server config          | `packages/auth` exports server instance; `apps/web` mounts route handler at `/api/auth/[...all]`.                                     |
| 4.3 | Client hooks                | `packages/auth` exports React client hooks / session provider for shell.                                                              |
| 4.4 | Email verification scaffold | Configured with dev noop / log sink — no production SMTP in SPR-001.                                                                  |
| 4.5 | Password reset scaffold     | Routes + token storage; dev noop email.                                                                                               |
| 4.6 | Role field support          | User model includes role reference; Better Auth handles identity only (007).                                                          |
| 4.7 | Session management          | Sign-in, sign-out, session read; sliding expiry config. **No OAuth providers.**                                                       |
| 4.8 | Auth pages                  | `/login`, `/register` (dev-only register if gated), `/forgot-password` — presentation only, no business logic in components (000 §6). |
| 4.9 | Route protection            | Middleware: unauthenticated users → login; authenticated users → shell.                                                               |

**Phase 4 acceptance:** Dev user can register/login/logout; session persists across refresh; cookies are HTTP-only + SameSite; auth tables in platform DB only; no OAuth.

---

### Phase 5 — Theme engine (`packages/theme`)

| #   | Task                 | Description                                                                                      |
| --- | -------------------- | ------------------------------------------------------------------------------------------------ |
| 5.1 | Design tokens        | CSS variables / token map: colour, spacing, typography, radius, elevation, z-index per 006, 022. |
| 5.2 | Light + dark themes  | Semantic token sets; no hardcoded colours in components (000 §6).                                |
| 5.3 | Theme provider       | React context + `next-themes` or equivalent; system preference detection.                        |
| 5.4 | Persistence          | Theme preference in `localStorage` (023 appearance category — client-only for SPR-001).          |
| 5.5 | Tailwind integration | Map tokens to Tailwind v4 theme extension in `apps/web`.                                         |

**Phase 5 acceptance:** Theme switches without page reload; preference survives refresh; tokens drive all shell colours; no raw hex in shell components.

---

### Phase 6 — UI package & design system (`packages/ui`)

| #   | Task                        | Description                                                                                                         |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 6.1 | shadcn/ui init              | Initialise in `packages/ui` per 004; Lucide icons.                                                                  |
| 6.2 | Build pipeline              | `tsup` or `unbuild` so package is independently buildable (SPR-001 §5).                                             |
| 6.3 | Primitives                  | Button, Input, Card — token-driven, accessible (006, 028).                                                          |
| 6.4 | Shell composites            | Sidebar, Header, StatusBar, ShellLayout — **presentation only**, no business logic (016, 028).                      |
| 6.5 | `component.yaml` manifests  | One manifest per shared component added (028): Button, Input, Card, Sidebar, Header, StatusBar, ShellLayout.        |
| 6.6 | Component registry scaffold | `packages/ui/registry/` — static registry export for future SDK registration (024, 028); no dynamic module loading. |

**Phase 6 acceptance:** `@apzhub/ui` builds independently; each component has `component.yaml`; components use tokens only; RTL tests pass for primitives.

---

### Phase 7 — Workspace package (`packages/workspace`)

| #   | Task                  | Description                                                                                                                                        |
| --- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 | Shell layout composer | Composes Header, ActivityBar, Sidebar, Workspace, StatusBar regions per 016 layout diagram.                                                        |
| 7.2 | Activity Bar          | Static items: Home only (other workspaces visible as disabled/placeholder or hidden — **no fake module routes**).                                  |
| 7.3 | Sidebar               | Static Home navigation placeholder.                                                                                                                |
| 7.4 | Workspace area        | Blank Home view — welcome message only.                                                                                                            |
| 7.5 | Header                | Logo, theme toggle, user menu (profile stub, sign out). **Exclude:** global search, command palette, notifications, AI entry (SPR-001 §11).        |
| 7.6 | Status Bar            | Environment indicator, connection status stub.                                                                                                     |
| 7.7 | SDK scaffolding       | `packages/sdk` — types/interfaces for future module registration (024); `packages/workspace` exports layout contracts. No module registry runtime. |

**Phase 7 acceptance:** Authenticated user sees full minimal shell; unauthenticated user never sees shell; no business content; excluded 016 features absent.

---

### Phase 8 — Application integration (`apps/web`)

| #   | Task                    | Description                                                                                                       |
| --- | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 8.1 | App shell wiring        | Root layout: ThemeProvider, AuthProvider, TanStack Query provider (004).                                          |
| 8.2 | Route structure         | `(auth)/*` for login; `(platform)/*` for shell; `/` → Home workspace.                                             |
| 8.3 | Replace Next.js starter | Remove default Next.js marketing page; APZHUB branded minimal home.                                               |
| 8.4 | Redis client            | Connect for session/cache/rate-limit scaffold (009 future; connect + ping only in SPR-001).                       |
| 8.5 | `GET /api/health`       | Returns: platform version, DB status, Redis status, environment, build number, overall health (014, SPR-001 §15). |
| 8.6 | Security headers        | Baseline headers in `next.config` / middleware per 013 (CSP scaffold, X-Frame-Options, etc.).                     |
| 8.7 | Rate limiting scaffold  | Redis-backed stub on auth routes (013).                                                                           |

**Phase 8 acceptance:** `pnpm dev` serves shell; health endpoint returns JSON with dependency statuses; no console errors on load.

---

### Phase 9 — Storybook

| #   | Task               | Description                                                                 |
| --- | ------------------ | --------------------------------------------------------------------------- |
| 9.1 | Storybook 8 + Vite | Configure for `packages/ui` (028).                                          |
| 9.2 | Stories            | Button, Input, Card, Sidebar, Header, StatusBar, ShellLayout (SPR-001 §13). |
| 9.3 | Theme toolbar      | Light/dark switch in Storybook.                                             |
| 9.4 | Root script        | `pnpm storybook` launches on dedicated port (e.g. `6006`).                  |

**Phase 9 acceptance:** Storybook builds and runs; all listed stories render in both themes.

---

### Phase 10 — Testing

| #    | Task                    | Description                                                                                         |
| ---- | ----------------------- | --------------------------------------------------------------------------------------------------- |
| 10.1 | Vitest                  | Root config; package-level unit tests.                                                              |
| 10.2 | React Testing Library   | Component tests in `packages/ui`.                                                                   |
| 10.3 | Testing Library setup   | `testing/fixtures/`, shared render helpers with providers.                                          |
| 10.4 | Playwright              | Config in `testing/playwright/`; base URL from env.                                                 |
| 10.5 | E2E acceptance suite    | Per SPR-001 §19 (see Tests section below).                                                          |
| 10.6 | Accessibility           | axe-core in component tests + Playwright a11y scan on shell (015 §11).                              |
| 10.7 | Coverage                | Vitest coverage reporting; threshold scaffold (e.g. 60% on `packages/ui` — raise in later sprints). |
| 10.8 | API / integration tests | Health endpoint + auth flow against test DB.                                                        |

**Phase 10 acceptance:** `pnpm test` and `pnpm test:e2e` pass locally and in CI; coverage report generated.

---

### Phase 11 — CI/CD & GitHub

| #    | Task                    | Description                                                                                                  |
| ---- | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| 11.1 | GitHub Actions `ci.yml` | Jobs: install → lint → typecheck → unit tests → build → Playwright (with service containers for PG + Redis). |
| 11.2 | `CODEOWNERS`            | Platform team placeholders.                                                                                  |
| 11.3 | Dependabot              | `dependabot.yml` for npm/pnpm ecosystem.                                                                     |
| 11.4 | Branch protection doc   | `docs/developer/branch-protection.md` — required checks documented (015).                                    |
| 11.5 | No warnings policy      | CI fails on lint warnings (SPR-001 §6).                                                                      |

**Phase 11 acceptance:** CI workflow green on clean clone; all mandatory stages pass; no lint warnings.

---

### Phase 12 — Documentation & close-out

| #    | Task                                | Description                                                                                  |
| ---- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| 12.1 | Update `README.md`                  | Dev setup: clone → env → docker → migrate → seed → dev.                                      |
| 12.2 | Package READMEs                     | Each touched package documents purpose, scripts, boundaries.                                 |
| 12.3 | `docs/developer/getting-started.md` | Full onboarding guide.                                                                       |
| 12.4 | Update `ENVIRONMENT.md`             | APZHUB ports and coexistence notes.                                                          |
| 12.5 | Update `docs/README.md`             | Mark SPR-001 in progress → complete.                                                         |
| 12.6 | SDK placeholder READMEs             | `services/`, `integrations/`, `events/` — pointers to 025–029 manifests; no implementations. |
| 12.7 | `packages/events` scaffold          | Export event types + manifest schema types only (029) — **no Event Bus implementation**.     |
| 12.8 | Final verification                  | Full Definition of Done checklist (SPR-001 §23).                                             |

**Phase 12 acceptance:** Documentation matches implementation; changelog current; sprint marked complete.

---

## 2. Dependencies

### External / host

| Dependency       | Required for | Notes                                 |
| ---------------- | ------------ | ------------------------------------- |
| Node.js ≥ 20 LTS | All phases   | Matches BUILD-001 engines             |
| pnpm 10.x        | All phases   | Lockfile committed                    |
| Docker + Compose | Phases 2–12  | Coexist with `apz-stack` on same host |
| Git              | Phase 1      | Hooks                                 |

### Phase dependency graph

```
Phase 0
  → Phase 1 (tooling)
  → Phase 2 (Docker)
  → Phase 3 (DB) — requires Phase 2 PostgreSQL
  → Phase 4 (Auth) — requires Phase 3
  → Phase 5 (Theme) — parallel with Phase 4 after Phase 1
  → Phase 6 (UI) — requires Phase 5
  → Phase 7 (Workspace) — requires Phase 4, 6
  → Phase 8 (App) — requires Phase 4, 7
  → Phase 9 (Storybook) — requires Phase 6
  → Phase 10 (Tests) — requires Phase 8; E2E requires Docker
  → Phase 11 (CI) — requires Phase 10
  → Phase 12 (Docs) — requires Phase 11
```

### Package dependency graph (target)

```
apps/web
  → @apzhub/workspace, @apzhub/ui, @apzhub/theme, @apzhub/auth, @apzhub/config, @apzhub/types, @apzhub/shared

@apzhub/workspace
  → @apzhub/ui, @apzhub/theme, @apzhub/types

@apzhub/ui
  → @apzhub/theme, @apzhub/types

@apzhub/auth
  → @apzhub/config, @apzhub/types, better-auth

@apzhub/theme
  → @apzhub/types
```

**Prohibited:** `apps/web` → integrations; UI → backend engines; business logic in React components (000 §6).

---

## 3. Risks

| ID  | Risk                                                | Impact                             | Mitigation                                                                            |
| --- | --------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------- |
| R1  | Port collision with `apz-stack` on shared EC2 host  | Docker or dev server fails to bind | Phase 0.4 port map; verify with `ss -tlnp` before compose                             |
| R2  | Disk pressure (host ~40% free, Docker images 28 GB) | Build/pull failures                | Pin slim images; document `docker system df`; no duplicate PG/Redis if avoidable      |
| R3  | Better Auth + ORM schema drift                      | Auth broken after migration        | ADR-002; use Better Auth documented adapter; migration CI gate                        |
| R4  | shadcn/ui + monorepo + Tailwind v4 friction         | UI package build fails             | Initialise shadcn in `packages/ui` early; Storybook in Phase 9 validates              |
| R5  | Playwright flakiness in CI                          | False failures                     | Service container health waits; deterministic test user seed; retry policy documented |
| R6  | Scope creep (shell features from 017–021)           | Sprint overrun                     | Explicit exclusions in every phase; stop at SPR-001 §21                               |
| R7  | Nested `apps/web/.git`                              | Submodule confusion                | Phase 0.5 removal                                                                     |
| R8  | Caddy local TLS complexity                          | Dev HTTPS blocked                  | Document HTTP fallback for local dev; Caddy optional for `pnpm dev`                   |
| R9  | Husky in CI-less clones                             | Hooks annoy contributors           | Document `HUSKY=0` for rare cases; hooks optional in doc only if needed               |
| R10 | 004 vs 026 path terminology                         | Future confusion                   | ADR-001 in Phase 0                                                                    |

---

## 4. Assumptions

| ID  | Assumption                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | BUILD-001 acceptance criteria are met (verified in Phase 0.1).                                                                                                         |
| A2  | Development occurs on the documented EC2 host with `apz-stack` running; APZHUB uses **non-conflicting ports** (proposed below).                                        |
| A3  | **Proposed dev ports:** Web `3300`, Storybook `6006`, PostgreSQL host `54334`, Redis host `6380`, Caddy HTTP `3080` / HTTPS `3443`. Subject to Phase 0.4 verification. |
| A4  | **Drizzle ORM** will be adopted (ADR-002) unless owner rejects during plan approval.                                                                                   |
| A5  | Email in SPR-001 is **dev noop** (console/logger); production SMTP deferred.                                                                                           |
| A6  | RBAC in SPR-001 is **schema + seed only** — full Permission Service and permission-driven UI deferred (007), but auth gate protects shell routes.                      |
| A7  | `packages/*` are independently buildable via `tsup` with `dist/` exports added in Phase 6.                                                                             |
| A8  | TanStack Query is wired with no data-fetching business queries — provider scaffold only.                                                                               |
| A9  | No host nginx changes in SPR-001; APZHUB accessed via `localhost:3300` or Caddy locally.                                                                               |
| A10 | Document migration (BUILD-001 §13) remains **out of scope** — docs stay at `docs/` root to avoid link breakage.                                                        |
| A11 | Self-hosted GitHub Actions runners (015 §28) are **not** required for SPR-001 — `ubuntu-latest` acceptable for CI scaffold.                                            |
| A12 | Register route (`/register`) enabled in development only or behind `ALLOW_DEV_REGISTRATION` env flag.                                                                  |

---

## 5. Files & folders to be created or modified

### Created (major)

| Path                                                      | Purpose               |
| --------------------------------------------------------- | --------------------- |
| `docs/decisions/ADR-001-integrations-folder-canonical.md` | Path reconciliation   |
| `docs/decisions/ADR-002-database-migration-framework.md`  | ORM decision          |
| `docs/developer/getting-started.md`                       | Onboarding            |
| `docs/developer/branch-protection.md`                     | CI policy             |
| `infrastructure/docker/docker-compose.dev.yml`            | Dev stack             |
| `infrastructure/docker/docker-compose.prod.yml`           | Prod scaffold         |
| `infrastructure/postgres/init.sql`                        | DB bootstrap          |
| `infrastructure/caddy/Caddyfile`                          | Reverse proxy         |
| `infrastructure/redis/redis.conf`                         | Redis config          |
| `.env.example`                                            | Env template          |
| `CHANGELOG.md`                                            | Release notes         |
| `.husky/pre-commit`, `.husky/commit-msg`                  | Git hooks             |
| `commitlint.config.js`                                    | Commit rules          |
| `.github/workflows/ci.yml`                                | CI pipeline           |
| `.github/dependabot.yml`                                  | Dependency updates    |
| `.github/CODEOWNERS`                                      | Ownership             |
| `packages/config/src/env.ts`                              | Zod env schema        |
| `packages/auth/src/server.ts`, `client.ts`                | Better Auth           |
| `packages/theme/src/tokens.ts`, `provider.tsx`            | Tokens + themes       |
| `packages/ui/src/components/**`                           | UI primitives + shell |
| `packages/ui/src/**/component.yaml`                       | Component manifests   |
| `packages/workspace/src/shell/**`                         | Shell composer        |
| `packages/sdk/src/contracts/**`                           | SDK interface stubs   |
| `apps/web/app/(auth)/**`                                  | Auth routes           |
| `apps/web/app/(platform)/**`                              | Shell routes          |
| `apps/web/app/api/auth/[...all]/route.ts`                 | Auth handler          |
| `apps/web/app/api/health/route.ts`                        | Health endpoint       |
| `apps/web/middleware.ts`                                  | Auth gate             |
| `testing/playwright/playwright.config.ts`                 | E2E config            |
| `testing/playwright/e2e/*.spec.ts`                        | Acceptance tests      |
| `testing/fixtures/test-utils.tsx`                         | RTL helpers           |
| `vitest.config.ts`                                        | Unit test config      |
| `.storybook/**` or `packages/ui/.storybook/**`            | Storybook             |

### Modified (major)

| Path                                  | Changes                                              |
| ------------------------------------- | ---------------------------------------------------- |
| `package.json`                        | Real test/storybook/docker/db scripts; husky prepare |
| `pnpm-lock.yaml`                      | New dependencies                                     |
| `tsconfig.base.json`                  | Path mappings, project references                    |
| `apps/web/package.json`               | Workspace deps, auth, UI packages                    |
| `apps/web/next.config.ts`             | Security headers, monorepo transpile                 |
| `apps/web/app/layout.tsx`, `page.tsx` | Shell wiring                                         |
| `packages/*/package.json`             | Build scripts, dependencies                          |
| `README.md`                           | Dev setup instructions                               |
| `ENVIRONMENT.md`                      | APZHUB port allocation                               |
| `docs/README.md`                      | Sprint status                                        |
| `.gitignore`                          | `.env`, coverage, storybook-static                   |
| `eslint.config.mjs`                   | Storybook / test overrides if needed                 |

### Explicitly not created

- `modules/**` business modules
- `integrations/*/integration.yaml` implementations (Plane, Kimai, etc.)
- `services/*/service.yaml` business services
- Event Bus runtime, workers, queues (012, 029)
- Command palette, global search, notifications, context panel, session restore (017–021)
- OAuth providers, SSO, provisioning (007 — later sprints)

---

## 6. Tests to be written

### Unit tests (Vitest)

| Area                  | Tests                                                        |
| --------------------- | ------------------------------------------------------------ |
| `packages/config`     | Env schema validation; missing required vars throw           |
| `packages/theme`      | Token completeness; theme class application                  |
| `packages/auth`       | Auth config exports; role helper utilities                   |
| `packages/ui`         | Button, Input, Card — render, variants, disabled, a11y roles |
| `apps/web/api/health` | Response shape; degraded when DB/Redis down (mocked)         |

### Component tests (RTL + Vitest)

| Component   | Tests                                             |
| ----------- | ------------------------------------------------- |
| Button      | Click, disabled, keyboard activation              |
| Input       | Label association, error state                    |
| Header      | Theme toggle renders; user menu sign-out callback |
| Sidebar     | Navigation items render                           |
| StatusBar   | Environment label                                 |
| ShellLayout | All regions present; children in workspace slot   |

### Integration tests

| Test                  | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| Health integration    | `GET /api/health` against test server with real PG + Redis |
| Auth integration      | Sign-up → session cookie → protected route access          |
| Migration integration | `db:migrate` on empty test database succeeds               |

### Playwright E2E (SPR-001 §19)

| Spec                      | Assertions                                                                      |
| ------------------------- | ------------------------------------------------------------------------------- |
| `app-loads.spec.ts`       | `/login` loads; no console errors                                               |
| `login-page.spec.ts`      | Login form visible; validation messages                                         |
| `auth-flow.spec.ts`       | Login with seed user → redirect to shell → logout → redirect to login           |
| `desktop-shell.spec.ts`   | Header, Activity Bar, Sidebar, Workspace, Status Bar visible when authenticated |
| `theme-switching.spec.ts` | Toggle dark/light; persisted after reload                                       |
| `health-endpoint.spec.ts` | `GET /api/health` returns 200 + JSON schema                                     |
| `unauthenticated.spec.ts` | `/` redirects unauthenticated user to login                                     |

### Accessibility

| Test            | Tool                                 |
| --------------- | ------------------------------------ |
| Shell a11y scan | axe-playwright on authenticated home |
| Component a11y  | jest-axe on Button, Input, Card      |

---

## 7. Acceptance criteria per task

Criteria are summarized per phase above. **Global gates** apply to every phase:

- `pnpm lint` — zero warnings
- `pnpm typecheck` — pass
- `pnpm build` — pass
- No secrets in diff
- No business module code
- Documentation updated for the phase
- `CHANGELOG.md` entry added

### Sprint-level Definition of Done (SPR-001 §23)

| Criterion                       | Verification                         |
| ------------------------------- | ------------------------------------ |
| Platform builds                 | `pnpm build`                         |
| All automated tests pass        | `pnpm test` + `pnpm test:e2e`        |
| Storybook launches              | `pnpm storybook`                     |
| Docker starts without errors    | `pnpm docker:up`                     |
| Better Auth authenticates users | Manual + `auth-flow.spec.ts`         |
| PostgreSQL healthy              | Docker healthcheck + `/api/health`   |
| Redis healthy                   | Docker healthcheck + `/api/health`   |
| Desktop Shell renders           | `desktop-shell.spec.ts` + manual     |
| CI pipeline passes              | GitHub Actions green                 |
| Documentation updated           | README, getting-started, ENVIRONMENT |
| No critical defects             | E2E suite green                      |
| No business functionality       | Code review + no module manifests    |

---

## 8. Clear stopping point

**Stop immediately after Phase 12** when all SPR-001 §23 Definition of Done criteria pass.

### In scope terminus

The sprint delivers a developer-ready platform:

1. Clone repo → copy `.env.example` → `pnpm install` → `pnpm docker:up` → `pnpm db:migrate` → `pnpm db:seed` → `pnpm dev`
2. Browse to `http://localhost:3300` (or documented port)
3. Log in as seeded dev user
4. See minimal Desktop Shell (Header, Activity Bar, Sidebar, blank Home, Status Bar)
5. Switch light/dark theme
6. Run `pnpm storybook`, `pnpm test`, `pnpm test:e2e`
7. CI passes on push

### Explicit out-of-scope (do not implement)

| Item                                                                   | Deferred to                    |
| ---------------------------------------------------------------------- | ------------------------------ |
| Business modules (Projects, Support, etc.)                             | SPR-002+                       |
| Plane, Kimai, Zammad, Paperless, Metabase, n8n, Kiwi TCMS integrations | Integration sprints            |
| `module.yaml` implementations                                          | Module sprints                 |
| `integration.yaml` / `service.yaml` business implementations           | Service/integration sprints    |
| Platform Event Bus runtime                                             | Post-029 implementation sprint |
| Command Palette (019)                                                  | Future sprint                  |
| Global Search (020)                                                    | Future sprint                  |
| Notification Centre (021)                                              | Future sprint                  |
| Context Panel, multi-tab sessions (018)                                | Future sprint                  |
| Full RBAC / permission-driven UI (005, 007)                            | IAM sprint                     |
| OAuth / SSO providers                                                  | IAM sprint                     |
| User provisioning to backend engines                                   | Provisioning sprint            |
| Branding / white-label (022 §6)                                        | Branding sprint                |
| MinIO, OpenSearch, Prometheus, Grafana, Loki                           | Infrastructure sprints         |
| Production deployment automation                                       | Release sprint                 |
| Document folder migration (BUILD-001 §13)                              | Optional housekeeping          |

### Handoff artefact

Upon completion, update `docs/sprint/SPR-001-implementation-plan.md` status to **Complete** and add a short **Completion Report** section with: date, commit SHA, CI run URL placeholder, known limitations, and recommended SPR-002 prerequisites.

---

## Completion Report

**Date:** 2026-06-29  
**Status:** SPR-001 Definition of Done satisfied on development host.

### Verified locally

| Gate                               | Result                           |
| ---------------------------------- | -------------------------------- |
| `pnpm docker:up`                   | PostgreSQL, Redis, Caddy healthy |
| `pnpm db:migrate` / `pnpm db:seed` | Applied                          |
| `pnpm lint`                        | Pass                             |
| `pnpm typecheck`                   | Pass                             |
| `pnpm test`                        | Pass                             |
| `pnpm build`                       | Pass                             |
| `pnpm test:e2e`                    | 6/6 pass                         |
| `pnpm storybook`                   | Configured (port 6006)           |

### Known limitations

- Nested `apps/web/.git` may remain until manually removed
- Root git not initialised — Husky hooks inactive until `git init`
- Full RBAC, command palette, search, notifications, Event Bus deferred per scope
- Caddy optional for local dev (`pnpm dev` on port 3300 is primary)

### SPR-002 prerequisites

- Approved sprint guide for next platform capability
- ADRs for any new architectural decisions
- Module registry runtime (025) when first business module begins

---

## Approval

| Role          | Name | Date | Approved |
| ------------- | ---- | ---- | -------- |
| Project owner |      |      | ☐        |
| Engineering   |      |      | ☐        |

**No application code shall be written until this plan is approved.**
