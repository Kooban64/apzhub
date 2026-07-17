# APZHUB Future Administration Platform Guide

**Status:** Informational roadmap only  
**Declared:** APZADMIN-006  
**Authority:** Does not authorise implementation

---

## Purpose

Describe possible future programmes that may build on the frozen Platform Administration metadata governance plane. **Do not implement** any of these without explicit owner approval and a dedicated sprint guide.

## Closed wave (frozen)

APZADMIN-001…006 delivered the Administration SoR metadata plane:

```text
Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authz
→ Services → Core → Persistence → PostgreSQL
```

## Possible future programmes (roadmap only)

### 1. Identity Administration Foundation (recommended next label: APZIDENTITY-001)

Dedicated Identity Administration programme covering users, roles, organisations, tenants, and related governance — built **on top of** the frozen Administration platform, not by expanding Administration SoR into identity ownership.

### 2. Tenant Administration

Tenant lifecycle, isolation policies, and tenant-scoped governance surfaces.

### 3. Organisation Administration

Organisation structure, membership metadata, and organisation-scoped policies.

### 4. User Administration

User directory metadata and access request workflows (not a replacement for Better Auth authentication).

### 5. Role Administration

Role catalogue and assignment workflows — must still respect Production Authorization as authoritative.

### 6. Provisioning Framework

Account and service provisioning orchestration across engines — async, audited, connector-mediated.

### 7. Platform Health Administration

Operational health aggregation beyond metadata diagnostics — may relate to Platform Operations, not Administration SoR expansion.

## Rules for future work

- New programmes start with approved sprint guides
- Prefer dedicated programme IDs (e.g. APZIDENTITY) over mutating frozen APZADMIN surfaces
- No Administration Core/Persistence/HTTP/Workbench changes under APZADMIN-006
- No Event Bus / AI / runtime admin without ADR + owner approval

## Explicit non-goals of this document

This guide is **not** an implementation plan, backlog commitment, or architecture change.
