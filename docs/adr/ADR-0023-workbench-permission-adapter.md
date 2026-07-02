# ADR-0023 — Workbench Permission Adapter

> **Status:** Accepted  
> **Date:** 2026-06-28  
> **Sprint:** SPR-003 Phase 0  
> **Decided by:** Project owner (Sprint 003 Phase 0 approval)  
> **Related:** [Document 005](../005-desktop-experience-workspace-framework.md) · [Document 007](../007-identity-authentication-authorisation-rbac-architecture.md) · [ADR-0022](./ADR-0022-navigation-manifest-extension.md)

## Problem

Document 005 requires permission-driven UI: hide surfaces the user cannot access. Full PermissionService integration (Document 007) is a Milestone 8 deliverable. Sprint 003 needs permission-filtered Activity Bar, navigation, and view open requests **before** IAM is complete.

## Decision

Introduce a **`WorkbenchPermissionAdapter`** interface in `@apzhub/workbench-framework` with a **development allow-all implementation** for Sprint 003. Replace with `@apzhub/auth` PermissionService when Milestone 8 IAM integration lands.

### Interface

```typescript
// Conceptual — @apzhub/workbench-framework

interface WorkbenchPermissionContext {
  userId: string;
  roles: string[];
  permissions: Set<string>;
}

interface WorkbenchPermissionAdapter {
  /** Resolve current user permission context (from session). */
  getContext(): WorkbenchPermissionContext | null;

  /** Returns true if user may access the given permission key. */
  can(permission: string | undefined, ctx?: WorkbenchPermissionContext): boolean;

  /** Filter a list of items that declare optional permission keys. */
  filter<T extends { permission?: string }>(
    items: T[],
    ctx?: WorkbenchPermissionContext,
  ): T[];
}
```

### Sprint 003 default implementation

```typescript
class AllowAllWorkbenchPermissionAdapter implements WorkbenchPermissionAdapter {
  getContext() {
    return { userId: "dev", roles: ["superadmin"], permissions: new Set(["*"]) };
  }
  can(_permission?: string) {
    return true;
  }
  filter<T>(items: T[]) {
    return items;
  }
}
```

**Rule:** Allow-all adapter is permitted **only** in development and test environments. Production wiring must use authenticated context even if all permissions pass initially.

### Environment selection

| Environment                                 | Adapter                                                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV=test`                             | `AllowAllWorkbenchPermissionAdapter`                                                                                |
| Development (`ALLOW_DEV_REGISTRATION=true`) | `AllowAllWorkbenchPermissionAdapter` until auth permissions populated                                               |
| Production                                  | `AuthWorkbenchPermissionAdapter` (Phase 7 scaffold — reads session; returns empty permissions until RBAC populated) |

Phase 7 implements `AuthWorkbenchPermissionAdapter` that reads `@apzhub/auth` session and maps to permission keys. Until RBAC data exists, production returns **deny-by-default for undeclared permissions** and **allow for items without `permission` field**.

### Permission key convention (Sprint 003)

Manifest-declared keys follow dot notation:

```text
platform.nav.{workspace}.view
platform.view.{viewId}.open
platform.admin.{area}.view
```

Full RBAC catalogue is Milestone 8. Sprint 003 uses manifest-declared keys as opaque strings.

### Filtering points

Permission adapter is invoked at:

| Point                               | Filter                                                              |
| ----------------------------------- | ------------------------------------------------------------------- |
| Server registry hydration           | Remove nav/view entries user cannot access before DTO serialisation |
| Workbench Manager `handleRequest()` | Reject `openView`, `revealNavigationItem`, etc. if permission fails |
| Session restore                     | Drop tabs and workspace state for unauthorised views                |
| Navigation Manager render           | Defence-in-depth client filter (DTO already filtered)               |

### Hide-not-disable policy (Document 005)

- **Navigation items:** omitted from DTO when permission fails — not rendered disabled.
- **Views:** `openView` request rejected with `WorkbenchRequestError` code `FORBIDDEN` — no error toast in Sprint 003 unless scaffold exists.
- **Deep links:** route guard redirects to standard unauthorised surface.

### Future — Milestone 8

Replace adapter implementation:

```typescript
class AuthWorkbenchPermissionAdapter implements WorkbenchPermissionAdapter {
  constructor(private permissionService: PermissionService) {}
  // delegates to Document 007 Permission Service
}
```

No change to Workbench Manager or manifest schema — swap adapter at app bootstrap.

## Alternatives

| Alternative                                   | Why rejected                                              |
| --------------------------------------------- | --------------------------------------------------------- |
| Hardcoded role checks in managers             | Violates Document 005; not extensible                     |
| Wait for full IAM before Sprint 003           | Blocks all dynamic UI work                                |
| Permission filtering only in runtime registry | Client requests still need gate; server-only insufficient |
| `@apzhub/auth` PermissionService now          | Not implemented; would delay Sprint 003                   |

## Consequences

- Phase 1 registers default adapter at Workbench Manager init
- Phase 3 server hydration filters nav items via adapter
- Phase 7 completes `AuthWorkbenchPermissionAdapter` and production deny-by-default rules
- E2E tests use allow-all; dedicated E2E for permission filtering uses mock adapter
- No `@apzhub/auth` changes required in Phase 0
- Milestone 8 replaces adapter body without Workbench Manager redesign
