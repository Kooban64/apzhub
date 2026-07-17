# Identity Workbench Testing Guide

**Milestone:** APZIDENTITY-004

## Test layers

| Layer | Location | Purpose |
| --- | --- | --- |
| Component (Vitest) | `apps/web/components/identity/platform-identity-view.test.tsx` | Renders `PlatformIdentityView` / `IdentityWorkspaceRouter` against `createMockIdentityClient`; asserts banners, memberships/service-assignment panels, form flows, no password fields |
| Lib (Vitest) | `apps/web/lib/identity/*.test.ts` | `routes.ts`, `query-keys.ts`, `identity-client.ts` typed-client behaviour |
| Architecture harness (Vitest) | `testing/identity-workbench/apzidentity-004-workbench.test.ts` | Runs the boundary audit script and asserts required files/manifests exist |
| Boundary audit (Node script) | `scripts/apzidentity-004-identity-workbench-audit.mjs` | Static scan for forbidden imports/words, required banners, manifests, shell wiring |
| End-to-end (Playwright) | `testing/playwright/e2e/apzidentity-004-identity-workbench.spec.ts` | Mock-routed browser journey: Overview → Users → user detail (memberships/assignments) → Memberships/Service Assignments sections → Diagnostics |

## Running the suite

```bash
# Component + lib + harness tests
pnpm exec vitest run apps/web/components/identity apps/web/lib/identity testing/identity-workbench

# Architecture audit only
pnpm audit:identity-workbench

# Playwright (requires the dev server — see testing/playwright/playwright.config.ts)
pnpm test:e2e -- testing/playwright/e2e/apzidentity-004-identity-workbench.spec.ts
```

## Playwright approach

Mirrors `apzadmin-004-platform-administration-workbench.spec.ts`:

- Intercepts `**/api/v1/identity/**` with `page.route` and fulfils deterministic JSON fixtures — **no live IdP, no live database**.
- Signs in via the shared `signIn` helper (`testing/playwright/e2e/testing-ui-helpers.ts`), which uses dev-only test hooks, not a real authentication provider.
- Journey covered: `Overview` banners → `Users` list → open a user → memberships/service-assignments panels visible → `Memberships` and `Service Assignments` sections → `Diagnostics` safe/unavailable state.
- Uses `data-testid` selectors prefixed `identity-`/`user-`/`banner-`/`diag-`/`card-` wherever the component exposes them; falls back to visible text (e.g. row IDs) only for table rows without dedicated test ids.

## Mock client

`createMockIdentityClient()` (`apps/web/lib/identity/mock-identity-client.ts`) backs both component tests (via `setIdentityClient`) and is the default runtime client under `NODE_ENV=test`. It is in-memory only and returns fixed, non-authenticating metadata.

## Coverage baseline

See [APZIDENTITY-004 Coverage Baseline](../reviews/APZIDENTITY-004-coverage-baseline.md) for measured figures and known gaps.

## What is intentionally not tested

- No test exercises a real authentication flow, OAuth/OIDC/SAML handshake, SCIM/LDAP sync, or account provisioning — these surfaces do not exist in this milestone.
- No test depends on a live IdP, live Postgres, or live gateway; all HTTP is either the in-memory mock client (Vitest) or `page.route` fixtures (Playwright).
