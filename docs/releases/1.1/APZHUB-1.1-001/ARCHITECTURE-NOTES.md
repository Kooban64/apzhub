# APZHUB-1.1-001 — Architecture Notes (OBS-LAW-01)

> **Programme:** APZHUB-1.1-001  
> **Date:** 2026-07-19  
> **Related:** [APZHUB-Platform-Authorization-Reference-Architecture](../../../architecture/APZHUB-Platform-Authorization-Reference-Architecture.md)

---

## Law authorization path (post OBS-LAW-01)

```text
getValidatedSession()
  → resolveSessionAuthorization({ userId, tenantId, productKey: "law-platform" })
  → createAuthPermissionContextFromUser(...)
  → createWorkbenchPermissionAdapter({ mode: "auth", authContext })
  → filter registries / gate commands / Law API requiredPermission checks
```

Client shell:

```text
Platform layout (RSC)
  → createLawPlatformAuthPermissionContext(session)
  → WorkbenchProvider({ authPermissionContext, permissionMode: "auth" })
```

## Evaluation

- Platform AuthorizationService continues to own role/permission assignment and effective grants.
- Workbench `AuthWorkbenchPermissionAdapter` evaluates grants with the same wildcard semantics as `permissionPatternMatches` (exact, `*`, `namespace.*`).
- No redesign of Identity, Workbench framework structure, Legal Business Core, or Law HTTP surface.

## Explicit non-goals retained

| Path                                 | Mode                                                    |
| ------------------------------------ | ------------------------------------------------------- |
| Law health summaries (`*-health.ts`) | Explicit `mode: "allow-all"` for operational visibility |
| Product AuthZ paths                  | Always `mode: "auth"`                                   |

## Closed observation

**OBS-LAW-01** (M8 PermissionService / legal keys on dev adapter) — residual allow-all / `*` injection on Law user paths removed.
