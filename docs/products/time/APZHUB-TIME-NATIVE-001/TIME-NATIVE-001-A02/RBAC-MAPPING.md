# RBAC Mapping — TIME-NATIVE-001-A02

| Field     | Value               |
| --------- | ------------------- |
| Slice     | TIME-NATIVE-001-A02 |
| Status    | **COMPLETE**        |
| Timestamp | 20260804T194500Z    |

## Product permission keys (APZHUB)

| Permission                                        | UI use                  |
| ------------------------------------------------- | ----------------------- |
| `time.*`                                          | Full Time UI (wildcard) |
| `time.view`                                       | View-oriented access    |
| `time.manage`                                     | Manage-oriented access  |
| `time.timesheet.list`                             | List timesheets         |
| `time.timesheet.create`                           | Create timesheets       |
| `time.timesheet.manage` / `time.timesheet.update` | Edit / stop / archive   |
| `time.activity.list` / `time.activity.create`     | Activities              |
| `time.customer.list` / `time.customer.create`     | Customers               |
| `time.tag.list` / `time.tag.create`               | Tags                    |

## Catalog / role grants

| Location                                         | Change                              |
| ------------------------------------------------ | ----------------------------------- |
| `authorization-seed.ts` DEFAULT_PERMISSIONS      | Registered `time.*` + granular keys |
| Tenant Member role (in-memory seed)              | Granted `time.*`                    |
| Postgres seed permissions + tenant-member grants | Granted `time.*`                    |

## Explicit non-mapping

| Never mapped to UI        |
| ------------------------- |
| Engine user accounts      |
| Engine role names         |
| Engine permission strings |

Engine role translation remains connector-internal (out of A02 UI scope).
