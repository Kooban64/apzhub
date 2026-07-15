# APZ TCMS — Permission Catalogue

**Milestone:** APZTCMS-002  
**Package:** `@apzhub/testing-contracts` (`src/permissions/`)  
**Status:** Catalogue constants only — **no authz engine**

---

## Prefixes

| Prefix | Purpose |
|--------|---------|
| `testing.*` | Core testing workspace assets and executions |
| `certification.*` | Certification records and gate evaluation |
| `evidence.*` | Evidence metadata |
| `traceability.*` | Traceability links / matrices |
| `automation.*` | Automation job metadata |
| `reporting.*` | Report viewing / generation |
| `approval.*` | Approval workflow and signatures |
| `dashboard.*` | Dashboard snapshots |
| `*.admin` | Scoped administration within each area |

---

## Source of truth

```typescript
import {
  APZ_TCMS_PERMISSIONS,
  isApzTcmsPermission,
  listPermissionsByPrefix,
} from "@apzhub/testing-contracts";
```

Manifests (`services/testing/service.yaml`, `services/certification/service.yaml`, `module.yaml`) reference the same key strings.

---

## Rules

- Permissions never grant access by themselves in UI alone — server is authoritative (007 / 013).
- Prefs never grant permissions (023).
- Superadmin remains a special tier, not a silent bypass.
- Live PermissionService wiring and DB-backed grants are deferred to **APZTCMS-003+**.
