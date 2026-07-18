# Product Architecture Standard

> **Programme:** APZHUB-PRODUCTS-000  
> **Related:** [003 System Architecture](../003-overall-system-architecture-design-principles.md) · [AI-MANIFEST Frozen Architecture](../foundation/AI-MANIFEST.md) · [PRODUCT-ENGINEERING-HANDBOOK](./PRODUCT-ENGINEERING-HANDBOOK.md)

---

## Principle

```text
Platform Engineering
      ↓ enables
Product Engineering
```

**Products extend the platform. Products do not redesign the platform.**

Frozen architectures remain in force. Changes require **ADR + Owner approval**.

---

## Mandatory request path

```text
Client / Module UI
  → APZHUB API Gateway
  → Auth → Authz → Validation
  → Platform Service
  → Service Connector (Adapter)
  → Backend Engine
```

| Forbidden                         | Reason                |
| --------------------------------- | --------------------- |
| Module → Connector                | Architectural defect  |
| Module → Engine                   | Architectural defect  |
| Service → Engine (skip connector) | Architectural defect  |
| Exposing engine brand names in UI | Product identity rule |

---

## Platform contracts products must consume

| Concern            | Consume via                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| Business APIs      | Platform Services (`@apzhub/platform-services` / domain gateways)        |
| AuthN              | BetterAuth session (platform-owned)                                      |
| AuthZ              | Platform authorization / PermissionService                               |
| Enablement         | `@apzhub/platform-governance`                                            |
| Product activation | `@apzhub/platform-provisioning`                                          |
| Events             | Platform Event Bus / ENF (publish via services, not ad-hoc notify)       |
| Search             | Platform Search (frozen) — register providers; no standalone search UIs  |
| Notifications      | Platform notification path — modules publish events; do not own delivery |

---

## Integration SDK

- `@apzhub/integration-sdk` **1.0.0** is **Architecture Frozen**.
- Adapters live under `integrations/` (or equivalent); never call adapter clients from modules.
- **Never modify SDK public contracts** in a product programme. If a change appears required: **STOP**, recommend ADR, await Owner.

---

## Product ARCHITECTURE.md contents (minimum)

When a product is active, `ARCHITECTURE.md` must describe:

1. Product boundaries and non-goals
2. Platform Services used
3. Connectors / engines (internal names only in this doc; user-facing names in CAPABILITIES)
4. Data ownership (platform metadata vs engine SoR)
5. Events published/consumed
6. Permissions / governance touchpoints
7. Explicit “does not redesign” statement for frozen subsystems

---

## Platform extension (exceptional)

If a product cannot proceed without a platform change:

1. Document the dependency in the product programme
2. Raise ADR if architecture/freeze is affected
3. Obtain Owner Approval for the platform slice (exceptional)
4. Keep the product programme bounded; do not silently expand platform scope
