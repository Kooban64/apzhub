# Kimai Integration — Operational Readiness

> **Programme:** APZHUB-INTEGRATION-KIMAI-002  
> **Package:** `@apzhub/integration-kimai` **0.2.0**

| Check                                          | Result                                 |
| ---------------------------------------------- | -------------------------------------- |
| Connection validation                          | PASS (`testConnection` / ping+version) |
| Health classification                          | PASS                                   |
| Diagnostics (no secrets)                       | PASS                                   |
| Domain CRUD against mock CE                    | PASS                                   |
| Platform Services wiring (`domainMode: kimai`) | PASS                                   |
| Time HTTP regression                           | PASS (handlers unchanged)              |
| Integration SDK freeze                         | PASS (**1.0.0**)                       |
| APZ Time / Workbench absent                    | PASS (correct)                         |

## Enablement

- `KIMAI_INTEGRATION_ENABLED=true` + Kimai URL/token env
- `APZHUB_TIME_ENABLED=true` for gateway Time bundle

Production domain path no longer requires foundation-only fallback for implemented CE domains.
