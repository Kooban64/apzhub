# APZDOCS-004 Completion Report

**Milestone:** APZDOCS-004 — Document HTTP API & Typed Client  
**Status:** COMPLETE  
**Date:** 2026-07-13  
**Next:** APZDOCS-005 — Document Workbench (**await owner approval — do not start**)

---

## Executive Summary

Exposed the existing Document Platform through `/api/v1/documents`, OpenAPI (**Platform Documents**), and `createHttpDocumentClient()` (+ mock). Thin HTTP only — no new domain logic, uploads, downloads, binary transfer, Workbench, OCR, AI, or search engine.

## HTTP API

Gateway-only handlers under `/api/v1/documents` covering documents, versions, metadata, classifications, folders, collections, tags, relationships, retention, audit, storage metadata, checksum/verify, diagnostics, reconciliation inspect, and search **metadata** (not FTS).

Request path: HTTP → PlatformServiceGateway → RequestPipeline → Authorization → Platform Services → Document Core.

## OpenAPI

Tag **Platform Documents** in `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`.  
`pnpm openapi:validate:platform` — **PASS**.

## Typed Client

`createHttpDocumentClient()` in `apps/web/lib/documents/` with strongly typed operations listed in the Typed Client Guide. Mock client retained for tests. Accessor facades in `document-api.ts`.

## Authorization

Respects production `document.*` permissions via existing `documentPlatformOps`. Routes use `withPlatformApiAuth`; server remains authoritative.

## Diagnostics

Safe readiness / provider kind metadata only. Storage keys and reconciliation key hints redacted at the HTTP boundary.

## Testing

| Suite | Result |
| --- | --- |
| Vitest (handlers, client, api, authz, boundary, foundation) | **20** passed |
| OpenAPI validation | **PASS** |
| Architecture audit `scripts/apzdocs-004-document-http-audit.mjs` | **PASS** |
| Playwright | Not in scope |

## Coverage

Scoped APZDOCS-004 modules (handlers + schemas + documents client package):

| Metric | Result |
| --- | --- |
| Lines | **~97%** |
| Functions | **100%** |
| Branches | Meaningful (client mapping branches lower; handlers ~89%) |

## Quality Gates

| Gate | Result |
| --- | --- |
| OpenAPI validate | PASS |
| Vitest focused suites | PASS |
| Coverage ≥95% lines/functions (scoped) | PASS |
| Boundary / architecture audit | PASS |
| Authorization surface audit | PASS |

## Technical Debt

- No Document Workbench UI (APZDOCS-005)
- No binary upload/download HTTP (by design)
- Product consumer wiring (APZREPORT / APZ TCMS evidence) not implemented
- Folder/collection SoR remains assign-ID oriented from prior milestones
- OpenAPI YAML alias count requires elevated `maxAliasCount` in runtime loader

## Recommendation

**APZDOCS-005 — Document Workbench** — presentation-only Workbench over the typed HTTP client. **Do not implement until explicit owner approval.**

---

**Stop condition met.** Await explicit owner approval before APZDOCS-005.
