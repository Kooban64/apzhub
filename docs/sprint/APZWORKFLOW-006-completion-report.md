# APZWORKFLOW-006 Completion Report

**Milestone:** APZWORKFLOW-006 — n8n Reference Adapter Foundation  
**Status:** COMPLETE  
**Date:** 2026-07-15  
**Package:** `@apzhub/integration-n8n` **0.1.0**  
**Next:** **APZWORKFLOW-007 — n8n Platform Services Integration** (**await owner approval — do not start**)

---

## Executive Summary

Delivered the official n8n Workflow Engine Reference Adapter as a read-only Integration SDK package. Follows the GitHub Actions / Meilisearch adapter pattern (`IntegrationAdapterBase`, factory, injected fetch, secret refs, error translation). No Platform Services, Gateway, HTTP, Workbench, execution, or scheduling.

## Architecture

Workflow Platform (frozen) ↛ this package.  
Integration SDK → `N8nAdapter` → `N8nRestClient` → n8n Public API (mocked in tests).

## Capabilities

Discovery of workflows, templates (partial), credentials metadata, variables metadata, executions metadata, tags, users/projects (partial). Unsupported mutations/execution explicitly catalogued.

## Authentication

API key · personal access token · basic · OAuth placeholder only (`oauth.enabled` rejected when true).

## Mapping

Private vendor types → canonical metadata (`secretsIncluded` / `valueIncluded` / `payloadIncluded` always false).

## Diagnostics

Version hint, capabilities, supported/unsupported operations, health, compatibility matrix, latency. No execution metrics.

## Security

SecretProvider refs only; no secret leakage in diagnostics/exports; engine branding hidden.

## Tests

Vitest: adapter, boundary, coverage suites — **21** tests. Mock fetch only (no live n8n).

## Coverage

Scoped `integrations/n8n/src` (excluding tests/types/models): **~95.1%** lines/statements; **~99%** functions.

## Quality Gates

| Gate                                   | Result    |
| -------------------------------------- | --------- |
| Typecheck                              | PASS      |
| Vitest                                 | PASS (21) |
| Coverage (≥95% lines/functions scoped) | PASS      |
| `pnpm audit:n8n-adapter`               | PASS      |
| No platform-services / apps/web wiring | PASS      |

## Technical Debt

- Users/projects/variables/templates depend on n8n edition APIs (partial / NOT_SUPPORTED)
- OAuth not implemented
- Platform Services integration deferred to 007

## Recommendation

**APZWORKFLOW-007 — n8n Platform Services Integration** only. Do **not** implement until explicit owner approval.

---

**Stop condition met.** Await owner approval before APZWORKFLOW-007.
