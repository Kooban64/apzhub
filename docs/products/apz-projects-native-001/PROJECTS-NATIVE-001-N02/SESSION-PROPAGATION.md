# Session Propagation — APZ-PROJECTS-NATIVE-001-N02

| Field     | Value                       |
| --------- | --------------------------- |
| Slice     | APZ-PROJECTS-NATIVE-001-N02 |
| Status    | **COMPLETE**                |
| Timestamp | 20260805T071500Z            |

## Path

1. Platform layout resolves session authorization once per request.
2. `authPermissionContext` is passed into the workbench shell.
3. `SessionAuthorizationProvider` exposes grants to client product routers.
4. `useProjectsPermissions()` returns session grants (or explicit test override).
5. Missing / empty grants deny UI actions — never invent `projects.*`.

## Guarantees

- Same APZHUB session as the shell — no product-local identity store.
- Override exists only for tests / host injection.
- Server APIs remain authoritative; UI gating is progressive disclosure only.
