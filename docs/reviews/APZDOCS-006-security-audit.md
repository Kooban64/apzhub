# APZDOCS-006 — Security Audit

**Date:** 2026-07-13  
**Verdict:** **PASS**  
**Certification:** APZDOCS-006

---

## Authentication

Platform HTTP uses Better Auth session resolution via `withPlatformApiAuth` / `authenticatePlatformApiRequest`. Unauthenticated requests are rejected before gateway execution.

## Authorization

Production `documentPlatformOps` maps every gateway method to `document.*` permissions. RequestPipeline enforces authz. Workbench manifests declare permission keys; server remains authoritative.

## Isolation

Tenant / organisation context flows through `ServiceRequestContext` into Document Core / persistence. HTTP handlers do not broaden scope.

## Integrity

- Immutable content versions
- Checksum validation (SHA-256) via Document Core integrity service
- Storage coordinator transaction boundary (metadata vs content) per ADRs

## Diagnostics redaction

HTTP redacts:
- filesystem paths
- bucket names
- object keys (`storageKeyPresent` boolean only)
- credentials
- signed URLs
- binary content

## Secrets

No secrets in OpenAPI responses, client view models, Workbench UI, or audit scripts. Storage secret resolver is injection-based in production factories.

## Audit logging

Document audit facet + HTTP correlation IDs. Immutable audit records owned by platform document domain (APZDOCS-001+).
