# SPR-001 — Architecture & Engineering Review

> **Review ID:** REV-001  
> **Sprint:** SPR-001 — Monorepo Foundation & Development Environment  
> **Date:** 2026-06-29  
> **Reviewer:** Cursor (Architecture & Engineering Review)  
> **Scope:** Post-implementation review — **no code changes**  
> **Authority:** [Document 000](../000-apzhub-engineering-constitution.md) · [BUILD-001](../build/BUILD-001-repository-bootstrap-guide.md) · [SPR-001](../SPR-001-monorepo-foundation-development-environment.md)

---

## Section 1 — Executive Summary

### Overall assessment

SPR-001 delivers a **credible, runnable platform foundation**. The monorepo installs, builds, migrates, and runs locally with Docker-backed PostgreSQL and Redis, Better Auth email/password authentication, a minimal Desktop Shell, token-driven theming, Storybook, automated tests, and a CI pipeline. The implementation aligns with the sprint’s stated objective: _establish engineering foundation without business functionality_.

The foundation is **suitable for controlled progression to Sprint 002**, provided documented observations and technical debt items are tracked and prioritised. Several constitution-level aspirations (Zero Trust depth, full test pyramid, complete dev-standard tooling) are **scaffolded but not yet mature**.

### Architecture maturity

| Dimension        | Rating           | Notes                                                                    |
| ---------------- | ---------------- | ------------------------------------------------------------------------ |
| Layer separation | **Moderate**     | Packages exist; auth orchestration still in page components              |
| Manifest-first   | **Low–Moderate** | `component.yaml` present for UI; no module/integration/service manifests |
| Replaceability   | **Good**         | Backend-agnostic shell; no OSS engine coupling                           |
| Observability    | **Basic**        | `/api/health` only; no structured platform logging                       |
| Event-driven     | **Not started**  | Event package stub only (by design)                                      |

### Engineering maturity

| Dimension     | Rating           | Notes                                                   |
| ------------- | ---------------- | ------------------------------------------------------- |
| Tooling       | **Good**         | pnpm, ESLint, Prettier, TypeScript strict, CI           |
| Git hooks     | **Incomplete**   | Husky configured in `package.json` but `.husky/` absent |
| Testing       | **Foundational** | 2 unit tests, 6 E2E tests; coverage not enforced        |
| Documentation | **Good**         | Getting-started guide, ADRs, CHANGELOG, sprint plan     |
| CI/CD         | **Good**         | Lint, typecheck, format, migrate, build, E2E            |

### Code quality assessment

Code is **readable, consistently structured, and type-safe**. Shared packages use clear boundaries (`@apzhub/config`, `@apzhub/auth`, `@apzhub/ui`). Minor constitution deviations exist: hardcoded Tailwind colour utilities in `StatusBar`, auth flows in React pages, and a `as unknown as` cast in Better Auth server setup. No business logic was introduced in shell components.

### Repository quality assessment

Repository layout **matches BUILD-001 and SPR-001** with intentional reconciliation of `integrations/` vs Document 004’s `/adapters` (ADR-001). Foundation documents remain at `docs/` root (BUILD-001 §13 migration deferred). Placeholder packages (`search`, `notifications`) and directories (`services/`, `events/`) are appropriately empty.

### Verdict

## **PASS WITH OBSERVATIONS**

SPR-001 meets its Definition of Done for a foundation sprint. Observations are non-blocking for Sprint 002 planning but must be addressed incrementally to reach constitution-grade maturity.

---

## Section 2 — Compliance Matrix

