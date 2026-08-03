# Authorization Matrix — Cap A–F Permissions vs Roles

| Field     | Value                                                             |
| --------- | ----------------------------------------------------------------- |
| Programme | APZQEP-152                                                        |
| Artefact  | AUTHORIZATION-MATRIX                                              |
| Timestamp | 20260803T064000Z                                                  |
| Source    | `QEP_OPERATOR_PERMISSIONS` / `QEP_READER_PERMISSIONS` / catalogue |

Legend: **Y** = granted by role seed · **—** = not granted · **\*** = covered by `platform-admin` `*`

---

## Cap A — Suites

| Permission             | qep-reader | qep-operator | tenant-member | platform-admin |
| ---------------------- | ---------- | ------------ | ------------- | -------------- |
| `qep.suites.read`      | Y          | Y            | —             | \*             |
| `qep.suites.create`    | —          | Y            | —             | \*             |
| `qep.suites.update`    | —          | Y            | —             | \*             |
| `qep.suites.lifecycle` | —          | Y            | —             | \*             |
| `qep.suites.admin`     | —          | —            | —             | \*             |

## Cap B — Execution Plans

| Permission                      | qep-reader | qep-operator | tenant-member | platform-admin |
| ------------------------------- | ---------- | ------------ | ------------- | -------------- |
| `qep.execution_plans.read`      | Y          | Y            | —             | \*             |
| `qep.execution_plans.create`    | —          | Y            | —             | \*             |
| `qep.execution_plans.update`    | —          | Y            | —             | \*             |
| `qep.execution_plans.lifecycle` | —          | Y            | —             | \*             |
| `qep.execution_plans.handoff`   | —          | Y            | —             | \*             |
| `qep.execution_plans.admin`     | —          | —            | —             | \*             |

## Cap C — Execution Workspace

| Permission                          | qep-reader | qep-operator | tenant-member | platform-admin |
| ----------------------------------- | ---------- | ------------ | ------------- | -------------- |
| `qep.execution_workspace.read`      | Y          | Y            | —             | \*             |
| `qep.execution_workspace.create`    | —          | Y            | —             | \*             |
| `qep.execution_workspace.execute`   | —          | Y            | —             | \*             |
| `qep.execution_workspace.lifecycle` | —          | Y            | —             | \*             |
| `qep.execution_workspace.amend`     | —          | Y            | —             | \*             |
| `qep.execution_workspace.admin`     | —          | —            | —             | \*             |

## Cap D — Defects

| Permission              | qep-reader | qep-operator | tenant-member | platform-admin |
| ----------------------- | ---------- | ------------ | ------------- | -------------- |
| `qep.defects.read`      | Y          | Y            | —             | \*             |
| `qep.defects.create`    | —          | Y            | —             | \*             |
| `qep.defects.update`    | —          | Y            | —             | \*             |
| `qep.defects.lifecycle` | —          | Y            | —             | \*             |
| `qep.defects.admin`     | —          | —            | —             | \*             |

## Cap E — Enterprise Requirements

| Permission                              | qep-reader | qep-operator | tenant-member | platform-admin |
| --------------------------------------- | ---------- | ------------ | ------------- | -------------- |
| `qep.enterprise_requirements.read`      | Y          | Y            | —             | \*             |
| `qep.enterprise_requirements.create`    | —          | Y            | —             | \*             |
| `qep.enterprise_requirements.update`    | —          | Y            | —             | \*             |
| `qep.enterprise_requirements.lifecycle` | —          | Y            | —             | \*             |
| `qep.enterprise_requirements.admin`     | —          | —            | —             | \*             |

## Cap F — Enterprise Reporting

| Permission                        | qep-reader | qep-operator | tenant-member | platform-admin |
| --------------------------------- | ---------- | ------------ | ------------- | -------------- |
| `qep.enterprise_reporting.read`   | Y          | Y            | —             | \*             |
| `qep.enterprise_reporting.create` | —          | Y            | —             | \*             |
| `qep.enterprise_reporting.update` | —          | Y            | —             | \*             |
| `qep.enterprise_reporting.admin`  | —          | —            | —             | \*             |

## Notes

- Cap `*.admin` keys exist in the catalogue for least-privilege future use; they are **not** on `qep-operator` seed.
- Wildcard `qep.*` is catalogue-only for matching / admin tooling; not assigned to operator/reader seeds.
- Opt-in `APZQEP_QEP_AUTO_ASSIGN_OPERATOR` assigns the full operator set above; it does not change this matrix.
