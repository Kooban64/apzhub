# APZIDENTITY-004 — Quality Evidence

**Date:** 2026-07-17
**Milestone:** Identity Administration Workbench

## Audits

| Command                                 | Result              |
| --------------------------------------- | ------------------- |
| `pnpm audit:identity-workbench`         | PASS (0 violations) |
| `pnpm audit:identity-http-client`       | PASS                |
| `pnpm audit:identity-platform-services` | PASS                |
| `pnpm audit:identity-foundation`        | PASS                |
| `pnpm openapi:validate:platform`        | PASS                |

## Tests

| Suite                                                               | Result                                                                       |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `apps/web/components/identity/**/*.test.tsx`                        | PASS                                                                         |
| `apps/web/lib/identity/**/*.test.ts`                                | PASS                                                                         |
| `testing/identity-workbench/apzidentity-004-workbench.test.ts`      | PASS                                                                         |
| `testing/playwright/e2e/apzidentity-004-identity-workbench.spec.ts` | Added; mock-routed, no live IdP; syntax-validated (`playwright test --list`) |

## Versions (unchanged — no new HTTP/Core/Persistence surface)

| Package                        | Version |
| ------------------------------ | ------- |
| `@apzhub/identity-contracts`   | 0.2.0   |
| `@apzhub/identity-core`        | 0.2.0   |
| `@apzhub/identity-persistence` | 0.1.0   |
| `@apzhub/platform-services`    | 0.23.0  |
| Platform OpenAPI               | 1.7.0   |

## Coverage (Workbench components + lib)

| Metric             | Value     |
| ------------------ | --------- |
| Lines / statements | **98.5%** |
| Branches           | **76.8%** |
| Functions          | **98.5%** |

See [APZIDENTITY-004 Coverage Baseline](./APZIDENTITY-004-coverage-baseline.md) for the full breakdown and rationale. Milestone targets (95%+ lines/functions) are met.

## Boundary guarantees (enforced by `audit:identity-workbench`)

- No `@apzhub/identity-core` / `@apzhub/identity-persistence` / `@apzhub/platform-services` / gateway / drizzle / Postgres driver imports in Workbench UI or lib.
- No direct `fetch`, `localStorage`, `sessionStorage`, or `EventBus` usage in components.
- No password/credential fields, login forms, OAuth/OIDC/SAML/SCIM/LDAP controls, MFA-secret handling, or `provisionUser`/directory-sync function calls.
- Required capability banners present: `AUTHENTICATION NOT MANAGED`, `PROVISIONING NOT AVAILABLE`, `DIRECTORY SYNC`.
- Required manifests present: parent `platform-identity` + all sixteen sidebar sections.
- No dedicated `apps/web/app/workspace/identity` route tree (catch-all only).
- No coupling into the frozen Administration architecture (`@/lib/administration`, `@/components/administration`, `@apzhub/admin-core`, `@apzhub/admin-persistence`).

## Classification

**PRODUCTION_READY_WITH_LIMITATIONS** — Workbench is functionally complete for metadata management; authentication, provisioning, and directory sync remain explicitly out of scope and clearly signposted. Scoped coverage meets the 95%+ lines/functions milestone targets. Recommend **APZIDENTITY-005** for full-stack vertical certification only.