| Document                           | Compliant                                                                                                                         | Partially Compliant                                                                     | Not Compliant                  | Evidence                                                                                   | Required Actions                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **000 — Engineering Constitution** | Principles 1–5, 9–10 (foundation scope)                                                                                           | Principles 6–8 (RBAC, events, security depth)                                           | —                              | Monorepo before modules; no engine integrations; tests exist; docs updated                 | Wire RBAC beyond schema; deepen security; expand test coverage before feature sprints                                  |
| **BUILD-001**                      | Structure, pnpm, `apps/web`, package shells, scripts, `.github/` scaffold                                                         | §13 doc migration to subfolders                                                         | —                              | `pnpm-workspace.yaml`, 11 packages, `infrastructure/`, `testing/`                          | Optional: migrate docs per BUILD-001 §13 when link strategy approved                                                   |
| **SPR-001**                        | Monorepo, Better Auth, PG, Redis, Docker, Caddy, shell regions, themes, Storybook, Vitest, Playwright, health, `.env.example`, CI | Stack deps (shadcn, RHF, Table, Lucide); Redis functional use; Husky/commitlint runtime | —                              | `docker-compose.dev.yml`, `packages/auth`, `shell-layout.tsx`, `ci.yml`, `spr-001.spec.ts` | Install or formally defer undeclared stack items; activate git hooks; use Redis per sprint intent or document deferral |
| **004 — Technology Stack**         | Next.js, React, TS, Tailwind, pnpm, ESLint, Prettier, Playwright, Vitest                                                          | shadcn/ui, TanStack Table, RHF, Zod forms in UI, Lucide, Husky operational              | Motion not referenced          | `apps/web/package.json`, `packages/ui` CVA pattern                                         | Align package.json with 004 or update sprint acceptance for custom primitives                                          |
| **006 — Design System**            | Token usage in components; semantic colours                                                                                       | StatusBar uses `emerald`/`amber` utilities                                              | —                              | `packages/theme/src/tokens.css`; `packages/ui/src/components/*.tsx`                        | Replace status colours with semantic success/warning tokens                                                            |
| **007 — IAM**                      | Better Auth; email/password; session cookies; dev registration gate                                                               | RBAC tables seeded but not enforced; no Permission Service; middleware cookie-only      | OAuth (correctly deferred)     | `packages/auth/src/server.ts`, `schema.ts` roles/user_roles, `middleware.ts`               | Sprint 002+ IAM: session validation, role assignment, permission-driven UI                                             |
| **011 — Platform Data**            | Platform-only schema; auth + roles; no business tables                                                                            | `user.roleId` unused; `user_roles` unpopulated                                          | —                              | `packages/config/src/db/schema.ts`, migration `0000_*.sql`                                 | Connect identity to RBAC model in IAM sprint                                                                           |
| **013 — Security**                 | `.env.example` only; Zod env validation; basic headers; no secrets in repo                                                        | CSP, HSTS, rate limiting, audit logging; middleware trust model                         | —                              | `packages/config/src/env.ts`, `next.config.ts` headers, `.gitignore`                       | Add CSP/HSTS roadmap; Redis rate-limit scaffold; server-side session check                                             |
| **015 — Quality & Release**        | CI gates; test pyramid started; E2E for critical paths                                                                            | Coverage not reported/enforced; Storybook not in CI; a11y tests minimal; Husky inactive | —                              | `.github/workflows/ci.yml`, `vitest.config.ts`, `spr-001.spec.ts`                          | Enforce coverage thresholds; add `build-storybook` to CI; axe in E2E                                                   |
| **016 — Desktop Shell**            | Header, Activity Bar, Sidebar, Workspace, Status Bar present                                                                      | Context Panel, Command Palette, Search, Notifications, tabs (correctly excluded)        | Permission-driven activity bar | `packages/ui/src/components/shell-layout.tsx`, `packages/workspace/src/desktop-shell.tsx`  | Dynamic workspace registry in module sprint; permission filtering per 005/016                                          |
| **022 — Presentation Engine**      | Token layers; light/dark; persistence via `next-themes`                                                                           | No Brand layer; no high-contrast theme                                                  | —                              | `packages/theme/src/tokens.css`, `provider.tsx`                                            | Brand/white-label deferred appropriately                                                                               |
| **024 — Platform SDK**             | Package stub; layer philosophy documented in code comments                                                                        | No registration runtime; `registerModule` throws                                        | —                              | `packages/sdk/src/index.ts`                                                                | Implement registry when first module lands                                                                             |
| **025 — Module SDK**               | No modules (correct)                                                                                                              | No `module.yaml`, registry, or module packages                                          | —                              | N/A — out of scope                                                                         | First module sprint begins with manifest                                                                               |
| **026 — Integration SDK**          | `integrations/` + ADR-001; README                                                                                                 | No `integration.yaml` implementations                                                   | —                              | `integrations/README.md`, ADR-001                                                          | First integration sprint uses manifest-first                                                                           |
| **027 — Service SDK**              | `services/` placeholder                                                                                                           | No `service.yaml` or Platform Services                                                  | —                              | `services/README.md`                                                                       | Platform Service extraction in dedicated sprint                                                                        |
| **028 — UI Component SDK**         | 7 `component.yaml` files; Storybook stories; component tests (Button)                                                             | ActivityBar not manifested; no Component Registry runtime; not shadcn-generated         | —                              | `packages/ui/src/components/*/component.yaml`, `.storybook/`                               | Registry + remaining primitives in design-system sprint                                                                |
| **029 — Event SDK**                | Types stub; no Event Bus (correct)                                                                                                | No `event.yaml`; no bus runtime                                                         | —                              | `packages/events/src/index.ts`                                                             | Event Bus sprint per 012/029                                                                                           |

