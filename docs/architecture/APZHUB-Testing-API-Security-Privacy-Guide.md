# APZHUB Testing API Security Privacy Guide

**Purpose:** Brief security and privacy guide for the APZTCMS-012 Testing HTTP API.  
**Audience:** Platform engineers, security reviewers, AI agents.  
**Authority:** [013 Security & Zero Trust](../013-security-architecture-zero-trust-framework.md) · [Testing Security Tenancy Guide](./APZHUB-Testing-Security-Tenancy-Guide.md)  
**Status:** Implemented guidance — APZTCMS-012 complete.  
**Last updated:** 2026-07-12

---

## Controls

- All `/api/v1/testing/**` routes use platform API authentication and `ServiceRequestContext`.
- Authorization remains in `RequestPipeline` and the platform service layer; handlers do not own permission decisions.
- Handlers validate path, query, and JSON bodies with strict Zod schemas.
- Responses use APZHUB envelopes and sanitized error translation.
- Correlation/request IDs flow through responses and logs.

## Privacy Boundaries

- Evidence APIs register metadata only; no binary evidence upload was added.
- Automation imports accept normalized result metadata; no runner secrets or live execution credentials are required.
- Backend/domain package details are not exposed to clients.
- Release readiness is advisory and includes `isDecision: false`; it must not be treated as approval.

## Exclusions

No AI, Event Bus publication, notifications, live runners, multipart upload, or binary storage integration is part of APZTCMS-012.
