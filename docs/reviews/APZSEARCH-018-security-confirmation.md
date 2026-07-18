# APZSEARCH-018 — Security Confirmation

**Date:** 2026-07-18  
**Scope:** Search Publication ecosystem (009–017) — certification only  
**Verdict:** **PASS** with documented limitations

---

## Authorization

| Control                   | Evidence                                                            |
| ------------------------- | ------------------------------------------------------------------- |
| Deny-by-default           | Gateway requires explicit `search.publication.*`                    |
| Package-owned permissions | `@apzhub/search-publication-admin` catalogue (not search-contracts) |
| Server-side enforcement   | HTTP → gateway → `assertSearchPublicationPermission`                |
| Permission keys           | `read` · `retry` · `deadletter` · `admin` · `diagnostics`           |
| Audit logging             | Mutating admin ops write audit entries                              |

---

## Credential & secret hygiene

- No Meilisearch / provider credentials in admin diagnostics responses
- Typed client talks only to APZHUB HTTP (`/api/v1/search/publication/*`)
- Product publishers metadata-only (no binary / report body leakage — 015 cert)
- Orchestrator does not import `@apzhub/search-persistence` or Meilisearch SDK

---

## Secure operations

| Operation                              | Controls                                             |
| -------------------------------------- | ---------------------------------------------------- |
| Retry / drain                          | Permission + audit                                   |
| Dead-letter re-enqueue / ack / archive | Permission + markers; no hard-delete of journal rows |
| Diagnostics                            | Permission; no provider internals                    |

---

## Residual risks (limitations)

1. Admin audit/marker stores default to in-memory unless a durable store is composed.
2. Playwright Publication Ops journey is LIMITED (mocked HTTP).
3. Journal admin aggregates via `listByStatus` — not a dedicated indexed admin query plane.

These do not weaken deny-by-default authorization on the HTTP path.

---

## Frozen platform

Search Platform packages (contracts, persistence, integration-search-sdk, Meilisearch) remain at certified versions with **no** APZSEARCH-018 modifications.
