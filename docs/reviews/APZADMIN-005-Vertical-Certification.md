# APZADMIN-005 — Vertical Certification

**Date:** 2026-07-16  
**Scope:** Platform Administration System of Record (metadata governance plane)  
**Classification:** See [Production Readiness](./APZADMIN-005-Production-Readiness.md)

## Certified path

```text
Administration Workbench
→ createHttpAdministrationClient() / administration-api
→ /api/v1/administration/*
→ PlatformServiceGateway.administration.*
→ RequestPipeline
→ Production Authorization
→ Administration Platform Services
→ Admin Core
→ Admin Persistence
→ PostgreSQL
```

## Gates

| Gate | Result |
| --- | --- |
| `pnpm audit:admin-foundation` | PASS |
| `pnpm audit:administration-platform-services` | PASS |
| `pnpm audit:administration-http-client` | PASS |
| `pnpm audit:administration-workbench` | PASS |
| `pnpm audit:administration-vertical` | PASS (required) |
| `pnpm openapi:validate:platform` | PASS |
| Vitest `testing/administration-vertical` | Required harness |
| Playwright live webServer | LIMITED (Testing slug conflict — external) |

## Intentional non-defects

No runtime administration, action execution, permission grant/revoke, user/role/tenant/organisation management, provisioning, live probes, Event Bus, AI administration, or Workbench HTTP embedding under `/api/v1/administration`.

Platform Operations remains at `/workspace/operations` (parent id `platform-administration`); Administration SoR Workbench owns `/workspace/administration` (`platform-admin`).

APZADMIN-003 console text “no Administration Workbench” means HTTP must not ship Workbench routes — Workbench via catch-all is APZADMIN-004 and is required for this vertical.

## Architecture freeze

Administration metadata vertical frozen pending owner approval for **APZADMIN-006 — Administration Wave Certification & Architecture Freeze**.
