# APZHUB Configuration Operational Readiness Guide

**Programme:** APZCONFIG (metadata management plane)  
**Wave:** APZCONFIG-006  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS

---

## Production deployment expectations

- Enable Configuration via `APZHUB_CONFIGURATION_ENABLED` only when PostgreSQL-backed persistence, production authorisation, RequestPipeline, and Configuration Platform Services are wired
- Do not silently fall back to in-memory persistence or allow-all authorisation in production
- Serve HTTP under `/api/v1/configuration` through the existing Next.js App Router / API Gateway path
- Expose Workbench at `/workspace/configuration` via manifest discovery

## Supported topology

```text
Clients / Workbench
→ Typed Client
→ /api/v1/configuration
→ PlatformServiceGateway.configuration.*
→ RequestPipeline + Production Authorization
→ Configuration Platform Services → Core → Persistence → PostgreSQL
```

Single SoR for configuration **metadata**. No distributed runtime config mesh in this wave.

## Operational limitations (by design)

| Capability                 | Status                               |
| -------------------------- | ------------------------------------ |
| Runtime resolution         | **RUNTIME RESOLUTION NOT AVAILABLE** |
| Runtime application        | Not available                        |
| Feature flags              | Not available                        |
| Secrets / Vault            | Not available                        |
| Env injection / ConfigMaps | Not available                        |
| Hot reload / rollout       | Not available                        |
| Event Bus                  | Not available                        |

These are not outages — they are programme boundaries.

## Monitoring expectations

- Use Configuration diagnostics / health / readiness endpoints (management plane)
- Correlate with platform RequestPipeline logs using request / correlation IDs
- Treat “runtime unavailable” flags as expected healthy state for this SoR
- Do not alert on absent feature-flag or secret subsystems as Configuration defects

## Backup expectations

- Back up platform PostgreSQL including Configuration persistence tables/migrations
- Configuration SoR is metadata — restore follows platform DB restore procedures
- Do not back up “effective runtime values” (they are not produced by this plane)

## Upgrade expectations

- Respect frozen package versions until a new approved milestone bumps them
- Apply Configuration persistence migrations with platform migration tooling
- Re-run `pnpm audit:configuration-wave` (or successor) after governed changes
- Architecture changes require ADR + owner approval

## Separation from `@apzhub/config`

Operational teams must not conflate:

- **Configuration SoR** (this programme) — governed metadata
- **`@apzhub/config`** — runtime configuration-manager / infrastructure helpers

Integrating runtime apply into this SoR is out of scope without a new programme.
