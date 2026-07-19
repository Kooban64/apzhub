# APZHUB-TIME-HTTP-001 — Sprint Guide

> **Programme:** APZHUB-TIME-HTTP-001  
> **Title:** Canonical Time HTTP API  
> **Classification:** PLATFORM API · IMPLEMENTATION  
> **Owner Approval:** Formal — Canonical Time Platform Services (APZHUB-PLATFORM-TIME-001) **ACCEPTED**; this programme authorised next.

---

## Objective

Expose Canonical Time Platform Services through the existing APZHUB HTTP Gateway architecture. The HTTP API becomes the only supported external interface for future Time products.

This programme does **not** implement APZ Time, Workbench UI, React, approvals, notifications, exports, or Kimai/Platform Service redesigns.

## Scope

Version 1 Time HTTP endpoints under `/api/v1/time/*`:

- Timesheets · Time Entries (alias) · Activities · Customers · Time Projects · Tags
- Reporting (foundation) · Search (foundation composition) · Health · Diagnostics
- OpenAPI · Zod validation · canonical error mapping · auth · request pipeline · logging · metrics

## Architecture

```
Client → Gateway HTTP → Auth → Authz (pipeline) → gateway.time.* → Time Platform Services → Kimai Integration
```

No direct Kimai access from HTTP handlers.

## Stop

Await Owner Acceptance. Do not begin Workbench or APZ Time product.
