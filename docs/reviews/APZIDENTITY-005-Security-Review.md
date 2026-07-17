# APZIDENTITY-005 — Security Review

**Date:** 2026-07-17  
**Result:** PASS (with intentional plane exclusions)

## Authorization

- Deny-by-default production mode via RequestPipeline
- Granular `identityPlatformOps` — no allow-all for Identity ops
- UI affordances filtered by permissions; server remains authoritative

## Isolation

- Tenant isolation enforced at persistence (certified Journey 2)
- Organisation context carried on `ServiceRequestContext`
- Cross-tenant reads return null/empty; unauthorized mutations rejected

## Credential exclusion

Certified absent from Workbench, typed client, OpenAPI Identity schemas, and IAM migrations:

- passwords / password hashes
- MFA secrets
- OAuth/OIDC/SAML tokens
- session tokens
- API keys

## Diagnostics safety

- Controlled `503 IDENTITY_SERVICE_UNAVAILABLE` when disabled
- No stack traces or internal package names in Workbench errors
- Diagnostics do not probe external IdPs

## Impersonation

Uses trusted `ServiceRequestContext` construction at the gateway boundary (existing platform pattern). No new impersonation surface introduced.
