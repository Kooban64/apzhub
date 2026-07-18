# APZHUB Platform Configuration Architecture

**Milestone:** APZCONFIG-001  
**Status:** Foundation complete — no HTTP / Gateway / Workbench  
**Classification (foundation):** Metadata System of Record only

---

## Purpose

Canonical **Platform Configuration** System of Record for every APZHUB product.

**Not** `@apzhub/config` (env + Drizzle schemas).  
**Not** runtime configuration-manager.  
**Not** secrets, Vault, K8s ConfigMaps, or environment-variable injection.

## Architecture

```text
Products
  ↓
Platform Configuration (SoR metadata)
  ↓
Future consumers / runtime (APZCONFIG-002+)
```

No runtime application in this milestone.

## Packages

| Package                             | Version | Role                                                             |
| ----------------------------------- | ------- | ---------------------------------------------------------------- |
| `@apzhub/configuration-contracts`   | 0.1.0   | Models, permissions, service interface                           |
| `@apzhub/configuration-core`        | 0.1.0   | Lifecycle, hierarchy precedence, validation metadata, versioning |
| `@apzhub/configuration-persistence` | 0.1.0   | In-memory (tests) + PostgreSQL                                   |

## Persistence

Tables `platform_configuration*` · migrations **0048** / **0049** (RLS).  
Production requires PostgreSQL — no silent in-memory fallback.

## Explicit exclusions

HTTP · Gateway · Platform Services · Workbench · feature flags · secrets · hot reload · Event Bus · AI
