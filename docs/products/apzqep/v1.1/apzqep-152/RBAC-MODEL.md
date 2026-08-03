# RBAC Model — APZQEP-152

| Field     | Value                                                            |
| --------- | ---------------------------------------------------------------- |
| Programme | APZQEP-152                                                       |
| Artefact  | RBAC-MODEL                                                       |
| Timestamp | 20260803T064000Z                                                 |
| Catalogue | `packages/platform-authorization/src/qep-core-qe-permissions.ts` |

---

## Product rule

Permission evaluation **fails closed**. No Cap A–F operation may succeed without an explicit grant (or `platform-admin` `*`).

## Roles (Cap-relevant)

| Role slug        | Role ID               | Scope            | Cap grants                                         |
| ---------------- | --------------------- | ---------------- | -------------------------------------------------- |
| `platform-admin` | `role-platform-admin` | platform         | `*` (all Cap A–F)                                  |
| `qep-operator`   | `role-qep-operator`   | product `apzqep` | Cap A–F read + write operators (not Cap `*.admin`) |
| `qep-reader`     | `role-qep-reader`     | product `apzqep` | Cap A–F `*.read` only                              |
| `tenant-member`  | `role-tenant-member`  | tenant           | **No Cap A–F grants**                              |

`law-operator` remains a law-platform role; it does not grant Cap A–F permissions.

## Default provision

`provisionDefaultAuthorizationForUser` assigns:

1. `tenant-member`
2. `law-operator`
3. **`qep-operator` only when** `APZQEP_QEP_AUTO_ASSIGN_OPERATOR` is `true` / `1` / `yes`

Production default: env unset → **no Cap operator assignment** → Cap APIs deny without explicit role assignment.

## Cap permission namespaces

| Cap                       | Prefix                          |
| ------------------------- | ------------------------------- |
| A Suites                  | `qep.suites.*`                  |
| B Execution Plans         | `qep.execution_plans.*`         |
| C Execution Workspace     | `qep.execution_workspace.*`     |
| D Defects                 | `qep.defects.*`                 |
| E Enterprise Requirements | `qep.enterprise_requirements.*` |
| F Enterprise Reporting    | `qep.enterprise_reporting.*`    |

Full matrix: [AUTHORIZATION-MATRIX.md](./AUTHORIZATION-MATRIX.md).

## Superadmin

`platform-admin` with `*` is an explicit platform tier, not an HTTP bypass path. Cap handlers do not special-case elevation; domain matching treats `*` as full grant via the permission service / domain checks as implemented.
