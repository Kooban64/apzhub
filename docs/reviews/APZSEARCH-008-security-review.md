# APZSEARCH-008 — Security Review

**Date:** 2026-07-14  
**Verdict:** **PASS** (no security behaviour changes)  
**Certification:** APZSEARCH-008

---

## Authentication

Every Search HTTP route uses `withPlatformApiAuth`. Unauthenticated requests are rejected before gateway execution.

## Authorisation

RequestPipeline + production operation maps enforce granular `search.*` permissions for:

- Query: execute / validate / facets / highlights / select-provider
- Management: providers, configurations, collections, sources, scopes, profiles, health, diagnostics, statistics, audit, validation
- Index administration: gateway-only (no public HTTP) with existing index/document permissions retained on gateway facets

Workbench manifests declare permission keys; **server remains authoritative**.

## Tenant / organisation / classification isolation

Mandatory tenant (and organisation / classification / permission) restrictions are applied fail-closed on the trusted execution path (ADR-0061). Client-supplied tenant/org filters are not authoritative. Handlers construct `ServiceRequestContext` from server-side session identity.

## Provider selection

Guessed or unauthorised provider selection is denied by gateway authorisation + resolver policy (ADR-0063). No Workbench post-filtering of insecure provider results.

## Error / secret / diagnostics redaction

- Safe public error messages only; no raw Meilisearch payloads, index names, API keys, or engine ranking internals
- Management responses redact resolved secrets
- Diagnostics omit provider credentials and private metadata
- Highlight fragments sanitised in typed client (plain-text / approved sanitisation)

## Typed client safety

Client targets `/api/v1/search` only; no imports of platform-services, Meilisearch, or persistence. Abort signals supported. Mock client parity for offline tests.

## Explicit non-goals (unchanged)

No security redesign · no new permission keys · no public index mutation HTTP · no OCR/AI/semantic/vector surfaces.
