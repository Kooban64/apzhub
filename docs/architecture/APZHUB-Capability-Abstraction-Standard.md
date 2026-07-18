# APZHUB Capability Abstraction Standard

**Milestone:** OSS-002  
**Status:** Mandatory for all APZHUB capabilities — OSS-backed and native  
**Authority:** [Document 003](../003-overall-system-architecture-design-principles.md) · [Document 008](../008-module-plugin-connector-architecture.md) · [Document 009](../009-platform-service-layer-integration-framework.md) · [Document 002](../002-product-naming-positioning-terminology-standard.md)

---

## Purpose

Define the standard pattern for turning external OSS tools and internal APZHUB-built capabilities into **first-class APZHUB capabilities**. Users experience one coherent platform — not a collection of separate tools.

**Key principle:** Users see APZHUB capabilities. They never see underlying engines.

| User-facing capability | Engine (hidden)             |
| ---------------------- | --------------------------- |
| Projects               | Plane                       |
| Documents              | Paperless-ngx               |
| Time Tracking          | Kimai                       |
| Support                | Zammad                      |
| Analytics              | Metabase                    |
| Automation             | n8n                         |
| Quality Engineering    | APZHUB native               |
| Observability          | Grafana / Prometheus / Loki |
| Security Operations    | Greenbone / MobSF / Faraday |

---

## Mandatory architecture

Every capability follows this path. Products and users **must not** call external engines directly.

```text
APZHUB Workbench UI
        ↓
APZHUB Capability Service
        ↓
APZHUB Adapter Boundary  (OSS adapter or native engine boundary)
        ↓
External OSS Engine  |  Native APZHUB Engine
```

Cross-cutting concerns are consumed from Platform Core — never reimplemented per capability.

---

## Capability types

| Type                    | Adapter boundary                                | Manifests                                              | Example             |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------ | ------------------- |
| **OSS-backed**          | Integration adapter (026)                       | `integration.yaml` + `service.yaml` + `module.yaml`    | Projects (Plane)    |
| **Native**              | Internal engine module behind service interface | `service.yaml` + `module.yaml` (no `integration.yaml`) | Quality Engineering |
| **Operator-tier**       | Admin connector; no end-user module             | `integration.yaml` + service partial                   | Observability stack |
| **Security-admin tier** | Restricted connector                            | `integration.yaml` + service partial                   | Security Operations |

See [OSS vs Native Decision Model](./APZHUB-OSS-vs-Native-Capability-Decision-Model.md).

---

## Mandatory capability structure

Every capability — OSS or native — must implement the following registrations and boundaries.

### 1. Capability manifest

| OSS-backed                        | Native                            |
| --------------------------------- | --------------------------------- |
| `module.yaml` (025)               | `module.yaml` (025)               |
| `service.yaml` (027)              | `service.yaml` (027)              |
| `integration.yaml` (026)          | Not required                      |
| Domain `event.yaml` entries (029) | Domain `event.yaml` entries (029) |

Manifests are authored **before** implementation. Capability ID, permissions, and API contracts are declared in manifests.

### 2. Workbench navigation

- Register via Module Registry — never hardcode in shell (005, 016, 017)
- Activity Bar entry permission-gated via `PermissionService`
- Sidebar routes owned by module manifest
- Deep links use APZHUB paths only — never engine URLs in user-facing navigation
- Workspace and Context Panel integration per Workbench Development Guide

### 3. Platform permissions

- Permissions declared in module manifest and enforced in Capability Service
- Server is authoritative — UI permission filtering is supplementary
- Engine/backend roles translated in service layer; never shown in UI (007)
- Superadmin and operator tiers explicitly scoped

### 4. Governance enablement

- Capability registered in Platform Capability Registry (`@apzhub/platform-governance`)
- Feature flags control enablement per tenant/org
- Commercial entitlements map to capability IDs
- Provisioning gates capability activation — not user self-service to engines

