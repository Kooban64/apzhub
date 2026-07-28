# APZHUB Configuration Management

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20

---

## Scope

| Config class               | System of Record              | Notes                             |
| -------------------------- | ----------------------------- | --------------------------------- |
| Platform Configuration SoR | APZCONFIG (frozen)            | Metadata; feature flags           |
| Connector / engine config  | Platform-owned refs           | Secrets never in plain repo       |
| Environment variables      | Deployment env / secret store | Per environment                   |
| Host / reverse proxy       | Host nginx / Caddy            | ENVIRONMENT.md coexistence        |
| Feature enablement         | Flags / provisioning          | Product enablement platform-owned |

## Asset management (CMDB-lite)

Maintain an inventory of:

- Catalogue services and owners
- Environments and endpoints
- Containers / compose projects (legacy + APZHUB)
- Certificates and expiry
- Backup jobs and restore test dates

## Rules

1. No secrets in git, logs, or tickets.
2. Config changes are Changes.
3. Drift detected in Staging/Production → Problem or Change.
4. Document **011**: platform DB holds platform metadata only — never duplicate engine business SoR.