---

## Section 3 — Repository Review

### Repository structure

| Expected (BUILD-001 / SPR-001) | Status                 | Location                                                   |
| ------------------------------ | ---------------------- | ---------------------------------------------------------- |
| `apps/`                        | ✅                     | `apps/web/`                                                |
| `packages/`                    | ✅                     | 11 workspace packages                                      |
| `services/`                    | ✅ Placeholder         | `services/README.md`                                       |
| `integrations/`                | ✅ Canonical (ADR-001) | `integrations/README.md`                                   |
| `events/`                      | ✅ Placeholder         | `events/README.md` + `packages/events/`                    |
| `infrastructure/`              | ✅                     | `infrastructure/{docker,caddy,postgres,redis}/`            |
| `testing/`                     | ✅                     | `testing/{playwright,fixtures,accessibility,performance}/` |
| `scripts/`                     | ✅                     | `scripts/db-{migrate,seed}.ts`                             |
| `docs/`                        | ✅                     | Foundation docs + `developer/`, `decisions/`, `reviews/`   |
| `.github/`                     | ✅                     | Workflows, templates, CODEOWNERS, Dependabot               |

**Inconsistencies:**

- Document 004 references `/adapters` and `/modules` — not present; reconciled via ADR-001 (`integrations/`) and deferred modules (acceptable).
- BUILD-001 §13 subfolder migration (`docs/architecture/`, etc.) not executed — docs remain at `docs/` root with README stubs in subfolders.
- Nested `apps/web/.git` may still exist (blocks single-root git workflow).
- Root git may be uninitialised — Husky `prepare` script logs `.git can't be found`.

### Package organisation

| Package                                     | Role                      | Maturity                        |
| ------------------------------------------- | ------------------------- | ------------------------------- |
| `@apzhub/config`                            | Env + Drizzle             | Production-ready for foundation |
| `@apzhub/auth`                              | Better Auth server/client | Functional scaffold             |
| `@apzhub/types`                             | Shared types              | Minimal                         |
| `@apzhub/shared`                            | Logger, Redis client      | Redis used for health only      |
| `@apzhub/theme`                             | Tokens + provider         | Functional                      |
| `@apzhub/ui`                                | Design system + shell     | Functional                      |
| `@apzhub/workspace`                         | DesktopShell composer     | Thin wrapper                    |
| `@apzhub/sdk`                               | Stub                      | Throws on `registerModule`      |
| `@apzhub/events`, `search`, `notifications` | Stubs                     | Empty exports                   |

### Naming conventions

- Package scope `@apzhub/*` — consistent with Document 002.
- Product name `apzhub` in `package.json`; host path `apz-portal` — documented in BUILD-001.

### Workspace boundaries

**Observed dependency direction (correct):**

```
apps/web → workspace → ui → theme
apps/web → auth → config
apps/web → shared → config
```

No UI → integration or module → engine dependencies detected.

### Monorepo compliance

- `pnpm-workspace.yaml` registers `apps/*`, `packages/*`, `services/*`, `integrations/*`, `events/*`.
- `transpilePackages` in `apps/web/next.config.ts` for workspace packages.
- TypeScript path aliases in `tsconfig.base.json` and `apps/web/tsconfig.json`.

### Documentation placement

- Sprint guides: `docs/SPR-001-*.md`, `docs/sprint/SPR-001-implementation-plan.md`
- ADRs: `docs/decisions/ADR-001`, `ADR-002`
- Developer: `docs/developer/getting-started.md`
- Reviews: `docs/reviews/` (this document)

### Package ownership

- `CODEOWNERS` assigns `@apzhub-platform` to `apps/`, `packages/`, `infrastructure/` — placeholder team name.

