# APZDOCS-006 — Architecture / Dependency / Boundary Audit

**Date:** 2026-07-13  
**Verdict:** **PASS** — 0 violations  
**Script:** `scripts/apzdocs-006-document-vertical-audit.mjs` (`pnpm audit:document-vertical`)  
**Layered scripts:** APZDOCS-003 / 004 / 005 audits — all **PASS**

---

## Architecture

Certified path verified end-to-end. No layer bypass detected in scanned sources.

## Dependency direction

```text
Consumers / Workbench → Typed Client → HTTP → Gateway → Platform Services
  → Document Core → Persistence / Storage Coordinator → Storage Providers → Contracts
```

No reverse dependencies found:

- Contracts do not import core/persistence/storage/platform-services/apps
- Storage does not import apps/web, platform-services, or product modules
- Persistence does not import storage SDKs or platform-services
- Core does not import platform-services or product integrations
- Workbench/client do not import core/persistence/storage/gateway

## Boundary

| Layer              | Must not                                                   | Result                  |
| ------------------ | ---------------------------------------------------------- | ----------------------- |
| Workbench          | core / persistence / storage / gateway / handlers / binary | **PASS**                |
| Typed client       | core / persistence / storage / platform-services / binary  | **PASS**                |
| HTTP handlers      | core / persistence / storage SDKs                          | **PASS** (gateway only) |
| Thin service impls | storage SDK / binary transfer / apps/web                   | **PASS**                |
| Composition root   | May wire persistence/storage factories into Core           | **Observed** (allowed)  |
| Storage providers  | apps/web / platform-services / Azure / GCS                 | **PASS**                |

## Platform isolation

- No Plane / Zammad / Kimai / Paperless leakage in document packages
- Product-neutral Workbench + OpenAPI **Platform Documents** tag
- User-facing surfaces mask engine branding

## Immutable versioning

Document Core + persistence enforce immutable content versions (APZDOCS-001/002). HTTP exposes version **metadata** only — no binary mutation APIs.

## Observations (not violations)

1. `create-document-platform-services.ts` is the composition root that wires `@apzhub/document-storage` factories into Document Core — thin impls never call providers.
2. HTTP handlers import branded ID helpers from `@apzhub/document-contracts` only.
3. Playwright Document Workbench may be environment-**LIMITED** by an unrelated Next.js dynamic slug conflict.
