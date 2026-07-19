# Kimai Integration — Capability Assessment

> **Programme:** APZHUB-INTEGRATION-KIMAI-002  
> **Package:** `@apzhub/integration-kimai` **0.2.0**

| Capability                                    | Status          | Notes                                         |
| --------------------------------------------- | --------------- | --------------------------------------------- |
| Authentication                                | **Supported**   | Bearer / legacy headers                       |
| Version detection                             | **Supported**   | `/api/version`                                |
| Health / diagnostics                          | **Supported**   | Ops framework retained                        |
| Compatibility / readiness / certification     | **Supported**   | Extended for domain IDs                       |
| Timesheets (+ Time Entries)                   | **Supported**   | CE CRUD + stop                                |
| Activities                                    | **Supported**   | CE CRUD · archive via `visible=false`         |
| Customers                                     | **Supported**   | CE CRUD · archive via `visible=false`         |
| Projects (time reference)                     | **Supported**   | CE CRUD · not Plane Projects                  |
| Tags                                          | **Partial**     | CE CRUD; some CE versions return string lists |
| Search                                        | **Partial**     | `term` param + client filters                 |
| Approvals / Reporting / Analytics / Workbench | **Unsupported** | Out of programme scope                        |

Platform consumption: `createTimePlatformServicesWithKimai` → `adapter.core` via `createKimaiDomainProvider` (`domainMode: "kimai"`).
