# Identity Forms & Validation Guide

**Milestone:** APZIDENTITY-004
**Component:** `apps/web/components/identity/platform-identity-view.tsx`

## Form inventory

| Form                                                                  | Fields                                                                                          | Required        | Notes                                                                                                                                                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create user                                                           | Display name, email (optional), organisation id (optional)                                      | Display name    | No password / credential field                                                                                                                                                           |
| `UserEditForm`                                                        | Display name, email, auth subject reference, organisation id (all optional except display name) | Display name    | `authSubjectRef` is an opaque foreign-system reference string, never a credential                                                                                                        |
| Activate / Deactivate user                                            | Reason (optional)                                                                               | —               | Writes an activation/deactivation **metadata record**; does not touch any authentication session or credential store                                                                     |
| Create/update Group, Role, Organisation, Tenant, Department, Position | Key, name, description (optional)                                                               | Key, name       | Shared via `EntityCrudPanel`                                                                                                                                                             |
| Create membership                                                     | User id, kind, target id                                                                        | All three       | `kind` is a free-form metadata label (e.g. `group`, `role`)                                                                                                                              |
| Update membership status                                              | New status                                                                                      | —               | Status transition only                                                                                                                                                                   |
| Create service assignment                                             | Subject kind, subject id, service capability (select)                                           | All three       | Service capability is chosen from a fixed catalogue (`SERVICE_CAPABILITY_OPTIONS`) — see [Service Assignments Workbench Guide](./APZHUB-Identity-Service-Assignments-Workbench-Guide.md) |
| Update service assignment status                                      | New status                                                                                      | —               | Status transition only                                                                                                                                                                   |
| Create/update invitation                                              | Email, status                                                                                   | Email           | No email is sent; `NO EMAIL DELIVERY — INVITATION METADATA ONLY` banner always shown                                                                                                     |
| Create/update policy                                                  | Key, name, kind, description (optional)                                                         | Key, name, kind | Catalogue metadata only — no policy engine execution                                                                                                                                     |
| Create/update reference                                               | Kind, target, label (optional)                                                                  | Kind, target    | —                                                                                                                                                                                        |

## Client-side validation

- HTML5 `required` on mandatory `Input` fields; forms use native `onSubmit` + `event.preventDefault()`.
- Optional fields normalise empty strings to `null` before calling the typed client (e.g. `email: draft.email || null`).
- Selects are constrained to closed enumerations where the domain is fixed (service capability options).

## Server-side validation & error surfacing

- All mutations go through `useIdentityAction`, which wraps `useMutation`:
  - On success: clears `actionError`, sets a transient `Completed: <label>` status message (`data-testid="identity-status"`, `role="status"`), and invalidates `identityQueryKeys.all`.
  - On error: clears the status message and renders the mapped message via `toIdentityUserMessage` (`data-testid="identity-action-error"`, `role="alert"`).
- `IdentityClientError` (`apps/web/lib/identity/identity-errors.ts`) carries `status`, `code`, `correlationId`, and `requestId`. `toIdentityUserMessage` produces a stable, non-leaking message for the UI; raw backend errors are never rendered.
- List/detail queries distinguish `forbidden` / `notFound` / `unavailable` via `isForbidden` / `isNotFound` / `isUnavailable` helpers and render the corresponding `ErrorState` variant instead of a generic failure.

## What forms never do

- No password, passphrase, secret, or credential fields.
- No OAuth/OIDC/SAML/SCIM/LDAP/MFA configuration controls.
- No `provisionUser`-style calls into a backend IdP or directory.
- No direct `fetch` — every mutation goes through `@/lib/identity/identity-api` facades.

See also: [Identity Views Catalogue](./APZHUB-Identity-Views-Catalogue.md), [Authorization-Aware UI Guide](./APZHUB-Identity-Authorization-Aware-UI-Guide.md).
