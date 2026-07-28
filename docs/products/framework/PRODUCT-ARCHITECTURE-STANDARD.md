# Product Architecture Standard

> **Programme:** APZHUB-PRODUCTS-002 · Baseline: Platform 1.4  
> **Authority:** Constitution 000 · Architecture 003 · Modules 008 · Services 009 · Gateway 010 · SDK 024–029

## Principle

**Products extend Platform 1.4. Products do not redesign Platform 1.4.**

Frozen platform architectures remain in force. Changes require **Platform ADR + Owner Approval** (not a product programme).

## Mandatory request path

```text
Client / Module UI
  → APZHUB API Gateway
  → Auth → Authz → Validation
  → Platform Service
  → Service Connector (Integration Adapter)
  → Backend Engine
```

| Forbidden                         | Classification          |
| --------------------------------- | ----------------------- |
| Module → Connector                | Architectural defect    |
| Module → Engine                   | Architectural defect    |
| Service → Engine (skip connector) | Architectural defect    |
| Engine brand in user-facing UI    | Product identity defect |

## Engine principles

| Mode                | SoR location                          | Connector role                                         |
| ------------------- | ------------------------------------- | ------------------------------------------------------ |
| **Native APZHUB**   | Platform PostgreSQL / product schemas | None or internal-only helpers — no external engine SoR |
| **Platform-backed** | External OSS engine                   | Dedicated Integration Adapter; brand masked            |

### Classification rules

1. Prefer **Platform-backed** when a mature CE OSS engine provides the domain SoR (Projects/Plane, Support/Zammad, Time/Kimai, Analytics/Metabase, Workflows/n8n).
2. Prefer **Native APZHUB** when the domain is a commercial differentiator or lacks a suitable CE SoR (Law, TCMS, current Documents metadata SoR).
3. Hybrid paths (Native today → optional Paperless later) require **Product ADR + Owner** before connector introduction.
4. Never expose backend role names or engine login screens to standard users (IAM 007).

## Product ADR Standard

A **Product ADR** is required when a product programme would:

- Introduce or replace an external engine
- Change SoR ownership (native ↔ backed)
- Alter public Platform Service contracts consumed by other products
- Introduce cross-product coupling beyond Platform Events
- Request any Platform freeze exception

Product ADRs do **not** modify Platform ADRs silently. Platform-impacting ADRs are Platform ADRs.

Minimum ADR fields: Context · Decision · Consequences · Alternatives · Compliance with 003/008/009 · Owner decision.

## Product ARCHITECTURE.md (minimum contents)

1. Boundaries and non-goals
2. Native vs Platform-backed classification + rationale
3. Platform Services consumed
4. Connectors / engines (internal names)
5. Data ownership (platform metadata vs engine SoR)
6. Events published/consumed
7. Permissions / governance
8. Explicit “does not redesign Platform 1.4” statement

## Shared services

Products consume shared Platform Services (Identity, Permissions, Audit, Notifications, Search, Activity, Configuration, Observability). Products must not duplicate them.