---

## Section 4 — Desktop Shell Review

### Regions implemented (Document 016)

| Region           | Implemented | Evidence                                    | Notes                                                    |
| ---------------- | ----------- | ------------------------------------------- | -------------------------------------------------------- |
| **Header**       | ✅          | `packages/ui/src/components/header.tsx`     | Logo, workspace label, theme toggle, user name, sign out |
| **Activity Bar** | ✅          | `shell-layout.tsx` → `ActivityBar`          | Single static Home icon (`H`); not permission-driven     |
| **Sidebar**      | ✅          | `packages/ui/src/components/sidebar.tsx`    | Static Home item via `DesktopShell`                      |
| **Workspace**    | ✅          | `apps/web/app/(platform)/page.tsx`          | Blank Home welcome content                               |
| **Status Bar**   | ✅          | `packages/ui/src/components/status-bar.tsx` | Environment + connection status                          |

### Correctly excluded (SPR-001 §11)

Context Panel, Command Palette, Global Search, Notification Centre, multi-tab/session restore — **not present** (compliant).

### Theme implementation

- `ThemeProvider` (`next-themes`) at root layout.
- Header uses mounted-state guard to avoid hydration mismatch — good practice.

### Layout responsiveness

- Flex-based full-height layout (`min-h-screen`, `min-h-0`, `overflow-auto`).
- Fixed sidebar width (`w-56`), activity bar (`w-12`).
- **Gap:** No breakpoint behaviour for narrow viewports (acceptable for foundation; document for mobile sprint).

### Accessibility

- Positive: `aria-label` on theme toggle and Home workspace button; form labels on `Input`; `role="alert"` on errors.
- Gaps: No skip link; Activity Bar uses letter glyph not icon+tooltip; no keyboard shortcut registry; no automated axe suite in CI (Storybook a11y addon only).

### Architecture consistency

- Shell components are **presentation-only** — compliant with Document 016 §5 and Constitution §6.
- `DesktopShell` hardcodes sidebar items — acceptable static scaffold; conflicts with future permission-driven navigation (005, 016).

---

## Section 5 — Authentication Review

### Better Auth configuration

| Requirement                 | Status | Evidence                                                                   |
| --------------------------- | ------ | -------------------------------------------------------------------------- |
| Email/password              | ✅     | `packages/auth/src/server.ts`                                              |
| PostgreSQL adapter          | ✅     | Drizzle adapter with `user`, `session`, `account`, `verification`          |
| Session cookies             | ✅     | Better Auth defaults + `nextCookies` plugin                                |
| Email verification scaffold | ⚠️     | `sendVerificationEmail` logs to console; `requireEmailVerification: false` |
| Password reset scaffold     | ⚠️     | `sendResetPassword` logs; UI is static info page only                      |
| Role support                | ⚠️     | `user.roleId` column exists; not set by auth flow                          |
| No OAuth                    | ✅     | No OAuth providers configured                                              |

### Session handling

- Client: `useSession` via `@apzhub/auth`.
- Server: lazy handler in `/api/auth/[...all]/route.ts`.
- Session config: 7-day expiry, sliding `updateAge`, cookie cache enabled.

### Cookie security

- Better Auth manages HTTP-only session cookies (library default).
- Middleware uses `getSessionCookie` — **presence check only**, not cryptographic validation against store.

### Password policy

- Register form: `minLength={8}` in UI only.
- **No server-side Zod policy** in auth package beyond Better Auth defaults.

### Development registration

- `ALLOW_DEV_REGISTRATION` + `NODE_ENV === development` gate in `isDevRegistrationAllowed()`.
- Register server page calls `notFound()` when disabled — **correct**.
- `NEXT_PUBLIC_ALLOW_DEV_REGISTRATION` exposed for client link visibility — not validated in Zod schema (optional field only).

### Future readiness

- Server/client split (`@apzhub/auth` vs `@apzhub/auth/server`) supports App Router patterns.
- RBAC schema ready for IAM sprint wiring.
- Email scaffolds ready for SMTP integration.

### Concerns

1. Middleware cookie check is weaker than Document 013 Zero Trust expectations.
2. Auth orchestration in page components (`login-form.tsx`, `register-form.tsx`) — future Platform Auth Service should own flows.
3. Default dev credentials pre-filled in login form — convenient but document for team norms.

