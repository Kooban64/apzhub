# Administration Module Governance UI Guide

**Milestone:** APZADMIN-004

## Purpose

Govern registered product/module **metadata** in the Administration Workbench — not runtime process control.

## Allowed lifecycle commands

When facades exist and the caller has manage permission:

- Archive
- Restore
- Transition (target status string)

## Forbidden

Start, Stop, Deploy, Restart, Scale, Provision, execute, user/role/tenant management.

## Product navigation

**Open Product** navigates only to canonical workspace routes known from metadata keys (e.g. `configuration` → `/workspace/configuration`). Never fetches other product APIs.
