# Identity Authorization-Aware UI Guide

**Milestone:** APZIDENTITY-004

## Model

Per [007 — IAM Foundation](../000-apzhub-engineering-constitution.md) and [017 — Navigation Framework](../017-navigation-framework-workspace-navigation-architecture.md), the **server is authoritative** for permissions. The Identity Workbench is permission-aware at two layers:

1. **Manifest-driven visibility** — the Activity Bar entry (`platform-identity`) and every sidebar child manifest (`platform-identity-*`) declare `permission: identity.read`. The shell's `PermissionService` filters navigation before it ever renders; a user without `identity.read` never sees the Identity entry, sidebar sections, or the `platform.identity.navigate` command in the palette.
2. **Route guard** — `isIdentityRoute` (`apps/web/lib/identity/routes.ts`) determines whether `workbench-page.tsx` mounts `IdentityWorkspaceRouter` for the current pathname. This is a rendering concern, not an authorization decision; the API layer is the enforcement boundary.
3. **API enforcement** — every `identity-api` facade call is a thin wrapper over the typed HTTP client, which calls `/api/v1/identity/*`. Authorization is enforced server-side by the Identity Platform Services / gateway request pipeline (APZIDENTITY-002/003), never in the browser.

## `canManage`

`PlatformIdentityView` accepts a `canManage` prop (default `true`) that gates the rendering of create/update/activate/deactivate controls across all sections. It is a **UI convenience for hiding controls that would fail server-side**, not a security boundary — the server independently authorizes every mutation regardless of what the client renders. Callers that wire a real permission (e.g. `identity.write`) should pass `canManage={hasPermission("identity.write")}` once a write-scoped permission is introduced; this milestone ships a uniform `identity.read` for all sidebar sections and defaults `canManage` to `true`.

## Forbidden/Not-found/Unavailable states

Authorization failures are never silently swallowed:

- `isForbidden(error)` → `ErrorState forbidden` — user lacks permission for the requested resource.
- `isNotFound(error)` → `ErrorState notFound` — resource does not exist or is out of tenant scope.
- `isUnavailable(error)` → `ErrorState unavailable` — the Identity service or a specific facet is disabled (`APZHUB_IDENTITY_ENABLED`, per-capability flags).

Each maps to a distinct, correlation-id-bearing message via `toIdentityUserMessage` — no raw backend/authorization error text reaches the UI.

## Superadmin

Superadmin is a distinct permission tier (007/005), never a bypass. The Identity Workbench does not special-case superadmin in the UI; any elevated visibility is expressed purely through manifest permissions and server-side authorization, consistent with the rest of the platform.

## What this milestone does not add

- No permission/role **grant or revoke** actions (that remains Administration's `admin.policy` surface, out of scope for Identity metadata).
- No client-side role/permission caching beyond what `PermissionService` already provides to the shell.

See also: [Identity Workbench Navigation Guide](./APZHUB-Identity-Workbench-Navigation-Guide.md).