---

## Section 6 — Theme & Design Review

### Design tokens

| Criterion                | Status | Evidence                                         |
| ------------------------ | ------ | ------------------------------------------------ |
| Centralised tokens       | ✅     | `packages/theme/src/tokens.css`                  |
| Semantic naming          | ✅     | `--color-primary`, `--color-surface`, etc.       |
| Hex only in token source | ✅     | No hex in `packages/ui` or `apps/web` components |

### Dark / light themes

- `:root` and `.dark` token sets defined.
- `next-themes` with `attribute="class"`.

### Theme persistence

- `localStorage` via `next-themes` — aligns with Document 023 appearance preferences (client-only for SPR-001).

### Tailwind implementation

- Tailwind v4 via `@import "tailwindcss"` in `apps/web/app/globals.css`.
- Components use arbitrary property syntax `bg-[var(--color-*)]` — valid token consumption pattern.

### Component consistency

- CVA-based `Button` variants; shared `Input`, `Card` patterns.
- **Deviation:** Not official shadcn/ui components — custom implementation with similar patterns.

### Hardcoded styling violations

| Location                | Issue                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `status-bar.tsx` L12–14 | `text-emerald-600`, `text-amber-600` — **violates Document 006/022** (should use semantic success/warning tokens) |

### Accessibility

- Focus rings use `--color-ring`.
- Colour contrast not formally verified (no a11y audit artifact).
- Status colours may fail WCAG AA if semantic tokens not used consistently.

---

## Section 7 — SDK Compliance

| SDK (Document)            | Expected SPR-001 state       | Actual                            | Outside contract?             |
| ------------------------- | ---------------------------- | --------------------------------- | ----------------------------- |
| **Platform SDK (024)**    | Contracts stubbed            | `packages/sdk` throws on register | No — intentional              |
| **Module SDK (025)**      | No modules                   | None                              | No                            |
| **Integration SDK (026)** | Placeholder dir              | `integrations/README.md` only     | No                            |
| **Service SDK (027)**     | Placeholder dir              | `services/README.md` only         | No                            |
| **UI SDK (028)**          | `component.yaml` + Storybook | 7 manifests, 7 stories            | Partial — no registry runtime |
| **Event SDK (029)**       | Types only                   | `PlatformEventEnvelope` interface | No                            |

### Implementations outside SDK contracts

| Item                                    | Assessment                                                |
| --------------------------------------- | --------------------------------------------------------- |
| Auth in `apps/web` forms                | Pre-SDK pattern; should migrate to auth service layer     |
| Static shell nav in `desktop-shell.tsx` | Pre-module-registry pattern                               |
| Health endpoint in `apps/web`           | Acceptable app route; could become Platform Service later |
| Drizzle schema in `@apzhub/config`      | Pragmatic; consider `@apzhub/db` package in future        |

No business `module.yaml`, `integration.yaml`, or `service.yaml` files exist — **compliant with SPR-001 scope**.

---

## Section 8 — Testing Review

### Unit coverage

| Area                           | Tests       | Files                                        |
| ------------------------------ | ----------- | -------------------------------------------- |
| UI Button                      | 2 cases     | `packages/ui/src/components/button.test.tsx` |
| Config, auth, theme, workspace | 0           | —                                            |
| **Total**                      | **2 tests** | —                                            |

Vitest coverage reporter configured but **not run in CI**; no threshold enforced.

### Component coverage

- Button only. Input, Card, Header, Sidebar, StatusBar, ShellLayout — **untested** at unit level (Storybook provides visual coverage only).

### Playwright coverage

| Test                      | SPR-001 §19 requirement |
| ------------------------- | ----------------------- |
| Login page renders        | ✅                      |
| Health endpoint           | ✅                      |
| Unauthenticated redirect  | ✅                      |
| Registration + shell      | ✅                      |
| Theme switching           | ✅                      |
| Sign out                  | ✅                      |
| No console errors (login) | ✅                      |

**6/6 acceptance tests** in `testing/playwright/e2e/spr-001.spec.ts`.

### Accessibility testing

- Storybook `@storybook/addon-a11y` configured.
- `testing/accessibility/` directory **empty**.
- No `axe-playwright` or similar in E2E pipeline.

### Missing tests

