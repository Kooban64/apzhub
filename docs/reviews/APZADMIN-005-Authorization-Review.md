# APZADMIN-005 — Authorization Review

**Date:** 2026-07-16

## Production map

`administrationPlatformOps` in `operation-authorization-map.ts` maps every gateway facet operation to permissions including:

- `admin.read`
- `admin.manage`
- (supporting catalogue permissions as registered: `admin.audit`, `admin.policy`, `admin.diagnostics`, `admin.navigation`, `admin.registration` where applicable)

## Certified properties

- Deny-by-default Production Authorization (no allow-all in production bootstrap)
- RequestPipeline wraps all administration service facets
- HTTP routes declare `operation:` for `withPlatformApiAuth`
- UI soft-gate is not a security boundary — server remains authoritative
- No client-supplied roles, permissions, or tenant IDs trusted

## Verdict

**PASS**
