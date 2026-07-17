# APZOBSERVE-005 — Route-to-OpenAPI Traceability Report

**OpenAPI:** `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` **1.8.0**  
**Tag:** Platform Observability Administration  
**Validation:** `pnpm openapi:validate:platform` PASS

## Coverage

All App Router routes under `apps/web/app/api/v1/observe/**` (45 route modules) map to OpenAPI paths under `/observe/*`, including:

- Facet collections + `/{id}` resources for all 19 metadata facets
- `/observe/health`, `/observe/readiness`, `/observe/capabilities`
- Diagnostics surfaces (`/observe/diagnostics*`, management-diagnostics)

## Envelope & errors

Canonical response envelopes, pagination page objects, validation/not-found/conflict, and controlled `503` / `OBSERVE_SERVICE_UNAVAILABLE` are documented.

## Forbidden OpenAPI surfaces (absent)

`/observe/grafana`, `/prometheus`, `/loki`, `/scrape`, `/ingest`, `/workbench`, `/stream`, provider credential schemas.

## Undocumented routes

None in the Observability tree (handlers ↔ OpenAPI parity checked by vertical audit + harness Journey 10).
