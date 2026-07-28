# APZ Documents — Platform Alignment

> **Programme:** APZ-DOCUMENTS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Requirement:** Align commercial Release 1.0 planning with Identity, Workflow, Analytics, Search, and Integration

---

## Identity

| Topic          | Alignment                                                                      |
| -------------- | ------------------------------------------------------------------------------ |
| Authentication | BetterAuth only — no Documents engine login                                    |
| Authorization  | PermissionService · `document.*` catalogue — server authoritative              |
| Provisioning   | Platform provisioning patterns for product enablement (no Documents-owned IAM) |
| Superadmin     | Explicit tier — not a bypass of Documents AuthZ                                |
| Release 1.0    | Consumes Identity; does not extend Identity Administration SoR                 |

---

## Workflow

| Topic        | Alignment                                                                         |
| ------------ | --------------------------------------------------------------------------------- |
| Relationship | Documents metadata may be referenced by future automations                        |
| Release 1.0  | **No dependency** on Workflow execute/schedule plane for Documents packaging      |
| Boundary     | Documents does not implement workflow engines; Workflow does not own document SoR |
| Path         | Any future link: Module → Gateway → Platform Services only                        |

---

## Analytics

| Topic        | Alignment                                                                 |
| ------------ | ------------------------------------------------------------------------- |
| Relationship | Future metrics/dashboards over document activity                          |
| Release 1.0  | **No dependency** on APZ Analytics product for Documents SemVer packaging |
| Boundary     | Analytics/Metabase remain distinct; Documents does not embed BI engines   |

---

## Search

| Topic          | Alignment                                                                       |
| -------------- | ------------------------------------------------------------------------------- |
| Relationship   | `@apzhub/search-documents` publishes document entities into Platform Search     |
| Release 1.0    | Retain Search Publication freeze; no standalone Documents search UI             |
| Unified Search | Discovery via Platform Search Service (020) — permission-filtered at query time |
| Non-goal       | Documents-owned search engine                                                   |

---

## Integration

| Topic                      | Alignment                                                                  |
| -------------------------- | -------------------------------------------------------------------------- |
| Integration SDK            | **1.0.0** Architecture Frozen                                              |
| Release 1.0 provider model | **Native** Document Core/Persistence/Storage — not an external DMS adapter |
| Paperless                  | **Excluded** from Release 1.0; future programme if Owner authorises        |
| Rules                      | Modules never call connectors; adapters translate only                     |

---

## Layered request path (unchanged)

```text
Workbench / HTTP
  → Gateway → Auth → Authz
    → Platform Document Services
      → Document Core / Persistence / Storage Coordinator
```

Forbidden: Module → Storage/engine bypass · UI → integration packages · business logic in adapters.

---

## Related

- [INTEGRATIONS.md](./INTEGRATIONS.md)
- [RELEASE-1.0-DEFINITION.md](./RELEASE-1.0-DEFINITION.md)
- [Platform Delivery Standard](../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)