- API integration tests for auth flows (beyond E2E).
- Health endpoint unit/integration tests in Vitest.
- Storybook visual regression.
- CI does not run `build-storybook`.
- Forgot-password flow untested.

### Regression readiness

- E2E suite provides **reasonable regression guard** for foundation journeys.
- Low unit coverage means refactors in `packages/ui` rely heavily on E2E and manual verification.

### Test quality

- E2E uses resilient login-or-register pattern for dev user.
- Vitest setup includes `@testing-library/jest-dom` and `cleanup()` after each test — good.
- Playwright runs serially (`workers: 1`) — appropriate for auth state.

---

## Section 9 — Performance Review

### Bundle size

- Production build completes successfully (Next.js 16 Turbopack).
- `.next` output ~171 MB (includes cache; not First Load JS metric captured in review environment).
- Workspace `transpilePackages` may increase client bundle vs pre-built packages — acceptable for monorepo dev velocity.

### Lazy loading

- No `dynamic()` imports for shell regions — entire shell loads with home page (acceptable for minimal shell).

### Code splitting

- Next.js App Router provides route-level splitting (`(auth)` vs `(platform)` groups).
- No additional manual chunks.

### Rendering efficiency

- Client components for shell and auth pages — expected for session/theme interactivity.
- `suppressHydrationWarning` on theme button — correct mitigation.
- TanStack Query provider mounted with no queries yet — negligible overhead.

### React best practices

- Generally sound; auth forms mix presentation and side effects (architectural, not performance issue).

### Potential bottlenecks

- `getEnv()` cached — good.
- DB/Redis pools singleton — good.
- E2E starts dev server per run — slow but acceptable for CI.

### Recommendations

1. Add bundle analyser in a future sprint before module loading.
2. Consider `dynamic()` for Storybook-only or dev-only tooling (already separated).
3. Monitor `.next` cache size on CI runners.

---

## Section 10 — Security Review

### Secrets

| Check                              | Status                                       |
| ---------------------------------- | -------------------------------------------- |
| `.env` gitignored                  | ✅ `.gitignore`                              |
| `.env.example` placeholders only   | ✅                                           |
| CI uses non-production test secret | ✅ 32+ char `BETTER_AUTH_SECRET` in workflow |

### Environment variables

- Zod validation in `packages/config/src/env.ts` for server vars.
- **Gap:** `NEXT_PUBLIC_APP_URL` used in auth client but not in schema.
- Root `.env` loaded in `apps/web/next.config.ts` via `dotenv` — document that Next app reads monorepo root `.env`.

### Authentication

- Better Auth industry-standard patterns.
- Dev registration double-gated (server + env).

### Authorisation scaffolding

- RBAC tables exist; **no enforcement** at API or UI layers.
- Middleware is authentication-adjacent only (cookie presence).

### Input validation

- HTML5 `required`, `minLength` on forms.
- No shared Zod schemas for auth payloads at API boundary.

### Headers (`apps/web/next.config.ts`)

| Header                            | Present |
| --------------------------------- | ------- |
| `X-Frame-Options: DENY`           | ✅      |
| `X-Content-Type-Options: nosniff` | ✅      |
| `Referrer-Policy`                 | ✅      |
| `Content-Security-Policy`         | ❌      |
| `Strict-Transport-Security`       | ❌      |
| `Permissions-Policy`              | ❌      |

### Dependency security

- Dependabot configured (`.github/dependabot.yml`).
- No `pnpm audit` step in CI.

### Potential risks

| Risk                                          | Severity  | Notes                                                   |
| --------------------------------------------- | --------- | ------------------------------------------------------- |
| Middleware cookie-only check                  | Medium    | Forged/stale cookie name could pass until server render |
| Dev registration env misconfiguration in prod | Medium    | Mitigated by `NODE_ENV` + `notFound()`                  |
| Redis exposed on localhost:6380               | Low (dev) | Docker port map; not for production as-is               |
| Default `.env.example` auth secret            | Low       | Document rotation for any shared dev host               |

---

## Section 11 — Technical Debt Register

