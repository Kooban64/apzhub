# APZIDENTITY-005 — Contract Traceability Report

**Date:** 2026-07-17

| Concern | Contracts | Core | Services | HTTP/OpenAPI | Typed client | Workbench |
| --- | --- | --- | --- | --- | --- | --- |
| Canonical IDs | branded IDs | preserved | preserved | string IDs in envelopes | view models | display only |
| Lifecycle states | draft/active/deactivated… | transition rules | mapped errors | status fields | status fields | status display |
| Pagination | list query | n/a | list ops | page envelope | `page` | tables |
| Errors | domain codes | IdentityDomainError | PlatformServiceError | canonical envelope | IdentityClientError | safe banners |
| Credentials | forbidden | credentials_forbidden | VALIDATION_FAILED | absent schemas | absent fields | absent inputs |
| Timestamps | ISO-8601 | entity stamps | pass-through | JSON strings | view models | formatted display |
| Transport fields | none in core | no HTTP types | gateway DTOs | envelope meta | client errors | UI messages |

No persistence-specific columns leak into HTTP responses. No transport envelopes appear in Core models.
