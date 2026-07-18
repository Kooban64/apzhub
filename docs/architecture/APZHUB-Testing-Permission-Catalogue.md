# APZHUB — Testing Permission Catalogue

**Milestone:** APZTCMS-011  
**Domain source:** `@apzhub/testing-contracts` → `APZ_TCMS_PERMISSIONS`  
**Platform merge:** `@apzhub/platform-services` → `PLATFORM_SERVICE_PERMISSION_CATALOGUE`  
**Status:** Merged into platform catalogue; operation map references same keys

---

## Source of truth

Domain catalogue (`packages/testing-contracts/src/permissions/catalogue.ts`):

```typescript
import {
  APZ_TCMS_PERMISSIONS,
  listApzTcmsPermissions,
  listPermissionsByPrefix,
  isApzTcmsPermission,
} from "@apzhub/testing-contracts";
```

Platform merge (`packages/platform-services/src/authorization/permission-catalogue.ts`):

```typescript
// Testing platform services (APZTCMS-011)
...APZ_TCMS_PERMISSIONS,
```

All APZ TCMS keys are valid `PlatformPermissionKey` values for production authz.

---

## Prefix groups

| Prefix            | Count (approx.) | Purpose                                                          |
| ----------------- | --------------- | ---------------------------------------------------------------- |
| `testing.*`       | 22              | Workspace, requirements, plans, suites, cases, executions, admin |
| `certification.*` | 13              | Records, gates, review, approve, reject, audit, admin            |
| `evidence.*`      | 4               | List, read, register, admin                                      |
| `traceability.*`  | 4               | List, read, link, admin                                          |
| `automation.*`    | 10              | Jobs, import, view, history, adapters, coverage, admin           |
| `reporting.*`     | 3               | View, generate, admin                                            |
| `approval.*`      | 6               | List, read, request, decide, sign, admin                         |
| `dashboard.*`     | 3               | View, refresh, admin                                             |
| `quality.*`       | 3               | View, compute, admin                                             |
| `coverage.*`      | 3               | View, compute, admin                                             |
| `defects.*`       | 4               | View, link, update, admin                                        |
| `release.*`       | 3               | View, compute, admin                                             |

Full enumerated list: `APZ_TCMS_PERMISSIONS` in `@apzhub/testing-contracts` (single array export).

---

## Manifest alignment

| Manifest                              | Permissions declared                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| `services/testing/service.yaml`       | Core testing + evidence + traceability + automation jobs + reporting + dashboard |
| `services/certification/service.yaml` | Certification subset                                                             |
| `services/testing/manifests/*.yaml`   | View-level keys for workbench nav                                                |

Manifest keys must remain subsets of `APZ_TCMS_PERMISSIONS`.

---

## Persistence layer

Repositories in `@apzhub/testing-persistence` call `assertPermission` with the same key strings. Wildcards (`testing.*`, `evidence.*`, …) match via `permissionPatternMatches`. No repository allow-all bypass.

See [APZ TCMS Authorization Guide](./APZHUB-APZ-TCMS-Authorization-Guide.md).

---

## UI layer

Workbench helpers (`apps/web/lib/testing/permissions.ts`) mirror keys for control visibility only. **Server / pipeline remains authoritative.**

---

## Rules

- Permissions never grant access from UI alone (007, 013)
- User preferences never grant permissions (023)
- Superadmin is an explicit tier — not a silent bypass
- Operation → permission mapping is explicit — never inferred from method names alone

---

## Related

- [APZ TCMS Permission Catalogue](./APZHUB-APZ-TCMS-Permission-Catalogue.md) — domain catalogue intro
- [Testing Operation Permission Map](./APZHUB-Testing-Operation-Permission-Map.md)
- [Platform Permission Catalogue](../specs/APZHUB-Platform-Permission-Catalogue.md)
- [Testing Security Tenancy Guide](./APZHUB-Testing-Security-Tenancy-Guide.md)