| ID     | Item                                                 | Priority | Impact                               | Recommended Sprint            | Effort |
| ------ | ---------------------------------------------------- | -------- | ------------------------------------ | ----------------------------- | ------ |
| TD-001 | Husky/commitlint not initialised (no `.husky/`)      | Medium   | Hooks documented but inactive        | SPR-002 or hygiene sprint     | S      |
| TD-002 | RBAC schema not wired to Better Auth / UI            | High     | Identity without authorisation model | IAM sprint                    | M      |
| TD-003 | Redis provisioned but only used for health ping      | Medium   | Sprint promise partially unfulfilled | SPR-002 or infra              | M      |
| TD-004 | Middleware session = cookie presence only            | High     | Weak Zero Trust boundary             | IAM / security sprint         | M      |
| TD-005 | Auth flows in React page components                  | Medium   | Violates layered architecture (009)  | Platform Auth Service sprint  | M      |
| TD-006 | StatusBar hardcoded emerald/amber colours            | Low      | Design system violation              | Design-system hardening       | S      |
| TD-007 | shadcn/ui, Lucide, RHF, TanStack Table not installed | Medium   | SPR-001/004 stack mismatch           | SPR-002 prep or doc amendment | M      |
| TD-008 | `as unknown as` cast in Better Auth server           | Low      | Type safety escape hatch             | Auth refactor                 | S      |
| TD-009 | Nested `apps/web/.git`                               | Low      | Monorepo git confusion               | Hygiene                       | S      |
| TD-010 | Root git uninitialised                               | Low      | Husky, version tags blocked          | Hygiene                       | S      |
| TD-011 | Docs not migrated to `docs/architecture/` etc.       | Low      | Registry vs BUILD-001 §13            | Doc housekeeping              | M      |
| TD-012 | Storybook not in CI                                  | Low      | Visual regressions undetected        | Quality sprint                | S      |
| TD-013 | Vitest coverage not enforced                         | Medium   | Low unit test safety net             | Quality sprint                | M      |
| TD-014 | Forgot-password UI non-functional                    | Low      | Incomplete auth scaffold             | IAM sprint                    | S      |
| TD-015 | Email verification disabled                          | Low      | Acceptable for dev; prod blocker     | IAM sprint                    | M      |
| TD-016 | `@apzhub/sdk` unused stub                            | Low      | No module registry                   | Module sprint                 | L      |
| TD-017 | ActivityBar no `component.yaml` / story              | Low      | Incomplete 028 coverage              | Design-system                 | S      |
| TD-018 | `NEXT_PUBLIC_APP_URL` not in Zod schema              | Low      | Client/server URL drift risk         | Config hardening              | S      |
| TD-019 | No CSP / HSTS headers                                | Medium   | Security baseline gap                | Security sprint               | M      |
| TD-020 | Production Docker compose has no web image           | Low      | Deploy story incomplete              | Deploy sprint                 | L      |

**Effort key:** S = hours, M = days, L = multi-day

---

## Section 12 — Architecture Decision Records

The following decisions should be formalised as ADRs (not created in this review):

### ADR-003 — Session validation strategy in middleware

| Field              | Content                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **Reason**         | Cookie presence vs server-side session lookup affects security and latency                      |
| **Alternatives**   | (a) Keep cookie check; (b) `auth.api.getSession` in middleware; (c) Edge-compatible session API |
| **Recommendation** | Adopt (b) or (c) before production; document performance impact                                 |

### ADR-004 — Redis usage scope for foundation phase

| Field              | Content                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- |
| **Reason**         | Redis running but unused for sessions/cache/rate-limit per SPR-001 §9                     |
| **Alternatives**   | (a) Wire Better Auth secondary storage; (b) rate-limit middleware; (c) defer and document |
| **Recommendation** | (b) rate-limit auth routes in near term; (a) when scaling sessions                        |

### ADR-005 — UI component source strategy

| Field              | Content                                                                             |
| ------------------ | ----------------------------------------------------------------------------------- |
| **Reason**         | SPR-001 cites shadcn/ui; implementation uses custom CVA components                  |
| **Alternatives**   | (a) Migrate to shadcn CLI; (b) Keep custom primitives; (c) hybrid                   |
| **Recommendation** | (b) with explicit doc amendment if team prefers control; else (a) for 028 alignment |

### ADR-006 — Platform database package boundary

| Field              | Content                                                              |
| ------------------ | -------------------------------------------------------------------- |
| **Reason**         | Drizzle lives in `@apzhub/config` alongside env                      |
| **Alternatives**   | (a) Keep combined; (b) extract `@apzhub/db`                          |
| **Recommendation** | (a) until schema complexity grows; revisit at first Platform Service |

