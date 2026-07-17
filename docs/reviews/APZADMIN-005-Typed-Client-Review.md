# APZADMIN-005 — Typed Client Review

**Date:** 2026-07-16  
**Surface:** `apps/web/lib/administration`

## Certified properties

| Property | Status |
| --- | --- |
| `createHttpAdministrationClient()` factory | PASS |
| Calls only `/api/v1/administration*` | PASS |
| No gateway / platform-services / admin-core / persistence imports | PASS |
| No runtime execute / provision / user-role methods | PASS |
| Mock client for Workbench / Playwright | PASS |
| `administration-api` facades consumed by Workbench | PASS |

## Forbidden method surfaces (absent)

`executeAdministration`, `provisionUser`, `manageRoles`, `manageUsers`, `manageTenants`, `runLiveProbe`, `invokeRuntimeAdmin`, `executeAction`, `grantPermission`, `revokePermission`

## Verdict

**PASS**
