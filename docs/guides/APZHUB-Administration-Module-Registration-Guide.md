# APZHUB Administration Module Registration Guide

**Milestone:** APZADMIN-001

## Canonical registrations

`@apzhub/admin-contracts` exports `CANONICAL_ADMINISTRATION_MODULE_REGISTRATIONS` for twelve module keys:

`identity`, `projects`, `support`, `testing`, `reporting`, `documents`, `search`, `workflow`, `workflow-engine`, `notifications`, `configuration`, `future`

These are **metadata only** — no adapters, UI, or Platform Service wiring.

## Helpers (`@apzhub/admin-core`)

- `listCanonicalAdministrationModuleRegistrations()`
- `getCanonicalAdministrationModuleRegistration(key)`
- `assertKnownModuleKey(key)` — fail-closed for unknown keys

## Persistence

Registration rows live in `platform_admin_registration` (tenant-scoped, RLS in migration 0051).
