# APZCONFIG-005 — Vertical Certification

**Date:** 2026-07-16  
**Scope:** Platform Configuration System of Record (metadata management plane)  
**Classification:** See [Production Readiness](./APZCONFIG-005-Production-Readiness.md)

## Certified path

```text
Configuration Workbench
→ createHttpConfigurationClient() / configuration-api
→ /api/v1/configuration/*
→ PlatformServiceGateway.configuration.*
→ RequestPipeline
→ Production Authorization
→ Configuration Platform Services
→ Configuration Core
→ Configuration Persistence
→ PostgreSQL
```

## Gates

| Gate                                         | Result                                     |
| -------------------------------------------- | ------------------------------------------ |
| `pnpm audit:configuration-foundation`        | PASS                                       |
| `pnpm audit:configuration-platform-services` | PASS                                       |
| `pnpm audit:configuration-http-client`       | PASS                                       |
| `pnpm audit:configuration-workbench`         | PASS                                       |
| `pnpm audit:configuration-vertical`          | PASS (required)                            |
| `pnpm openapi:validate:platform`             | PASS                                       |
| Vitest `testing/configuration-vertical`      | Required harness                           |
| Playwright live webServer                    | LIMITED (Testing slug conflict — external) |

## Intentional non-defects

No runtime configuration resolution, effective-value calculation, runtime application, feature flags, secret management, Vault, environment-variable injection, Kubernetes ConfigMaps, hot reload, Event Bus, workers, or notifications.

Configuration SoR (`@apzhub/configuration-*`) remains distinct from runtime `@apzhub/config`.

## Architecture freeze

Configuration metadata vertical frozen pending owner approval for **APZCONFIG-006 — Configuration Wave Certification & Architecture Freeze**.
