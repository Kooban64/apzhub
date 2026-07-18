# APZIDENTITY-005 — Identity Administration Operational Readiness Guide

**Date:** 2026-07-17

## Environment

| Variable                  | Requirement                                        |
| ------------------------- | -------------------------------------------------- |
| `APZHUB_IDENTITY_ENABLED` | Must be `true`/`1`/`on` to enable; deny-by-default |
| PostgreSQL                | Required in production for Identity SoR            |
| Platform DB migrations    | Apply `0052` then `0053` before enabling           |

## Deployment order

1. Migrate PostgreSQL (`0052`, `0053`)
2. Deploy platform services with Identity wiring
3. Deploy web (HTTP + Workbench)
4. Set `APZHUB_IDENTITY_ENABLED=true`
5. Verify `/api/v1/identity/health` and `/api/v1/identity/readiness`
6. Verify Workbench `/workspace/identity` Overview + Diagnostics

## Controlled disable

Set `APZHUB_IDENTITY_ENABLED=false` (or unset). Expect HTTP `503` with `IDENTITY_SERVICE_UNAVAILABLE` and Workbench unavailable state. No in-memory fallback.

## Health / diagnostics

- `health`, `readiness`, `capabilities`, `management-capabilities`
- Authentication managed / provisioning / directory sync always unavailable by design

## Logging / metrics

Use existing platform correlation IDs, structured errors, and diagnostics hooks. Never log credentials or secrets.

## Backup / restore / retention

Follow platform PostgreSQL backup for `platform_iam_*`. Audit/history are append-only — retain per organisational policy. No Identity-specific retention engine in this milestone.

## Incident triage

1. Confirm `APZHUB_IDENTITY_ENABLED`
2. Confirm PostgreSQL connectivity / migrations
3. Check authz denials vs service unavailable
4. Inspect diagnostics (safe metadata only)
5. Review audit/history for administrative mutations

## Upgrade / rollback

Upgrade: migrate forward, deploy services, enable flag. Rollback: disable flag first, revert deploy, do not drop IAM tables without explicit owner approval.
