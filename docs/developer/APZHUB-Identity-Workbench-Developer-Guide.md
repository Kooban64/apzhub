# Identity Workbench Developer Guide

**Milestone:** APZIDENTITY-004

## Layout

| Path | Role |
| --- | --- |
| `apps/web/lib/identity/routes.ts` | Workspace + HTTP path helpers (`IDENTITY_WORKSPACE_BASE`, `isIdentityRoute`, `resolveIdentitySection`, `identitySectionPath`) |
| `apps/web/lib/identity/identity-api.ts` | Typed-client facades consumed by the Workbench |
| `apps/web/lib/identity/identity-client.ts` | Production HTTP client — calls only `/api/v1/identity/*` |
| `apps/web/lib/identity/mock-identity-client.ts` | In-memory client for tests / `NODE_ENV=test` |
| `apps/web/lib/identity/identity-errors.ts` | `IdentityClientError` + `toIdentityUserMessage` |
| `apps/web/lib/identity/identity-types.ts` | View models + create/update input types |
| `apps/web/lib/identity/query-keys.ts` | Canonical TanStack Query keys |
| `apps/web/components/identity/identity-workspace-router.tsx` | Path → section |
| `apps/web/components/identity/platform-identity-view.tsx` | Section UI |
| `packages/workbench-framework/manifests/platform-identity*/` | Activity Bar + Sidebar registration |

## Consumption rule

```ts
import { listUsers, createUser } from "@/lib/identity/identity-api";
```

Do **not** import `@apzhub/identity-core`, `@apzhub/identity-persistence`, `@apzhub/platform-services`, `PlatformServiceGateway`, or call `fetch` in Identity UI code. Do **not** import from `@/lib/administration` or `@/components/administration` — Identity and Administration are separate, non-coupled verticals (008/009).

## Adding a new section

1. Add the section to `IDENTITY_SECTIONS` in `routes.ts` and to `SECTION_META` in `platform-identity-view.tsx`.
2. Add typed-client facades in `identity-api.ts` / `identity-client.ts` / `mock-identity-client.ts` if new endpoints are needed (requires a prior APZIDENTITY-003-style HTTP milestone — do not add ad hoc endpoints from the Workbench).
3. Render the section branch in `PlatformIdentityView` using the shared primitives (`PageShell`, `MetaTable`, `EntityCrudPanel`, `StatusCard`, `NoticeBanner`, `EmptyState`, `ErrorState`).
4. Add a sidebar manifest under `packages/workbench-framework/manifests/platform-identity-<section>/module.yaml` with `permission: identity.read` (or a new scoped permission if introduced) and route `/workspace/identity/<section>`.
5. Add the manifest path to `testing/identity-workbench/apzidentity-004-workbench.test.ts` and, if it introduces new forbidden-word risk, extend `scripts/apzidentity-004-identity-workbench-audit.mjs`.
6. Add component tests and, if the journey is meaningfully new, a Playwright mock-routed scenario.

## Audit

```bash
pnpm audit:identity-workbench
```

Zero violations required. Checks: forbidden imports (`identity-core`, `identity-persistence`, `platform-services`, gateway, drizzle/pg), forbidden auth words/functions (password hash, login form, OAuth/OIDC/SAML/SCIM/LDAP, MFA secret, `provisionUser`, directory-sync calls), required banners, required manifests, shell wiring, no dedicated `app/workspace/identity` tree, no Administration coupling.

## Tests

```bash
pnpm exec vitest run apps/web/components/identity apps/web/lib/identity testing/identity-workbench
```

## Shell wiring

`workbench-page.tsx` checks `isIdentityRoute(pathname)` (from `@/lib/identity/routes`) and mounts `IdentityWorkspaceRouter` alongside the other product workspaces (Configuration, Administration, Notifications, Documents, Search).

## Stop

Do not start **APZIDENTITY-005** without owner approval.
