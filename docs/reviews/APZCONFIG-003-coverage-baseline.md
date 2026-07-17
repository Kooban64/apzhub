# APZCONFIG-003 — Coverage Baseline

**Milestone:** APZCONFIG-003 — Configuration HTTP API & Production Typed Client  
**Date:** 2026-07-16

## Scope

- `apps/web/lib/api/v1/handlers/configuration.ts`
- `apps/web/lib/configuration/configuration-client.ts`
- Zod schemas under `apps/web/lib/api/v1/schemas/configuration.ts`

## Result (as certified at APZCONFIG-003 closeout)

| Surface | Lines | Notes |
| --- | --- | --- |
| HTTP handlers | ~99.5% | Gateway-only presentation |
| Typed client | ~98% | HTTP envelope + error paths |

## Notes

- Management plane only — no runtime routes
- Coverage reaffirmed under APZCONFIG-005
