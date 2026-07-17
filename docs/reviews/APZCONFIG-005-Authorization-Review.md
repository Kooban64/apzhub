# APZCONFIG-005 — Authorization Review

**Date:** 2026-07-16

## Production map

`configurationPlatformOps` in `operation-authorization-map.ts` maps every gateway facet operation to permissions including:

- `configuration.read`
- `configuration.manage`
- `configuration.version`
- `configuration.validation`
- `configuration.audit`

## Certified properties

- Deny-by-default Production Authorization (no allow-all in production bootstrap)
- RequestPipeline wraps all configuration service facets
- HTTP routes declare `operation:` for `withPlatformApiAuth`
- UI soft-gate (`canManage`) is not a security boundary — server remains authoritative
- No client-supplied roles, permissions, or tenant IDs trusted

## Verdict

**PASS**
