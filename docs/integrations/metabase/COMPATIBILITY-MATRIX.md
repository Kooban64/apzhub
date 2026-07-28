# Metabase Integration — Compatibility Matrix

> **Programme:** APZHUB-INTEGRATION-METABASE-001  
> **Package:** `@apzhub/integration-metabase` **0.1.0**  
> **SDK:** `@apzhub/integration-sdk` **1.0.0** (unchanged)

| Dimension              | Supported                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| Metabase edition       | Community Edition (self-hosted first)                                                                   |
| Version range          | **0.49.0** – **0.5x**                                                                                   |
| API                    | `/api` (v1 surface)                                                                                     |
| Auth                   | `X-Api-Key` (preferred) · Session (`POST /api/session` → `X-Metabase-Session`)                          |
| Foundation probes      | `GET /api/health` · `GET /api/session/properties` · `GET /api/collection` (metadata)                    |
| Capability detection   | `enable-embedding`, application name, version tag                                                       |
| Explicitly unsupported | create/update/delete dashboard · custom SQL · report designer · embed token issuance · write collection |
| Product surfaces       | Analytics Services · HTTP · Workbench · APZ Analytics — **not implemented**                             |

Runtime matrix is also produced by `buildMetabaseCompatibilityMatrix` / adapter operational diagnostics.
