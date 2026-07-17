# APZCONFIG-005 — Typed Client Certification

**Date:** 2026-07-16  
**Module:** `apps/web/lib/configuration`

## Certified properties

- `createHttpConfigurationClient()` calls only `/api/v1/configuration`
- Mock client for tests / DI; production runtime selection via module accessor
- Standard envelope parsing, pagination, filters, `AbortSignal`, revision metadata
- Controlled error translation (`ConfigurationClientError`)
- Query keys tenant-safe / session-scoped; no browser persistence of values
- No gateway, platform-services, core, or persistence imports

## Forbidden methods absent

`resolveConfiguration`, `getEffectiveConfiguration`, `applyConfiguration`, `evaluateFlag`, `retrieveSecret`, `injectEnvironment`

## Verdict

**PASS**
