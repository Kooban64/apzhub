# Session Propagation — TIME-NATIVE-001-A02

| Field     | Value               |
| --------- | ------------------- |
| Slice     | TIME-NATIVE-001-A02 |
| Status    | **COMPLETE**        |
| Timestamp | 20260804T194500Z    |

## Propagation path

1. `getValidatedSession(headers)` in platform layout
2. `createPlatformAuthPermissionContext(session)` → roles + permissions
3. Passed as `authPermissionContext` into `ActionWorkbenchShellProvider`
4. `SessionAuthorizationProvider` exposes grants to product hooks
5. `WorkbenchProvider` receives same context for shell permission adapter
6. `TimeWorkspaceRouter` → `useTimePermissions()` → view gating

## G-22 resolution

Previously Time UI ignored session and defaulted to `["time.*"]`.  
Now permissions come only from hydrated APZHUB session (or explicit test override).

## API path (unchanged authority)

`withPlatformApiAuth` continues to attach `resolveSessionAuthorization` grants to
`ServiceRequestContext`. UI is non-authoritative.
