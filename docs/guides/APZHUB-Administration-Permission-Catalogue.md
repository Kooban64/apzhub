# APZHUB Administration Permission Catalogue

**Milestone:** APZADMIN-001

Catalogue in `@apzhub/admin-contracts`:

| Permission           | Intent                         |
| -------------------- | ------------------------------ |
| `admin.*`            | Wildcard                       |
| `admin.read`         | Read administration metadata   |
| `admin.manage`       | Manage administration metadata |
| `admin.audit`        | Access audit trails            |
| `admin.policy`       | Manage policy metadata         |
| `admin.diagnostics`  | Access diagnostic metadata     |
| `admin.navigation`   | Manage navigation metadata     |
| `admin.registration` | Manage module registrations    |

Helpers: `isPlatformAdminPermission`, `hasAdminPermission`.

Authorization enforcement is deferred to **APZADMIN-002**.
