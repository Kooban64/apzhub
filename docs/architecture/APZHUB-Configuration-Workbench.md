# APZHUB Configuration Workbench

**Milestone:** APZCONFIG-004  
**Status:** Complete  
**Route:** `/workspace/configuration`

## Purpose

Product-neutral Configuration management interface for the Platform Configuration **metadata management plane**.

## Architecture

```text
Configuration Workbench
  → createHttpConfigurationClient() / configuration-api facades
  → /api/v1/configuration/*
  → PlatformServiceGateway.configuration.*
  → RequestPipeline → Production Authorization
  → Configuration Platform Services → Core → Persistence → PostgreSQL
```

## Boundary

The Workbench imports only:

- `@/lib/configuration/configuration-api`
- `@/lib/configuration/query-keys`
- approved UI packages (`@apzhub/ui`, React Query)

It must not import gateway, platform-services, configuration-core, configuration-persistence, repositories, `@apzhub/config` runtime manager, or call `fetch` from components.

## Registration

Manifest-driven under `packages/workbench-framework/manifests/platform-configuration*`:

- Activity Bar: Configuration (`configuration.read`)
- Sidebar: Overview, Configurations, Namespaces, Groups, Versions, Overrides, Scopes, Validation, References, Audit, Diagnostics

Mounted via catch-all workspace + `ConfigurationWorkspaceRouter` in `workbench-page.tsx`.

## Capability notices (always)

- `RUNTIME RESOLUTION NOT AVAILABLE`
- `FEATURE FLAGS NOT AVAILABLE`
- `SECRET MANAGEMENT NOT AVAILABLE`
- `HOT RELOAD NOT AVAILABLE`

## Version comparison

**Deferred** — existing APIs do not expose a safe client-side diff payload. No new HTTP routes were added for comparison.

## Export

**Omitted** — safe export of secret-like / redacted values cannot be guaranteed without additional server contracts.

## Audit

`pnpm audit:configuration-workbench` — zero violations required.

## Next milestone

**APZCONFIG-005 — Configuration Vertical Certification & Production Readiness** (not started).

## See also

- [Configuration HTTP API](./APZHUB-Configuration-HTTP-API.md)
- [APZCONFIG-004 Completion Report](../sprint/APZCONFIG-004-completion-report.md)
