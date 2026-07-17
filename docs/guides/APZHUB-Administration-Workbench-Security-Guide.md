# Administration Workbench Security Guide

**Milestone:** APZADMIN-004

## Principles

- Server remains authoritative for authorization
- UI may hide manage actions when `canManage` is false; never trusts client-only checks
- Typed client only — no direct `fetch`, no gateway imports in components
- No grant/revoke, provisioning, runtime execute, user/role/tenant surfaces

## Permissions

Section manifests declare `admin.read`, `admin.registration`, `admin.policy`, `admin.navigation`, `admin.audit`, `admin.diagnostics` as appropriate.

## Secrets & side effects

Workbench does not surface secrets, Event Bus subscriptions, or AI administration.