### ADR-007 — Monorepo environment file strategy

| Field              | Content                                                                              |
| ------------------ | ------------------------------------------------------------------------------------ |
| **Reason**         | Root `.env` loaded via `dotenv` in `next.config.ts`                                  |
| **Alternatives**   | (a) Root `.env` only; (b) `apps/web/.env.local` only; (c) both with precedence rules |
| **Recommendation** | Document (a) in getting-started; validate `NEXT_PUBLIC_*` in Zod                     |

---

## Section 13 — Recommendations

### Critical

_None blocking Sprint 002 planning for non-auth features._ If Sprint 002 touches IAM or permissions, address **TD-002** and **TD-004** first.

### High

1. **Wire RBAC to identity model** (TD-002) before permission-driven UI (005, 016).
2. **Strengthen middleware session validation** (TD-004) before any production exposure.
3. **Resolve stack declaration mismatch** (TD-007) — install declared deps or amend SPR-001/004 acceptance records.

### Medium

4. Initialise **Husky + commitlint** (TD-001) when root git is established.
5. **Functional Redis use** or formal deferral ADR (TD-003).
6. Add **CSP** and security header roadmap (TD-019).
7. Expand **unit test coverage** and enforce in CI (TD-013).
8. Replace **StatusBar hardcoded colours** with semantic tokens (TD-006).

### Low

9. Complete **ActivityBar** manifest/story (TD-017).
10. Migrate docs per BUILD-001 §13 when approved (TD-011).
11. Add **Storybook build** to CI (TD-012).
12. Remove nested git / init root repo (TD-009, TD-010).

---

## Section 14 — Sprint Readiness

### May Sprint 002 begin?

## **Yes — with prerequisites**

SPR-001 foundation is sufficiently stable for the next approved sprint **provided Sprint 002 scope does not assume full IAM, module registry, or production security hardening without additional work**.

### Prerequisites before Sprint 002 execution

1. **Approved SPR-002 guide** filed in `docs/sprint/` with explicit scope boundary.
2. **Acknowledge technical debt register** (Section 11) — assign owners for High items if Sprint 002 touches auth, permissions, or UI scale-up.
3. **Initialise git at repository root** (if version control and Husky are required for Sprint 002).
4. **Confirm Docker stack running** for local/CI parity (`pnpm docker:up`, `pnpm db:migrate`).
5. **ADR backlog triage** — schedule ADR-003 through ADR-007 as Sprint 002 planning inputs if relevant to scope.

### Blockers

**None** that prevent Sprint 002 _planning and authoring_. Blockers exist only if Sprint 002 scope includes production IAM, module loading, or OSS integrations without intermediate sprints.

---

## Section 15 — Version Recommendation

### Should Sprint 001 be tagged?

## **Yes**

SPR-001 represents a coherent, test-verified foundation milestone. Tagging establishes a known baseline before Sprint 002 changes.

### Recommended tag

```
v0.1.0-foundation
```

### Semantic versioning rationale

| Component       | Value                      | Reason                                                    |
| --------------- | -------------------------- | --------------------------------------------------------- |
| **0**           | Pre-1.0                    | Platform not feature-complete; no business modules        |
| **1**           | First foundation increment | BUILD-001 + SPR-001 delivered                             |
| **0**           | Patch                      | Initial foundation release                                |
| **-foundation** | Pre-release label          | Distinguishes scaffold from future `v0.2.0-module-*` tags |

### Tag prerequisites

1. Root git repository initialised (if not already).
2. All CI checks green on tagged commit.
3. `CHANGELOG.md` entry for `0.1.0` confirmed.
4. Technical debt register committed alongside tag (this document).

---

## Appendix — Review evidence summary

| Gate              | Result (review date)                 |
| ----------------- | ------------------------------------ |
| `pnpm lint`       | Pass                                 |
| `pnpm typecheck`  | Pass                                 |
| `pnpm test`       | Pass (2 unit tests)                  |
| `pnpm build`      | Pass                                 |
| `pnpm test:e2e`   | Pass (6 tests)                       |
| `pnpm db:migrate` | Applied                              |
| Docker services   | Postgres, Redis, Caddy (dev compose) |

---

_End of review. Await further instructions. No code was modified during this review._
