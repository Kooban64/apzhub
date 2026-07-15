# M8-04 Completion Report — Platform Personalisation Framework (User Preferences Phase 1)

## Status

**COMPLETE** — User Preferences Phase 1 delivered. Await owner approval before M8-05 (Governance).

## Delivered

### Package

- `@apzhub/platform-personalisation` — services, repositories, PostgreSQL store, API handlers, session resolver

### Schema

- `0013_platform_personalisation.sql` — preference, favorite, recent, workbench layout tables

### APIs

- `GET/PATCH /api/platform/v1/preferences`
- `GET/POST/DELETE /api/platform/v1/favorites`
- `GET/POST /api/platform/v1/recent`
- `GET /api/platform/v1/personalisation/diagnostics`
- `GET/PUT /api/platform/v1/personalisation/workbench-layout`

### Operations UX

- Manifest `platform-operations-personalisation`
- Personalisation section in Platform Operations Console

### Product integration

- `apps/web` — shell provider, theme bridge, session store, hydration
- `apps/law-platform` — same pattern (includes Trust Accounting workbench)

### Documentation

- Personalisation Reference Architecture
- Preference Model
- Workbench Personalisation Guide
- Developer onboarding guide
- ADR-0043

## Out of scope (as specified)

Feature flags, governance, dashboard widget designer, custom forms, saved searches, advanced layouts.

## Quality gates

Run: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm test:coverage`.

## Next

M8-05 Governance Framework — **not started**; requires owner approval.