### 5. Provisioning

- Tenant-scoped provisioning via Platform Provisioning (M8-05)
- OSS: engine workspace/project/customer created via adapter provisioning bridge
- Native: platform PostgreSQL schema + tenant seed via service
- Credentials and connection refs in config provider — never plain secrets in repo

### 6. Lifecycle participation

- Product capabilities register with `@apzhub/platform-lifecycle`
- Participate in maintenance, degraded, and recovery states
- Background sync jobs survive lifecycle transitions (PCv2-02 outbox)
- Operator-tier capabilities register as infrastructure products

### 7. Diagnostics

- Contribute health signals to consolidated diagnostics (bootstrap loader extension)
- Register in operations control plane capability registry (PRH-008)
- Connector/native engine health distinct from platform health
- Correlation IDs on all diagnostic events

### 8. Search registration

- Register Search Provider via Knowledge Discovery Framework (020)
- Async event-driven indexing — never synchronous engine queries from search UI
- Permission-filtered at query time
- Platform search index is derived — not System of Record

### 9. Knowledge registration

- Register Knowledge Provider and Experiences (020)
- Link capability entities to cross-product knowledge graph
- No standalone knowledge UIs per module

### 10. Notification integration

- Capability Service publishes domain events (012, 029)
- Notification routes registered in Event Notification Framework (021)
- Modules never send notifications directly
- Attention Engine decides delivery channel

### 11. Activity integration

- Activity mappers registered in Activity Timeline Framework (007)
- Past-tense event naming; correlation and causation IDs
- Immutable audit trail for security-sensitive actions

### 12. API boundary

- All client traffic via APZHUB API Gateway (010)
- Standard request context and response envelope
- Typed error categories — no raw engine errors to users
- Versioned REST-first Platform Service APIs
- Validation, auth, authz, audit on every endpoint

### 13. Adapter boundary

OSS-backed capabilities: see [Adapter Boundary Pattern](./APZHUB-Adapter-Boundary-Pattern.md).

Native capabilities: service exposes a stable interface; internal engine modules sit behind the boundary — same prohibition on UI or module bypassing the service.

### 14. Replacement strategy

Every capability documents:

- **Exit strategy** — data export, decommission steps
- **Replacement strategy** — alternate engine, native build, or commercial option
- **Abstraction preservation** — module and API contracts stable across engine swap
- **Migration path** — tenant data migration if engine changes

Documented in capability catalog or product strategy — not ad hoc at swap time.

---

## Prohibited patterns

| Pattern                        | Why prohibited                  |
| ------------------------------ | ------------------------------- |
| Module → engine API            | Bypasses service, auth, audit   |
| Module → integration adapter   | Violates layer model (008, 009) |
| User-visible engine login      | Breaks single SSO (007)         |
| Engine branding in UI          | Violates Document 002           |
| Per-module identity/auth       | Duplicates Platform Core        |
| Per-module search/notify/audit | Duplicates platform frameworks  |
| Hardcoded capability in shell  | Violates manifest-first (024)   |

---

## Validation checklist

Before any capability wave (OSS or native) enters implementation:

- [ ] Manifests complete and reviewed
- [ ] User-facing name is APZHUB-only (002)
- [ ] All 14 structure elements addressed
- [ ] Platform Core consumption mapped — no duplicates
- [ ] Replacement strategy documented
- [ ] Architecture compliance test plan defined
- [ ] Approved sprint guide exists

---

## Related

- [Adapter Boundary Pattern](./APZHUB-Adapter-Boundary-Pattern.md)
- [OSS vs Native Decision Model](./APZHUB-OSS-vs-Native-Capability-Decision-Model.md)
- [OSS Integration Master Architecture](./APZHUB-OSS-Integration-Master-Architecture.md)
- [Quality Engineering Reference Architecture](./APZHUB-Quality-Engineering-Reference-Architecture.md) — first native example
