# ADR-0006 — Platform Service Architecture

> **Status:** Accepted  
> **Date:** 2026-06-29  
> **Sprint:** SPR-001 closeout

## Problem

Business logic must not live in UI components or engine adapters. The platform needs a stable service layer (Document 009) that orchestrates use cases, enforces authorisation, and exposes capability APIs to the presentation layer.

## Decision

Platform Services live under **`services/`** with **`service.yaml`** manifests per Document 027.

Architecture:

```
Presentation → Platform Service → Integration Adapter → Engine
```

Rules:

- UI and Desktop Shell call Platform Services only — never engines
- Services are interface-first and independently testable
- `packages/` holds shared libraries; `services/` holds deployable or in-process Platform Services
- SPR-001 creates `services/README.md` placeholder only

## Alternatives

| Alternative                                 | Why rejected                       |
| ------------------------------------------- | ---------------------------------- |
| Business logic in Next.js route handlers    | Violates layered architecture      |
| One service per engine                      | Collapses adapter boundary         |
| Shared npm package without service manifest | No registry or permission contract |

## Consequences

- First business capability sprint extracts a Platform Service with `service.yaml`.
- API Gateway routes to services per Document 010.
- Health and observability attach at service boundaries (Document 014).
