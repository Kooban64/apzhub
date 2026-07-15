# APZHUB Platform Document HTTP Security Guide

**Milestone:** APZDOCS-004

## Authorization

Every gateway op maps through `documentPlatformOps` to `document.*` permissions. HTTP uses `withPlatformApiAuth`; pipeline enforces authz. Route `operation` labels are for observability — permission decisions remain server-side in RequestPipeline.

## Isolation

Tenant and organisation isolation remain in Document Core / persistence via `ServiceRequestContext`. HTTP handlers do not broaden scope.

## Diagnostics & storage metadata

Safe metadata only. HTTP responses **must not** expose:

- filesystem paths
- bucket names
- object keys (redacted; `storageKeyPresent` boolean only)
- credentials
- signed URLs
- binary content

## Presentation rules

- Handlers never import document-core, persistence, or storage SDKs
- No multipart / FormData / streaming body handling
- No Workbench or product UI in this milestone

## Least privilege

Grant only required `document.*` keys. `document.*` wildcard is a namespace grant pattern — not a security bypass. Superadmin remains an audited special tier.
