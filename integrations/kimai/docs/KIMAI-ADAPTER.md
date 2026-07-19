# Kimai Integration Adapter

> **Package:** `@apzhub/integration-kimai` **0.2.0**  
> **Programme:** APZHUB-INTEGRATION-KIMAI-002  
> **Previous:** **0.1.0** CERTIFIED_FOUNDATION (KIMAI-001)  
> **SDK:** Integration SDK **1.0.0** (frozen — unchanged)  
> **Scope:** Foundation ops + domain CE APIs — **not** APZ Time product / Workbench

---

## Purpose

Reusable Kimai Community Edition integration for the APZHUB platform.

Provides authentication, version detection, health, diagnostics, error translation, metrics, logging, capability registration, factory/bootstrap, mock provider, compatibility, readiness, certification, and **domain CE APIs** (timesheets, activities, customers, projects, tags).

Does **not** implement APZ Time Workbench UI, reporting UI, approvals, analytics, notifications, or product surfaces.

---

## Architecture

```text
Platform Time Services → adapter.core → @apzhub/integration-kimai → Kimai CE JSON API
```

- Extends `IntegrationAdapterBase`
- Secret refs only — never store tokens in configuration
- Preferred auth: `Authorization: Bearer <api-token>`
- Optional legacy: `X-AUTH-USER` / `X-AUTH-TOKEN`
- Foundation probes: `GET /api/ping`, `GET /api/version`
- Domain surface: Plane-style `adapter.core` (see `services/kimai-domain-services.ts`)

---

## Public surface

Use `createKimaiAdapter` / `disposeKimaiAdapter` from package root.

Do not import `internal/*` REST client or vendor DTOs.

---

## Configuration

| Field                       | Notes                                           |
| --------------------------- | ----------------------------------------------- |
| `baseUrl`                   | Kimai UI root (no trailing slash)               |
| `apiBaseUrl`                | Defaults to `{baseUrl}/api`                     |
| `authMode`                  | `bearer` (default) or `legacy_headers`          |
| `apiTokenRef`               | SecretProvider ref for Bearer token             |
| `versionMin` / `versionMax` | CE compatibility range (default 2.13.0–2.99.99) |

---

## Related

- [KIMAI-OPERATIONS.md](./KIMAI-OPERATIONS.md)
- [integration.yaml](../integration.yaml)
- Certification: [docs/integrations/kimai/CERTIFICATION-REPORT.md](../../../docs/integrations/kimai/CERTIFICATION-REPORT.md)
- Plane reference adapter: `integrations/plane/`
