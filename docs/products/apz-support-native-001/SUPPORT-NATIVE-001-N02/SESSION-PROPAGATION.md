# Session Propagation — APZ-SUPPORT-NATIVE-001-N02

| Field     | Value                      |
| --------- | -------------------------- |
| Slice     | APZ-SUPPORT-NATIVE-001-N02 |
| Status    | **COMPLETE**               |
| Timestamp | 20260805T043000Z           |

## Path

1. Platform layout resolves session authorization once per request.
2. `authPermissionContext` is passed into the workbench shell.
3. `SessionAuthorizationProvider` exposes grants to client product routers.
4. `useSupportPermissions()` returns session grants (or explicit test override).
5. Missing / empty grants deny UI actions — never invent `support.*`.

## Guarantees

- Same APZHUB session as the shell — no product-local identity store.
- Override exists only for tests / host injection.
- Server APIs remain authoritative; UI gating is progressive disclosure only.
