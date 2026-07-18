# APZHUB Identity Administration Operational Readiness Guide

**Programme:** Platform Identity Administration (APZIDENTITY)  
**Status:** Final for wave freeze (APZIDENTITY-006)  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS  
**Related:** [APZIDENTITY-005 Operational Readiness](../reviews/APZIDENTITY-005-Operational-Readiness.md)

---

## Scope

Operational expectations for the **metadata administration** plane.  
**AUTHENTICATION IS NOT MANAGED** by Identity Administration. Provisioning and directory synchronisation are unavailable.

## Environment configuration

| Variable                  | Requirement                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `APZHUB_IDENTITY_ENABLED` | Deny-by-default; set `true` / `1` / `on` to enable                                   |
| PostgreSQL                | Required in production for Identity SoR                                              |
| Platform migrations       | Apply `0052_apz_platform_iam.sql` then `0053_apz_platform_iam_rls.sql` before enable |

## Deployment order

1. Apply PostgreSQL migrations `0052` → `0053`
2. Deploy platform services with Identity wiring (`gateway.identity.*`)
3. Deploy web application (HTTP handlers + Workbench)
4. Set `APZHUB_IDENTITY_ENABLED=true`
5. Verify `/api/v1/identity/health` and `/api/v1/identity/readiness`
6. Verify Workbench `/workspace/identity` Overview and Diagnostics

## Controlled disable procedure

1. Set `APZHUB_IDENTITY_ENABLED=false` (or unset)
2. Expect HTTP `503` with code `IDENTITY_SERVICE_UNAVAILABLE`
3. Expect Workbench controlled unavailable state
4. Confirm no in-memory production fallback occurs

## Backup and restore

- Include `platform_iam_*` tables in platform PostgreSQL backup sets
- Restore with platform DB restore procedures; re-validate RLS / tenant scoping after restore
- Do not drop IAM tables without explicit owner approval

## Monitoring expectations

- Health / readiness / capabilities / management-capabilities diagnostics
- Authorization denials and persistence failures via existing structured logs + correlation IDs
- Do not expect IdP connectivity probes from Identity Diagnostics

## Operational ownership

| Area                          | Owner                                      |
| ----------------------------- | ------------------------------------------ |
| Identity metadata SoR         | Platform Identity Administration           |
| Authentication plane          | Separate future programme                  |
| Provisioning / directory sync | Separate future programmes                 |
| Platform Operations console   | Separate product (`/workspace/operations`) |

## Incident handling

1. Confirm enable flag and PostgreSQL connectivity / migrations
2. Distinguish authz denial vs service unavailable vs persistence failure
3. Inspect safe diagnostics (no credential material)
4. Review Identity audit / history for administrative mutations
5. Escalate authentication issues to the authentication programme (not this SoR)

## Production support expectations

- Metadata CRUD and lifecycle within declared permissions
- No password reset, MFA enrolment, or IdP configuration via this Workbench
- Service assignments are metadata links — not external account creation

## Known limitations

See [Known Limitations Register](../reviews/APZIDENTITY-005-Known-Limitations.md) and wave [Security Confirmation](../reviews/APZIDENTITY-006-Security-Confirmation.md).
