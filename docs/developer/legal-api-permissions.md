# Law Platform API — Permissions

> **Story:** LAW-014-07

---

## Model

Permissions follow Workbench convention: `legal.{resource}.{action}`.

Each OpenAPI operation declares `x-required-permission`.

---

## Implemented resources

| Resource  | View                  | Create                  | Edit                  | Delete/Archive/Cancel    |
| --------- | --------------------- | ----------------------- | --------------------- | ------------------------ |
| Clients   | `legal.client.view`   | `legal.client.create`   | `legal.client.edit`   | `legal.client.delete`    |
| Matters   | `legal.matter.view`   | `legal.matter.create`   | `legal.matter.edit`   | `legal.matter.archive`   |
| Documents | `legal.document.view` | `legal.document.create` | `legal.document.edit` | `legal.document.archive` |
| Tasks     | `legal.task.view`     | `legal.task.create`     | `legal.task.edit`     | `legal.task.archive`     |
| Calendar  | `legal.calendar.view` | `legal.calendar.create` | `legal.calendar.edit` | `legal.calendar.cancel`  |
| Time      | `legal.time.view`     | `legal.time.create`     | `legal.time.edit`     | `legal.time.delete`      |
| Invoices  | `legal.invoice.view`  | `legal.invoice.create`  | `legal.invoice.edit`  | `legal.invoice.cancel`   |

---

## Forbidden response

**403** with `FORBIDDEN` when authenticated but permission is missing.

---

## Development mode

When dev registration is enabled, permissions may be bypassed for local testing. Production enforces all permissions.

---

## Related

- [Authentication](./legal-api-authentication.md)
- [OpenAPI spec](/api/law/v1/openapi.yaml) — per-operation `x-required-permission`
